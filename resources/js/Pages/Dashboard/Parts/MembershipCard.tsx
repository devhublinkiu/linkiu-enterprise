import { Link } from '@inertiajs/react';
import { ArrowRight, CalendarClock, Clock, Crown } from 'lucide-react';

import { Badge } from '@/Components/base/Badge';
import { Button } from '@/Components/base/Button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/Components/base/Card';

export type Subscription = {
    status: 'none' | 'active' | 'grace' | 'expired';
    plan_name: string | null;
    days_remaining: number | null;
    expires_at: string | null;
};

const STATUS_BADGE: Record<
    'active' | 'grace' | 'expired',
    { label: string; variant: 'default' | 'secondary' | 'destructive' }
> = {
    active: { label: 'Al día', variant: 'default' },
    grace: { label: 'En gracia', variant: 'secondary' },
    expired: { label: 'Vencido', variant: 'destructive' },
};

export function MembershipCard({ sub }: { sub: Subscription | null }) {
    const noPlan = !sub || sub.status === 'none';
    const badge = !noPlan
        ? STATUS_BADGE[sub!.status as 'active' | 'grace' | 'expired']
        : null;
    const needsPay = sub?.status === 'grace' || sub?.status === 'expired';

    return (
        <Card>
            <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                    <Crown className="size-4 text-muted-foreground" />
                    Mi membresía
                    {badge && (
                        <Badge variant={badge.variant} className="ml-auto">
                            {badge.label}
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {noPlan ? (
                    <>
                        <p className="text-sm text-muted-foreground">
                            Aún no tienes una membresía activa. Actívala para
                            habilitar todas las funciones y aparecer en el
                            directorio.
                        </p>
                        <Button asChild>
                            <Link href={route('associate.company.billing')}>
                                Ver planes
                                <ArrowRight />
                            </Link>
                        </Button>
                    </>
                ) : (
                    <>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Plan
                                </p>
                                <p className="font-medium">
                                    {sub!.plan_name || 'Sin plan'}
                                </p>
                            </div>
                            {sub!.days_remaining !== null && (
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Días restantes
                                    </p>
                                    <p className="flex items-center gap-1.5 font-medium">
                                        <Clock className="size-3.5 text-muted-foreground" />
                                        {sub!.days_remaining}
                                    </p>
                                </div>
                            )}
                            {sub!.expires_at && (
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        {sub!.status === 'expired'
                                            ? 'Venció el'
                                            : 'Vence el'}
                                    </p>
                                    <p className="flex items-center gap-1.5 font-medium">
                                        <CalendarClock className="size-3.5 text-muted-foreground" />
                                        {sub!.expires_at}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                asChild
                                variant={needsPay ? 'default' : 'outline'}
                            >
                                <Link href={route('associate.company.billing')}>
                                    {needsPay
                                        ? 'Pagar y renovar'
                                        : 'Gestionar plan'}
                                    <ArrowRight />
                                </Link>
                            </Button>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
