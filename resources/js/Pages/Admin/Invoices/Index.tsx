import React, { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card } from '@/Components/ui/Card';
import {
    FileText,
    Receipt,
    Plus,
    Download,
    ExternalLink,
    CheckCircle2,
    Clock,
    Trash2,
    ChevronDown,
    ChevronUp,
    Building2,
    X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Associate { id: number; company_name: string; }
interface InvoiceRow {
    id: number;
    associate_name: string;
    type: string;
    period: string;
    amount: number | null;
    status: string;
    has_document: boolean;
    external_link: string | null;
    creator_name: string;
    created_at: string;
    read_at: string | null;
}

interface Props {
    invoices: InvoiceRow[];
    associates: Associate[];
}

const TYPE_LABELS: Record<string, string> = {
    factura: 'Factura',
    cuenta_cobro: 'Cuenta de Cobro',
};

export default function InvoicesIndex({ invoices, associates }: Props) {
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        associate_id: '',
        type: 'factura',
        period: '',
        amount: '',
        document: null as File | null,
        external_link: '',
        notes: '',
    });

    const formatCurrency = (v: number | null) =>
        v != null
            ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v)
            : '—';

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.invoices.store'), {
            forceFormData: true,
            onSuccess: () => { reset(); setShowForm(false); },
        });
    };

    const handleMarkPaid = (id: number) => {
        if (confirm('¿Marcar esta factura como pagada?')) {
            useForm({}).patch(route('admin.invoices.mark-paid', id));
        }
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900">Facturación</h1>
                        <p className="text-sm text-slate-500 font-medium mt-1">
                            Sube facturas y cuentas de cobro a los asociados
                        </p>
                    </div>
                    <button
                        onClick={() => setShowForm(v => !v)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-700 transition-all"
                    >
                        <Plus size={16} />
                        Nueva Factura
                    </button>
                </div>

                {/* Upload Form */}
                {showForm && (
                    <Card className="p-6 border-slate-200 rounded-2xl shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="font-black text-slate-900 text-base">Nueva Factura / Cuenta de Cobro</h2>
                            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Associate */}
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                                    Asociado *
                                </label>
                                <select
                                    value={data.associate_id}
                                    onChange={e => setData('associate_id', e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                                >
                                    <option value="">Seleccionar asociado…</option>
                                    {associates.map(a => (
                                        <option key={a.id} value={a.id}>{a.company_name}</option>
                                    ))}
                                </select>
                                {errors.associate_id && <p className="text-red-500 text-xs mt-1">{errors.associate_id}</p>}
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">Tipo *</label>
                                <select
                                    value={data.type}
                                    onChange={e => setData('type', e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                                >
                                    <option value="factura">Factura</option>
                                    <option value="cuenta_cobro">Cuenta de Cobro</option>
                                </select>
                            </div>

                            {/* Period */}
                            <div>
                                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">Período *</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Marzo 2026"
                                    value={data.period}
                                    onChange={e => setData('period', e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                                />
                                {errors.period && <p className="text-red-500 text-xs mt-1">{errors.period}</p>}
                            </div>

                            {/* Amount */}
                            <div>
                                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">Valor (opcional)</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={data.amount}
                                    onChange={e => setData('amount', e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                                />
                            </div>

                            {/* Document */}
                            <div>
                                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">Documento (PDF / imagen)</label>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={e => setData('document', e.target.files?.[0] ?? null)}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-600 file:mr-3 file:border-0 file:bg-slate-100 file:text-slate-700 file:font-bold file:rounded-lg file:px-3 file:py-1 focus:outline-none"
                                />
                                {errors.document && <p className="text-red-500 text-xs mt-1">{errors.document}</p>}
                            </div>

                            {/* External link */}
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">Enlace externo (opcional)</label>
                                <input
                                    type="url"
                                    placeholder="https://…"
                                    value={data.external_link}
                                    onChange={e => setData('external_link', e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                                />
                            </div>

                            {/* Notes */}
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">Observaciones</label>
                                <textarea
                                    rows={2}
                                    value={data.notes}
                                    onChange={e => setData('notes', e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                                />
                            </div>

                            <div className="md:col-span-2 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => { reset(); setShowForm(false); }}
                                    className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-700 transition-all disabled:opacity-50"
                                >
                                    {processing ? 'Subiendo…' : 'Subir Factura'}
                                </button>
                            </div>
                        </form>
                    </Card>
                )}

                {/* Invoice List */}
                <Card className="border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    {invoices.length === 0 ? (
                        <div className="py-20 flex flex-col items-center text-center gap-3">
                            <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                                <Receipt size={24} className="text-slate-400" />
                            </div>
                            <p className="font-black text-slate-700">No hay facturas aún</p>
                            <p className="text-sm text-slate-400">Usa el botón "Nueva Factura" para subir la primera.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/60">
                                    <th className="text-left px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asociado</th>
                                    <th className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</th>
                                    <th className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Período</th>
                                    <th className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor</th>
                                    <th className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                                    <th className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((inv, i) => (
                                    <tr key={inv.id} className={cn("border-b border-slate-50 hover:bg-slate-50/40 transition-colors", i % 2 === 0 ? 'bg-white' : 'bg-slate-50/20')}>
                                        <td className="px-5 py-3.5 font-bold text-slate-800">
                                            <div className="flex items-center gap-2">
                                                <Building2 size={14} className="text-slate-400 shrink-0" />
                                                {inv.associate_name}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className={cn(
                                                "text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide",
                                                inv.type === 'factura' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                            )}>
                                                {TYPE_LABELS[inv.type] ?? inv.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 font-medium text-slate-600">{inv.period}</td>
                                        <td className="px-4 py-3.5 font-bold text-slate-800">{formatCurrency(inv.amount)}</td>
                                        <td className="px-4 py-3.5">
                                            <span className={cn(
                                                "text-[10px] font-black px-2 py-0.5 rounded-full uppercase",
                                                inv.status === 'pagada' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                            )}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-slate-500 text-xs">{inv.created_at}</td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-2 justify-end">
                                                {inv.external_link && (
                                                    <a href={inv.external_link} target="_blank" rel="noreferrer"
                                                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                                                        <ExternalLink size={14} />
                                                    </a>
                                                )}
                                                {inv.status !== 'pagada' && (
                                                    <Link
                                                        href={route('admin.invoices.mark-paid', inv.id)}
                                                        method="patch"
                                                        as="button"
                                                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                        title="Marcar como pagada"
                                                    >
                                                        <CheckCircle2 size={14} />
                                                    </Link>
                                                )}
                                                <Link
                                                    href={route('admin.invoices.destroy', inv.id)}
                                                    method="delete"
                                                    as="button"
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Eliminar"
                                                    onClick={() => confirm('¿Eliminar esta factura?')}
                                                >
                                                    <Trash2 size={14} />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </Card>
            </div>
        </AppLayout>
    );
}
