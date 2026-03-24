import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/Button';
import { Input } from '@/Components/ui/Input';
import { Label } from '@/Components/ui/Label';
import {
    Phone,
    Mail,
    Briefcase,
    ShieldCheck,
    Plus,
    Trash2,
    Building2,
    Globe,
    MessageSquare,
    CheckCircle2,
    Pencil,
    Users,
    Instagram,
    Facebook,
    Linkedin,
    Link,
    AlertCircle,
    ChevronRight,
    Info,
    X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
    auth: any;
    initialAssociate?: any;
}

function completionScore(data: any) {
    const checks = [
        data.contacts?.some((c: any) => c.name?.trim()),
        !!data.billing_email?.trim(),
        !!data.main_ciiu?.trim(),
        data.company_type?.length > 0,
        data.references?.some((r: any) => r.name?.trim()),
    ];
    const filled = checks.filter(Boolean).length;
    return { filled, total: checks.length, pct: Math.round((filled / checks.length) * 100) };
}

function SectionHeader({ icon: Icon, title, right }: { icon: any; title: string; right?: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
                    <Icon size={14} className="text-white" />
                </div>
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">{title}</h2>
            </div>
            {right}
        </div>
    );
}

function StatusDot({ status }: { status: string | null }) {
    if (!status) return null;
    if (status === 'approved') return (
        <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase shrink-0">
            <CheckCircle2 size={11} /> Aprobado
        </span>
    );
    if (status === 'rejected') return (
        <span className="flex items-center gap-1 text-[10px] font-black text-red-500 uppercase shrink-0">
            <AlertCircle size={11} /> Rechazado
        </span>
    );
    return null;
}

