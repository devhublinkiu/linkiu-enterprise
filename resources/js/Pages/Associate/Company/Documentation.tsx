import React, { useState, useRef } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/Button';
import { Label } from '@/Components/ui/Label';
import { Input } from '@/Components/ui/Input';
import {
    FileText,
    Upload,
    CheckCircle2,
    AlertTriangle,
    Pencil,
    ShieldCheck,
    MessageSquare,
    AlertCircle,
    FileCheck,
    Image as ImageIcon,
    ChevronRight,
    Download,
    Eye,
    Info,
    Check,
    X,
    FileDigit,
    Landmark,
    FileSpreadsheet,
    Scale,
    Signature,
    Share2,
    Building2,
    Building,
    Plus,
    Target,
    FileUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
    auth: any;
    initialAssociate?: any;
}

const MANDATORY_DOCS = [
    { name: 'Carta Solicitud Afiliación', icon: FileText, required: true, accept: '.pdf' },
    { name: 'Logo HD (JPG/PNG)', icon: ImageIcon, required: true, accept: '.jpg,.jpeg,.png' },
    { name: 'Brochure/Portafolio', icon: FileSpreadsheet, required: true, accept: '.pdf' },
    { name: 'RUT', icon: FileDigit, required: true, accept: '.pdf', legend: 'Del año más reciente' },
    { name: 'Cámara y Comercio / Registro Mercantil', icon: Landmark, required: true, accept: '.pdf', legend: 'Del año más reciente' },
    { name: 'Estados financieros con notas', icon: FileSpreadsheet, required: true, accept: '.pdf' },
    { name: 'Fotocopia de la cédula del representante legal', icon: ShieldCheck, required: true, accept: '.pdf' },
    { name: 'Antecedentes del contador público (Balance anterior)', icon: FileCheck, required: true, accept: '.pdf' },
    { name: 'Composición Accionaria', icon: CheckCircle2, required: true, accept: '.pdf' },
    { name: 'Certificación Parafiscales', icon: Check, required: true, accept: '.pdf' },
    { 
        name: 'Declaración de aceptación del PTEEI', 
        icon: FileText, 
        required: true, 
        accept: '.pdf', 
        legend: 'Usa la plantilla oficial', 
        template: '/plantillas_docs/FR-PICAMEP-006_V01_FORMATO_DECLARACION_DE_ACEPTACION_Y_AUTORIZACION_DEL_PTEEI.pdf' 
    },
    { 
        name: 'Compromiso de autoregulacion', 
        icon: Scale, 
        required: true, 
        accept: '.pdf', 
        legend: 'Usa la plantilla oficial', 
        template: '/plantillas_docs/FR-PICAMEP-005_FORMATO_COMPROMISO_DE_AUTOREGULACION.pdf' 
    },
    { 
        name: 'Transferencia de datos', 
        icon: Share2, 
        required: true, 
        accept: '.pdf', 
        legend: 'Usa la plantilla oficial', 
        template: '/plantillas_docs/FR-PICAMEP-004_FORMATO_TRANSFERENCIA_DE_DATOS.pdf' 
    },
    { 
        name: 'Acuerdo de Afiliación', 
        icon: FileText, 
        required: true, 
        accept: '.pdf', 
        legend: 'Usa la plantilla oficial', 
        template: '/plantillas_docs/FR-PICAMEP-003_FORMATO_ACUERDO_DE_AFILIACION.docx' 
    },
    { 
        name: 'Participación Accionaria', 
        icon: Building2, 
        required: true, 
        accept: '.pdf', 
        legend: 'Usa la plantilla oficial', 
        template: '/plantillas_docs/FR-PICAMEP-007_FORMATO_PARTICIPACION_ACCIONARIA.docx' 
    },
    { 
        name: 'Certificado tamaño empresas', 
        icon: Building, 
        required: true, 
        accept: '.pdf', 
        legend: 'Usa la plantilla oficial', 
        template: '/plantillas_docs/FR-PICAMEP-008_FORMATO_CERTIFICACION_DE_TAMAÑO_EMPRESA_JURIDICAS.docx' 
    },
];

