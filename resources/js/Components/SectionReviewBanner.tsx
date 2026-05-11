import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import {
    Clock, ShieldCheck, CheckCircle2, AlertCircle, RotateCcw,
    X, Save, Building2, Info, MessageSquare, Send
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/Components/ui/Button';

export interface SectionReview {
    status: 'draft' | 'pending' | 'approved' | 'rejected' | 'change_pending';
    rejected_reason?: string;
    change_request_reason?: string;
    change_rejected_reason?: string;
    change_rejected_by?: string;
    reviewed_by?: string;
    reviewed_at?: string;
    submitted_at?: string;
}

interface Props {
    section: string;
    review: SectionReview;
    isNew?: boolean;
    notification?: { type: 'success' | 'draft' | 'error'; msg: string } | null;
    onCloseNotification?: () => void;
}

export default function SectionReviewBanner({ section, review, isNew, notification, onCloseNotification }: Props) {
    const [showModal, setShowModal] = useState(false);
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleRequestChange = () => {
        if (!reason.trim()) return;
        setSubmitting(true);
        router.post(route('associate.company.request.section.change'), { section, reason }, {
            onFinish: () => {
                setSubmitting(false);
                setShowModal(false);
                setReason('');
            },
        });
    };

    const status = review.status;

    return (
        <div className="space-y-4">
            {/* Welcome banner for new profiles */}
            {isNew && (
                <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Building2 size={120} />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-xl font-bold mb-2">¡Bienvenido a la red CAMEP!</h2>
                        <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
                            Completa la información de tu organización para comenzar el proceso de verificación.
                        </p>
                    </div>
                </div>
            )}

            {/* Status banners */}
            {status === 'draft' && !isNew && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                        <Info size={18} className="text-amber-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-black text-amber-900 uppercase tracking-tight">Borrador</p>
                        <p className="text-xs text-amber-700 font-medium">Has guardado cambios, pero aún no los has enviado para revisión.</p>
                    </div>
                </div>
            )}

            {status === 'pending' && (
                <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                        <ShieldCheck size={18} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-black text-blue-900 uppercase tracking-tight">En Revisión</p>
                        <p className="text-xs text-blue-700 font-medium">CAMEP está validando esta sección. Te notificaremos por correo cualquier novedad.</p>
                    </div>
                </div>
            )}

            {status === 'approved' && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 size={18} className="text-emerald-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-black text-emerald-900 uppercase tracking-tight">Aprobada</p>
                        {review.change_rejected_reason ? (
                            <p className="text-xs text-emerald-700 font-medium mt-0.5">
                                Tu solicitud de cambio fue rechazada: <span className="italic">"{review.change_rejected_reason}"</span>
                            </p>
                        ) : (
                            <p className="text-xs text-emerald-700 font-medium">Esta sección ha sido aprobada por CAMEP.</p>
                        )}
                    </div>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setShowModal(true)}
                        className="shrink-0 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-100 rounded-lg flex items-center gap-1.5"
                    >
                        <RotateCcw size={13} /> Solicitar cambio
                    </Button>
                </div>
            )}

            {status === 'rejected' && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                        <AlertCircle size={18} className="text-red-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-black text-red-900 uppercase tracking-tight">Sección Rechazada</p>
                        {review.rejected_reason && (
                            <p className="text-xs text-red-700 font-medium mt-1">
                                <span className="font-black">Motivo:</span> {review.rejected_reason}
                            </p>
                        )}
                        <p className="text-xs text-red-600 mt-1.5">Realiza las correcciones y vuelve a enviar a revisión.</p>
                    </div>
                </div>
            )}

            {status === 'change_pending' && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Clock size={18} className="text-amber-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-black text-amber-900 uppercase tracking-tight">Solicitud de Cambio Pendiente</p>
                        {review.change_request_reason && (
                            <p className="text-xs text-amber-700 font-medium mt-0.5">
                                Motivo enviado: <span className="italic">"{review.change_request_reason}"</span>
                            </p>
                        )}
                        <p className="text-xs text-amber-600 mt-1">Esperando respuesta del administrador.</p>
                    </div>
                </div>
            )}

            {/* Toast notifications */}
            {notification && (
                <div className={cn(
                    "rounded-2xl border px-4 py-3 flex items-center gap-3 shadow-lg animate-in zoom-in-95 duration-300",
                    notification.type === 'success' && "bg-emerald-50 border-emerald-200 text-emerald-800",
                    notification.type === 'draft'   && "bg-emerald-50 border-emerald-200 text-emerald-800",
                    notification.type === 'error'   && "bg-red-50 border-red-200 text-red-800",
                )}>
                    <div className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                        notification.type === 'success' && "bg-emerald-100 text-emerald-600",
                        notification.type === 'draft'   && "bg-emerald-100 text-emerald-600",
                        notification.type === 'error'   && "bg-red-100 text-red-600",
                    )}>
                        {notification.type === 'success' && <CheckCircle2 size={18} />}
                        {notification.type === 'draft'   && <Save size={18} />}
                        {notification.type === 'error'   && <AlertCircle size={18} />}
                    </div>
                    <p className="text-sm font-bold flex-1">{notification.msg}</p>
                    {onCloseNotification && (
                        <button onClick={onCloseNotification} className="p-1.5 hover:bg-black/5 rounded-lg transition-colors">
                            <X size={16} className="text-slate-950" />
                        </button>
                    )}
                </div>
            )}

            {/* Change request modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 animate-in zoom-in-95">
                        <div className="flex items-center justify-between">
                            <h3 className="font-black text-slate-900 uppercase tracking-tight">Solicitar Cambio</h3>
                            <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                                <X size={16} />
                            </button>
                        </div>
                        <p className="text-sm text-slate-600">Explica el motivo por el que necesitas modificar esta sección. El administrador evaluará tu solicitud.</p>
                        <textarea
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            placeholder="Ej: Necesito actualizar el número de teléfono de contacto..."
                            rows={4}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="rounded-xl">Cancelar</Button>
                            <Button
                                type="button"
                                onClick={handleRequestChange}
                                disabled={!reason.trim() || submitting}
                                className="rounded-xl bg-slate-900 text-white flex items-center gap-2"
                            >
                                <Send size={14} /> {submitting ? 'Enviando...' : 'Enviar Solicitud'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