export default function Contacts({ auth, initialAssociate }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [saved, setSaved] = useState(false);
    const auditLog = initialAssociate?.audit_log || {};

    const { data, setData, post, processing, errors } = useForm({
        contacts:          initialAssociate?.contacts  || [{ area: 'Gerencia', name: '', position: '', email: '', phone: '' }],
        main_ciiu:         initialAssociate?.main_ciiu         || '',
        secondary_ciiu:    initialAssociate?.secondary_ciiu    || '',
        billing_email:     initialAssociate?.billing_email     || '',
        company_type:      initialAssociate?.company_type      || [] as string[],
        references:        initialAssociate?.references        || [{ type: 'commercial', name: '', contact_person: '', position: '', email: '', phone: '' }],
        social_instagram:  initialAssociate?.social_instagram  || '',
        social_facebook:   initialAssociate?.social_facebook   || '',
        social_linkedin:   initialAssociate?.social_linkedin   || '',
        social_other:      initialAssociate?.social_other      || '',
    });

    const score = completionScore(data);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('associate.company.update.contacts'), {
            onSuccess: () => { setIsEditing(false); setSaved(true); setTimeout(() => setSaved(false), 4000); },
        });
    };

    const locked = (field: string) => {
        if (!isEditing) return true;
        if (auditLog[field]?.status === 'approved') return true;
        return false;
    };

    const fieldStatus = (field: string): string | null => {
        const a = auditLog[field];
        if (!a) return null;
        return a.status === 'approved' ? 'approved' : a.status === 'rejected' ? 'rejected' : null;
    };

    // ── Contacts helpers ──
    const addContact = () => setData('contacts', [...data.contacts, { area: '', name: '', position: '', email: '', phone: '' }]);
    const removeContact = (i: number) => { if (data.contacts.length > 1) setData('contacts', data.contacts.filter((_: any, idx: number) => idx !== i)); };
    const updateContact = (i: number, field: string, value: string) => {
        const next = [...data.contacts]; next[i] = { ...next[i], [field]: value }; setData('contacts', next);
    };

    // ── References helpers ──
    const addReference = (type: 'commercial' | 'bank') => setData('references', [...data.references, { type, name: '', contact_person: '', position: '', email: '', phone: '' }]);
    const removeReference = (i: number) => { if (data.references.length > 1) setData('references', data.references.filter((_: any, idx: number) => idx !== i)); };
    const updateReference = (i: number, field: string, value: string) => {
        const next = [...data.references]; next[i] = { ...next[i], [field]: value }; setData('references', next);
    };

    const toggleCompanyType = (type: string) => {
        const current = data.company_type || [];
        setData('company_type', current.includes(type) ? current.filter((t: string) => t !== type) : [...current, type]);
    };

    const rejectedFields = Object.entries(auditLog)
        .filter(([_, a]: [any, any]) => a.status === 'rejected')
        .map(([key, a]: [any, any]) => ({
            field: key,
            reason: a.reason,
            label: ({
                contacts:         'Directorio de Contactos',
                main_ciiu:        'CIIU Principal',
                billing_email:    'Email de Facturación',
                company_type:     'Tipo de Empresa',
                references:       'Referencias',
            } as Record<string, string>)[key] || key.replace(/_/g, ' '),
        }));

    return (
        <AppLayout>
            <Head title="Contactos y Referencias" />

            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Contactos y Referencias</h1>
                        <p className="text-slate-500 text-sm mt-1 font-medium">
                            Directorio de personal clave y soporte institucional de tu organización.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        {!isEditing ? (
                            <Button onClick={() => { setIsEditing(true); setSaved(false); }}
                                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center gap-2 px-5">
                                <Pencil size={14} /> Editar información
                            </Button>
                        ) : (
                            <>
                                <Button variant="outline" onClick={() => setIsEditing(false)} className="border-slate-200 text-slate-600 rounded-xl">Cancelar</Button>
                                <Button onClick={handleSubmit} disabled={processing}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-2 px-5">
                                    <ShieldCheck size={15} />
                                    {processing ? 'Guardando...' : 'Enviar a revisión'}
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Completion bar */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-4">
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider">Completitud del perfil</span>
                            <span className={cn("text-[11px] font-black", score.pct === 100 ? "text-emerald-600" : score.pct >= 60 ? "text-amber-600" : "text-red-500")}>
                                {score.filled}/{score.total} secciones completas
                            </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={cn("h-full rounded-full transition-all duration-500", score.pct === 100 ? "bg-emerald-500" : score.pct >= 60 ? "bg-amber-400" : "bg-red-400")}
                                style={{ width: `${score.pct}%` }}
                            />
                        </div>
                    </div>
                    {score.pct === 100 ? (
                        <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0"><CheckCircle2 size={18} className="text-emerald-600" /></div>
                    ) : (
                        <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-[13px] font-black text-slate-600">{score.pct}%</div>
                    )}
                </div>

                {/* Success */}
                {saved && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-3">
                        <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-black text-emerald-800">¡Información enviada a revisión!</p>
                            <p className="text-xs text-emerald-600 font-medium mt-0.5">CAMEP revisará los datos en los próximos días hábiles y recibirás una notificación.</p>
                        </div>
                        <button onClick={() => setSaved(false)} className="text-emerald-400 hover:text-emerald-600"><X size={16} /></button>
                    </div>
                )}

                {/* Rejection summary */}
                {rejectedFields.length > 0 && (
                    <div className="rounded-2xl border border-red-200 bg-red-50/60 p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-8 w-8 rounded-xl bg-red-100 flex items-center justify-center shrink-0 text-red-600"><AlertCircle size={16} /></div>
                            <p className="text-sm font-black text-red-900 uppercase tracking-tight">
                                {rejectedFields.length} campo{rejectedFields.length > 1 ? 's' : ''} rechazado{rejectedFields.length > 1 ? 's' : ''} — corrígelos y reenvía
                            </p>
                        </div>
                        <div className="space-y-2">
                            {rejectedFields.map((rf, i) => (
                                <div key={i} className="flex items-start gap-2.5 p-3 bg-white rounded-xl border border-red-100">
                                    <MessageSquare size={12} className="text-red-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-[11px] font-black text-slate-700 uppercase tracking-wide">{rf.label}</p>
                                        <p className="text-[11px] text-slate-500 font-medium italic mt-0.5">"{rf.reason || 'Sin motivo'}"</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Read-only hint */}
                {!isEditing && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-center gap-2.5">
                        <Info size={14} className="text-slate-400 shrink-0" />
                        <p className="text-xs text-slate-500 font-medium flex-1">
                            Modo visualización · Haz clic en <strong>Editar información</strong> para modificar los campos.
                        </p>
                        <ChevronRight size={14} className="text-slate-300" />
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* ── Directorio de Contactos ── */}
                    <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                        <SectionHeader
                            icon={Users}
                            title="Directorio de Contactos"
                            right={
                                <Button type="button" onClick={addContact} disabled={locked('contacts')}
                                    className={cn("h-8 rounded-xl px-3 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5",
                                        locked('contacts') ? "bg-slate-100 text-slate-300 cursor-not-allowed" : "bg-slate-900 text-white hover:bg-slate-800")}>
                                    <Plus size={12} /> Agregar
                                </Button>
                            }
                        />
                        <div className="p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-slate-500 font-medium">Personas clave para comunicación institucional.</p>
                                <StatusDot status={fieldStatus('contacts')} />
                            </div>
                            {data.contacts.map((contact: any, idx: number) => (
                                <div key={idx} className={cn(
                                    "relative rounded-2xl border p-5 group transition-all",
                                    isEditing ? "border-slate-200 bg-slate-50/50 hover:border-slate-300" : "border-slate-100 bg-white"
                                )}>
                                    <div className="absolute -top-2.5 left-4 px-2.5 py-0.5 bg-white border border-slate-200 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest shadow-sm">
                                        Contacto #{idx + 1}
                                    </div>
                                    {data.contacts.length > 1 && !locked('contacts') && (
                                        <button type="button" onClick={() => removeContact(idx)}
                                            className="absolute -top-2.5 -right-2.5 h-6 w-6 rounded-full bg-white border border-red-100 text-red-300 hover:text-red-500 hover:bg-red-50 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Trash2 size={11} />
                                        </button>
                                    )}
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-1">
                                        {[
                                            { key: 'area', label: 'Área/Depto', placeholder: 'Gerencia' },
                                            { key: 'name', label: 'Nombre', placeholder: 'Nombre completo' },
                                            { key: 'position', label: 'Cargo', placeholder: 'Ej. Coordinador' },
                                            { key: 'email', label: 'Email', placeholder: 'correo@empresa.com' },
                                            { key: 'phone', label: 'Teléfono', placeholder: '+57 300...' },
                                        ].map(f => (
                                            <div key={f.key} className="space-y-1.5">
                                                <Label className="text-[10px] font-black uppercase text-slate-500">{f.label}</Label>
                                                <Input
                                                    type={f.key === 'email' ? 'email' : 'text'}
                                                    value={contact[f.key]}
                                                    onChange={e => updateContact(idx, f.key, e.target.value)}
                                                    disabled={locked('contacts')}
                                                    placeholder={f.placeholder}
                                                    className={cn("rounded-xl text-xs h-9 border-slate-200", locked('contacts') && "bg-slate-50 text-slate-400 cursor-not-allowed")}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ── Info Comercial (2 col) ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        {/* CIIU */}
                        <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
                                <div className="flex items-center gap-2.5">
                                    <div className="h-7 w-7 rounded-lg bg-slate-900 flex items-center justify-center shrink-0"><Briefcase size={14} className="text-white" /></div>
                                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Actividad Económica (CIIU)</h2>
                                </div>
                                <StatusDot status={fieldStatus('main_ciiu')} />
                            </div>
                            <div className="p-5">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase text-slate-500">Código Principal <span className="text-red-400">*</span></Label>
                                        <Input
                                            value={data.main_ciiu}
                                            onChange={e => setData('main_ciiu', e.target.value)}
                                            disabled={locked('main_ciiu')}
                                            placeholder="Ej. 4111"
                                            className={cn("rounded-xl text-sm font-bold text-center", locked('main_ciiu') && "bg-slate-50 text-slate-400 cursor-not-allowed")}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase text-slate-500">Código Secundario</Label>
                                        <Input
                                            value={data.secondary_ciiu}
                                            onChange={e => setData('secondary_ciiu', e.target.value)}
                                            disabled={locked('secondary_ciiu')}
                                            placeholder="Opcional"
                                            className={cn("rounded-xl text-sm font-bold text-center", locked('secondary_ciiu') && "bg-slate-50 text-slate-400 cursor-not-allowed")}
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Billing + Tipo */}
                        <div className="space-y-5">
                            <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                                <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
                                    <div className="flex items-center gap-2.5">
                                        <div className="h-7 w-7 rounded-lg bg-slate-900 flex items-center justify-center shrink-0"><Mail size={14} className="text-white" /></div>
                                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Facturación Electrónica</h2>
                                    </div>
                                    <StatusDot status={fieldStatus('billing_email')} />
                                </div>
                                <div className="p-5">
                                    <div className="relative">
                                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        <Input
                                            type="email"
                                            value={data.billing_email}
                                            onChange={e => setData('billing_email', e.target.value)}
                                            disabled={locked('billing_email')}
                                            placeholder="facturacion@empresa.com"
                                            className={cn("pl-9 rounded-xl text-sm", locked('billing_email') && "bg-slate-50 text-slate-400 cursor-not-allowed")}
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                                <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
                                    <div className="flex items-center gap-2.5">
                                        <div className="h-7 w-7 rounded-lg bg-slate-900 flex items-center justify-center shrink-0"><Building2 size={14} className="text-white" /></div>
                                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Tipo de Empresa</h2>
                                    </div>
                                    <StatusDot status={fieldStatus('company_type')} />
                                </div>
                                <div className="p-5">
                                    <div className="flex flex-wrap gap-2">
                                        {['Suministros', 'Constructor', 'Consultor', 'Proveedor', 'Otros'].map(type => (
                                            <button key={type} type="button"
                                                onClick={() => !locked('company_type') && toggleCompanyType(type)}
                                                disabled={locked('company_type')}
                                                className={cn(
                                                    "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                                                    data.company_type?.includes(type)
                                                        ? "bg-slate-900 text-white border-slate-900"
                                                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-400",
                                                    locked('company_type') && "opacity-40 cursor-not-allowed pointer-events-none"
                                                )}
                                            >{type}</button>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* ── Referencias de Respaldo ── */}
                    <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                        <SectionHeader
                            icon={ShieldCheck}
                            title="Referencias de Respaldo"
                            right={
                                <div className="flex gap-2">
                                    {[
                                        { type: 'commercial' as const, label: 'Comercial', color: 'bg-slate-900 text-white hover:bg-slate-800' },
                                        { type: 'bank' as const, label: 'Bancaria', color: 'bg-emerald-600 text-white hover:bg-emerald-700' },
                                    ].map(btn => (
                                        <button key={btn.type} type="button"
                                            onClick={() => !locked('references') && addReference(btn.type)}
                                            disabled={locked('references')}
                                            className={cn("h-8 rounded-xl px-3 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5", btn.color, locked('references') && "opacity-40 cursor-not-allowed pointer-events-none")}>
                                            <Plus size={11} /> {btn.label}
                                        </button>
                                    ))}
                                </div>
                            }
                        />
                        <div className="p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-slate-500 font-medium">Referencias comerciales y bancarias de respaldo institucional.</p>
                                <StatusDot status={fieldStatus('references')} />
                            </div>
                            {data.references.map((ref: any, idx: number) => (
                                <div key={idx} className="relative rounded-2xl border border-slate-100 bg-white p-5 group hover:border-slate-200 transition-all shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border",
                                            ref.type === 'bank'
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                : "bg-blue-50 text-blue-700 border-blue-100"
                                        )}>
                                            {ref.type === 'bank' ? '🏦 Referencia Bancaria' : '🤝 Referencia Comercial'}
                                        </span>
                                        {!locked('references') && (
                                            <div className="flex items-center gap-2">
                                                <button type="button" onClick={() => updateReference(idx, 'type', ref.type === 'commercial' ? 'bank' : 'commercial')}
                                                    className="text-slate-300 hover:text-slate-600 transition-colors" title="Cambiar tipo">
                                                    <Globe size={14} />
                                                </button>
                                                {data.references.length > 1 && (
                                                    <button type="button" onClick={() => removeReference(idx)}
                                                        className="text-slate-300 hover:text-red-500 transition-colors">
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        <Input
                                            value={ref.name}
                                            onChange={e => updateReference(idx, 'name', e.target.value)}
                                            disabled={locked('references')}
                                            placeholder={ref.type === 'bank' ? 'Nombre del banco' : 'Nombre de la empresa'}
                                            className={cn("rounded-xl text-sm font-bold", locked('references') && "bg-slate-50 text-slate-400 cursor-not-allowed")}
                                        />
                                        <div className="grid grid-cols-2 gap-3">
                                            <Input value={ref.contact_person} onChange={e => updateReference(idx, 'contact_person', e.target.value)}
                                                disabled={locked('references')} placeholder="Persona de contacto"
                                                className={cn("rounded-xl text-xs", locked('references') && "bg-slate-50 text-slate-400 cursor-not-allowed")} />
                                            <Input value={ref.phone} onChange={e => updateReference(idx, 'phone', e.target.value)}
                                                disabled={locked('references')} placeholder="Teléfono"
                                                className={cn("rounded-xl text-xs", locked('references') && "bg-slate-50 text-slate-400 cursor-not-allowed")} />
                                        </div>
                                        <Input type="email" value={ref.email} onChange={e => updateReference(idx, 'email', e.target.value)}
                                            disabled={locked('references')} placeholder="Email de la referencia"
                                            className={cn("rounded-xl text-xs", locked('references') && "bg-slate-50 text-slate-400 cursor-not-allowed")} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ── Canales Digitales ── */}
                    <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
                            <div className="flex items-center gap-2.5">
                                <div className="h-7 w-7 rounded-lg bg-slate-900 flex items-center justify-center shrink-0"><Globe size={14} className="text-white" /></div>
                                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Canales Digitales</h2>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Opcionales</span>
                        </div>
                        <div className="p-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { key: 'social_instagram', label: 'Instagram', icon: Instagram, placeholder: '@empresa', color: 'group-focus-within:text-pink-500' },
                                    { key: 'social_facebook', label: 'Facebook', icon: Facebook, placeholder: 'facebook.com/empresa', color: 'group-focus-within:text-blue-600' },
                                    { key: 'social_linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'linkedin.com/company/...', color: 'group-focus-within:text-blue-700' },
                                    { key: 'social_other', label: 'Otras / Portafolio', icon: Link, placeholder: 'Sitios adicionales...', color: 'group-focus-within:text-slate-900' },
                                ].map(s => (
                                    <div key={s.key} className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase text-slate-500">{s.label}</Label>
                                        <div className="relative group">
                                            <s.icon size={14} className={cn("absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 transition-colors pointer-events-none", s.color)} />
                                            <Input
                                                value={data[s.key as keyof typeof data] as string}
                                                onChange={e => setData(s.key as any, e.target.value)}
                                                disabled={locked(s.key)}
                                                placeholder={s.placeholder}
                                                className={cn("pl-9 rounded-xl text-xs bg-slate-50", locked(s.key) && "text-slate-400 cursor-not-allowed")}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Bottom save bar */}
                    {isEditing && (
                        <div className="flex items-center justify-between pt-1">
                            <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                                <ShieldCheck size={12} />
                                Al guardar, los datos quedan en revisión. CAMEP te notificará el resultado.
                            </p>
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-xl text-slate-600 border-slate-200">Cancelar</Button>
                                <Button onClick={handleSubmit} disabled={processing}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-2">
                                    <ShieldCheck size={14} />
                                    {processing ? 'Guardando...' : 'Enviar a revisión'}
                                </Button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </AppLayout>
    );
}
