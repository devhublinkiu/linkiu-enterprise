import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Card } from '@/Components/ui/Card';
import {
    Banknote, Building2, CheckCircle2, ExternalLink, FileText,
    Hourglass, X, Zap, Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentRow {
    id: number;
    associate_name: string;
    invoice_period: string;
    invoice_id: number;
    method: string;
    method_label: string;
    status: string;
    amount: string | null;
    reference: string | null;
    proof_url: string | null;
    notes: string | null;
    admin_notes: string | null;
    paid_at: string | null;
    created_at: string;
    reviewed_at: string | null;
    reviewer_name: string | null;
    applied: boolean;
    can_review: boolean;
}

interface Props {
    filter: string;
    counts: { pendiente: number; aprobado: number; rechazado: number };
    payments: PaymentRow[];
}

const STATUS_STYLES: Record<string, string> = {
    pendiente: 'bg-amber-100 text-amber-700',
    aprobado:  'bg-emerald-100 text-emerald-700',
    rechazado: 'bg-red-100 text-red-700',
    fallido:   'bg-slate-200 text-slate-600',
    cancelado: 'bg-slate-100 text-slate-500',
};

const TABS = [
    { key: 'pendiente', label: 'Por revisar' },
    { key: 'aprobado',  label: 'Aprobados' },
    { key: 'rechazado', label: 'Rechazados' },
    { key: 'todos',     label: 'Todos' },
];

export default function PaymentsIndex({ filter, counts, payments }: Props) {
    const [rejecting, setRejecting] = useState<PaymentRow | null>(null);

    const rejection = useForm({ admin_notes: '' });

    const formatCurrency = (v: string | null) =>
        v != null
            ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
                  .format(parseFloat(v))
            : '—';

    const openReject = (payment: PaymentRow) => {
        rejection.reset();
        rejection.clearErrors();
        setRejecting(payment);
    };

    const submitReject = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rejecting) return;
        rejection.patch(route('admin.payments.reject', rejecting.id), {
            preserveScroll: true,
            onSuccess: () => setRejecting(null),
        });
    };

    return (
        <AppLayout>
            <Head title="Pagos — CAMEP" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Pagos</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                        Todo lo que ha entrado, sin importar por dónde: pasarela, transferencia o efectivo.
                    </p>
                </div>

                {/* Filtros */}
                <div className="flex flex-wrap gap-2">
                    {TABS.map(tab => {
                        const count = tab.key === 'todos' ? null : counts[tab.key as keyof typeof counts];
                        return (
                            <Link
                                key={tab.key}
                                href={route('admin.payments.index', { estado: tab.key })}
                                className={cn(
                                    'px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide transition-all border',
                                    filter === tab.key
                                        ? 'bg-slate-900 text-white border-slate-900'
                                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                )}
                            >
                                {tab.label}
                                {count != null && count > 0 && (
                                    <span className={cn(
                                        'ml-2 px-1.5 py-0.5 rounded-full text-[10px]',
                                        filter === tab.key ? 'bg-white/20' : 'bg-slate-100 text-slate-600'
                                    )}>
                                        {count}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>

                <Card className="border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    {payments.length === 0 ? (
                        <div className="py-20 flex flex-col items-center text-center gap-3">
                            <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                                <Wallet size={24} className="text-slate-400" />
                            </div>
                            <p className="font-black text-slate-700">No hay pagos aquí</p>
                            <p className="text-sm text-slate-400">
                                {filter === 'pendiente'
                                    ? 'Nada esperando revisión. Todo al día.'
                                    : 'Prueba con otro filtro.'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm min-w-[860px]">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/60">
                                        <th className="text-left px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asociado</th>
                                        <th className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Concepto</th>
                                        <th className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Medio</th>
                                        <th className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Monto</th>
                                        <th className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                                        <th className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Enviado</th>
                                        <th className="px-4 py-3" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((p, i) => (
                                        <tr
                                            key={p.id}
                                            className={cn(
                                                'border-b border-slate-50 hover:bg-slate-50/40 transition-colors',
                                                i % 2 === 0 ? 'bg-white' : 'bg-slate-50/20'
                                            )}
                                        >
                                            <td className="px-5 py-3.5 font-bold text-slate-800">
                                                <div className="flex items-center gap-2">
                                                    <Building2 size={14} className="text-slate-400 shrink-0" />
                                                    {p.associate_name}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 font-medium text-slate-600">
                                                {p.invoice_period}
                                                {p.reference && (
                                                    <span className="block text-[10px] font-mono text-slate-400 mt-0.5">{p.reference}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                                    {p.method === 'bold'
                                                        ? <Zap size={13} className="text-emerald-500" />
                                                        : <Banknote size={13} className="text-slate-400" />}
                                                    {p.method_label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 font-bold text-slate-800 tabular-nums">{formatCurrency(p.amount)}</td>
                                            <td className="px-4 py-3.5">
                                                <span className={cn(
                                                    'text-[10px] font-black px-2 py-0.5 rounded-full uppercase',
                                                    STATUS_STYLES[p.status] ?? 'bg-slate-100 text-slate-600'
                                                )}>
                                                    {p.status}
                                                </span>
                                                {p.applied && (
                                                    <span className="block text-[10px] font-bold text-emerald-600 mt-1">vigencia aplicada</span>
                                                )}
                                                {p.admin_notes && (
                                                    <span className="block text-[10px] font-medium text-slate-400 mt-1 max-w-[220px]">
                                                        {p.admin_notes}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5 text-slate-500 text-xs">
                                                {p.created_at}
                                                {p.reviewer_name && (
                                                    <span className="block text-[10px] text-slate-400 mt-0.5">por {p.reviewer_name}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-2 justify-end">
                                                    {p.proof_url && (
                                                        <a
                                                            href={p.proof_url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                            title="Ver comprobante"
                                                        >
                                                            <FileText size={14} />
                                                        </a>
                                                    )}
                                                    {p.can_review && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    if (confirm('¿Aprobar este pago? Se aplicará la vigencia al asociado.')) {
                                                                        router.patch(route('admin.payments.approve', p.id), {}, { preserveScroll: true });
                                                                    }
                                                                }}
                                                                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                                title="Aprobar y aplicar"
                                                            >
                                                                <CheckCircle2 size={14} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => openReject(p)}
                                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                                title="Rechazar"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </>
                                                    )}
                                                    {p.status === 'pendiente' && p.method === 'bold' && (
                                                        <span
                                                            className="p-1.5 text-slate-300"
                                                            title="Esperando la confirmación de la pasarela"
                                                        >
                                                            <Hourglass size={14} />
                                                        </span>
                                                    )}
                                                    <Link
                                                        href={route('admin.invoices.index')}
                                                        className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                                                        title="Ver en facturación"
                                                    >
                                                        <ExternalLink size={14} />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>

                {/* Rechazo */}
                {rejecting && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="rechazar-pago-titulo"
                    >
                        <Card className="w-full max-w-lg rounded-2xl border-slate-200 shadow-xl overflow-hidden">
                            <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100">
                                <div>
                                    <h2 id="rechazar-pago-titulo" className="text-lg font-black text-slate-900">Rechazar pago</h2>
                                    <p className="text-xs font-medium text-slate-500 mt-1">
                                        {rejecting.associate_name} · {rejecting.invoice_period} · {formatCurrency(rejecting.amount)}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setRejecting(null)}
                                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                                    aria-label="Cerrar"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <form onSubmit={submitReject} className="px-6 py-5 space-y-4">
                                <div>
                                    <label htmlFor="admin_notes" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                        Motivo del rechazo
                                    </label>
                                    <textarea
                                        id="admin_notes"
                                        rows={3}
                                        value={rejection.data.admin_notes}
                                        onChange={e => rejection.setData('admin_notes', e.target.value)}
                                        placeholder="El asociado verá esto. Sé concreto: qué falló y qué debe hacer."
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                    />
                                    {rejection.errors.admin_notes && (
                                        <p className="text-[11px] font-bold text-red-600 mt-1">{rejection.errors.admin_notes}</p>
                                    )}
                                </div>

                                <p className="text-[11px] font-bold text-slate-500 bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
                                    La cuenta de cobro sigue pendiente y el asociado podrá volver a intentarlo.
                                </p>

                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setRejecting(null)}
                                        className="px-4 py-2 text-sm font-bold text-slate-600 rounded-xl hover:bg-slate-100 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={rejection.processing}
                                        className="px-5 py-2 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all disabled:opacity-50"
                                    >
                                        {rejection.processing ? 'Rechazando…' : 'Rechazar pago'}
                                    </button>
                                </div>
                            </form>
                        </Card>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
