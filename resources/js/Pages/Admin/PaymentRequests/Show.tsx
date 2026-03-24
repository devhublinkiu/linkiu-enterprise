import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/Card';
import { Button } from '@/Components/ui/Button';
import { Badge } from '@/Components/ui/Badge';
import { ArrowLeft, CheckCircle, XCircle, Clock, User, FileText, X } from 'lucide-react';
import InputError from '@/Components/InputError';

interface PaymentRequestDetail {
    id: number;
    user_name: string;
    user_email: string;
    plan: { id: number; name: string; color_hex: string };
    billing_cycle: string;
    amount: string;
    status: string;
    admin_notes: string | null;
    proof_url: string;
    created_at: string;
    reviewed_at: string | null;
    reviewer_name: string | null;
}

const CYCLE_LABELS: Record<string, string> = {
    monthly: 'Mensual', semiannual: 'Semestral', annual: 'Anual',
};

export default function PaymentRequestShow({ paymentRequest: req }: { paymentRequest: PaymentRequestDetail }) {
    const [showRejectForm, setShowRejectForm] = useState(false);
    const formatCurrency = (v: string) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(parseFloat(v));

    const approveForm = useForm({});
    const rejectForm = useForm({ admin_notes: '' });

    const handleApprove = () => {
        if (!confirm(`¿Aprobar y activar el plan ${req.plan.name} para ${req.user_name}?`)) return;
        approveForm.patch(route('admin.payment-requests.approve', req.id));
    };

    const handleReject = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rejectForm.data.admin_notes.trim()) return;
        rejectForm.patch(route('admin.payment-requests.reject', req.id));
    };

    const isPending = req.status === 'pending';

    return (
        <AppLayout>
            <Head title={`Solicitud #${req.id} — ${req.user_name}`} />

            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={route('admin.payment-requests.index')} className="h-10 w-10 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                        <ArrowLeft size={18} />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Solicitud #{req.id}</h1>
                        <p className="text-slate-500 text-sm mt-0.5 font-medium">{req.user_name} — {req.created_at}</p>
                    </div>
                    <Badge className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 px-3 py-2 ${
                        req.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        req.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                        {req.status === 'approved' ? <CheckCircle size={12} /> : req.status === 'rejected' ? <XCircle size={12} /> : <Clock size={12} />}
                        {req.status === 'approved' ? 'Aprobado' : req.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                    </Badge>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Proof Image */}
                    <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                            <CardTitle className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <FileText size={14} /> Comprobante de Pago
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            {req.proof_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                <img
                                    src={req.proof_url}
                                    alt="Comprobante"
                                    className="w-full rounded-xl object-contain max-h-96 bg-slate-50 border border-slate-100"
                                />
                            ) : (
                                <a
                                    href={req.proof_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center h-40 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 transition-all gap-3 font-bold"
                                >
                                    <FileText size={28} className="text-slate-400" />
                                    Ver documento PDF
                                </a>
                            )}
                        </CardContent>
                    </Card>

                    {/* Details + Actions */}
                    <div className="space-y-4">
                        {/* Summary */}
                        <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                            <div className="h-1.5" style={{ backgroundColor: req.plan.color_hex }} />
                            <CardContent className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1"><User size={9}/>Solicitante</p>
                                        <p className="font-black text-slate-900">{req.user_name}</p>
                                        <p className="text-[10px] text-slate-400">{req.user_email}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Plan</p>
                                        <p className="font-black text-slate-900">{req.plan.name}</p>
                                        <p className="text-[10px] text-slate-400">{CYCLE_LABELS[req.billing_cycle] ?? req.billing_cycle}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Monto declarado</p>
                                        <p className="font-black text-slate-900 text-lg">{formatCurrency(req.amount)}</p>
                                    </div>
                                    {req.reviewed_at && (
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Revisado</p>
                                            <p className="font-bold text-slate-800">{req.reviewed_at}</p>
                                            <p className="text-[10px] text-slate-400">por {req.reviewer_name}</p>
                                        </div>
                                    )}
                                </div>

                                {req.admin_notes && (
                                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                        <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-1">Motivo de rechazo</p>
                                        <p className="text-sm text-red-700 font-medium">{req.admin_notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        {isPending && (
                            <div className="space-y-3">
                                <Button
                                    onClick={handleApprove}
                                    disabled={approveForm.processing}
                                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg flex items-center justify-center gap-2"
                                >
                                    <CheckCircle size={18} />
                                    {approveForm.processing ? 'Activando...' : 'Aprobar y Activar Plan'}
                                </Button>

                                {!showRejectForm ? (
                                    <Button
                                        onClick={() => setShowRejectForm(true)}
                                        variant="ghost"
                                        className="w-full h-12 text-red-500 hover:bg-red-50 border border-red-200 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                                    >
                                        <XCircle size={18} />
                                        Rechazar Solicitud
                                    </Button>
                                ) : (
                                    <form onSubmit={handleReject} className="bg-red-50 border border-red-200 rounded-2xl p-5 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Motivo del rechazo</p>
                                            <button type="button" onClick={() => setShowRejectForm(false)} className="text-slate-400 hover:text-slate-700">
                                                <X size={14} />
                                            </button>
                                        </div>
                                        <textarea
                                            value={rejectForm.data.admin_notes}
                                            onChange={e => rejectForm.setData('admin_notes', e.target.value)}
                                            rows={3}
                                            placeholder="Ej: El monto del comprobante no coincide con el plan seleccionado."
                                            className="w-full rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                                        />
                                        <InputError message={rejectForm.errors.admin_notes} />
                                        <Button
                                            type="submit"
                                            disabled={rejectForm.processing}
                                            className="w-full h-11 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black uppercase tracking-widest text-xs"
                                        >
                                            {rejectForm.processing ? 'Rechazando...' : 'Confirmar Rechazo'}
                                        </Button>
                                    </form>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
