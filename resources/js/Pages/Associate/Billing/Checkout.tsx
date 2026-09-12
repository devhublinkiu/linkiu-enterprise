import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/Card';
import { Button } from '@/Components/ui/Button';
import { Badge } from '@/Components/ui/Badge';
import {
    ArrowLeft, ArrowRight, Building2, Hash, User, CreditCard,
    CheckCircle, Info
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

interface OpenInvoice {
    id: number;
    period: string;
    amount: string | null;
    pay_url: string;
}

interface Props {
    plan: Plan;
    bankAccounts: BankAccount[];
    associateStatus?: string;
    isSignupOnly?: boolean;
    currentCycle?: string;
    openInvoice?: OpenInvoice | null;
}

const CYCLES = [
    { value: 'monthly', label: 'Mensual', key: 'price_monthly' as const },
    { value: 'semiannual', label: 'Semestral (6 meses)', key: 'price_semiannual' as const },
    { value: 'annual', label: 'Anual (12 meses)', key: 'price_annual' as const },
];

export default function Checkout({
    plan,
    bankAccounts,
    associateStatus,
    isSignupOnly = false,
    currentCycle = 'monthly',
    openInvoice = null,
}: Props) {
    // El checkout ya no recibe el comprobante: emite la cuenta de cobro y lleva
    // a la pantalla de pago, donde el asociado elige cÃ³mo pagarla.
    // Ver docs/adr/0001-motor-de-cobro-unificado.md
    const { data, setData, post, processing } = useForm<{ billing_cycle: string }>({
        billing_cycle: CYCLES.some(c => c.value === currentCycle) ? currentCycle : 'monthly',
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('associate.checkout.store', plan.id));
    };

    return (
        <AppLayout>
            <Head title={`Checkout â€” Plan ${plan.name}`} />

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

                        {/* Billing Cycle â€” hidden in signup-only flow */}
                        {!isSignupOnly && (
                            <Card className="border-slate-200 shadow-sm rounded-2xl">
                                <CardContent className="p-6 space-y-3">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Periodo de facturaciÃ³n</p>
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
                                    <p className="text-[11px] font-black text-indigo-700 uppercase tracking-widest mb-1">Pago inicial: solo inscripciÃ³n</p>
                                    <p className="text-xs text-indigo-900/70 leading-relaxed font-medium">
                                        Este plan separa la inscripciÃ³n del primer mes. Hoy pagas Ãºnicamente la cuota inicial.
                                        A los 30 dÃ­as recibirÃ¡s automÃ¡ticamente la cuenta de cobro de tu primera mensualidad.
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
                                        ? 'InscripciÃ³n'
                                        : (signupFee > 0 ? `${selectedCycle.label} + InscripciÃ³n` : selectedCycle.label)
                                    }
                                </p>
                            </div>
                            <p className="text-2xl font-black">{formatCurrency(totalPrice)}</p>
                        </div>
                    </div>

                    {/* Right: Bank Accounts */}
                    <div className="lg:col-span-2 space-y-4">
                        {openInvoice && (
                            <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/60 p-5 flex flex-wrap items-center gap-4">
                                <Info size={20} className="text-amber-600 shrink-0" />
                                <div className="flex-1 min-w-[200px]">
                                    <p className="font-black text-sm uppercase text-amber-800">Ya tienes un cobro abierto de este plan</p>
                                    <p className="text-xs font-medium text-amber-700 mt-0.5">{openInvoice.period}</p>
                                </div>
                                <Link href={openInvoice.pay_url}>
                                    <Button className="h-10 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase px-5">
                                        Ir a pagarlo
                                    </Button>
                                </Link>
                            </div>
                        )}

                        <div className="flex items-center gap-2 mb-2">
                            <CreditCard size={18} className="text-slate-400" />
                            <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm">Cuentas bancarias de CAMEP</h3>
                        </div>
                        <p className="text-xs font-medium text-slate-500 -mt-2">
                            Si prefieres transferir, estas son las cuentas. TambiÃ©n podrÃ¡s pagar en lÃ­nea en el siguiente paso.
                        </p>

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
                                <p className="text-slate-400 font-bold">No hay cuentas bancarias configuradas todavÃ­a.</p>
                                <p className="text-slate-400 text-xs mt-1">Contacta a CAMEP para mÃ¡s informaciÃ³n.</p>
                            </div>
                        )}

                        {/* CTA */}
                        <form onSubmit={handleSubmit} className="pt-2">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg flex items-center justify-center gap-3"
                                style={{ backgroundColor: plan.color_hex, color: '#fff' }}
                            >
                                <CheckCircle size={20} />
                                {processing ? 'Generando tu cuenta de cobroâ€¦' : 'Continuar al pago'}
                                <ArrowRight size={18} />
                            </Button>
                            <p className="text-center text-[11px] font-medium text-slate-400 mt-3">
                                Generamos tu cuenta de cobro por {formatCurrency(totalPrice)} y eliges cÃ³mo pagarla:
                                en lÃ­nea, por transferencia con comprobante, o coordinando con CAMEP.
                            </p>
                        </form>
                    </div>
                </div>
            </div>

        </AppLayout>
    );
}
