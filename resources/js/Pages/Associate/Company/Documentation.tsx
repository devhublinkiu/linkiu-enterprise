import React, { useState, useRef, useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/Button';
import { Label } from '@/Components/ui/Label';
import { Input } from '@/Components/ui/Input';
import {
    FileText,
    Upload,
    CheckCircle2,
    ShieldCheck,
    FileCheck,
    Image as ImageIcon,
    Download,
    Eye,
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
    FileUp,
    ChevronLeft,
    Save,
    Send,
    ExternalLink,
    Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/Components/FieldWrapper';
import SectionReviewBanner, { SectionReview } from '@/Components/SectionReviewBanner';
import { getDocumentIcon } from '@/lib/documentIcons';

interface DocSpec {
    key: string;
    label: string;
    icon: string;
    accepts: string[];
    legend?: string;
    template?: string;
}

interface DocumentCatalog {
    mandatory: DocSpec[];
    optional: DocSpec[];
}

interface Props {
    auth: any;
    flash: any;
    initialAssociate?: any;
    documentCatalog: DocumentCatalog;
}

const INTERESTS = ['Gestión Gremial', 'Información Sectorial', 'Comunidad de Negocios', 'Otro'];

function acceptAttr(accepts: string[]): string {
    return accepts.map(a => `.${a}`).join(',');
}

function completionScore(data: any, fileUrls: any, mandatory: DocSpec[]) {
    const uploadedMandatory = mandatory.filter(d => data.files[d.key] || fileUrls[d.key]).length;

    const checks = [
        uploadedMandatory === mandatory.length,
        data.rep_name?.trim().length > 0,
        data.rep_doc?.trim().length > 0,
        data.funds_origin_declaration === true,
        data.membership_interest?.length > 0
    ];

    const filled = checks.filter(Boolean).length;
    return {
        filled,
        total:      checks.length,
        pct:        Math.round((filled / checks.length) * 100),
        docsFilled: uploadedMandatory,
        docsTotal:  mandatory.length
    };
}

function DocPreviewModal({ url, name, onClose }: { url: string; name: string; onClose: () => void }) {
    const isImage = /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-7 w-7 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
                            <FileText size={13} className="text-white" />
                        </div>
                        <p className="text-[11px] font-black uppercase text-slate-700 tracking-wide truncate">{name}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-500 hover:text-slate-900 border border-slate-200 rounded-lg px-3 py-1.5 transition-all hover:bg-slate-50"
                        >
                            <ExternalLink size={12} /> Abrir en pestaña
                        </a>
                        <button
                            onClick={onClose}
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden bg-slate-50 min-h-0">
                    {isImage ? (
                        <div className="h-full flex items-center justify-center p-6">
                            <img src={url} alt={name} className="max-w-full max-h-full object-contain rounded-xl" />
                        </div>
                    ) : (
                        <iframe
                            src={url}
                            title={name}
                            className="w-full h-full min-h-[65vh] border-0"
                        />
                    )}
                </div>
            </div>
        </div>
    );
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
            {right && <div className="flex items-center gap-2">{right}</div>}
        </div>
    );
}

