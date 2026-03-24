import React, { useState, useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/Button';
import { Input } from '@/Components/ui/Input';
import { Label } from '@/Components/ui/Label';
import {
    Users,
    ShieldCheck,
    CheckCircle2,
    Pencil,
    MessageSquare,
    AlertCircle,
    UserCircle,
    Building,
    Target,
    BarChart3,
    X,
    ChevronRight,
    Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
    auth: any;
    initialAssociate?: any;
}

const EMPLOYEE_CATS = [
    { id: 'employees_tech',  label: 'Técnico' },
    { id: 'employees_prof',  label: 'Profesional' },
    { id: 'employees_admin', label: 'Administrativo' },
    { id: 'employees_exec',  label: 'Directivo' },
    { id: 'employees_other', label: 'Otros' },
];

function completionScore(data: any) {
    const checks = [
        !!data.company_classification,
        data.employees_direct_count > 0,
        (Number(data.public_income_pct) + Number(data.private_income_pct)) === 100,
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

function YesNoToggle({
    value, onChange, disabled, yesLabel = 'SÍ', noLabel = 'NO',
}: { value: boolean; onChange: (v: boolean) => void; disabled: boolean; yesLabel?: string; noLabel?: string }) {
    return (
        <div className="flex gap-2">
            {[true, false].map(v => (
                <button
                    key={String(v)}
                    type="button"
                    onClick={() => !disabled && onChange(v)}
                    disabled={disabled}
                    className={cn(
                        "flex-1 py-2.5 rounded-xl text-xs font-black transition-all border",
                        value === v
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50",
                        disabled && "opacity-40 cursor-not-allowed pointer-events-none"
                    )}
                >
                    {v ? yesLabel : noLabel}
                </button>
            ))}
        </div>
    );
}

export default function Characterization({ auth, initialAssociate }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [saved, setSaved] = useState(false);
    const auditLog = initialAssociate?.audit_log || {};

    const { data, setData, post, processing } = useForm({
        employees_tech:            initialAssociate?.employees_tech            || 0,
        employees_prof:            initialAssociate?.employees_prof            || 0,
        employees_admin:           initialAssociate?.employees_admin           || 0,
        employees_exec:            initialAssociate?.employees_exec            || 0,
        employees_other:           initialAssociate?.employees_other           || 0,
        employees_other_desc:      initialAssociate?.employees_other_desc      || '',
        employees_direct_count:    initialAssociate?.employees_direct_count    || 0,
        hydrocarbons_participation: !!initialAssociate?.hydrocarbons_participation,
        hydrocarbons_level:        initialAssociate?.hydrocarbons_level        || '',
        pep_declaration:           !!initialAssociate?.pep_declaration,
        pep_name:                  initialAssociate?.pep_name                  || '',
        pep_doc_type:              initialAssociate?.pep_doc_type              || '',
        pep_entity:                initialAssociate?.pep_entity                || '',
        other_guilds:              initialAssociate?.other_guilds              || '',
        capacitation_plan:         !!initialAssociate?.capacitation_plan,
        capacitation_level:        initialAssociate?.capacitation_level        || '',
        capacitation_no_reason:    initialAssociate?.capacitation_no_reason    || '',
        company_classification:    initialAssociate?.company_classification    || '',
        public_income_pct:         initialAssociate?.public_income_pct        || 0,
        private_income_pct:        initialAssociate?.private_income_pct       || 0,
    });

    // Auto-sum employees
    useEffect(() => {
        const total = (data.employees_tech || 0)
            + (data.employees_prof || 0)
            + (data.employees_admin || 0)
            + (data.employees_exec || 0)
            + (data.employees_other || 0);
        if (total !== data.employees_direct_count) {
            setData('employees_direct_count', total);
        }
    }, [data.employees_tech, data.employees_prof, data.employees_admin, data.employees_exec, data.employees_other]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('associate.company.update.characterization'), {
            onSuccess: () => {
                setIsEditing(false);
                setSaved(true);
                setTimeout(() => setSaved(false), 4000);
            },
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

    const rejectedFields = Object.entries(auditLog)
        .filter(([_, a]: [any, any]) => a.status === 'rejected')
        .map(([key, a]: [any, any]) => ({
            field: key,
            reason: a.reason,
            label: ({
                employees_direct_count:     'Total Empleados',
                hydrocarbons_participation: 'Participación Hidrocarburos',
                pep_declaration:            'Declaración PEP',
                company_classification:     'Clasificación de Empresa',
                public_income_pct:          'Ingresos Sector Público',
                private_income_pct:         'Ingresos Sector Privado',
                capacitation_plan:          'Plan de Capacitación',
                other_guilds:               'Afiliación a Gremios',
            } as Record<string, string>)[key] || key.replace(/_/g, ' '),
        }));

    const totalIncome = Number(data.public_income_pct) + Number(data.private_income_pct);

    return (
        <AppLayout>
            <Head title="Caracterización" />

            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Caracterización</h1>
                        <p className="text-slate-500 text-sm mt-1 font-medium">
                            Perfil operativo, talento humano y clasificación de tu organización.
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
                                <Button variant="outline" onClick={() => setIsEditing(false)} className="border-slate-200 text-slate-600 rounded-xl">
                                    Cancelar
                                </Button>
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
                {(() => { const score = completionScore(data); return (
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-4">
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider">Completitud del perfil</span>
                                <span className={cn("text-[11px] font-black", score.pct === 100 ? "text-emerald-600" : score.pct >= 60 ? "text-amber-600" : "text-red-500")}>
                                    {score.filled}/{score.total} criterios clave
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
                            <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                <CheckCircle2 size={18} className="text-emerald-600" />
                            </div>
                        ) : (
                            <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-[13px] font-black text-slate-600">
                                {score.pct}%
                            </div>
                        )}
                    </div>
                ); })()}

                {/* Success */}
                {saved && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-3">
                        <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-black text-emerald-800">¡Información enviada a revisión!</p>
                            <p className="text-xs text-emerald-600 font-medium mt-0.5">
                                CAMEP revisará los datos en los próximos días hábiles y recibirás una notificación.
                            </p>
                        </div>
                        <button onClick={() => setSaved(false)} className="text-emerald-400 hover:text-emerald-600"><X size={16} /></button>
                    </div>
                )}

                {/* Rejected summary */}
                {rejectedFields.length > 0 && (
                    <div className="rounded-2xl border border-red-200 bg-red-50/60 p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-8 w-8 rounded-xl bg-red-100 flex items-center justify-center shrink-0 text-red-600">
                                <AlertCircle size={16} />
                            </div>
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

                    {/* ── Capacidad Instalada ── */}
                    <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
                            <div className="flex items-center gap-2.5">
                                <div className="h-7 w-7 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
                                    <Users size={14} className="text-white" />
                                </div>
                                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Capacidad Instalada</h2>
                            </div>
                            {/* Total pill */}
                            <div className="flex items-center gap-2 bg-slate-900 text-white rounded-xl px-4 py-1.5">
                                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Total</span>
                                <span className="text-lg font-black">{data.employees_direct_count}</span>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                                {EMPLOYEE_CATS.map(cat => (
                                    <div key={cat.id} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">{cat.label}</Label>
                                            <StatusDot status={fieldStatus(cat.id)} />
                                        </div>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={data[cat.id as keyof typeof data] as number}
                                            onChange={e => setData(cat.id as any, parseInt(e.target.value) || 0)}
                                            disabled={locked(cat.id)}
                                            className={cn(
                                                "text-center text-sm font-black py-5 rounded-xl border-2 transition-all",
                                                locked(cat.id) ? "bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed" : "border-slate-200 focus:border-slate-900"
                                            )}
                                        />
                                    </div>
                                ))}
                            </div>

                            {data.employees_other > 0 && (
                                <div className="mt-5 pt-5 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Descripción de "Otros" perfiles</Label>
                                    <Input
                                        value={data.employees_other_desc}
                                        onChange={e => setData('employees_other_desc', e.target.value)}
                                        disabled={locked('employees_other_desc')}
                                        placeholder="Especifique los cargos adicionales..."
                                        className={cn("text-sm rounded-xl", locked('employees_other_desc') && "bg-slate-50 text-slate-400 cursor-not-allowed")}
                                    />
                                </div>
                            )}
                        </div>
                    </section>

                    {/* ── Hidrocarburos + PEP ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        {/* Hidrocarburos */}
                        <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
                                <div className="flex items-center gap-2.5">
                                    <div className="h-7 w-7 rounded-lg bg-slate-900 flex items-center justify-center shrink-0"><Target size={14} className="text-white" /></div>
                                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Hidrocarburos</h2>
                                </div>
                                <StatusDot status={fieldStatus('hydrocarbons_participation')} />
                            </div>
                            <div className="p-5 space-y-4">
                                <div>
                                    <Label className="text-xs font-bold text-slate-500 mb-2 block">¿Participa en licitaciones del sector?</Label>
                                    <YesNoToggle
                                        value={data.hydrocarbons_participation}
                                        onChange={v => setData('hydrocarbons_participation', v)}
                                        disabled={locked('hydrocarbons_participation')}
                                        yesLabel="SÍ PARTICIPA"
                                        noLabel="NO PARTICIPA"
                                    />
                                </div>
                                {data.hydrocarbons_participation && (
                                    <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                                        <Label className="text-xs font-bold text-slate-400 mb-2 block">Nivel de alcance</Label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['Nacional', 'Departamental', 'Municipal'].map(lvl => (
                                                <button key={lvl} type="button"
                                                    onClick={() => !locked('hydrocarbons_level') && setData('hydrocarbons_level', lvl)}
                                                    disabled={locked('hydrocarbons_level')}
                                                    className={cn(
                                                        "py-2 rounded-xl text-[10px] font-bold border transition-all",
                                                        data.hydrocarbons_level === lvl ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-400 border-slate-200 hover:border-slate-400",
                                                        locked('hydrocarbons_level') && "opacity-40 cursor-not-allowed pointer-events-none"
                                                    )}
                                                >{lvl}</button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* PEP */}
                        <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
                                <div className="flex items-center gap-2.5">
                                    <div className="h-7 w-7 rounded-lg bg-slate-900 flex items-center justify-center shrink-0"><UserCircle size={14} className="text-white" /></div>
                                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Persona PEP</h2>
                                </div>
                                <StatusDot status={fieldStatus('pep_declaration')} />
                            </div>
                            <div className="p-5 space-y-4">
                                <div>
                                    <Label className="text-xs font-bold text-slate-500 mb-2 block">¿Declara ser persona políticamente expuesta?</Label>
                                    <YesNoToggle
                                        value={data.pep_declaration}
                                        onChange={v => setData('pep_declaration', v)}
                                        disabled={locked('pep_declaration')}
                                        yesLabel="SÍ DECLARA"
                                        noLabel="NO DECLARA"
                                    />
                                </div>
                                {data.pep_declaration && (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                        <Input value={data.pep_name} onChange={e => setData('pep_name', e.target.value)}
                                            disabled={locked('pep_name')} placeholder="Nombre del PEP"
                                            className={cn("text-sm rounded-xl", locked('pep_name') && "bg-slate-50 text-slate-400 cursor-not-allowed")} />
                                        <div className="grid grid-cols-2 gap-2">
                                            <Input value={data.pep_doc_type} onChange={e => setData('pep_doc_type', e.target.value)}
                                                disabled={locked('pep_doc_type')} placeholder="Tipo de documento"
                                                className={cn("text-sm rounded-xl", locked('pep_doc_type') && "bg-slate-50 text-slate-400 cursor-not-allowed")} />
                                            <Input value={data.pep_entity} onChange={e => setData('pep_entity', e.target.value)}
                                                disabled={locked('pep_entity')} placeholder="Entidad"
                                                className={cn("text-sm rounded-xl", locked('pep_entity') && "bg-slate-50 text-slate-400 cursor-not-allowed")} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* ── Clasificación + Ingresos ── */}
                    <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
                            <div className="flex items-center gap-2.5">
                                <div className="h-7 w-7 rounded-lg bg-slate-900 flex items-center justify-center shrink-0"><Building size={14} className="text-white" /></div>
                                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Clasificación de Empresa</h2>
                            </div>
                            <StatusDot status={fieldStatus('company_classification')} />
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Tamaño */}
                            <div>
                                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3 block">Tamaño de la organización</Label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {['Grande', 'Mediana', 'Pequeña', 'Micro'].map(size => (
                                        <button key={size} type="button"
                                            onClick={() => !locked('company_classification') && setData('company_classification', size)}
                                            disabled={locked('company_classification')}
                                            className={cn(
                                                "p-4 rounded-2xl border-2 transition-all text-center",
                                                data.company_classification === size
                                                    ? "bg-slate-900 border-slate-900 shadow-lg"
                                                    : "bg-white border-slate-100 hover:border-slate-300",
                                                locked('company_classification') && "opacity-40 cursor-not-allowed pointer-events-none"
                                            )}
                                        >
                                            <div className={cn("h-2 w-2 rounded-full mx-auto mb-2", data.company_classification === size ? "bg-emerald-400" : "bg-slate-200")} />
                                            <span className={cn("text-xs font-black uppercase", data.company_classification === size ? "text-white" : "text-slate-500")}>{size}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Distribución de ingresos */}
                            <div className="pt-5 border-t border-slate-100">
                                <div className="flex items-center justify-between mb-4">
                                    <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Distribución de ingresos (%)</Label>
                                    <span className={cn(
                                        "text-[11px] font-black px-3 py-1 rounded-full",
                                        totalIncome === 100 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                                    )}>
                                        Total: {totalIncome}% {totalIncome !== 100 ? '— debe sumar 100%' : '✓'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        { key: 'public_income_pct', label: 'Sector Público', color: 'bg-emerald-500' },
                                        { key: 'private_income_pct', label: 'Sector Privado', color: 'bg-slate-900' },
                                    ].map(s => (
                                        <div key={s.key} className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <Label className="text-xs font-bold text-slate-600 uppercase">{s.label}</Label>
                                                <span className="text-sm font-black text-slate-900">{data[s.key as keyof typeof data]}%</span>
                                            </div>
                                            <div className="relative">
                                                <Input
                                                    type="number" min="0" max="100"
                                                    value={data[s.key as keyof typeof data] as number}
                                                    onChange={e => {
                                                        const val = Math.min(100, parseInt(e.target.value) || 0);
                                                        const other = s.key === 'public_income_pct' ? 'private_income_pct' : 'public_income_pct';
                                                        setData({ ...data, [s.key]: val, [other]: 100 - val });
                                                    }}
                                                    disabled={locked(s.key)}
                                                    className={cn("rounded-xl text-sm font-bold py-5 border-slate-100 bg-slate-50", locked(s.key) && "opacity-50 cursor-not-allowed")}
                                                />
                                                <div className={cn("absolute bottom-0 left-0 h-[3px] rounded-b-xl transition-all duration-500", s.color)}
                                                    style={{ width: `${data[s.key as keyof typeof data]}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ── Capacitación + Gremios ── */}
                    <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                        <SectionHeader icon={BarChart3} title="Capacitación y Gremios" />
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                                {/* Capacitación */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">¿Cuenta con plan de capacitación?</Label>
                                        <StatusDot status={fieldStatus('capacitation_plan')} />
                                    </div>
                                    <YesNoToggle
                                        value={data.capacitation_plan}
                                        onChange={v => setData('capacitation_plan', v)}
                                        disabled={locked('capacitation_plan')}
                                        yesLabel="SÍ TIENE"
                                        noLabel="NO TIENE"
                                    />
                                    {data.capacitation_plan && (
                                        <div className="animate-in slide-in-from-top-2 duration-200">
                                            <Label className="text-xs font-bold text-slate-400 mb-2 block">Nivel educativo principal</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {['Alta Gerencia', 'Media', 'Profesionales', 'Técnicos', 'Todos'].map(lvl => (
                                                    <button key={lvl} type="button"
                                                        onClick={() => !locked('capacitation_level') && setData('capacitation_level', lvl)}
                                                        disabled={locked('capacitation_level')}
                                                        className={cn(
                                                            "px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all",
                                                            data.capacitation_level === lvl ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200 hover:border-slate-400",
                                                            locked('capacitation_level') && "opacity-40 cursor-not-allowed pointer-events-none"
                                                        )}
                                                    >{lvl}</button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {!data.capacitation_plan && (
                                        <div className="animate-in slide-in-from-top-2 duration-200">
                                            <Label className="text-xs font-bold text-slate-400 mb-2 block">Principal motivo</Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {['Falta recursos', 'Desconocimiento', 'Falta oferta', 'Otro'].map(opt => (
                                                    <button key={opt} type="button"
                                                        onClick={() => !locked('capacitation_no_reason') && setData('capacitation_no_reason', opt)}
                                                        disabled={locked('capacitation_no_reason')}
                                                        className={cn(
                                                            "p-2.5 rounded-xl text-[10px] font-bold border text-left transition-all",
                                                            data.capacitation_no_reason === opt ? "bg-slate-100 border-slate-300 text-slate-800" : "bg-white border-slate-100 text-slate-400 hover:border-slate-300",
                                                            locked('capacitation_no_reason') && "opacity-40 cursor-not-allowed pointer-events-none"
                                                        )}
                                                    >{opt}</button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Gremios */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Afiliación a otros gremios</Label>
                                        <StatusDot status={fieldStatus('other_guilds')} />
                                    </div>
                                    <p className="text-[11px] text-slate-400 font-medium">Mencione qué otros gremios o asociaciones integra actualmente.</p>
                                    <textarea
                                        value={data.other_guilds}
                                        onChange={e => setData('other_guilds', e.target.value)}
                                        disabled={locked('other_guilds')}
                                        placeholder="Ej. ANDI, Camacol, ACOPI..."
                                        className={cn(
                                            "w-full border border-slate-200 rounded-xl p-4 text-sm min-h-[120px] resize-none transition-all focus:outline-none focus:border-slate-900",
                                            locked('other_guilds') ? "bg-slate-50 text-slate-400 cursor-not-allowed" : "bg-white"
                                        )}
                                    />
                                </div>
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
                                <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-xl text-slate-600 border-slate-200">
                                    Cancelar
                                </Button>
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
