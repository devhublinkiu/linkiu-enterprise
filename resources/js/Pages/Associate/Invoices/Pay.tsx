import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent } from '@/Components/ui/Card';
import { Button } from '@/Components/ui/Button';
import { Badge } from '@/Components/ui/Badge';
import {
    ArrowLeft, ArrowRight, Building2, Hash, User, CreditCard,
    Upload, CheckCircle, FileText, Hourglass, XOctagon, Zap, AlertTriangle,
} from 'lucide-react';

interface BankAccount {
    id: number;
    bank_name: string;
    account_type: string;
    account_number: string;
    holder_name: string;
    holder_document: string;
    holder_document_type: string;
    color_hex: string;
}

interface Invoice {
    id: number;
    period: string;
    type: string;
    cycle: string | null;
    amount: string | null;
    currency: string;
    due_date: string | null;
    is_overdue: boolean;
    status: string;
    notes: string | null;
    document_url: string | null;
}

interface Props {
    invoice: Invoice;
    bankAccounts: BankAccount[];
    onlineEnabled: boolean;
    pendingReview: { id: number; created_at: string } | null;
    lastRejected: { method: string; admin_notes: string | null; reviewed_at: string | null } | null;
}

export default function Pay({ invoice, bankAccounts, onlineEnabled, pendingReview, lastRejected }: Props) {
    const [preview, setPreview] = useState<string | null>(null);

    const { data, setData, post, processing, errors } = useForm<{
        proof: File | null;
        notes: string;
    }>({
        proof: null,
        notes: '',
    });

    const formatCurrency = (value: string | null) =>
        value != null
            ? new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: invoice.currency || 'COP',
                  maximumFractionDigits: 0,
              }).format(parseFloat(value))
            : '—';

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setData('proof', file);
        setPreview(file && file.type.startsWith('image/') ? URL.createObjectURL(file) : null);
    };

    const submitProof = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('associate.invoice.proof', invoice.id), { forceFormData: true });
    };

    const isPaid = invoice.status === 'pagada';

    return (
        <AppLayout>
            <Head title={`Pagar — ${invoice.period}`} />

            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href={route('associate.company.billing')}
                        className="h-10 w-10 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-900 transition-all shadow-sm"
                        aria-label="Volver a facturación"
                    >
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Pagar</h1>
                        <p className="text-slate-500 text-sm mt-0.5 font-medium">{invoice.period}</p>
                    </div>
                </div>

                {/* Resumen del cobro */}
                <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                    <div className={`h-2 ${isPaid ? 'bg-emerald-500' : invoice.is_overdue ? 'bg-red-500' : 'bg-slate-900'}`} />
                    <CardContent className="p-6 flex flex-wrap items-center gap-x-8 gap-y-4">
                        <div className="flex-1 min-w-[200px]">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Concepto</p>
                            <p className="text-lg font-black text-slate-900 mt-0.5">{invoice.period}</p>
                            {invoice.notes && <p className="text-xs font-medium text-slate-500 mt-1">{invoice.notes}</p>}
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {invoice.is_overdue ? 'Venció' : 'Vence'}
                            </p>
                            <p className={`text-sm font-black mt-0.5 ${invoice.is_overdue ? 'text-red-600' : 'text-slate-900'}`}>
                                {invoice.due_date ?? '—'}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</p>
                            <p className="text-2xl font-black text-slate-900 tabular-nums">{formatCurrency(invoice.amount)}</p>
                        </div>
                        {isPaid && (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-black uppercase">
                                <CheckCircle size={10} className="mr-1" /> Pagada
                            </Badge>
                        )}
                    </CardContent>
                </Card>

                {invoice.document_url && (
                    <a
                        href={invoice.document_url}
                        className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900"
                    >
                        <FileText size={15} />
                        Descargar el documento de esta cuenta de cobro
                    </a>
                )}

                {/* Comprobante en revisión */}
                {pendingReview && (
                    <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50/60 p-5 flex items-start gap-4">
                        <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                            <Hourglass size={20} />
                        </div>
                        <div>
                            <h3 className="font-black text-sm uppercase text-indigo-800">Comprobante en revisión</h3>
                            <p className="text-xs font-medium mt-1 text-indigo-600">
                                Lo enviaste el {pendingReview.created_at}. CAMEP lo está revisando y te avisaremos
                                cuando quede aplicado. Si subes otro, reemplazará a este.
                            </p>
                        </div>
                    </div>
                )}

                {/* Intento anterior rechazado */}
                {lastRejected && !pendingReview && !isPaid && (
                    <div className="rounded-2xl border-2 border-red-200 bg-red-50/60 p-5 flex items-start gap-4">
                        <div className="h-10 w-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                            <XOctagon size={20} />
                        </div>
                        <div>
                            <h3 className="font-black text-sm uppercase text-red-800">Tu intento anterior no se pudo aplicar</h3>
                            {lastRejected.admin_notes && (
                                <p className="text-xs font-medium mt-1 text-red-600">
                                    <strong>Motivo:</strong> {lastRejected.admin_notes}
                                </p>
                            )}
                            <p className="text-xs font-medium mt-1 text-red-500">
                                Puedes intentarlo de nuevo por cualquiera de los medios de abajo.
                            </p>
                        </div>
                    </div>
                )}

                {isPaid ? (
                    <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/60 p-6 flex items-start gap-4">
                        <CheckCircle size={22} className="text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-black text-sm uppercase text-emerald-800">Esta cuenta de cobro ya está pagada</h3>
                            <p className="text-xs font-medium mt-1 text-emerald-700">
                                No tienes que hacer nada más. Puedes consultarla en tus facturas.
                            </p>
                            <Link href={route('associate.company.invoices.index')} className="inline-block mt-3">
                                <Button className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase px-5">
                                    Ver mis facturas
                                </Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Opción 1 — pago en línea */}
                        <div>
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-3">
                                Elige cómo quieres pagar
                            </h2>

                            {onlineEnabled ? (
                                <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                                    <div className="h-1.5 bg-emerald-500" />
                                    <CardContent className="p-6 flex flex-wrap items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center shrink-0">
                                            <Zap size={20} className="text-emerald-600" />
                                        </div>
                                        <div className="flex-1 min-w-[220px]">
                                            <p className="font-black text-slate-900 uppercase text-sm">Pago en línea</p>
                                            <p className="text-xs font-medium text-slate-500 mt-0.5">
                                                Tarjeta, PSE o Nequi. Se confirma solo, en segundos, y tu suscripción
                                                queda al día sin que nadie tenga que revisar nada.
                                            </p>
                                        </div>
                                        <Link href={route('associate.invoice.online', invoice.id)}>
                                            <Button className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase px-5 flex items-center gap-2">
                                                Pagar en línea
                                                <ArrowRight size={15} />
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 flex items-start gap-3">
                                    <AlertTriangle size={18} className="text-slate-400 shrink-0 mt-0.5" />
                                    <p className="text-xs font-medium text-slate-500">
                                        El pago en línea no está disponible por ahora. Puedes pagar por transferencia
                                        bancaria siguiendo los pasos de abajo.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Opción 2 — transferencia */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <CreditCard size={18} className="text-slate-400" />
                                <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm">
                                    Transferencia bancaria
                                </h3>
                            </div>
                            <p className="text-xs font-medium text-slate-500 -mt-2">
                                Transfiere a cualquiera de estas cuentas y sube el comprobante. CAMEP lo revisa y aplica el pago.
                            </p>

                            {bankAccounts.map(account => (
                                <Card key={account.id} className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                                    <div className="h-1.5" style={{ backgroundColor: account.color_hex }} />
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div
                                                className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0"
                                                style={{ backgroundColor: `${account.color_hex}20`, border: `2px solid ${account.color_hex}40` }}
                                            >
                                                <Building2 size={20} style={{ color: account.color_hex }} />
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Banco</p>
                                                    <p className="font-black text-slate-900">{account.bank_name}</p>
                                                    <Badge className="mt-1 text-[8px] font-black uppercase bg-slate-100 text-slate-600 border-slate-200">
                                                        {account.account_type}
                                                    </Badge>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                                                        <Hash size={9} />Cuenta
                                                    </p>
                                                    <p className="font-black text-slate-900 font-mono text-sm select-all">{account.account_number}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                                                        <User size={9} />Titular
                                                    </p>
                                                    <p className="font-bold text-slate-800 text-sm">{account.holder_name}</p>
                                                    <p className="text-[9px] text-slate-400 font-mono">
                                                        {account.holder_document_type}: {account.holder_document}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {bankAccounts.length === 0 && (
                                <div className="py-10 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 text-center">
                                    <p className="text-slate-400 font-bold">No hay cuentas bancarias configuradas.</p>
                                    <p className="text-slate-400 text-xs mt-1">Contacta a CAMEP para coordinar el pago.</p>
                                </div>
                            )}

                            {/* Subida del comprobante */}
                            <Card className="border-slate-200 shadow-sm rounded-2xl">
                                <CardContent className="p-6">
                                    <form onSubmit={submitProof} className="space-y-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Ya transferí — subir comprobante
                                        </p>

                                        <label
                                            className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                                                data.proof
                                                    ? 'border-emerald-400 bg-emerald-50'
                                                    : 'border-slate-200 bg-slate-50 hover:border-slate-400 hover:bg-slate-100'
                                            }`}
                                        >
                                            {preview ? (
                                                <img src={preview} alt="Vista previa del comprobante" className="h-36 w-full object-contain rounded-xl p-1" />
                                            ) : data.proof ? (
                                                <div className="flex flex-col items-center gap-2">
                                                    <CheckCircle size={32} className="text-emerald-500" />
                                                    <p className="text-emerald-700 font-bold text-sm">{data.proof.name}</p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-2 text-slate-400">
                                                    <Upload size={28} />
                                                    <p className="font-bold text-sm">Arrastra o haz clic para subir</p>
                                                    <p className="text-[11px] font-medium">JPG, PNG o PDF — máx 5 MB</p>
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                className="sr-only"
                                                accept=".jpg,.jpeg,.png,.pdf"
                                                onChange={handleFileChange}
                                            />
                                        </label>
                                        {errors.proof && <p className="text-red-600 text-xs font-bold">{errors.proof}</p>}

                                        <div>
                                            <label htmlFor="notes" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                                Nota para CAMEP <span className="text-slate-300">(opcional)</span>
                                            </label>
                                            <input
                                                id="notes"
                                                type="text"
                                                value={data.notes}
                                                onChange={e => setData('notes', e.target.value)}
                                                placeholder="Ej. transferencia desde otra cuenta, número de operación…"
                                                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                            />
                                            {errors.notes && <p className="text-red-600 text-xs font-bold mt-1">{errors.notes}</p>}
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={processing || !data.proof}
                                            className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            <Upload size={17} />
                                            {processing ? 'Enviando…' : 'Enviar comprobante'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>

                        <p className="text-xs font-medium text-slate-400 text-center pb-4">
                            ¿Vas a pagar en efectivo o por otro medio? Coordina con CAMEP y el equipo registrará el pago por ti.
                        </p>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
