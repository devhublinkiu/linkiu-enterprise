import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { AlertCircle, ArrowRight, CalendarClock, Clock } from 'lucide-react';

export type Subscription = {
    status: 'none' | 'active' | 'grace' | 'expired';
    plan_name: string | null;
    plan_color: string | null;
    days_remaining: number | null;
    days_total: number | null;
    expires_at: string | null;
};

const STATUS_LABEL: Record<'active' | 'grace' | 'expired', string> = {
    active: 'Al día',
    grace: 'En gracia',
    expired: 'Vencido',
};

// Ciclo nominal mensual (corte del cliente al día 19). Se usa como total cuando el
// backend no entrega `days_total`, para que la barra de avance siempre sea correcta.
const NOMINAL_CYCLE_DAYS = 30;

// Card de estado del plan + avisos. Va en el PIE del sidebar (SidebarFooter) y solo
// con el sidebar expandido (se oculta en modo icono). Los colores de estado salen de
// tokens; el color del plan (`plan_color`) viene de datos y va en estilo en línea.
export function PlanWidget({
    sub,
    needsProfileCompletion,
    hasNoPlan,
}: {
    sub: Subscription | null;
    needsProfileCompletion: boolean;
    hasNoPlan: boolean;
}) {
    const planProgress = (() => {
        if (!sub || sub.status !== 'active' || sub.days_remaining === null) {
            return null;
        }
        const total = sub.days_total || NOMINAL_CYCLE_DAYS;
        const remaining = Math.max(0, Math.min(sub.days_remaining, total));
        const elapsed = total - remaining;
        const pct = Math.min(Math.round((elapsed / total) * 100), 100);
        return { pct, remaining };
    })();

    return (
        <div className="flex flex-col gap-2 group-data-[collapsible=icon]:hidden">
            {/* Estado del plan */}
            {sub && sub.status !== 'none' && (
                <div
                    className={cn(
                        'rounded-lg border p-3',
                        sub.status === 'active' && 'border-border bg-muted',
                        sub.status === 'grace' &&
                            'border-accent-strong/30 bg-accent-subtle',
                        sub.status === 'expired' &&
                            'border-destructive/30 bg-destructive-subtle',
                    )}
                >
                    <div className="mb-2 flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                            <span
                                className="size-2 shrink-0 rounded-full"
                                style={{
                                    backgroundColor:
                                        sub.plan_color ||
                                        'hsl(var(--muted-foreground))',
                                }}
                            />
                            <span className="truncate text-xs font-medium">
                                {sub.plan_name || 'Sin plan'}
                            </span>
                        </div>
                        <span
                            className={cn(
                                'shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium',
                                sub.status === 'active' &&
                                    'bg-success text-success-foreground',
                                sub.status === 'grace' &&
                                    'bg-accent text-accent-foreground',
                                sub.status === 'expired' &&
                                    'bg-destructive text-destructive-foreground',
                            )}
                        >
                            {STATUS_LABEL[sub.status]}
                        </span>
                    </div>

                    {planProgress && sub.status === 'active' && (
                        <div className="space-y-1.5">
                            <div className="h-1 w-full overflow-hidden rounded-full bg-border">
                                <div
                                    className="h-full rounded-full transition-all duration-1000"
                                    style={{
                                        width: `${planProgress.pct}%`,
                                        backgroundColor:
                                            sub.plan_color ||
                                            'hsl(var(--success))',
                                    }}
                                />
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Clock className="size-2.5" />
                                    {planProgress.remaining}d restantes
                                </span>
                                {sub.expires_at && (
                                    <span className="flex items-center gap-1">
                                        <CalendarClock className="size-2.5" />
                                        {sub.expires_at}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {sub.status === 'grace' && (
                        <>
                            <p className="text-[11px] text-accent-strong">
                                Prórroga — {sub.days_remaining}d restantes
                                {sub.expires_at
                                    ? ` (venció el ${sub.expires_at})`
                                    : ''}
                            </p>
                            <RenewCta className="mt-2" label="Renovar ahora" />
                        </>
                    )}

                    {sub.status === 'expired' && (
                        <>
                            <p className="text-[11px] text-destructive">
                                Vencido el {sub.expires_at}
                            </p>
                            <RenewCta
                                className="mt-2"
                                label="Pagar y reactivar"
                            />
                        </>
                    )}
                </div>
            )}

            {/* Sin suscripción */}
            {hasNoPlan && (
                <div className="rounded-lg bg-primary p-3 text-primary-foreground">
                    <p className="text-[11px] font-medium">Sin suscripción</p>
                    <p className="mt-1 text-[11px] text-primary-foreground/70">
                        Activa tu membresía para habilitar todas las funciones.
                    </p>
                    <Link
                        href={route('associate.company.billing')}
                        className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium underline-offset-2 hover:underline"
                    >
                        Ver planes
                        <ArrowRight className="size-3" />
                    </Link>
                </div>
            )}

            {/* CTA: completar perfil */}
            {needsProfileCompletion && (
                <Link
                    href={route('associate.company.basic')}
                    className="group/cta flex items-start gap-3 rounded-lg border border-success-strong/20 bg-success-subtle p-3 transition-colors hover:bg-success-subtle/70"
                >
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md bg-success text-success-foreground">
                        <AlertCircle className="size-3" />
                    </span>
                    <span>
                        <span className="block text-xs font-medium text-success-strong">
                            Activar perfil
                        </span>
                        <span className="mt-0.5 block text-[11px] text-muted-foreground">
                            Completa los datos para aparecer en el directorio.
                        </span>
                    </span>
                </Link>
            )}
        </div>
    );
}

// Botón de renovación/pago. Facturación nunca se bloquea (ADR-0001), así que el
// vencido/en gracia siempre puede llegar aquí.
function RenewCta({ label, className }: { label: string; className?: string }) {
    return (
        <Link
            href={route('associate.company.billing')}
            className={cn(
                'flex items-center justify-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-[11px] font-medium text-background transition-colors hover:bg-foreground/90',
                className,
            )}
        >
            {label}
            <ArrowRight className="size-3" />
        </Link>
    );
}
