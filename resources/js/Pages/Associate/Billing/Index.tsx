import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/Card';
import { Button } from '@/Components/ui/Button';
import { Badge } from '@/Components/ui/Badge';
import {
    Crown,
    Layers,
    Image as ImageIcon,
    ShieldCheck,
    Download,
    Briefcase,
    Headphones,
    Calendar,
    AlertTriangle,
    Check,
    X,
    ArrowRight,
    Clock,
    Zap,
    TrendingUp,
    Hourglass,
    XOctagon,
} from 'lucide-react';

interface Plan {
    id: number;
    name: string;
    slug: string;
    description: string;
    price_monthly: string;
    price_semiannual: string;
    price_annual: string;
    currency: string;
    limit_services: number;
    limit_gallery: number;
    has_priority_directory: boolean;
    can_download_tenders: boolean;
    has_job_board: boolean;
    has_network: boolean;
    has_reviews: boolean;
    has_priority_support: boolean;
    color_hex: string;
    grace_days: number;
    is_active: boolean;
    is_popular: boolean;
    signup_fee: string;
}

interface PaymentRequestInfo {
    id: number;
    status: 'pending' | 'rejected';
    plan_name: string;
    plan_color: string;
    admin_notes: string | null;
    created_at: string;
}

interface Props {
    currentPlan: Plan | null;
    subscriptionStatus: 'none' | 'active' | 'grace' | 'expired';
    daysRemaining: number | null;
    planExpiresAt: string | null;
    usage: {
        services: number;
        gallery: number;
    };
    availablePlans: Plan[];
    paymentRequest: PaymentRequestInfo | null;
}

