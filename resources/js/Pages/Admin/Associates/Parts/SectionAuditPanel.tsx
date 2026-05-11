import React, { useState } from 'react';
import { Button } from '@/Components/ui/Button';
import { Input } from '@/Components/ui/Input';
import { Check, X, Clock, CheckCircle2, AlertCircle, RotateCcw, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SectionReviewData {
    status: 'draft' | 'pending' | 'approved' | 'rejected' | 'change_pending';
    rejected_reason?: string;
    change_request_reason?: string;
    change_rejected_reason?: string;
    reviewed_by?: string;
    reviewed_at?: string;
    submitted_at?: string;
}

interface Props {
    sectionKey: string;
    review: SectionReviewData;
    onAuditSection: (section: string, status: 'approved' | 'rejected', reason?: string) => void;
    onAuditChangeRequest: (section: string, action: 'approve' | 'reject', reason?: string) => void;
}

export function SectionAuditPanel({ sectionKey, review, onAuditSection, onAuditChangeRequest }: Props) {
    const [showRejectForm, setShowRejectForm]               = useState(false);
    const [rejectReason, setRejectReason]                   = useState('');
    const [showRejectChangeForm, setShowRejectChangeForm]   = useState(false);
    const [rejectChangeReason, setRejectChangeReason]       = useState('');

    const status = review.status;

    if (status === 'draft') {
        return (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-center gap-3">
                <div className="h-7 w-7 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
                    <Clock size={14} className="text-slate-400" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Borrador — el asociado aún no ha enviado esta sección.</p>
            </div>
        );
    }

    if (status === 'approved') {
        return (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 flex items-center gap-3">
                <div className="h-7 w-7 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                </div>
                <p className="text-xs font-black text-emerald-800 uppercase tracking-wide flex-1">Sección Aprobada</p>
                {review.reviewed_by && (
                    <span className="text-[10px] text-emerald-600 font-medium hidden sm:block">por {review.reviewed_by}</span>
                )}
            </div>
        );
    }

    if (status === 'rejected') {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 space-y-2">
                <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                        <AlertCircle size={14} className="text-red-600" />
                    </div>
                    <p className="text-xs font-black text-red-800 uppercase tracking-wide flex-1">Sección Rechazada</p>
                    <Button
                        size="sm"
                        onClick={() => onAuditSection(sectionKey, 'approved')}
                        className="h-7 px-3 text-[10px] font-black uppercase bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                    >
                        <Check size={11} className="mr-1" /> Re-aprobar
                    </Button>
                </div>
                {review.rejected_reason && (
                    <p className="text-[11px] text-red-700 font-medium pl-10 italic">Motivo: "{review.rejected_reason}"</p>
                )}
            </div>
        );
    }

    if (status === 'change_pending') {
        return (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 space-y-3">
                <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                        <RotateCcw size={14} className="text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-amber-800 uppercase tracking-wide">Solicitud de Cambio Pendiente</p>
                        {review.change_request_reason && (
                            <p className="text-[11px] text-amber-700 font-medium mt-0.5 italic truncate">"{review.change_request_reason}"</p>
                        )}
                    </div>
                </div>

                {showRejectChangeForm ? (
                    <div className="flex gap-2 pl-10">
                        <Input
                            value={rejectChangeReason}
                            onChange={e => setRejectChangeReason(e.target.value)}
                            placeholder="Motivo del rechazo del cambio..."
                            autoFocus
                            className="h-8 text-xs flex-1 border-amber-300"
                        />
                        <Button
                            size="sm"
                            disabled={!rejectChangeReason.trim()}
                            onClick={() => { onAuditChangeRequest(sectionKey, 'reject', rejectChangeReason); setShowRejectChangeForm(false); setRejectChangeReason(''); }}
                            className="h-8 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-3 shrink-0"
                        >Ok</Button>
                        <button onClick={() => setShowRejectChangeForm(false)}
                            className="h-8 w-8 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center shrink-0">
                            <X size={12} />
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-2 pl-10">
                        <Button
                            size="sm"
                            onClick={() => onAuditChangeRequest(sectionKey, 'approve')}
                            className="h-7 px-3 text-[10px] font-black uppercase bg-slate-900 hover:bg-slate-800 text-white rounded-lg"
                        >
                            <Check size={11} className="mr-1" /> Aprobar Cambio
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowRejectChangeForm(true)}
                            className="h-7 px-3 text-[10px] font-black uppercase border-red-200 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                            <X size={11} className="mr-1" /> Rechazar Cambio
                        </Button>
                    </div>
                )}
            </div>
        );
    }

    // status === 'pending'
    return (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 space-y-3">
            <div className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <ShieldCheck size={14} className="text-blue-600" />
                </div>
                <p className="text-xs font-black text-blue-800 uppercase tracking-wide flex-1">Pendiente de Revisión</p>
            </div>

            {showRejectForm ? (
                <div className="flex gap-2 pl-10">
                    <Input
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                        placeholder="Motivo del rechazo..."
                        autoFocus
                        className="h-8 text-xs flex-1 border-red-300"
                    />
                    <Button
                        size="sm"
                        disabled={!rejectReason.trim()}
                        onClick={() => { onAuditSection(sectionKey, 'rejected', rejectReason); setShowRejectForm(false); setRejectReason(''); }}
                        className="h-8 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-3 shrink-0"
                    >Ok</Button>
                    <button onClick={() => setShowRejectForm(false)}
                        className="h-8 w-8 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center shrink-0">
                        <X size={12} />
                    </button>
                </div>
            ) : (
                <div className="flex gap-2 pl-10">
                    <Button
                        size="sm"
                        onClick={() => onAuditSection(sectionKey, 'approved')}
                        className="h-7 px-3 text-[10px] font-black uppercase bg-slate-900 hover:bg-slate-800 text-white rounded-lg"
                    >
                        <Check size={11} className="mr-1" /> Aprobar Sección
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowRejectForm(true)}
                        className="h-7 px-3 text-[10px] font-black uppercase border-red-200 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                        <X size={11} className="mr-1" /> Rechazar
                    </Button>
                </div>
            )}
        </div>
    );
}
