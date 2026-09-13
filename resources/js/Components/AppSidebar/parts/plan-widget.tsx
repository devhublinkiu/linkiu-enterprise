import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { AlertCircle, Clock } from 'lucide-react';

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

// Widget de estado del plan + avisos. Solo se muestra con el sidebar expandido
// (se oculta en modo icono). Los colores de estado salen de tokens; el color del plan
// (`plan_color`) viene de datos y va en estilo en línea.
export function PlanWidget({
    sub,
    needsProfileCompletion,
}: {
    sub: Subscription | null;
    needsProfileCompletion: boolean;
}) {
    const planProgress = (() => {
        if (
            !sub ||
            sub.status !== 'active' ||
            sub.days_remaining === null ||
            !sub.days_total
        ) {
            return null;
        }
        const elapsed = sub.days_total - sub.days_remaining;
        const pct = Math.min(Math.round((elapsed / sub.days_total) * 100), 100);
        return { pct, elapsed, remaining: sub.days_remaining };
    })();

    return (
        <div className="flex flex-col gap-2 px-2 group-data-[collapsible=icon]:hidden">
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
                                <span>{planProgress.elapsed}d de uso</span>
                                <span className="flex items-center gap-1 text-foreground">
                                    <Clock className="size-2.5" />
                                    {planProgress.remaining}d restantes
                                </span>
                            </div>
                        </div>
                    )}

                    {sub.status === 'grace' && (
                        <p className="mt-1 text-[11px] text-accent-strong">
                            Prórroga — {sub.days_remaining}d restantes
                        </p>
                    )}

                    {sub.status === 'expired' && (
                        <p className="mt-1 text-[11px] text-destructive">
                            Vencido el {sub.expires_at}
                        </p>
                    )}
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

// Aviso "sin suscripción". Va DESPUÉS de los ítems del menú (no en el encabezado).
export function NoPlanNotice({ hasNoPlan }: { hasNoPlan: boolean }) {
    if (!hasNoPlan) return null;

    return (
        <div className="px-2 group-data-[collapsible=icon]:hidden">
            <div className="rounded-lg bg-primary p-3 text-primary-foreground">
                <p className="text-[11px] font-medium">Sin suscripción</p>
                <p className="mt-1 text-[11px] text-primary-foreground/70">
                    Activa tu membresía para habilitar todas las funciones.
                </p>
            </div>
        </div>
    );
}