export default function BillingIndex({
    currentPlan,
    subscriptionStatus,
    daysRemaining,
    planExpiresAt,
    usage,
    availablePlans,
    paymentRequest,
}: Props) {
    const formatCurrency = (value: string) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(parseFloat(value));
    };

    const getStatusConfig = () => {
        switch (subscriptionStatus) {
            case 'active':
                return {
                    label: 'Suscripción Activa',
                    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    icon: Check,
                    barColor: 'bg-emerald-500',
                };
            case 'grace':
                return {
                    label: 'Período de Gracia',
                    color: 'bg-amber-50 text-amber-700 border-amber-200',
                    icon: Clock,
                    barColor: 'bg-amber-500',
                };
            case 'expired':
                return {
                    label: 'Suscripción Vencida',
                    color: 'bg-red-50 text-red-700 border-red-200',
                    icon: AlertTriangle,
                    barColor: 'bg-red-500',
                };
            default:
                return {
                    label: 'Sin Plan Activo',
                    color: 'bg-slate-50 text-slate-500 border-slate-200',
                    icon: X,
                    barColor: 'bg-slate-300',
                };
        }
    };

    const statusConfig = getStatusConfig();
    const StatusIcon = statusConfig.icon;

    const [hidePendingBanner, setHidePendingBanner] = useState(false);
    const [hideRejectedBanner, setHideRejectedBanner] = useState(false);

    const getUsagePercentage = (current: number, limit: number) => {
        if (limit === 0) return 0; // unlimited
        return Math.min((current / limit) * 100, 100);
    };

    const getUsageColor = (pct: number) => {
        if (pct >= 90) return 'bg-red-500';
        if (pct >= 70) return 'bg-amber-500';
        return 'bg-emerald-500';
    };

    return (
        <AppLayout>
            <Head title="Facturación y Suscripción - CAMEP" />

            <div className="space-y-8 max-w-6xl mx-auto">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase">Facturación</h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Gestiona tu suscripción y consulta los planes disponibles.</p>
                </div>

                {/* Alert Banner for expired/grace */}
                {(subscriptionStatus === 'expired' || subscriptionStatus === 'grace') && (
                    <div className={`rounded-xl border-2 p-5 flex items-start gap-4 ${
                        subscriptionStatus === 'expired'
                            ? 'bg-red-50/50 border-red-200'
                            : 'bg-amber-50/50 border-amber-200'
                    }`}>
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                            subscriptionStatus === 'expired' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <h3 className={`font-black text-sm uppercase ${
                                subscriptionStatus === 'expired' ? 'text-red-800' : 'text-amber-800'
                            }`}>
                                {subscriptionStatus === 'expired'
                                    ? '¡Tu suscripción ha vencido!'
                                    : `Período de gracia — Quedan ${daysRemaining} días`}
                            </h3>
                            <p className={`text-xs font-medium mt-1 ${
                                subscriptionStatus === 'expired' ? 'text-red-600' : 'text-amber-600'
                            }`}>
                                {subscriptionStatus === 'expired'
                                    ? 'Tu perfil público ha sido ocultado y el acceso a funciones está restringido. Renueva tu plan para continuar.'
                                    : 'Tu plan venció pero aún tienes acceso temporal. Renueva antes de que expire para evitar la desactivación de tu perfil.'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Payment Request Status Banner */}
                {paymentRequest?.status === 'pending' && !hidePendingBanner && (
                    <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50/60 p-5 flex items-start gap-4">
                        <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                            <Hourglass size={20} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-black text-sm uppercase text-indigo-800">Solicitud en revisión</h3>
                            <p className="text-xs font-medium mt-1 text-indigo-600">
                                Tu comprobante para el plan <strong>{paymentRequest.plan_name}</strong> fue enviado el {paymentRequest.created_at}.
                                CAMEP lo está revisando — te notificaremos cuando sea aprobado.
                            </p>
                        </div>
                        <button onClick={() => setHidePendingBanner(true)} className="shrink-0 h-7 w-7 flex items-center justify-center rounded-full text-indigo-300 hover:bg-indigo-100 hover:text-indigo-600 transition-all">
                            <X size={14} />
                        </button>
                    </div>
                )}
                {paymentRequest?.status === 'rejected' && !hideRejectedBanner && (
                    <div className="rounded-xl border-2 border-red-200 bg-red-50/60 p-5 flex items-start gap-4">
                        <div className="h-10 w-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                            <XOctagon size={20} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-black text-sm uppercase text-red-800">Comprobante rechazado</h3>
                            {paymentRequest.admin_notes && (
                                <p className="text-xs font-medium mt-1 text-red-600"><strong>Motivo:</strong> {paymentRequest.admin_notes}</p>
                            )}
                            <p className="text-xs font-medium mt-2 text-red-500">Selecciona un plan y sube un nuevo comprobante para continuar.</p>
                        </div>
                        <button onClick={() => setHideRejectedBanner(true)} className="shrink-0 h-7 w-7 flex items-center justify-center rounded-full text-red-300 hover:bg-red-100 hover:text-red-600 transition-all">
                            <X size={14} />
                        </button>
                    </div>
                )}

                {/* Current Plan Card */}
                <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
                    {currentPlan ? (
                        <div className="h-2 w-full" style={{ backgroundColor: currentPlan.color_hex }} />
                    ) : (
                        <div className="h-2 w-full bg-slate-200" />
                    )}
                    <CardContent className="p-8">
                        <div className="flex flex-col lg:flex-row lg:items-start gap-8">
                            {/* Plan Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                    <div
                                        className="h-12 w-12 rounded-xl flex items-center justify-center shadow-sm"
                                        style={{ backgroundColor: currentPlan?.color_hex || '#94a3b8' }}
                                    >
                                        <Crown size={22} className="text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900 uppercase">
                                            {currentPlan?.name || 'Sin Plan'}
                                        </h2>
                                        <Badge className={`${statusConfig.color} text-[10px] font-black uppercase`}>
                                            <StatusIcon size={10} className="mr-1" />
                                            {statusConfig.label}
                                        </Badge>
                                    </div>
                                </div>

                                {currentPlan?.description && (
                                    <p className="text-slate-500 text-sm font-medium mb-6 max-w-lg">{currentPlan.description}</p>
                                )}

                                {/* Features Grid */}
                                {currentPlan && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex items-center gap-2 text-xs font-bold">
                                            <ShieldCheck size={14} className={currentPlan.has_priority_directory ? "text-emerald-500" : "text-slate-300"} />
                                            <span className={currentPlan.has_priority_directory ? "text-slate-700" : "text-slate-400 line-through"}>Prioridad en Directorio</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-bold">
                                            <Download size={14} className={currentPlan.can_download_tenders ? "text-emerald-500" : "text-slate-300"} />
                                            <span className={currentPlan.can_download_tenders ? "text-slate-700" : "text-slate-400 line-through"}>Descarga Licitaciones</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-bold">
                                            <Briefcase size={14} className={currentPlan.has_job_board ? "text-indigo-500" : "text-slate-300"} />
                                            <span className={currentPlan.has_job_board ? "text-slate-700" : "text-slate-400 line-through"}>Banco de Empleo</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-bold">
                                            <Headphones size={14} className={currentPlan.has_priority_support ? "text-indigo-500" : "text-slate-300"} />
                                            <span className={currentPlan.has_priority_support ? "text-slate-700" : "text-slate-400 line-through"}>Soporte VIP</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Usage & Expiration */}
                            <div className="lg:w-80 space-y-6">
                                {/* Expiration */}
                                {planExpiresAt && (
                                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Calendar size={14} className="text-slate-400" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase">Vencimiento</span>
                                        </div>
                                        <p className="text-lg font-black text-slate-900">{planExpiresAt}</p>
                                        {daysRemaining !== null && subscriptionStatus !== 'expired' && (
                                            <p className={`text-xs font-bold mt-1 ${
                                                daysRemaining <= 7 ? 'text-red-500' : daysRemaining <= 30 ? 'text-amber-500' : 'text-emerald-500'
                                            }`}>
                                                {daysRemaining} días restantes
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Usage Bars */}
                                {currentPlan && (
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1.5">
                                                    <Layers size={12} />
                                                    Servicios
                                                </span>
                                                <span className="text-xs font-black text-slate-900">
                                                    {usage.services} / {currentPlan.limit_services === 0 ? '∞' : currentPlan.limit_services}
                                                </span>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${
                                                        currentPlan.limit_services === 0
                                                            ? 'bg-emerald-500'
                                                            : getUsageColor(getUsagePercentage(usage.services, currentPlan.limit_services))
                                                    }`}
                                                    style={{
                                                        width: currentPlan.limit_services === 0
                                                            ? '15%'
                                                            : `${getUsagePercentage(usage.services, currentPlan.limit_services)}%`
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1.5">
                                                    <ImageIcon size={12} />
                                                    Galería
                                                </span>
                                                <span className="text-xs font-black text-slate-900">
                                                    {usage.gallery} / {currentPlan.limit_gallery === 0 ? '∞' : currentPlan.limit_gallery}
                                                </span>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${
                                                        currentPlan.limit_gallery === 0
                                                            ? 'bg-emerald-500'
                                                            : getUsageColor(getUsagePercentage(usage.gallery, currentPlan.limit_gallery))
                                                    }`}
                                                    style={{
                                                        width: currentPlan.limit_gallery === 0
                                                            ? '15%'
                                                            : `${getUsagePercentage(usage.gallery, currentPlan.limit_gallery)}%`
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Available Plans Section */}
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <Zap size={20} className="text-slate-400" />
                        <h2 className="text-lg font-black text-slate-900 uppercase">Planes Disponibles</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {availablePlans.map((plan) => {
                            const isCurrent = currentPlan?.id === plan.id;

                            return (
                                <Card
                                    key={plan.id}
                                    className={`border-slate-200 shadow-sm overflow-hidden rounded-xl flex flex-col transition-all duration-300 ${
                                        isCurrent
                                            ? 'ring-2 shadow-lg'
                                            : 'hover:shadow-lg'
                                    }`}
                                    style={isCurrent ? { borderColor: plan.color_hex, boxShadow: `0 4px 20px ${plan.color_hex}20` } : {}}
                                >
                                    <div className="h-2 w-full" style={{ backgroundColor: plan.color_hex }} />

                                    <CardContent className="p-6 flex-1 flex flex-col">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-base font-black text-slate-900 uppercase">{plan.name}</h3>
                                                    {plan.is_popular && (
                                                        <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-[9px] font-black uppercase">Popular</Badge>
                                                    )}
                                                </div>
                                                {isCurrent && (
                                                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] font-black uppercase">
                                                        <Check size={8} className="mr-1" /> Tu plan actual
                                                    </Badge>
                                                )}
                                            </div>
                                            <div
                                                className="w-4 h-4 rounded-full shadow-sm shrink-0"
                                                style={{ backgroundColor: plan.color_hex }}
                                            />
                                        </div>

                                        <p className="text-slate-500 text-[11px] font-medium mb-5 line-clamp-2">
                                            {plan.description || "Plan de membresía CAMEP."}
                                        </p>

                                        {/* Precios */}
                                        <div className="space-y-1.5 mb-5 bg-slate-50 p-3.5 rounded-xl border border-slate-100 font-bold">
                                            {parseFloat(plan.signup_fee) > 0 && (
                                                <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/50 mb-1.5">
                                                    <span className="text-[10px] font-black text-indigo-500 uppercase">Inscripción (Única vez)</span>
                                                    <span className="text-sm font-black text-indigo-700">{formatCurrency(plan.signup_fee)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center gap-4">
                                                <span className="text-[9px] font-black text-slate-400 uppercase">Mensual</span>
                                                <span className="text-sm font-black text-slate-900">{formatCurrency(plan.price_monthly)}</span>
                                            </div>
                                            <div className="flex justify-between items-center gap-4">
                                                <span className="text-[9px] font-black text-slate-400 uppercase">Semestral</span>
                                                <span className="text-sm font-black text-slate-900">{formatCurrency(plan.price_semiannual)}</span>
                                            </div>
                                            <div className="flex justify-between items-center gap-4">
                                                <span className="text-[9px] font-black text-slate-400 uppercase">Anual</span>
                                                <span className="text-sm font-black text-slate-900">{formatCurrency(plan.price_annual)}</span>
                                            </div>
                                        </div>

                                        {/* Limits */}
                                        <div className="space-y-2 mb-5 text-xs">
                                            <div className="flex items-center gap-2 font-bold">
                                                <Layers size={12} className="text-slate-400" />
                                                <span className="text-slate-600">Servicios: <span className="text-slate-900 font-black">{plan.limit_services === 0 ? 'Ilimitado' : plan.limit_services}</span></span>
                                            </div>
                                            <div className="flex items-center gap-2 font-bold">
                                                <ImageIcon size={12} className="text-slate-400" />
                                                <span className="text-slate-600">Galería: <span className="text-slate-900 font-black">{plan.limit_gallery}</span> fotos</span>
                                            </div>
                                            <div className="flex items-center gap-2 font-bold">
                                                <ShieldCheck size={12} className={plan.has_priority_directory ? "text-emerald-500" : "text-slate-300"} />
                                                <span className={plan.has_priority_directory ? "text-slate-700" : "text-slate-400 line-through"}>Prioridad Directorio</span>
                                            </div>
                                            <div className="flex items-center gap-2 font-bold">
                                                <Download size={12} className={plan.can_download_tenders ? "text-emerald-500" : "text-slate-300"} />
                                                <span className={plan.can_download_tenders ? "text-slate-700" : "text-slate-400 line-through"}>Licitaciones</span>
                                            </div>
                                        </div>

                                        {/* CTA */}
                                        <div className="mt-auto pt-4 border-t border-slate-100">
                                            {isCurrent ? (
                                                <Button disabled className="w-full h-10 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs uppercase cursor-default">
                                                    Plan Vigente
                                                </Button>
                                            ) : (
                                                <Link href={route('associate.checkout.show', plan.id)} className="w-full">
                                                    <Button
                                                        className="w-full h-10 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2"
                                                        style={{ backgroundColor: plan.color_hex, color: '#fff' }}
                                                    >
                                                        <TrendingUp size={14} />
                                                        {currentPlan ? 'Cambiar a este plan' : 'Seleccionar plan'}
                                                        <ArrowRight size={14} />
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}

                        {availablePlans.length === 0 && (
                            <div className="col-span-full py-16 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center">
                                <Zap size={40} className="text-slate-200 mb-4" />
                                <p className="text-slate-500 font-bold">No hay planes configurados en este momento.</p>
                                <p className="text-slate-400 text-sm mt-1">Contacta a CAMEP para más información.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
