import React, { useState, useRef, useMemo } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Plus, Trash2, Edit2, GripVertical, FileText, X, Upload, Eye,
    CheckCircle2, Circle, Search, Files, AlertCircle,
} from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Input } from '@/Components/ui/Input';
import { Label } from '@/Components/ui/Label';
import { cn } from '@/lib/utils';
import { DOCUMENT_ICON_MAP, getDocumentIcon } from '@/lib/documentIcons';

interface DocumentRequirement {
    id: number;
    key: string;
    label: string;
    icon: string;
    accepts: string[];
    is_required: boolean;
    is_active: boolean;
    legend?: string | null;
    template_path?: string | null;
    template_url?: string | null;
    display_order: number;
}

interface Props {
    documents: DocumentRequirement[];
    allowedIcons: string[];
    allowedMimes: string[];
    flash?: any;
}

const MIME_LABELS: Record<string, string> = {
    pdf: 'PDF',
    jpg: 'JPG',
    jpeg: 'JPEG',
    png: 'PNG',
    docx: 'DOCX',
    xlsx: 'XLSX',
};

function toSlug(s: string) {
    return s.toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '');
}

interface ModalProps {
    document: DocumentRequirement | null;
    allowedIcons: string[];
    allowedMimes: string[];
    onClose: () => void;
}

