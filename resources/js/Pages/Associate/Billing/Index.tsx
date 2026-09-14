import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    Calendar,
    CheckCircle2,
    Clock,
    CreditCard,
    Crown,
    Image as ImageIcon,
    Layers,
    Receipt,
    RefreshCw,
    TrendingUp,
} from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/Components/base/Alert';
import { Badge } from '@/Components/base/Badge';
import { Button } from '@/Components/base/Button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/Components/base/Card';
import { Progress } from '@/Components/base/Progress';
import AppLayout from '@/Layouts/AppLayout';
import { cn } from '@/lib/utils';

interface PlanModule {
    key: string;
    name: string;
    type: 'boolean' | 'limit';
    group: string | null;
    coming_soon: boolean;
    enabled: boolean;
    limit_value: number | null;
}

interface CurrentPlan {
    id: number;
    name: string;
    color_hex: string;
    description: string | null;
    modules: PlanModule[];
    limits: { services: number | null; gallery: number | null };
}

interface AvailablePlan {
    id: number;
    name: string;
    color_hex: string;
    description: string | null;
    price_monthly: string;
    price_semiannual: string;
    price_annual: string;
    signup_fee: string;
    is_popular: boolean;
    modules: PlanModule[];
}

interface PendingInvoice {
    id: number;
    period: string;
    amount: string | null;
    due_date: string | null;
    is_overdue: boolean;
    notes: string | null;
}

interface Props {
    currentPlan: CurrentPlan | null;
    subscriptionStatus: 'none' | 'active' | 'grace' | 'expired';
    daysRemaining: number | null;
    planExpiresAt: string | null;
    billingCycle: string;
    usage: { services: number; gallery: number };
    availablePlans: AvailablePlan[];
    pendingInvoices: PendingInvoice[];
}

const formatCurrency = (value: string | number) =>
    new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
    }).format(typeof value === 'string' ? parseFloat(value) : value);

const STATUS = {
    active: { label: 'Suscripción activa', variant: 'secondary' as const },
    grace: { label: 'Período de gracia', variant: 'outline' as const },
    expired: { label: 'Suscripción vencida', variant: 'destructive' as const },
    none: { label: 'Sin plan activo', variant: 'outline' as const },
};

function usagePercent(count: number, limit: number | null) {
    if (limit === null || limit === 0) return 8; // ilimitado: barra testimonial
    return Math.min((count / limit) * 100, 100);
}

