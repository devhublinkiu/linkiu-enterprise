import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    Building2,
    CheckCircle2,
    ChevronDown,
    Search,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { Alert, AlertTitle } from '@/Components/base/Alert';
import { Badge } from '@/Components/base/Badge';
import { Button } from '@/Components/base/Button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/base/Dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/base/DropdownMenu';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from '@/Components/base/InputGroup';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/base/Select';
import { Switch } from '@/Components/base/Switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/base/Table';
import AppLayout from '@/Layouts/AppLayout';
import { cn } from '@/lib/utils';

import TablePagination from './Parts/TablePagination';
import {
    AssociateRow,
    daysUntil,
    ESTADO_BADGE,
    Filters,
    Paginator,
    SECTION_KEYS,
} from './types';

interface Props {
    associates: Paginator<AssociateRow>;
    filters: Filters;
}

const SECTION_DOT: Record<string, string> = {
    approved: 'bg-primary',
    pending: 'bg-muted-foreground',
    rejected: 'bg-destructive',
    draft: 'bg-muted',
};

function SectionDots({
    reviews,
}: {
    reviews: Record<string, { status: string }> | null;
}) {
    return (
        <div className="flex items-center gap-1">
            {SECTION_KEYS.map((key) => {
                const status = reviews?.[key]?.status ?? 'draft';
                return (
                    <span
                        key={key}
                        title={`${key}: ${status}`}
                        className={cn(
                            'inline-block size-2 rounded-full',
                            SECTION_DOT[status] ?? 'bg-muted',
                        )}
                    />
                );
            })}
        </div>
    );
}

function subscriptionHint(row: AssociateRow): string | null {
    const d = daysUntil(row.plan_expires_at);
    if (row.estado === 'activa' && d !== null && d >= 0)
        return `vence en ${d} d`;
    if (row.estado === 'vencida' && d !== null) return `hace ${Math.abs(d)} d`;
    return null;
}

export default function Index({ associates, filters }: Props) {
    const flash = (usePage().props.flash ?? {}) as {
        success?: string;
        error?: string;
    };

    const [search, setSearch] = useState(filters.q ?? '');
    const [target, setTarget] = useState<AssociateRow | null>(null);
    const [notice, setNotice] = useState<{
        variant: 'success' | 'destructive';
        msg: string;
    } | null>(null);

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

    const applyFilter = (params: Partial<Filters>) =>
        router.get(
            route('admin.associates.index'),
            { estado: filters.estado, q: filters.q, ...params },
            { preserveState: true, replace: true, preserveScroll: true },
        );

    const toggleVerified = (row: AssociateRow) =>
        router.post(
            route('admin.associates.toggle-verified', row.id),
            {},
            { preserveScroll: true },
        );

    const confirmToggleActive = () => {
        if (!target) return;
        const isDeactivating = target.estado !== 'desactivada';
        router.post(
            route(
                isDeactivating
                    ? 'admin.associates.deactivate'
                    : 'admin.associates.reactivate',
                target.id,
            ),
            {},
            { preserveScroll: true, onFinish: () => setTarget(null) },
        );
    };

    const rows = associates.data;

    return (
        <AppLayout>
            <Head title="Empresas asociadas" />
            <div className="mx-auto max-w-6xl space-y-6">
                <div>
                    <h1 className="flex items-center gap-2 font-display text-h3">
                        <Building2 className="size-6 text-muted-foreground" />
                        Empresas asociadas
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Gestiona y audita las afiliaciones ({associates.total}{' '}
                        en total).
                    </p>
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

                <div className="flex flex-wrap items-center gap-3">
                    <InputGroup className="h-9 max-w-xs flex-1">
                        <InputGroupAddon>
                            <Search />
                        </InputGroupAddon>
                        <InputGroupInput
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                applyFilter({ q: e.target.value });
                            }}
                            placeholder="Buscar por nombre o NIT…"
                        />
                    </InputGroup>

                    <Select
                        value={filters.estado || 'all'}
                        onValueChange={(v) =>
                            applyFilter({ estado: v === 'all' ? '' : v })
                        }
                    >
                        <SelectTrigger className="ml-auto w-48">
                            <SelectValue placeholder="Todos los estados" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                Todos los estados
                            </SelectItem>
                            <SelectItem value="pendiente">
                                Pendientes
                            </SelectItem>
                            <SelectItem value="admitida">Admitidas</SelectItem>
                            <SelectItem value="activa">Activas</SelectItem>
                            <SelectItem value="inactiva">Inactivas</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="rounded-xl ring-1 ring-foreground/10">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Empresa</TableHead>
                                <TableHead>NIT</TableHead>
                                <TableHead>Ubicación</TableHead>
                                <TableHead>Secciones</TableHead>
                                <TableHead className="text-center">
                                    Verificada
                                </TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">
                                    Acciones
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="py-12 text-center text-muted-foreground"
                                    >
                                        No hay empresas para este filtro.
                                    </TableCell>
                                </TableRow>
                            )}
                            {rows.map((row) => {
                                const badge = ESTADO_BADGE[row.estado];
                                const hint = subscriptionHint(row);
                                const isDeactivated =
                                    row.estado === 'desactivada';
                                return (
                                    <TableRow key={row.id}>
                                        <TableCell className="font-medium">
                                            {row.company_name}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {row.nit ?? '—'}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {row.city ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            <SectionDots
                                                reviews={row.section_reviews}
                                            />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Switch
                                                checked={row.is_verified}
                                                onCheckedChange={() =>
                                                    toggleVerified(row)
                                                }
                                                aria-label={`Verificada: ${row.company_name}`}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-0.5">
                                                <Badge variant={badge.variant}>
                                                    {badge.label}
                                                </Badge>
                                                {hint && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {hint}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        aria-label={`Acciones para ${row.company_name}`}
                                                    >
                                                        Acciones
                                                        <ChevronDown className="size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            href={route(
                                                                'admin.associates.show',
                                                                row.id,
                                                            )}
                                                        >
                                                            Auditar perfil
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    {isDeactivated ? (
                                                        <DropdownMenuItem
                                                            onSelect={() =>
                                                                setTarget(row)
                                                            }
                                                        >
                                                            Reactivar empresa
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem
                                                            variant="destructive"
                                                            onSelect={() =>
                                                                setTarget(row)
                                                            }
                                                        >
                                                            Desactivar empresa
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>

                {associates.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            {associates.from}–{associates.to} de{' '}
                            {associates.total}
                        </p>
                        <TablePagination page={associates} />
                    </div>
                )}
            </div>

            <Dialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {target?.estado === 'desactivada'
                                ? 'Reactivar empresa'
                                : 'Desactivar empresa'}
                        </DialogTitle>
                        <DialogDescription>
                            {target?.estado === 'desactivada'
                                ? `Se reactivará «${target?.company_name}». Volverá al directorio solo si su suscripción está al día.`
                                : `«${target?.company_name}» dejará de aparecer en el directorio hasta reactivarla.`}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancelar</Button>
                        </DialogClose>
                        <Button
                            variant={
                                target?.estado === 'desactivada'
                                    ? 'default'
                                    : 'destructive'
                            }
                            onClick={confirmToggleActive}
                        >
                            {target?.estado === 'desactivada'
                                ? 'Reactivar'
                                : 'Desactivar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