function DocumentModal({ document, allowedIcons, allowedMimes, onClose }: ModalProps) {
    const isEditing = !!document;
    const [autoKey, setAutoKey] = useState(!isEditing);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        key:             document?.key ?? '',
        label:           document?.label ?? '',
        icon:            document?.icon ?? 'FileText',
        accepts:         document?.accepts ?? ['pdf'],
        is_required:     document?.is_required ?? true,
        is_active:       document?.is_active ?? true,
        legend:          document?.legend ?? '',
        template_file:   null as File | null,
        remove_template: false,
    });

    const handleLabelChange = (val: string) => {
        setData('label', val);
        if (autoKey && !isEditing) {
            setData('key', toSlug(val));
        }
    };

    const toggleMime = (mime: string) => {
        const next = data.accepts.includes(mime)
            ? data.accepts.filter(m => m !== mime)
            : [...data.accepts, mime];
        setData('accepts', next.length ? next : data.accepts);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = isEditing
            ? route('admin.document-requirements.update', document!.id)
            : route('admin.document-requirements.store');

        post(url, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => { reset(); onClose(); },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <form
                onSubmit={handleSubmit}
                onClick={e => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                        {isEditing ? 'Editar documento' : 'Nuevo documento'}
                    </h2>
                    <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Label */}
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600">Nombre visible *</Label>
                        <Input
                            value={data.label}
                            onChange={e => handleLabelChange(e.target.value)}
                            placeholder="Ej: Certificado de tradición y libertad"
                            required
                        />
                        <p className="text-[10px] text-slate-400 italic">Lo que ve el asociado como título del doc.</p>
                        {errors.label && <p className="text-xs text-red-500 font-bold">{errors.label}</p>}
                    </div>

                    {/* Key */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600">Clave interna (slug)</Label>
                            {!isEditing && (
                                <label className="flex items-center gap-1 text-[10px] text-slate-500 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={autoKey}
                                        onChange={e => setAutoKey(e.target.checked)}
                                    />
                                    Generar automáticamente
                                </label>
                            )}
                        </div>
                        <Input
                            value={data.key}
                            onChange={e => { setData('key', e.target.value); setAutoKey(false); }}
                            placeholder="certificado_tradicion_libertad"
                            pattern="[a-z0-9_]+"
                            disabled={isEditing}
                            className={isEditing ? 'bg-slate-50 text-slate-400' : ''}
                        />
                        {isEditing
                            ? <p className="text-[10px] text-amber-600 italic font-bold">No se puede editar después de creado.</p>
                            : <p className="text-[10px] text-slate-400 italic">Solo minúsculas, números y guión bajo.</p>
                        }
                        {errors.key && <p className="text-xs text-red-500 font-bold">{errors.key}</p>}
                    </div>

                    {/* Icon picker */}
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600">Ícono</Label>
                        <div className="grid grid-cols-9 gap-2 p-3 border border-slate-200 rounded-xl bg-slate-50/50">
                            {allowedIcons.map(iconName => {
                                const Icon = getDocumentIcon(iconName);
                                const selected = data.icon === iconName;
                                return (
                                    <button
                                        key={iconName}
                                        type="button"
                                        title={iconName}
                                        onClick={() => setData('icon', iconName)}
                                        className={cn(
                                            "h-10 w-10 rounded-lg flex items-center justify-center transition-all border",
                                            selected
                                                ? "bg-slate-900 text-white border-slate-900 shadow"
                                                : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
                                        )}
                                    >
                                        <Icon size={18} />
                                    </button>
                                );
                            })}
                        </div>
                        <p className="text-[10px] text-slate-400 italic">Seleccionado: <span className="font-bold text-slate-700">{data.icon}</span></p>
                    </div>

                    {/* Accepts */}
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600">Tipos de archivo permitidos *</Label>
                        <div className="flex flex-wrap gap-2">
                            {allowedMimes.map(mime => (
                                <button
                                    key={mime}
                                    type="button"
                                    onClick={() => toggleMime(mime)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide transition-all border",
                                        data.accepts.includes(mime)
                                            ? "bg-slate-900 text-white border-slate-900"
                                            : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
                                    )}
                                >
                                    {MIME_LABELS[mime] || mime.toUpperCase()}
                                </button>
                            ))}
                        </div>
                        {errors.accepts && <p className="text-xs text-red-500 font-bold">{errors.accepts}</p>}
                    </div>

                    {/* is_required */}
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600">Obligatoriedad *</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setData('is_required', true)}
                                className={cn(
                                    "p-4 rounded-xl border-2 text-left transition-all",
                                    data.is_required
                                        ? "border-red-500 bg-red-50"
                                        : "border-slate-200 bg-white hover:border-slate-300"
                                )}
                            >
                                <p className="text-sm font-black text-slate-900">Obligatorio</p>
                                <p className="text-[10px] text-slate-500 italic">El asociado no puede enviar a revisión sin este doc.</p>
                            </button>
                            <button
                                type="button"
                                onClick={() => setData('is_required', false)}
                                className={cn(
                                    "p-4 rounded-xl border-2 text-left transition-all",
                                    !data.is_required
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-slate-200 bg-white hover:border-slate-300"
                                )}
                            >
                                <p className="text-sm font-black text-slate-900">Opcional</p>
                                <p className="text-[10px] text-slate-500 italic">El asociado lo sube si quiere.</p>
                            </button>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600">Leyenda corta (opcional)</Label>
                        <Input
                            value={data.legend ?? ''}
                            onChange={e => setData('legend', e.target.value)}
                            placeholder="Ej: Del año más reciente"
                            maxLength={255}
                        />
                    </div>

                    {/* Template */}
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600">Plantilla descargable (opcional)</Label>
                        {document?.template_url && !data.template_file && !data.remove_template && (
                            <div className="flex items-center gap-2 p-3 border border-slate-200 rounded-xl bg-slate-50">
                                <FileText size={14} className="text-slate-500" />
                                <a href={document.template_url} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-700 font-bold flex-1 truncate hover:text-slate-900">
                                    {document.template_path}
                                </a>
                                <button
                                    type="button"
                                    onClick={() => setData('remove_template', true)}
                                    className="text-[10px] font-black uppercase text-red-500 hover:text-red-700 px-2"
                                >
                                    Quitar
                                </button>
                            </div>
                        )}
                        {data.remove_template && (
                            <div className="text-[10px] text-amber-600 font-bold italic">
                                ⚠ La plantilla actual se eliminará al guardar.
                                <button type="button" onClick={() => setData('remove_template', false)} className="ml-2 underline">Deshacer</button>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={e => {
                                const f = e.target.files?.[0];
                                if (f) { setData('template_file', f); setData('remove_template', false); }
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full p-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:text-slate-700 hover:border-slate-400 transition-all flex items-center justify-center gap-2 text-xs font-bold"
                        >
                            <Upload size={14} />
                            {data.template_file ? data.template_file.name : 'Subir plantilla (PDF/DOCX/XLSX)'}
                        </button>
                        {errors.template_file && <p className="text-xs text-red-500 font-bold">{errors.template_file}</p>}
                    </div>

                    {/* is_active */}
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600">Estado</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setData('is_active', true)}
                                className={cn("p-3 rounded-xl border-2 text-left transition-all",
                                    data.is_active ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white")}
                            >
                                <p className="text-sm font-black text-slate-900">Activo</p>
                            </button>
                            <button
                                type="button"
                                onClick={() => setData('is_active', false)}
                                className={cn("p-3 rounded-xl border-2 text-left transition-all",
                                    !data.is_active ? "border-slate-500 bg-slate-50" : "border-slate-200 bg-white")}
                            >
                                <p className="text-sm font-black text-slate-900">Inactivo</p>
                                <p className="text-[10px] text-slate-500 italic">Oculto para el asociado.</p>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 sticky bottom-0 bg-white">
                    <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">Cancelar</Button>
                    <Button type="submit" disabled={processing} className="bg-slate-900 text-white rounded-xl">
                        {processing ? 'Guardando...' : (isEditing ? 'Guardar cambios' : 'Crear documento')}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default function DocumentRequirementsIndex({ documents, allowedIcons, allowedMimes, flash }: Props) {
    const [editing, setEditing] = useState<DocumentRequirement | null>(null);
    const [creating, setCreating] = useState(false);
    const [search, setSearch] = useState('');
    const [draggedId, setDraggedId] = useState<number | null>(null);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return documents;
        return documents.filter(d =>
            d.label.toLowerCase().includes(q) || d.key.toLowerCase().includes(q)
        );
    }, [documents, search]);

    const mandatory = filtered.filter(d => d.is_required);
    const optional  = filtered.filter(d => !d.is_required);

    const handleToggle = (doc: DocumentRequirement) => {
        router.post(route('admin.document-requirements.toggle', doc.id), {}, { preserveScroll: true });
    };

    const handleDelete = (doc: DocumentRequirement) => {
        if (!confirm(`¿Eliminar definitivamente "${doc.label}" del catálogo?`)) return;
        router.delete(route('admin.document-requirements.destroy', doc.id), { preserveScroll: true });
    };

    const handleDragStart = (id: number) => setDraggedId(id);

    const handleDrop = (targetId: number) => {
        if (!draggedId || draggedId === targetId) { setDraggedId(null); return; }
        const reordered = [...documents];
        const fromIdx = reordered.findIndex(d => d.id === draggedId);
        const toIdx   = reordered.findIndex(d => d.id === targetId);
        if (fromIdx < 0 || toIdx < 0) { setDraggedId(null); return; }
        const [moved] = reordered.splice(fromIdx, 1);
        reordered.splice(toIdx, 0, moved);
        router.post(route('admin.document-requirements.reorder'), {
            order: reordered.map(d => d.id),
        }, { preserveScroll: true });
        setDraggedId(null);
    };

    const renderRow = (doc: DocumentRequirement) => {
        const Icon = getDocumentIcon(doc.icon);
        return (
            <div
                key={doc.id}
                draggable
                onDragStart={() => handleDragStart(doc.id)}
                onDragOver={e => e.preventDefault()}
                onDrop={() => handleDrop(doc.id)}
                className={cn(
                    "flex items-center gap-3 px-4 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-all",
                    draggedId === doc.id && "opacity-40"
                )}
            >
                <GripVertical size={16} className="text-slate-300 cursor-grab shrink-0" />
                <div className={cn(
                    "h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
                    doc.is_active ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"
                )}>
                    <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className={cn("text-sm font-bold truncate", doc.is_active ? "text-slate-900" : "text-slate-400")}>{doc.label}</p>
                        {doc.is_required ? (
                            <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-red-100 text-red-700 shrink-0">Obligat.</span>
                        ) : (
                            <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 shrink-0">Opcional</span>
                        )}
                    </div>
                    <p className="text-[10px] text-slate-400 italic truncate">
                        <code className="font-mono">{doc.key}</code> · {doc.accepts.map(a => a.toUpperCase()).join(', ')}
                    </p>
                </div>

                {doc.template_url && (
                    <a
                        href={doc.template_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Ver plantilla"
                        className="h-8 px-2 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 flex items-center gap-1 text-[10px] font-black uppercase shrink-0"
                    >
                        <Eye size={12} /> Plantilla
                    </a>
                )}

                <button
                    type="button"
                    onClick={() => handleToggle(doc)}
                    title={doc.is_active ? 'Desactivar' : 'Activar'}
                    className={cn("h-8 w-8 rounded-lg border flex items-center justify-center transition-all shrink-0",
                        doc.is_active
                            ? "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                            : "border-slate-200 bg-slate-50 text-slate-400 hover:bg-slate-100")}
                >
                    {doc.is_active ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                </button>
                <button
                    type="button"
                    onClick={() => setEditing(doc)}
                    title="Editar"
                    className="h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center shrink-0"
                >
                    <Edit2 size={13} />
                </button>
                <button
                    type="button"
                    onClick={() => handleDelete(doc)}
                    title="Eliminar"
                    className="h-8 w-8 rounded-lg border border-red-100 bg-red-50 text-red-500 hover:bg-red-600 hover:text-white flex items-center justify-center shrink-0"
                >
                    <Trash2 size={13} />
                </button>
            </div>
        );
    };

    return (
        <AppLayout>
            <Head title="Documentos Requeridos" />
            <div className="max-w-5xl mx-auto p-6 space-y-6">

                <div className="flex items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-slate-400 mb-1">
                            <Files size={14} />
                            <span className="text-xs font-bold uppercase tracking-wider">Admin / Catálogo</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Documentos Requeridos</h1>
                        <p className="text-slate-500 text-sm">Define qué documentos deben subir los asociados durante el onboarding.</p>
                    </div>
                    <Button onClick={() => setCreating(true)} className="bg-slate-900 text-white rounded-xl">
                        <Plus size={16} className="mr-2" /> Nuevo documento
                    </Button>
                </div>

                {flash?.success && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 flex items-center gap-2">
                        <CheckCircle2 size={16} /> {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-800 flex items-center gap-2">
                        <AlertCircle size={16} /> {flash.error}
                    </div>
                )}

                <div className="rounded-2xl border border-slate-200 bg-white p-3 flex items-center gap-2">
                    <Search size={16} className="text-slate-400 ml-2" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar por nombre o clave..."
                        className="flex-1 bg-transparent outline-none text-sm py-1"
                    />
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                    <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-[11px] font-black uppercase text-slate-600 tracking-wider">Obligatorios</h2>
                        <span className="text-[10px] font-bold text-slate-400">{mandatory.length}</span>
                    </div>
                    {mandatory.length > 0
                        ? mandatory.map(renderRow)
                        : <p className="px-5 py-8 text-center text-sm text-slate-400 italic">Sin documentos obligatorios.</p>
                    }
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                    <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-[11px] font-black uppercase text-slate-600 tracking-wider">Opcionales</h2>
                        <span className="text-[10px] font-bold text-slate-400">{optional.length}</span>
                    </div>
                    {optional.length > 0
                        ? optional.map(renderRow)
                        : <p className="px-5 py-8 text-center text-sm text-slate-400 italic">Sin documentos opcionales.</p>
                    }
                </div>

                {(creating || editing) && (
                    <DocumentModal
                        document={editing}
                        allowedIcons={allowedIcons}
                        allowedMimes={allowedMimes}
                        onClose={() => { setCreating(false); setEditing(null); }}
                    />
                )}
            </div>
        </AppLayout>
    );
}