export default function BillingIndex({
    currentPlan,
    subscriptionStatus,
    daysRemaining,
    planExpiresAt,
    usage,
    availablePlans,
    pendingInvoices = [],
}: Props) {
    const status = STATUS[subscriptionStatus];
    const needsPayment =
        subscriptionStatus === 'expired' || subscriptionStatus === 'grace';

    return (
        <AppLayout>
            <Head title="Gestión del Plan" />

            <div className="mx-auto max-w-5xl space-y-6">
                <div>
                    <h1 className="flex items-center gap-2 font-display text-h3">
                        <Crown className="size-6 text-muted-foreground" />
                        Gestión del Plan
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Tu membresía, tu uso y lo que debes pagar.
                    </p>
                </div>

                {/* Aviso vencida / gracia */}
                {needsPayment && (
                    <Alert
                        variant={
                            subscriptionStatus === 'expired'
                                ? 'destructive'
                                : 'default'
                        }
                    >
                        <AlertTriangle />
                        <AlertTitle>
                            {subscriptionStatus === 'expired'
                                ? 'Tu suscripción venció'
                                : `Período de gracia — quedan ${daysRemaining} días`}
                        </AlertTitle>
                        <AlertDescription>
                            {subscriptionStatus === 'expired'
                                ? 'Tu perfil público está oculto. Renueva para reactivarlo.'
                                : 'Tu plan venció pero aún tienes acceso temporal. Renueva antes de que termine la gracia.'}
                            {currentPlan && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                    className="mt-2 w-fit"
                                >
                                    <Link
                                        href={route(
                                            'associate.checkout.show',
                                            currentPlan.id,
                                        )}
                                    >
                                        <CreditCard className="size-4" /> Pagar
                                        ahora
                                    </Link>
                                </Button>
                            )}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Cuentas de cobro pendientes */}
                {pendingInvoices.length > 0 && (
                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle className="flex items-center gap-2">
                                <Receipt className="size-4 text-muted-foreground" />
                                Cuentas de cobro pendientes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="divide-y divide-border">
                            {pendingInvoices.map((invoice) => (
                                <div
                                    key={invoice.id}
                                    className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3 first:pt-0 last:pb-0"
                                >
                                    <div className="min-w-[180px] flex-1">
                                        <p className="font-medium text-foreground">
                                            {invoice.period}
                                        </p>
                                        <p
                                            className={cn(
                                                'text-xs',
                                                invoice.is_overdue
                                                    ? 'text-destructive'
                                                    : 'text-muted-foreground',
                                            )}
                                        >
                                            {invoice.due_date
                                                ? `${invoice.is_overdue ? 'Venció el' : 'Vence el'} ${invoice.due_date}`
                                                : 'Sin fecha de vencimiento'}
                                        </p>
                                    </div>
                                    {invoice.amount && (
                                        <span className="font-semibold tabular-nums text-foreground">
                                            {formatCurrency(invoice.amount)}
                                        </span>
                                    )}
                                    {invoice.is_overdue && (
                                        <Badge variant="destructive">
                                            En mora
                                        </Badge>
                                    )}
                                    <Button size="sm" asChild>
                                        <Link
                                            href={route(
                                                'associate.invoice.pay',
                                                invoice.id,
                                            )}
                                        >
                                            <CreditCard className="size-4" />{' '}
                                            Pagar
                                        </Link>
                                    </Button>
                                </div>
                            ))}
                            <div className="pt-3">
                                <Button variant="outline" size="sm" asChild>
                                    <Link
                                        href={route(
                                            'associate.company.invoices.index',
                                        )}
                                    >
                                        Ver todas mis facturas
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Plan actual */}
                <Card>
                    <CardContent>
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                        <Crown className="size-5" />
                                    </span>
                                    <div>
                                        <h2 className="font-display text-lg text-foreground">
                                            {currentPlan?.name ?? 'Sin plan'}
                                        </h2>
                                        <Badge variant={status.variant}>
                                            {status.label}
                                        </Badge>
                                    </div>
                                </div>

                                {currentPlan?.description && (
                                    <p className="text-sm text-muted-foreground">
                                        {currentPlan.description}
                                    </p>
                                )}

                                {currentPlan && (
                                    <div>
                                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                            Incluye
                                        </p>
                                        <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                                            {currentPlan.modules
                                                .filter((m) => m.enabled)
                                                .map((m) => (
                                                    <li
                                                        key={m.key}
                                                        className="flex items-center gap-2 text-sm text-foreground"
                                                    >
                                                        <CheckCircle2 className="size-4 shrink-0 text-primary" />
                                                        <span>
                                                            {m.name}
                                                            {m.type ===
                                                                'limit' && (
                                                                <span className="text-muted-foreground">
                                                                    {' '}
                                                                    ·{' '}
                                                                    {m.limit_value ===
                                                                    null
                                                                        ? 'ilimitado'
                                                                        : m.limit_value}
                                                                </span>
                                                            )}
                                                        </span>
                                                        {m.coming_soon && (
                                                            <Badge
                                                                variant="secondary"
                                                                className="ml-auto"
                                                            >
                                                                Pronto
                                                            </Badge>
                                                        )}
                                                    </li>
                                                ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Vencimiento + uso */}
                            <div className="space-y-4 lg:w-72">
                                {planExpiresAt && (
                                    <div className="rounded-lg border border-border p-4">
                                        <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
                                            <Calendar className="size-3.5" />{' '}
                                            Vencimiento
                                        </p>
                                        <p className="mt-1 font-semibold text-foreground">
                                            {planExpiresAt}
                                        </p>
                                        {daysRemaining !== null &&
                                            subscriptionStatus !==
                                                'expired' && (
                                                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Clock className="size-3" />{' '}
                                                    {daysRemaining} días
                                                    restantes
                                                </p>
                                            )}
                                    </div>
                                )}

                                {currentPlan && (
                                    <div className="space-y-3">
                                        <UsageBar
                                            icon={
                                                <Layers className="size-3.5" />
                                            }
                                            label="Servicios"
                                            count={usage.services}
                                            limit={currentPlan.limits.services}
                                        />
                                        <UsageBar
                                            icon={
                                                <ImageIcon className="size-3.5" />
                                            }
                                            label="Galería"
                                            count={usage.gallery}
                                            limit={currentPlan.limits.gallery}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Planes disponibles */}
                <div className="space-y-4">
                    <h2 className="flex items-center gap-2 font-display text-lg text-foreground">
                        <TrendingUp className="size-5 text-muted-foreground" />
                        Planes disponibles
                    </h2>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {availablePlans.map((plan) => {
                            const isCurrent = currentPlan?.id === plan.id;
                            return (
                                <Card key={plan.id} className="flex flex-col">
                                    <CardContent className="flex flex-1 flex-col gap-4">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-display text-lg text-foreground">
                                                {plan.name}
                                            </h3>
                                            {plan.is_popular && (
                                                <Badge>Recomendada</Badge>
                                            )}
                                            {isCurrent && (
                                                <Badge variant="secondary">
                                                    Tu plan
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="space-y-1.5 rounded-lg bg-muted/50 p-4">
                                            <PriceRow
                                                label="Cuota inicial"
                                                value={plan.signup_fee}
                                                emphasis
                                            />
                                            <PriceRow
                                                label="Mensual"
                                                value={plan.price_monthly}
                                            />
                                            <PriceRow
                                                label="Semestral"
                                                value={plan.price_semiannual}
                                            />
                                            <PriceRow
                                                label="Anual"
                                                value={plan.price_annual}
                                            />
                                        </div>

                                        <ul className="flex-1 space-y-1.5">
                                            {plan.modules
                                                .filter((m) => m.enabled)
                                                .map((m) => (
                                                    <li
                                                        key={m.key}
                                                        className="flex items-center gap-2 text-sm text-foreground"
                                                    >
                                                        <CheckCircle2 className="size-4 shrink-0 text-primary" />
                                                        <span>{m.name}</span>
                                                        {m.coming_soon && (
                                                            <Badge
                                                                variant="secondary"
                                                                className="ml-auto"
                                                            >
                                                                Pronto
                                                            </Badge>
                                                        )}
                                                    </li>
                                                ))}
                                        </ul>

                                        <div className="border-t border-border pt-3">
                                            {isCurrent && needsPayment ? (
                                                <Button
                                                    className="w-full"
                                                    asChild
                                                >
                                                    <Link
                                                        href={route(
                                                            'associate.checkout.show',
                                                            plan.id,
                                                        )}
                                                    >
                                                        <RefreshCw className="size-4" />{' '}
                                                        Renovar mi plan
                                                    </Link>
                                                </Button>
                                            ) : isCurrent ? (
                                                <Button
                                                    className="w-full"
                                                    variant="outline"
                                                    disabled
                                                >
                                                    Plan vigente
                                                </Button>
                                            ) : (
                                                <Button
                                                    className="w-full"
                                                    asChild
                                                >
                                                    <Link
                                                        href={route(
                                                            'associate.checkout.show',
                                                            plan.id,
                                                        )}
                                                    >
                                                        {currentPlan
                                                            ? 'Cambiar a este plan'
                                                            : 'Seleccionar plan'}
                                                        <ArrowRight className="size-4" />
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}

                        {availablePlans.length === 0 && (
                            <Card className="md:col-span-2 lg:col-span-3">
                                <CardContent className="py-12 text-center text-sm text-muted-foreground">
                                    No hay planes configurados en este momento.
                                    Contacta a CAMEP para más información.
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function UsageBar({
    icon,
    label,
    count,
    limit,
}: {
    icon: React.ReactNode;
    label: string;
    count: number;
    limit: number | null;
}) {
    return (
        <div>
            <div className="mb-1 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                    {icon} {label}
                </span>
                <span className="font-medium text-foreground">
                    {count} / {limit === null || limit === 0 ? '∞' : limit}
                </span>
            </div>
            <Progress value={usagePercent(count, limit)} />
        </div>
    );
}

function PriceRow({
    label,
    value,
    emphasis,
}: {
    label: string;
    value: string;
    emphasis?: boolean;
}) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span
                className={cn(
                    'tabular-nums text-foreground',
                    emphasis && 'font-semibold',
                )}
            >
                {formatCurrency(value)}
            </span>
        </div>
    );
}
