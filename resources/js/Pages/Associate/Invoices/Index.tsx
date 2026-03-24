import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Card } from '@/Components/ui/Card';
import {
    Receipt,
    FileText,
    ExternalLink,
    Download,
    CheckCircle2,
    Clock,
    Inbox,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InvoiceItem {
    id: number;
    type: string;
    period: string;
    amount: number | null;
    status: string;
    external_link: string | null;
    notes: string | null;
    document_url: string | null;
    created_at: string;
    is_unread: boolean;
}

interface Props {
    invoices: InvoiceItem[];
}

const TYPE_LABELS: Record<string, string> = {
    factura: 'Factura',
    cuenta_cobro: 'Cuenta de Cobro',
};

const TYPE_COLORS: Record<string, string> = {
    factura: 'bg-blue-100 text-blue-700',
    cuenta_cobro: 'bg-purple-100 text-purple-700',
};

export default function AssociateInvoicesIndex({ invoices }: Props) {
    const formatCurrency = (v: number | null) =>
        v != null
            ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v)
            : null;

    const unread = invoices.filter(i => i.is_unread).length;

    return (
        <AppLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-black text-slate-900">Mis Facturas</h1>
                        {unread > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black">
                                {unread} nueva{unread > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                        Facturas y cuentas de cobro emitidas por CAMEP
                    </p>
                </div>

                {invoices.length === 0 ? (
                    <Card className="border-slate-200 rounded-2xl shadow-sm">
                        <div className="py-20 flex flex-col items-center text-center gap-3">
                            <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                                <Inbox size={24} className="text-slate-400" />
                            </div>
                            <p className="font-black text-slate-700">Sin facturas por ahora</p>
                            <p className="text-sm text-slate-400">Aquí aparecerán las facturas y cuentas de cobro de CAMEP.</p>
                        </div>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {invoices.map(inv => (
                            <Card
                                key={inv.id}
                                className={cn(
                                    "border rounded-2xl shadow-sm overflow-hidden transition-all",
                                    inv.is_unread ? "border-indigo-200 bg-indigo-50/30" : "border-slate-200 bg-white"
                                )}
                            >
                                <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                                    {/* Icon */}
                                    <div className={cn(
                                        "h-11 w-11 rounded-xl flex items-center justify-center shrink-0",
                                        inv.type === 'factura' ? 'bg-blue-100' : 'bg-purple-100'
                                    )}>
                                        {inv.type === 'factura'
                                            ? <Receipt size={20} className="text-blue-600" />
                                            : <FileText size={20} className="text-purple-600" />
                                        }
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={cn(
                                                "text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide",
                                                TYPE_COLORS[inv.type] ?? 'bg-slate-100 text-slate-600'
                                            )}>
                                                {TYPE_LABELS[inv.type] ?? inv.type}
                                            </span>
                                            {inv.is_unread && (
                                                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 uppercase">
                                                    Nueva
                                                </span>
                                            )}
                                            <span className={cn(
                                                "text-[10px] font-black px-2 py-0.5 rounded-full uppercase",
                                                inv.status === 'pagada' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                            )}>
                                                {inv.status}
                                            </span>
                                        </div>
                                        <p className="font-black text-slate-900 mt-1">{inv.period}</p>
                                        {inv.amount != null && (
                                            <p className="text-sm font-bold text-slate-600">{formatCurrency(inv.amount)}</p>
                                        )}
                                        {inv.notes && (
                                            <p className="text-xs text-slate-500 mt-1">{inv.notes}</p>
                                        )}
                                        <p className="text-[10px] text-slate-400 mt-1">Emitida el {inv.created_at}</p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        {inv.external_link && (
                                            <a
                                                href={inv.external_link}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all"
                                            >
                                                <ExternalLink size={13} />
                                                Ver enlace
                                            </a>
                                        )}
                                        {inv.document_url && (
                                            <a
                                                href={inv.document_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                                            >
                                                <Download size={13} />
                                                Descargar
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Status bar */}
                                <div className={cn(
                                    "h-1",
                                    inv.status === 'pagada' ? 'bg-emerald-400' : 'bg-amber-400'
                                )} />
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
