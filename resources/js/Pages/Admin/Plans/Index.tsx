import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Crown,
    Layers,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { Alert, AlertTitle } from '@/Components/base/Alert';
import { Badge } from '@/Components/base/Badge';
import { Button } from '@/Components/base/Button';
import { Card, CardContent } from '@/Components/base/Card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/base/Dialog';
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

interface Plan {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    price_monthly: string;
    price_semiannual: string;
    price_annual: string;
    color_hex: string;
    grace_days: number;
    is_active: boolean;
    is_popular: boolean;
    signup_fee: string;
    associates_count: number;
    modules: PlanModule[];
}

const formatCurrency = (value: string | number) =>
    new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
    }).format(typeof value === 'string' ? parseFloat(value) : value);

export default function Index({ plans }: { plans: Plan[] }) {
    const flash = (usePage().props.flash ?? {}) as {
        success?: string;
        error?: string;
    };
    const [notice, setNotice] = useState<{
        variant: 'success' | 'destructive';
        msg: string;
    } | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Plan | null>(null);

    useEffect(() => {
        if (flash.success)
            setNotice({ variant: 'success', msg: flash.success });
        else if (flash.error)
            setNotice({ variant: 'destructive', msg: flash.error });
        if (flash.success || flash.error) {
            const t = setTimeout(() => setNotice(null), 5000);
            return () => clearTimeout(t);
        }
    }, [flash.success, flash.error]);

    const confirmDelete = () => {
        if (!deleteTarget) return;
        router.delete(route('admin.plans.destroy', deleteTarget.id), {
            preserveScroll: true,
            onFinish: () => setDeleteTarget(null),
        });
    };

    return (
        <AppLayout>
            <Head title="Membresías" />
            <div className="mx-auto max-w-6xl space-y-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="flex items-center gap-2 font-display text-h3">
                            <Crown className="size-6 text-muted-foreground" />
                            Membresías
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Los niveles de afiliación y los módulos que incluye
                            cada uno ({plans.length}).
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={route('admin.plans.create')}>
                            <Plus className="size-4" /> Nueva membresía
                        </Link>
                    </Button>
                </div>

                {notice && (
                    <Alert variant={notice.variant}>
                        {notice.variant === 'success' ? (
                            <CheckCircle2 />
                        ) : (
                            <AlertCircle />
                        )}
                        <AlertTitle>{notice.msg}</AlertTitle>
                    </Alert>
                )}

                {plans.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                            <Layers className="size-10 text-muted-foreground" />
                            <p className="font-medium text-foreground">
                                Aún no hay membresías configuradas.
                            </p>
                            <p className="max-w-sm text-sm text-muted-foreground">
                                Crea al menos una para que los asociados puedan
                                registrarse y pagar.
                            </p>
                            <Button asChild className="mt-2">
                                <Link href={route('admin.plans.create')}>
                                    Crear la primera
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {plans.map((plan) => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                onDelete={() => setDeleteTarget(plan)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <Dialog
                open={!!deleteTarget}
                onOpenChange={(o) => !o && setDeleteTarget(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Eliminar membresía</DialogTitle>
                        <DialogDescription>
                            {deleteTarget && deleteTarget.associates_count > 0
                                ? `No puedes eliminar «${deleteTarget?.name}»: tiene ${deleteTarget?.associates_count} empresa(s) asociada(s). Desactívala en su lugar (interruptor "Activa") para que no aparezca en el registro.`
                                : `¿Eliminar «${deleteTarget?.name}»? Esta acción no se puede deshacer.`}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cerrar</Button>
                        </DialogClose>
                        {deleteTarget &&
                            deleteTarget.associates_count === 0 && (
                                <Button
                                    variant="destructive"
                                    onClick={confirmDelete}
                                >
                                    Eliminar
                                </Button>
                            )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

function PlanCard({ plan, onDelete }: { plan: Plan; onDelete: () => void }) {
    const includedModules = plan.modules.filter((m) => m.enabled);

    return (
        <Card className="relative flex flex-col gap-0 p-0">
            <div
                className="h-1.5 w-full"
                style={{ backgroundColor: plan.color_hex }}
            />
            <CardContent className="flex flex-1 flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="truncate font-display text-lg text-foreground">
                                {plan.name}
                            </h3>
                            {plan.is_popular && <Badge>Recomendada</Badge>}
                        </div>
                        <Badge
                            variant={plan.is_active ? 'secondary' : 'outline'}
                            className={cn(
                                'mt-1',
                                !plan.is_active && 'text-muted-foreground',
                            )}
                        >
                            {plan.is_active ? 'Activa' : 'Inactiva'}
                        </Badge>
                    </div>
                    <div className="flex shrink-0 gap-1">
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            asChild
                            aria-label={`Editar ${plan.name}`}
                        >
                            <Link href={route('admin.plans.edit', plan.id)}>
                                <Pencil className="size-4" />
                            </Link>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Eliminar ${plan.name}`}
                            className="text-muted-foreground hover:text-destructive"
                            onClick={onDelete}
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </div>
                </div>

                {plan.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                        {plan.description}
                    </p>
                )}

                {/* Precios */}
                <div className="space-y-1.5 rounded-lg bg-muted/50 p-4">
                    <PriceRow
                        label="Cuota inicial"
                        value={plan.signup_fee}
                        emphasis
                    />
                    <PriceRow label="Mensual" value={plan.price_monthly} />
                    <PriceRow label="Semestral" value={plan.price_semiannual} />
                    <PriceRow label="Anual" value={plan.price_annual} />
                </div>

                {/* Módulos */}
                <div className="flex-1">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Incluye
                    </p>
                    {includedModules.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Sin módulos configurados.
                        </p>
                    ) : (
                        <ul className="space-y-1.5">
                            {includedModules.map((m) => (
                                <li
                                    key={m.key}
                                    className="flex items-center gap-2 text-sm text-foreground"
                                >
                                    <CheckCircle2 className="size-4 shrink-0 text-primary" />
                                    <span>
                                        {m.name}
                                        {m.type === 'limit' && (
                                            <span className="text-muted-foreground">
                                                {' '}
                                                ·{' '}
                                                {m.limit_value === null
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
                    )}
                </div>

                <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                    <span>Prórroga: {plan.grace_days} días</span>
                    <span>{plan.associates_count} asociada(s)</span>
                </div>
            </CardContent>
        </Card>
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
                    'tabular-nums',
                    emphasis
                        ? 'font-semibold text-foreground'
                        : 'text-foreground',
                )}
            >
                {formatCurrency(value)}
            </span>
        </div>
    );
}
