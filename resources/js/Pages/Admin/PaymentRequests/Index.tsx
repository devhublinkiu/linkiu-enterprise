import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent } from '@/Components/ui/Card';
import { Badge } from '@/Components/ui/Badge';
import { Clock, CheckCircle, XCircle, Eye } from 'lucide-react';

interface PaymentRequestRow {
    id: number;
    user_name: string;
    user_email: string;
    plan_name: string;
    plan_color: string;
    billing_cycle: string;
    amount: string;
    status: string;
    created_at: string;
    reviewed_at: string | null;
    reviewer_name: string | null;
}

const CYCLE_LABELS: Record<string, string> = {
    monthly: 'Mensual',
    semiannual: 'Semestral',
    annual: 'Anual',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
    pending:  { label: 'Pendiente',  color: 'bg-amber-50 text-amber-700 border-amber-200',   icon: Clock },
    approved: { label: 'Aprobado',   color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
    rejected: { label: 'Rechazado',  color: 'bg-red-50 text-red-700 border-red-200',         icon: XCircle },
};

export default function PaymentRequestsIndex({ requests }: { requests: PaymentRequestRow[] }) {
    const formatCurrency = (v: string) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(parseFloat(v));

    return (
        <AppLayout>
            <Head title="Solicitudes de Pago - CAMEP" />

            <div className="space-y-6 max-w-5xl mx-auto">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Solicitudes de Pago</h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Comprobantes enviados por los socios para activar planes.</p>
                </div>

                <div className="space-y-3">
                    {requests.map((req) => {
                        const status = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.pending;
                        const StatusIcon = status.icon;

                        return (
                            <Card key={req.id} className="border-slate-200 shadow-sm rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300">
                                <div className="h-1.5 w-full" style={{ backgroundColor: req.plan_color }} />
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Solicitante</p>
                                                <p className="font-black text-slate-900 text-sm">{req.user_name}</p>
                                                <p className="text-[10px] text-slate-400">{req.user_email}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Plan</p>
                                                <p className="font-black text-slate-900 text-sm">{req.plan_name}</p>
                                                <p className="text-[10px] text-slate-400">{CYCLE_LABELS[req.billing_cycle] ?? req.billing_cycle}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Monto</p>
                                                <p className="font-black text-slate-900 text-sm">{formatCurrency(req.amount)}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Fecha</p>
                                                <p className="font-bold text-slate-800 text-sm">{req.created_at}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0">
                                            <Badge className={`${status.color} text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5`}>
                                                <StatusIcon size={10} />
                                                {status.label}
                                            </Badge>
                                            <Link href={route('admin.payment-requests.show', req.id)}>
                                                <button className="h-9 w-9 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white transition-all">
                                                    <Eye size={15} />
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}

                    {requests.length === 0 && (
                        <div className="py-24 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center">
                            <Clock size={48} className="text-slate-200 mb-4" />
                            <p className="text-slate-500 font-bold text-lg">No hay solicitudes de pago todavía.</p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