export default function Documentation({ auth, flash, initialAssociate, documentCatalog }: Props) {
    const sectionReview: SectionReview = initialAssociate?.section_reviews?.documentation ?? { status: 'draft' };
    const sectionStatus = sectionReview.status;
    const canEdit = ['draft', 'rejected'].includes(sectionStatus);

    const [notification, setNotification] = useState<{ type: 'success' | 'draft' | 'error'; msg: string } | null>(null);
    const [previewDoc, setPreviewDoc]     = useState<{ url: string; name: string } | null>(null);
    const fileInputRef                    = useRef<HTMLInputElement>(null);
    const [activeDocKey, setActiveDocKey] = useState<string | null>(null);
    const [activeAccept, setActiveAccept] = useState<string>('');

    const fileUrls = initialAssociate?.document_urls || {};

    const { data, setData, post, processing, errors } = useForm({
        files:                       {} as any,
        funds_origin_declaration:    initialAssociate?.funds_origin_declaration || false,
        rep_name:                    initialAssociate?.rep_name || '',
        rep_doc:                     initialAssociate?.rep_doc || '',
        membership_interest:         initialAssociate?.membership_interest || [] as string[],
        membership_interest_other:   initialAssociate?.membership_interest_other || '',
    });

    const score = completionScore(data, fileUrls, documentCatalog.mandatory);

    const fieldStatus = (_field: string): string => canEdit ? 'editable' : sectionStatus;
    const isLocked    = (_field: string) => !canEdit;

    useEffect(() => {
        if (flash?.draft_saved) setNotification({ type: 'draft', msg: `Borrador guardado · ${flash.draft_saved}` });
        if (flash?.success)     setNotification({ type: 'success', msg: flash.success });
        if (flash?.error)       setNotification({ type: 'error', msg: flash.error });
        if (flash) {
            const t = setTimeout(() => setNotification(null), 5000);
            return () => clearTimeout(t);
        }
    }, [flash]);

    const handleSubmit    = () => post(route('associate.company.update.documentation'));
    const handleSaveDraft = () => post(route('associate.company.save.documentation.draft'));

    const handleUploadClick = (key: string, accepts: string[]) => {
        setActiveDocKey(key);
        setActiveAccept(acceptAttr(accepts));
        // Defer the click so the accept attr is applied before the dialog opens.
        setTimeout(() => fileInputRef.current?.click(), 0);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && activeDocKey) {
            setData('files', { ...data.files, [activeDocKey]: file });
            if (e.target) e.target.value = '';
        }
    };

    const handleDeleteDoc = (key: string, label: string) => {
        if (!confirm(`¿Eliminar el documento "${label}"? Esta acción no se puede deshacer.`)) return;
        router.delete(route('associate.company.documentation.delete', { docKey: key }), {
            preserveScroll: true,
        });
    };

    const toggleInterest = (interest: string) => {
        if (isLocked('membership_interest')) return;
        const current = data.membership_interest || [];
        const next = current.includes(interest)
            ? current.filter((i: string) => i !== interest)
            : [...current, interest];
        setData('membership_interest', next);
        if (interest === 'Otro' && current.includes('Otro')) {
            setData('membership_interest_other', '');
        }
    };

    const renderDocItem = (doc: DocSpec) => {
        const Icon       = getDocumentIcon(doc.icon);
        const hasLocal   = !!data.files[doc.key];
        const hasRemote  = !!fileUrls[doc.key];
        const isUploaded = hasLocal || hasRemote;
        const fieldKey   = `files.${doc.key}`;
        const status     = fieldStatus(fieldKey);
        const required   = documentCatalog.mandatory.some(m => m.key === doc.key);

        return (
            <div key={doc.key} className="flex flex-col gap-2">
                <div
                    onClick={() => !isLocked(fieldKey) && handleUploadClick(doc.key, doc.accepts)}
                    className={cn(
                        "relative group p-4 rounded-2xl border transition-all h-full flex flex-col justify-between",
                        isUploaded
                            ? "bg-emerald-50/30 border-emerald-100"
                            : "bg-slate-50/50 border-slate-100 hover:border-slate-300",
                        !isLocked(fieldKey) ? "cursor-pointer" : "cursor-default grayscale-[0.5]"
                    )}
                >
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div className={cn(
                            "h-10 w-10 rounded-xl flex items-center justify-center transition-all shrink-0",
                            isUploaded ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/10" : "bg-white text-slate-300 group-hover:text-slate-500 border border-slate-50"
                        )}>
                            {isUploaded ? <Check size={20} className="stroke-[3]" /> : <Icon size={20} />}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            {required && (
                                <span className={cn(
                                    "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest",
                                    isUploaded ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
                                )}>Obligatorio</span>
                            )}
                            <StatusBadge status={status === 'editable' ? null : status} />
                        </div>
                    </div>

                    <div className="space-y-1 mb-3">
                        <h4 className="text-[10px] font-black uppercase text-slate-700 leading-tight tracking-tight">{doc.label}</h4>
                        {doc.legend && (
                            <p className="text-[9px] text-amber-700 font-bold leading-tight line-clamp-2">
                                {doc.legend}
                            </p>
                        )}
                        <p className="text-[9px] text-slate-400 font-bold italic line-clamp-1">
                            {hasLocal ? data.files[doc.key].name : (hasRemote ? 'Documento válido cargado' : acceptAttr(doc.accepts))}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100/50 mt-auto">
                        {hasRemote && (
                            <button
                                onClick={e => { e.stopPropagation(); setPreviewDoc({ url: fileUrls[doc.key], name: doc.label }); }}
                                className="flex-1 h-8 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-900 transition-all flex items-center justify-center gap-1.5 text-[9px] font-black uppercase"
                            >
                                <Eye size={12} /> Ver
                            </button>
                        )}
                        {!isLocked(fieldKey) && (
                            <button className={cn(
                                "flex-1 h-8 rounded-lg transition-all flex items-center justify-center gap-1.5 text-[9px] font-black uppercase",
                                hasLocal ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-900 group-hover:text-white"
                            )}>
                                <Upload size={12} /> {hasLocal ? 'Reemplazar' : 'Cargar'}
                            </button>
                        )}
                        {!isLocked(fieldKey) && hasRemote && (
                            <button
                                onClick={e => { e.stopPropagation(); handleDeleteDoc(doc.key, doc.label); }}
                                title="Eliminar documento"
                                className="h-8 w-8 rounded-lg bg-red-50 border border-red-100 text-red-500 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center shrink-0"
                            >
                                <Trash2 size={14} />
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

    const hasOtroInterest = (data.membership_interest || []).includes('Otro');

    return (
        <AppLayout>
            <Head title="Documentación Legal" />

            {previewDoc && (
                <DocPreviewModal
                    url={previewDoc.url}
                    name={previewDoc.name}
                    onClose={() => setPreviewDoc(null)}
                />
            )}

            <div className="max-w-5xl mx-auto space-y-6 pb-20">

                {/* Header */}
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <Link href={route('dashboard')} className="hover:text-slate-900 transition-colors text-xs font-bold">Dashboard</Link>
                        <ChevronLeft size={14} className="rotate-180" />
                        <span className="text-slate-900 font-bold text-xs">Documentación</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Carga de Documentación</h1>
                    <p className="text-slate-500 text-sm font-medium">Requisitos legales y declaraciones juradas para socios CAMEP.</p>
                </div>

                <SectionReviewBanner
                    section="documentation"
                    review={sectionReview}
                    notification={notification}
                    onCloseNotification={() => setNotification(null)}
                />

                {/* Progress Bar */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-4">
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider">Cumplimiento documental</span>
                            <span className="text-[11px] font-black text-slate-600">
                                {score.docsFilled}/{score.docsTotal} obligatorios cargados
                            </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full bg-slate-900 transition-all duration-700"
                                style={{ width: `${(score.docsFilled / score.docsTotal) * 100}%` }}
                            />
                        </div>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                        <span className="text-[13px] font-black text-slate-600">{score.pct}%</span>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Archivos Obligatorios */}
                    <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                        <SectionHeader icon={FileUp} title="Documentación Obligatoria" right={
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">PDF / JPG / PNG • Máx 10MB</span>
                        } />
                        <div className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {documentCatalog.mandatory.map(renderDocItem)}
                            </div>

                            <div className="mt-10 pt-8 border-t border-slate-100">
                                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2 italic">
                                    <Plus size={14} className="text-slate-300" /> Otros Documentos y Certificaciones
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {documentCatalog.optional.map(renderDocItem)}
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Intereses de Afiliación */}
                        <div className="lg:col-span-4">
                            <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden h-full flex flex-col">
                                <SectionHeader
                                    icon={Target}
                                    title="Interés de Afiliación"
                                    right={<StatusBadge status={fieldStatus('membership_interest') === 'editable' ? null : fieldStatus('membership_interest')} />}
                                />
                                <div className="p-6 space-y-2">
                                    {INTERESTS.map(interest => (
                                        <button key={interest} type="button" onClick={() => toggleInterest(interest)} disabled={isLocked('membership_interest')}
                                            className={cn("w-full flex items-center gap-3 p-4 border rounded-2xl transition-all group",
                                                data.membership_interest?.includes(interest) ? "border-slate-900 bg-slate-900/5" : "border-slate-100 hover:border-slate-200 bg-slate-50/10",
                                                isLocked('membership_interest') && "opacity-50 cursor-not-allowed")}>
                                            <div className={cn("h-5 w-5 rounded-lg border-2 flex items-center justify-center transition-all",
                                                data.membership_interest?.includes(interest) ? "bg-slate-900 border-slate-900" : "bg-white border-slate-200")}>
                                                {data.membership_interest?.includes(interest) && <Check size={12} className="text-white stroke-[3]" />}
                                            </div>
                                            <span className={cn("text-[10px] font-black uppercase tracking-wide", data.membership_interest?.includes(interest) ? "text-slate-900" : "text-slate-400")}>{interest}</span>
                                        </button>
                                    ))}
                                    {hasOtroInterest && (
                                        <div className="pt-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">¿Cuál?</Label>
                                            <Input
                                                value={data.membership_interest_other}
                                                onChange={e => setData('membership_interest_other', e.target.value)}
                                                disabled={isLocked('membership_interest')}
                                                placeholder="Describe tu interés"
                                                className="h-10 rounded-xl text-sm"
                                                maxLength={500}
                                            />
                                            {errors.membership_interest_other && (
                                                <p className="text-[10px] text-red-500 font-bold mt-1">{errors.membership_interest_other}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>

                        {/* Declaración Jurada */}
                        <div className="lg:col-span-8">
                            <section className="rounded-2xl border border-slate-900 bg-slate-900 text-white overflow-hidden shadow-2xl relative">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-[80px] pointer-events-none" />
                                <SectionHeader icon={Signature} title="Declaración Jurada" />
                                <div className="p-8 space-y-8 relative z-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* rep_name */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between gap-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Representante Legal</Label>
                                                <StatusBadge status={fieldStatus('rep_name') === 'editable' ? null : fieldStatus('rep_name')} />
                                            </div>
                                            <Input
                                                value={data.rep_name}
                                                onChange={e => setData('rep_name', e.target.value)}
                                                disabled={isLocked('rep_name')}
                                                placeholder="Nombre como en CC"
                                                className="bg-white/5 border-white/10 text-white h-11 rounded-xl focus:bg-white focus:text-slate-900 placeholder:text-white/10 transition-all font-bold"
                                            />
                                            {errors.rep_name && <p className="text-[10px] text-red-400 font-bold">{errors.rep_name}</p>}
                                        </div>

                                        {/* rep_doc */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between gap-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Cédula de Ciudadanía</Label>
                                                <StatusBadge status={fieldStatus('rep_doc') === 'editable' ? null : fieldStatus('rep_doc')} />
                                            </div>
                                            <Input
                                                value={data.rep_doc}
                                                onChange={e => setData('rep_doc', e.target.value)}
                                                disabled={isLocked('rep_doc')}
                                                placeholder="Número de identificación"
                                                className="bg-white/5 border-white/10 text-white h-11 rounded-xl focus:bg-white focus:text-slate-900 placeholder:text-white/10 transition-all font-bold"
                                            />
                                            {errors.rep_doc && <p className="text-[10px] text-red-400 font-bold">{errors.rep_doc}</p>}
                                        </div>
                                    </div>

                                    <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-1 w-8 bg-emerald-500 rounded-full" />
                                            <h4 className="text-white font-black text-[9px] uppercase tracking-[0.2em] italic">Manifestación del buen origen de fondos</h4>
                                        </div>
                                        <p className="text-slate-400 text-xs leading-relaxed italic pr-4">
                                            Yo, <span className="text-emerald-400 font-black">{data.rep_name || '[Representante]'}</span>, bajo la gravedad del juramento, declaro que los recursos de mi representada provienen de actividades lícitas y no serán destinados a financiación de actos delictivos. Autorizo el tratamiento de mis datos personales para fines de verificación gremial.
                                        </p>
                                    </div>

                                    <div
                                        onClick={() => !isLocked('funds_origin_declaration') && setData('funds_origin_declaration', !data.funds_origin_declaration)}
                                        className={cn("p-6 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-6",
                                            data.funds_origin_declaration ? "bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-500/20" : "bg-white/5 border-white/10 group",
                                            isLocked('funds_origin_declaration') && "opacity-60 cursor-not-allowed"
                                        )}
                                    >
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
                                        <StatusBadge status={fieldStatus('funds_origin_declaration') === 'editable' ? null : fieldStatus('funds_origin_declaration')} />
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>

                {canEdit && (
                    <div className="sticky bottom-6 flex justify-end gap-3 z-30">
                        <Button type="button" onClick={handleSaveDraft} disabled={processing} className="bg-white border border-slate-200 text-slate-700 rounded-xl px-6 shadow-lg hover:bg-slate-50">
                            <Save size={16} className="mr-2" /> Guardar Borrador
                        </Button>
                        <Button type="button" onClick={handleSubmit} disabled={processing} className="bg-slate-900 text-white rounded-xl px-8 shadow-xl hover:bg-slate-800">
                            <Send size={16} className="mr-2" /> {processing ? 'Enviando...' : 'Enviar a Revisión'}
                        </Button>
                    </div>
                )}

                <input
                    type="file"
                    ref={fileInputRef}
                    accept={activeAccept}
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>
        </AppLayout>
    );
}
