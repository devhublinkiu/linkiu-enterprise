import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/Card';
import { Button } from '@/Components/ui/Button';
import { Badge } from '@/Components/ui/Badge';
import {
    ArrowLeft, Building2, Hash, User, CreditCard, Upload,
    CheckCircle, Calendar, ChevronDown, X, FileText, Info
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

interface Plan {
    id: number;
    name: string;
    color_hex: string;
    price_monthly: string;
    price_semiannual: string;
    price_annual: string;
    currency: string;
    description: string;
    signup_fee: string;
}

interface Props {
    plan: Plan;
    bankAccounts: BankAccount[];
    associateStatus?: string;
    isSignupOnly?: boolean;
}

const CYCLES = [
    { value: 'monthly', label: 'Mensual', key: 'price_monthly' as const },
    { value: 'semiannual', label: 'Semestral (6 meses)', key: 'price_semiannual' as const },
    { value: 'annual', label: 'Anual (12 meses)', key: 'price_annual' as const },
];

export default function Checkout({ plan, bankAccounts, associateStatus, isSignupOnly = false }: Props) {
    const [showModal, setShowModal] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    const { data, setData, post, processing, errors } = useForm<{
        billing_cycle: string;
        proof: File | null;
    }>({
        billing_cycle: 'monthly',
        proof: null,
    });

    const selectedCycle = CYCLES.find(c => c.value === data.billing_cycle)!;
    const isFirstPayment = associateStatus === 'verified';
    const signupFeeValue = parseFloat(plan.signup_fee || '0');

    // Three-branch pricing
    let basePrice: number;
    let signupFee: number;
    let totalPrice: number;

    if (isSignupOnly) {
        basePrice    = 0;
        signupFee    = signupFeeValue;
        totalPrice   = signupFeeValue;
    } else {
        basePrice    = parseFloat(plan[selectedCycle.key]);
        signupFee    = (isFirstPayment && signupFeeValue > 0) ? signupFeeValue : 0;
        totalPrice   = basePrice + signupFee;
    }

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setData('proof', file);
        if (file && file.type.startsWith('image/')) {
            setPreview(URL.createObjectURL(file));
        } else {
            setPreview(null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('associate.checkout.store', plan.id), {
            forceFormData: true,
            onSuccess: () => setShowModal(false),
        });
    };

    return (
        <AppLayout>
            <Head title={`Checkout — Plan ${plan.name}`} />

            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={route('associate.company.billing')} className="h-10 w-10 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Checkout</h1>
                        <p className="text-slate-500 text-sm mt-0.5 font-medium">Completa tu solicitud para activar el plan <span className="font-black text-slate-900">{plan.name}</span>.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Plan Summary + Cycle Selector */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Plan Card */}
                        <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                            <div className="h-2" style={{ backgroundColor: plan.color_hex }} />
                            <CardContent className="p-6">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Plan seleccionado</p>
                                <h2 className="text-xl font-black text-slate-900 uppercase">{plan.name}</h2>
                                {plan.description && <p className="text-slate-500 text-xs mt-2 font-medium">{plan.description}</p>}
                            </CardContent>
                        </Card>

                        {/* Billing Cycle — hidden in signup-only flow */}
                        {!isSignupOnly && (
                            <Card className="border-slate-200 shadow-sm rounded-2xl">
                                <CardContent className="p-6 space-y-3">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Periodo de facturación</p>
                                    {CYCLES.map(cycle => (
                                        <label key={cycle.value} className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                                            data.billing_cycle === cycle.value
                                                ? 'border-slate-900 bg-slate-50'
                                                : 'border-slate-200 hover:border-slate-300'
                                        }`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                                                    data.billing_cycle === cycle.value ? 'border-slate-900' : 'border-slate-300'
                                                }`}>
                                                    {data.billing_cycle === cycle.value && (
                                                        <div className="h-2 w-2 rounded-full bg-slate-900" />
                                                    )}
                                                </div>
                                                <span className="font-bold text-sm text-slate-700">{cycle.label}</span>
                                            </div>
                                            <span className="font-black text-sm text-slate-900">{formatCurrency(parseFloat(plan[cycle.key]))}</span>
                                            <input type="radio" className="sr-only" value={cycle.value} checked={data.billing_cycle === cycle.value} onChange={() => setData('billing_cycle', cycle.value)} />
                                        </label>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Signup-only explainer */}
                        {isSignupOnly && (
                            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 flex gap-3">
                                <Info size={20} className="text-indigo-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[11px] font-black text-indigo-700 uppercase tracking-widest mb-1">Pago inicial: solo inscripción</p>
                                    <p className="text-xs text-indigo-900/70 leading-relaxed font-medium">
                                        Este plan separa la inscripción del primer mes. Hoy pagas únicamente la cuota inicial.
                                        A los 30 días recibirás automáticamente la cuenta de cobro de tu primera mensualidad.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Total */}
                        <div className="bg-slate-900 text-white rounded-2xl p-6 flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total a pagar</p>
                                <p className="text-slate-300 text-xs mt-0.5">
                                    {isSignupOnly
                                        ? 'Inscripción'
                                        : (signupFee > 0 ? `${selectedCycle.label} + Inscripción` : selectedCycle.label)
                                    }
                                </p>
                            </div>
                            <p className="text-2xl font-black">{formatCurrency(totalPrice)}</p>
                        </div>
                    </div>

                    {/* Right: Bank Accounts */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <CreditCard size={18} className="text-slate-400" />
                            <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm">Realiza tu transferencia a alguna de estas cuentas</h3>
                        </div>

                        {bankAccounts.map(account => (
                            <Card key={account.id} className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                                <div className="h-1.5" style={{ backgroundColor: account.color_hex }} />
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${account.color_hex}20`, border: `2px solid ${account.color_hex}40` }}>
                                            <Building2 size={20} style={{ color: account.color_hex }} />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Banco</p>
                                                <p className="font-black text-slate-900">{account.bank_name}</p>
                                                <Badge className="mt-1 text-[8px] font-black uppercase bg-slate-100 text-slate-600 border-slate-200">{account.account_type}</Badge>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1"><Hash size={9}/>Cuenta</p>
                                                <p className="font-black text-slate-900 font-mono text-sm select-all">{account.account_number}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1"><User size={9}/>Titular</p>
                                                <p className="font-bold text-slate-800 text-sm">{account.holder_name}</p>
                                                <p className="text-[9px] text-slate-400 font-mono">{account.holder_document_type}: {account.holder_document}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {bankAccounts.length === 0 && (
                            <div className="py-12 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 text-center">
                                <p className="text-slate-400 font-bold">No hay cuentas bancarias configuradas todavía.</p>
                                <p className="text-slate-400 text-xs mt-1">Contacta a CAMEP para más información.</p>
                            </div>
                        )}

                        {/* CTA */}
                        <Button
                            onClick={() => setShowModal(true)}
                            disabled={bankAccounts.length === 0}
                            className="w-full h-14 rounded-2xl mt-4 font-black text-sm uppercase tracking-widest shadow-lg flex items-center justify-center gap-3"
                            style={{ backgroundColor: plan.color_hex, color: '#fff' }}
                        >
                            <Upload size={20} />
                            Ya realicé la transferencia — Subir Comprobante
                        </Button>
                    </div>
                </div>
            </div>

            {/* Upload Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative">
                        <button onClick={() => setShowModal(false)} className="absolute top-5 right-5 h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 transition-all">
                            <X size={16} />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-12 w-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${plan.color_hex}20` }}>
                                <FileText size={22} style={{ color: plan.color_hex }} />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">Subir Comprobante</h3>
                                <p className="text-slate-400 text-xs font-medium">JPG, PNG o PDF — máx 5MB</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* File Upload Area */}
                            <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                                data.proof ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-slate-400 hover:bg-slate-100'
                            }`}>
                                {preview ? (
                                    <img src={preview} alt="preview" className="h-36 w-full object-contain rounded-xl p-1" />
                                ) : data.proof ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <CheckCircle size={32} className="text-emerald-500" />
                                        <p className="text-emerald-700 font-bold text-sm">{data.proof.name}</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-slate-400">
                                        <Upload size={28} />
                                        <p className="font-bold text-sm">Arrastra o haz clic para subir</p>
                                    </div>
                                )}
                                <input type="file" className="sr-only" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} />
                            </label>
                            {errors.proof && <p className="text-red-600 text-xs font-bold">{errors.proof}</p>}

                            {/* Summary */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-1.5 text-xs">
                                <div className="flex justify-between font-bold text-slate-600"><span>Plan:</span><span className="text-slate-900">{plan.name}</span></div>
                                {isSignupOnly ? (
                                    <div className="flex justify-between font-bold text-slate-600"><span>Concepto:</span><span className="text-slate-900">Inscripción</span></div>
                                ) : (
                                    <>
                                        <div className="flex justify-between font-bold text-slate-600"><span>Periodo:</span><span className="text-slate-900">{selectedCycle.label}</span></div>
                                        {signupFee > 0 && (
                                            <div className="flex justify-between font-bold text-slate-600"><span>Inscripción:</span><span className="text-slate-900">{formatCurrency(signupFee)}</span></div>
                                        )}
                                    </>
                                )}
                                <div className="flex justify-between font-black text-slate-900 text-sm pt-1 border-t border-slate-200"><span>Total:</span><span>{formatCurrency(totalPrice)}</span></div>
                            </div>

                            <Button
                                type="submit"
                                disabled={processing || !data.proof}
                                className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-sm shadow-lg flex items-center justify-center gap-2"
                                style={{ backgroundColor: plan.color_hex, color: '#fff' }}
                            >
                                {processing ? 'Enviando...' : '✅ Finalizar y Enviar Solicitud'}
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