const OPTIONAL_DOCS = [
    { name: 'Carta de residencia del Representante Legal', icon: FileText, required: false, accept: '.pdf' },
    { name: 'Última planilla de seguridad social', icon: FileCheck, required: false, accept: '.pdf' },
    { name: 'Certificaciones de calidad', icon: ShieldCheck, required: false, accept: '.pdf' },
];

const INTERESTS = ['Gestión Gremial', 'Información Sectorial', 'Comunidad de Negocios', 'Otro'];

function completionScore(data: any, fileUrls: any) {
    const mandatoryKeys = MANDATORY_DOCS.map(d => d.name);
    const uploadedMandatory = mandatoryKeys.filter(key => data.files[key] || fileUrls[key]).length;
    
    const checks = [
        uploadedMandatory === mandatoryKeys.length,
        data.rep_name?.trim().length > 0,
        data.rep_doc?.trim().length > 0,
        data.funds_origin_declaration === true,
        data.membership_interest?.length > 0
    ];
    
    const filled = checks.filter(Boolean).length;
    return { 
        filled, 
        total: checks.length, 
        pct: Math.round((filled / checks.length) * 100),
        docsFilled: uploadedMandatory,
        docsTotal: mandatoryKeys.length
    };
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

export default function Documentation({ auth, initialAssociate }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [saved, setSaved] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeDocKey, setActiveDocKey] = useState<string | null>(null);
    const auditLog = initialAssociate?.audit_log || {};
    const fileUrls = initialAssociate?.document_urls || {};

    const { data, setData, post, processing, errors } = useForm({
        files: {} as any,
        funds_origin_declaration: initialAssociate?.funds_origin_declaration || false,
        rep_name: initialAssociate?.rep_name || '',
        rep_doc: initialAssociate?.rep_doc || '',
        membership_interest: initialAssociate?.membership_interest || [] as string[],
    });

    const score = completionScore(data, fileUrls);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('associate.company.update.documentation'), {
            onSuccess: () => {
                setIsEditing(false);
                setSaved(true);
                setTimeout(() => setSaved(false), 5000);
            },
        });
    };

    const isLocked = (field: string) => {
        if (!isEditing) return true;
        if (field.startsWith('files.')) return false;
        if (auditLog[field]?.status === 'approved') return true;
        return false;
    };

    const fieldStatus = (field: string): string | null => {
        const a = auditLog[field] || (field.startsWith('files.') ? auditLog[field] : null);
        if (!a) return null;
        return a.status === 'approved' ? 'approved' : a.status === 'rejected' ? 'rejected' : null;
    };

    const handleUploadClick = (key: string) => {
        setActiveDocKey(key);
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && activeDocKey) {
            setData('files', { ...data.files, [activeDocKey]: file });
            if (e.target) e.target.value = '';
        }
    };

    const toggleInterest = (interest: string) => {
        if (isLocked('membership_interest')) return;
        const current = data.membership_interest || [];
        setData('membership_interest', current.includes(interest) ? current.filter((i: string) => i !== interest) : [...current, interest]);
    };

    const rejectedFields = Object.entries(auditLog)
        .filter(([_, a]: [any, any]) => a.status === 'rejected')
        .map(([key, a]: [any, any]) => ({
            field: key,
            reason: a.reason,
            label: ({
                funds_origin_declaration: 'Declaración de Fondos',
                rep_name: 'Representante Legal',
                membership_interest: 'Intereses de Afiliación',
            } as Record<string, string>)[key] || key.replace(/files\./g, 'Documento: ').replace(/_/g, ' '),
        }));

    const renderDocItem = (doc: any) => {
        const hasLocal = !!data.files[doc.name];
        const hasRemote = !!fileUrls[doc.name];
        const isUploaded = hasLocal || hasRemote;
        const fieldKey = `files.${doc.name}`;
        const status = fieldStatus(fieldKey);

        return (
            <div key={doc.name} className="flex flex-col gap-2">
                <div 
                    onClick={() => !isLocked(fieldKey) && handleUploadClick(doc.name)}
                    className={cn(
                        "relative group p-4 rounded-2xl border transition-all h-full flex flex-col justify-between",
                        isUploaded 
                            ? "bg-emerald-50/30 border-emerald-100 shadow-sm" 
                            : "bg-slate-50/50 border-slate-100 hover:border-slate-300",
                        !isLocked(fieldKey) ? "cursor-pointer" : "cursor-default grayscale-[0.5]"
                    )}
                >
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div className={cn(
                            "h-10 w-10 rounded-xl flex items-center justify-center transition-all shrink-0",
                            isUploaded ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/10" : "bg-white text-slate-300 group-hover:text-slate-500 border border-slate-50"
                        )}>
                            {isUploaded ? <Check size={20} className="stroke-[3]" /> : <doc.icon size={20} />}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            {doc.required && (
                                <span className={cn(
                                    "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest",
                                    isUploaded ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
                                )}>Obligatorio</span>
                            )}
                            <StatusDot status={status} />
                        </div>
                    </div>

                    <div className="space-y-1 mb-3">
                        <h4 className="text-[10px] font-black uppercase text-slate-700 leading-tight tracking-tight">{doc.name}</h4>
                        <p className="text-[9px] text-slate-400 font-bold italic line-clamp-1">
                            {hasLocal ? data.files[doc.name].name : (hasRemote ? 'Documento válido cargado' : doc.legend || doc.accept)}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100/50 mt-auto">
                        {hasRemote && (
                            <a href={fileUrls[doc.name]} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                                className="flex-1 h-8 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-900 transition-all flex items-center justify-center gap-1.5 text-[9px] font-black uppercase">
                                <Eye size={12} /> Ver
                            </a>
                        )}
                        {!isLocked(fieldKey) && (
                            <button className={cn(
                                "flex-1 h-8 rounded-lg transition-all flex items-center justify-center gap-1.5 text-[9px] font-black uppercase",
                                hasLocal ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-900 group-hover:text-white"
                            )}>
                                <Upload size={12} /> {hasLocal ? 'Reemplazar' : 'Cargar'}
                            </button>
                        )}
                        {doc.template && (
                            <a href={doc.template} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                                className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-500 hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center" title="Descargar plantilla">
                                <Download size={14} className="rotate-180" />
                            </a>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <AppLayout>
            <Head title="Documentación Legal" />

            <div className="max-w-5xl mx-auto space-y-6 pb-20">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">Carga de Documentación</h1>
                        <p className="text-slate-500 text-sm mt-2 font-medium">Requisitos legales y declaraciones juradas para socios CAMEP.</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        {!isEditing ? (
                            <Button onClick={() => { setIsEditing(true); setSaved(false); }}
                                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center gap-2 px-5 shadow-lg shadow-slate-900/10">
                                <Pencil size={14} /> Gestionar documentos
                            </Button>
                        ) : (
                            <>
                                <Button variant="outline" onClick={() => setIsEditing(false)} className="border-slate-200 text-slate-600 rounded-xl">Cancelar</Button>
                                <Button onClick={handleSubmit} disabled={processing || !data.funds_origin_declaration}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-2 px-5 shadow-lg shadow-emerald-600/10 transition-all">
                                    <ShieldCheck size={15} />
                                    {processing ? 'Subiendo...' : 'Enviar a revisión'}
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-4 shadow-sm">
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider">Cumplimiento documental</span>
                            <span className={cn("text-[11px] font-black", score.pct === 100 ? "text-emerald-600" : score.pct >= 60 ? "text-amber-600" : "text-red-500")}>
                                {score.docsFilled}/{score.docsTotal} obligatorios cargados
                            </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full transition-all duration-700", score.pct === 100 ? "bg-emerald-500" : score.pct >= 60 ? "bg-amber-400" : "bg-red-400")}
                                style={{ width: `${score.pct}%` }} />
                        </div>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                        <span className="text-[13px] font-black text-slate-600">{score.pct}%</span>
                    </div>
                </div>

                {/* Success Banner */}
                {saved && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-black text-emerald-800 uppercase tracking-tight">¡Documentación enviada con éxito!</p>
                            <p className="text-xs text-emerald-600 font-medium">CAMEP verificará la autenticidad de los archivos en 24-48 horas hábiles.</p>
                        </div>
                        <button onClick={() => setSaved(false)} className="text-emerald-400 hover:text-emerald-600"><X size={16} /></button>
                    </div>
                )}

                {/* Rejections */}
                {rejectedFields.length > 0 && (
                    <div className="rounded-2xl border border-red-200 bg-red-50/60 p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-8 w-8 rounded-xl bg-red-100 flex items-center justify-center shrink-0 text-red-600"><AlertCircle size={16} /></div>
                            <p className="text-sm font-black text-red-900 uppercase tracking-tight">{rejectedFields.length} observaciones de CAMEP</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {rejectedFields.map((rf, i) => (
                                <div key={i} className="flex items-start gap-2.5 p-3 bg-white rounded-xl border border-red-100">
                                    <MessageSquare size={12} className="text-red-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-black text-slate-700 uppercase tracking-wide">{rf.label}</p>
                                        <p className="text-[10px] text-slate-500 font-medium italic mt-0.5 leading-tight">"{rf.reason || 'Revise el documento cargado'}"</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Read-only Hint */}
                {!isEditing && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-center gap-2.5">
                        <Info size={14} className="text-slate-400 shrink-0" />
                        <p className="text-xs text-slate-500 font-medium flex-1">
                            Modo visualización · Haz clic en <strong>Gestionar documentos</strong> para subir o actualizar archivos.
                        </p>
                    </div>
                )}

                <div className="space-y-6">
                    {/* Archivos Obligatorios */}
                    <section className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                        <SectionHeader icon={FileUp} title="Documentación Obrigatoria" right={
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">PDF / JPG / PNG • Máx 10MB</span>
                        } />
                        <div className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {MANDATORY_DOCS.map(renderDocItem)}
                            </div>
                            
                            <div className="mt-10 pt-8 border-t border-slate-100">
                                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2 italic">
                                    <Plus size={14} className="text-slate-300" /> Otros Documentos y Certificaciones
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {OPTIONAL_DOCS.map(renderDocItem)}
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Intereses */}
                        <div className="lg:col-span-4">
                            <section className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm h-full flex flex-col">
                                <SectionHeader icon={Target} title="Interés de Afiliación" right={<StatusDot status={fieldStatus('membership_interest')} />} />
                                <div className="p-6 space-y-2">
                                    {INTERESTS.map(interest => (
                                        <button key={interest} type="button" onClick={() => toggleInterest(interest)} disabled={isLocked('membership_interest')}
                                            className={cn("w-full flex items-center gap-3 p-4 border rounded-2xl transition-all group",
                                                data.membership_interest?.includes(interest) ? "border-slate-900 bg-slate-900/5 shadow-sm" : "border-slate-100 hover:border-slate-200 bg-slate-50/10",
                                                isLocked('membership_interest') && "opacity-50 cursor-not-allowed")}>
                                            <div className={cn("h-5 w-5 rounded-lg border-2 flex items-center justify-center transition-all",
                                                data.membership_interest?.includes(interest) ? "bg-slate-900 border-slate-900" : "bg-white border-slate-200")}>
                                                {data.membership_interest?.includes(interest) && <Check size={12} className="text-white stroke-[3]" />}
                                            </div>
                                            <span className={cn("text-[10px] font-black uppercase tracking-wide", data.membership_interest?.includes(interest) ? "text-slate-900" : "text-slate-400")}>{interest}</span>
                                        </button>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Declaración Jurada */}
                        <div className="lg:col-span-8">
                            <section className="rounded-3xl border border-slate-900 bg-slate-900 text-white overflow-hidden shadow-2xl relative">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-[80px] pointer-events-none" />
                                <SectionHeader icon={Signature} title="Declaración Jurada" />
                                <div className="p-8 space-y-8 relative z-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Representante Legal</Label>
                                            <Input value={data.rep_name} onChange={e => setData('rep_name', e.target.value)} disabled={isLocked('rep_name')}
                                                placeholder="Nombre como en CC" className="bg-white/5 border-white/10 text-white h-11 rounded-xl focus:bg-white focus:text-slate-900 placeholder:text-white/10 transition-all font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Cédula de Ciudadanía</Label>
                                            <Input value={data.rep_doc} onChange={e => setData('rep_doc', e.target.value)} disabled={isLocked('rep_doc')}
                                                placeholder="Número de identificación" className="bg-white/5 border-white/10 text-white h-11 rounded-xl focus:bg-white focus:text-slate-900 placeholder:text-white/10 transition-all font-bold" />
                                        </div>
                                    </div>

                                    <div className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-1 w-8 bg-emerald-500 rounded-full" />
                                            <h4 className="text-white font-black text-[9px] uppercase tracking-[0.2em] italic">Manifestación del buen origen de fondos</h4>
                                        </div>
                                        <p className="text-slate-400 text-xs leading-relaxed italic pr-4">
                                            Yo, <span className="text-emerald-400 font-black">{data.rep_name || '[Representante]'}</span>, bajo la gravedad del juramento, declaro que los recursos de mi representada provienen de actividades lícitas y no serán destinados a financiación de actos delictivos. Autorizo el tratamiento de mis datos personales para fines de verificación gremial.
                                        </p>
                                    </div>

                                    <div onClick={() => !isLocked('funds_origin_declaration') && setData('funds_origin_declaration', !data.funds_origin_declaration)}
                                        className={cn("p-6 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-6",
                                            data.funds_origin_declaration ? "bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-500/20" : "bg-white/5 border-white/10 group")}>
                                        <div className="flex items-center gap-4">
                                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                                                data.funds_origin_declaration ? "bg-white text-emerald-600 scale-110" : "bg-white/5 text-white/20")}>
                                                <Signature size={24} />
                                            </div>
                                            <div>
                                                <h5 className={cn("text-[10px] font-black uppercase tracking-widest", data.funds_origin_declaration ? "text-slate-950" : "text-white/40")}>Firma Digital de Aceptación</h5>
                                                <p className={cn("text-[10px] font-bold italic", data.funds_origin_declaration ? "text-slate-900/80" : "text-white/20")}>
                                                    {data.funds_origin_declaration ? 'Manifestación firmada legalmente.' : 'Haz clic para firmar como Representante Legal.'}
                                                </p>
                                            </div>
                                        </div>
                                        {data.funds_origin_declaration ? <CheckCircle2 size={24} className="text-slate-950" /> : <div className="w-8 h-8 rounded-full border-4 border-white/10 group-hover:border-white/20" />}
                                    </div>
                                    
                                    <div className="flex items-center justify-between opacity-30 px-2 pt-2 border-t border-white/5">
                                         <span className="text-[8px] font-black uppercase tracking-widest">Trust Identity V2.44</span>
                                         <StatusDot status={fieldStatus('funds_origin_declaration')} />
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>

                {/* Sticky Save Bar */}
                {isEditing && (
                    <div className="sticky bottom-4 z-20 flex items-center justify-between p-4 bg-slate-900 rounded-3xl shadow-2xl shadow-slate-900/40 border border-white/10 backdrop-blur-md animate-in slide-in-from-bottom-5">
                        <div className="hidden sm:flex items-center gap-3 pl-2">
                            <div className="h-9 w-9 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/20">
                                <ShieldCheck size={18} className="text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Gestión Documental</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Sube archivos y firma antes de enviar</p>
                            </div>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <Button variant="ghost" onClick={() => setIsEditing(false)} className="flex-1 sm:flex-none text-white hover:bg-white/10 rounded-xl px-6 h-12 text-xs font-black uppercase">Cancelar</Button>
                            <Button onClick={handleSubmit} disabled={processing || !data.funds_origin_declaration}
                                className="flex-1 sm:flex-none bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl px-10 h-12 text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20">
                                {processing ? 'Subiendo...' : 'Confirmar y Enviar'}
                            </Button>
                        </div>
                    </div>
                )}

                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
            </div>
        </AppLayout>
    );
}

const style = `
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
`;
