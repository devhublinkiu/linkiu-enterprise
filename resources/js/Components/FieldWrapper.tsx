import React from 'react';
import { CheckCircle2, AlertCircle, RotateCcw, Clock, Pencil, Lock, MessageSquare, Info } from 'lucide-react';
import { Label } from '@/Components/ui/Label';
import { cn } from '@/lib/utils';

export function StatusBadge({ status }: { status: any }) {
    if (status === 'approved') return <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase"><CheckCircle2 size={11} /> Aprobado</span>;
    if (status === 'rejected') return <span className="flex items-center gap-1 text-[10px] font-black text-red-500 uppercase"><AlertCircle size={11} /> Rechazado</span>;
    if (status === 'change_requested') return <span className="flex items-center gap-1 text-[10px] font-black text-amber-600 uppercase"><RotateCcw size={11} /> Solicitud pendiente</span>;
    if (status === 'pending') return <span className="flex items-center gap-1 text-[10px] font-black text-blue-500 uppercase"><Clock size={11} /> En revisión</span>;
    if (status === 'editable') return <span className="flex items-center gap-1 text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 uppercase animate-pulse"><Pencil size={10} /> Listo para editar</span>;
    return null;
}

export function FieldWrapper({
    label,
    fieldId,
    auditLog,
    required,
    status,
    error,
    rejectedReason: manualRejectedReason,
    hint,
    icon: Icon,
    onRequestChange,
    children,
    isEditing = true,
    compact = false,
}: any) {
    const rejectedReason = manualRejectedReason || (fieldId && auditLog?.[fieldId]?.status === 'rejected' ? auditLog[fieldId].reason : undefined);

    // ── Compact mode: label arriba limpio, badge + acciones debajo del input ──
    if (compact) {
        return (
            <div className="space-y-1.5 w-full">
                <Label className={cn("text-[10px] font-bold uppercase tracking-wider flex items-center gap-1", status === 'rejected' ? "text-red-600" : "text-slate-500")}>
                    {Icon && <Icon size={11} className="text-slate-400" />} {label} {required && <span className="text-red-500 font-black ml-0.5">*</span>}
                </Label>
                <div className={cn("relative transition-all duration-200", status === 'rejected' && "ring-1 ring-red-100 rounded-xl")}>
                    {children}
                </div>
                <div className="flex items-center justify-between gap-1 min-h-[18px]">
                    <StatusBadge status={status} />
                    {status === 'approved' && onRequestChange && isEditing && (
                        <button type="button" onClick={onRequestChange} className="flex items-center gap-1 text-[9px] font-black uppercase text-slate-400 hover:text-slate-700 border border-slate-200 rounded-lg px-1.5 py-0.5 transition-all bg-white shadow-sm">
                            <RotateCcw size={9} /> Cambio
                        </button>
                    )}
                    {(status === 'approved' || status === 'pending' || status === 'change_requested') && !onRequestChange && (
                        <span title="Bloqueado por auditoría"><Lock size={11} className="text-slate-300" /></span>
                    )}
                </div>
                {error && <p className="text-[10px] text-red-500 font-bold animate-in fade-in slide-in-from-top-1">{error}</p>}
                {rejectedReason && (
                    <div className="flex items-start gap-1 p-2 bg-red-50 border-l-2 border-red-400 rounded-r text-[10px] text-red-600 font-medium mt-1">
                        <MessageSquare size={10} className="mt-0.5 shrink-0" />
                        <span className="flex-1 leading-snug">{rejectedReason}</span>
                    </div>
                )}
            </div>
        );
    }

    // ── Normal mode: label + badge en la misma fila ───────────────────────────
    return (
        <div className="space-y-1.5 w-full">
            <div className="flex items-center justify-between gap-2">
                <Label className={cn("text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5", status === 'rejected' ? "text-red-600" : "text-slate-500")}>
                    {Icon && <Icon size={12} className="text-slate-400" />} {label} {required && <span className="text-red-500 text-sm font-black ml-0.5">*</span>}
                </Label>
                <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={status} />
                    {status === 'approved' && onRequestChange && isEditing && (
                        <button type="button" onClick={onRequestChange} className="flex items-center gap-1 text-[9px] font-black uppercase text-slate-400 hover:text-slate-700 border border-slate-200 rounded-lg px-2 py-0.5 transition-all bg-white shadow-sm"><RotateCcw size={10} /> Solicitar cambio</button>
                    )}
                    {(status === 'approved' || status === 'pending' || status === 'change_requested') && !onRequestChange && (
                        <span title="Bloqueado por auditoría"><Lock size={12} className="text-slate-300" /></span>
                    )}
                </div>
            </div>
            <div className={cn("relative transition-all duration-200", status === 'rejected' && "ring-1 ring-red-100 rounded-xl")}>{children}</div>
            {hint && <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-1"><Info size={10} /> {hint}</p>}
            {error && <p className="text-[11px] text-red-500 font-bold mt-1 animate-in fade-in slide-in-from-top-1">{error}</p>}
            {rejectedReason && (
                <div className="flex items-start gap-1.5 p-2.5 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-[11px] text-red-700 font-bold mt-2 shadow-sm animate-in fade-in slide-in-from-left-2">
                    <MessageSquare size={12} className="mt-0.5 shrink-0 text-red-400" />
                    <span className="flex-1 leading-relaxed">Motivo de rechazo: <span className="font-medium italic text-red-600">"{rejectedReason}"</span></span>
                </div>
            )}
        </div>
    );
}
