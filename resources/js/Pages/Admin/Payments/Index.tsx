import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    Banknote,
    Building2,
    CheckCircle2,
    FileText,
    Hourglass,
    MoreHorizontal,
    Wallet,
    Zap,
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
import { Field, FieldLabel } from '@/Components/base/Field';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/base/Select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/base/Table';
import { Textarea } from '@/Components/base/Textarea';
import AppLayout from '@/Layouts/AppLayout';

interface PaymentRow {
    id: number;
    associate_name: string;
    invoice_period: string;
    invoice_id: number;
    method: string;
    method_label: string;
    status: string;
    amount: string | null;
    reference: string | null;
    proof_url: string | null;
    notes: string | null;
    admin_notes: string | null;
    paid_at: string | null;
    created_at: string;
    reviewed_at: string | null;
    reviewer_name: string | null;
    applied: boolean;
    can_review: boolean;
}

interface Props {
    filter: string;
    counts: { pendiente: number; aprobado: number; rechazado: number };
    payments: PaymentRow[];
}

const STATUS_VARIANT: Record<
    string,
    'default' | 'secondary' | 'destructive' | 'outline'
> = {
    pendiente: 'secondary',
    aprobado: 'default',
    rechazado: 'destructive',
    fallido: 'outline',
    cancelado: 'outline',
};

const FILTERS = [
    { key: 'pendiente', label: 'Por revisar' },
    { key: 'aprobado', label: 'Aprobados' },
    { key: 'rechazado', label: 'Rechazados' },
    { key: 'todos', label: 'Todos' },
];

const formatCurrency = (v: string | null) =>
    v != null
        ? new Intl.NumberFormat('es-CO', {
              style: 'currency',
              currency: 'COP',
              maximumFractionDigits: 0,
          }).format(parseFloat(v))
        : '—';

export default function PaymentsIndex({ filter, counts, payments }: Props) {
    const flash = (usePage().props.flash ?? {}) as {
        success?: string;
        error?: string;
    };
    const [notice, setNotice] = useState<{
        variant: 'success' | 'destructive';
        msg: string;
    } | null>(null);
    const [approving, setApproving] = useState<PaymentRow | null>(null);
    const [rejecting, setRejecting] = useState<PaymentRow | null>(null);
    const rejection = useForm({ admin_notes: '' });

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

    const applyFilter = (estado: string) =>
        router.get(
            route('admin.payments.index', { estado }),
            {},
            { preserveScroll: true, preserveState: true },
        );

    const confirmApprove = () => {
        if (!approving) return;
        router.patch(
            route('admin.payments.approve', approving.id),
            {},
            { preserveScroll: true, onFinish: () => setApproving(null) },
        );
    };

    const submitReject = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rejecting) return;
        rejection.patch(route('admin.payments.reject', rejecting.id), {
            preserveScroll: true,
            onSuccess: () => setRejecting(null),
        });
    };

    return (
        <AppLayout>
            <Head title="Pagos" />
            <div className="mx-auto max-w-6xl space-y-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="flex items-center gap-2 font-display text-h3">
                            <Wallet className="size-6 text-muted-foreground" />
                            Pagos
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Todo lo que ha entrado, sin importar el riel:
                            pasarela, transferencia o efectivo.
                        </p>
                    </div>
                    <Select value={filter} onValueChange={applyFilter}>
                        <SelectTrigger className="w-48">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {FILTERS.map((f) => (
                                <SelectItem key={f.key} value={f.key}>
                                    {f.label}
                                    {f.key !== 'todos' &&
                                        counts[f.key as keyof typeof counts] >
                                            0 &&
                                        ` (${counts[f.key as keyof typeof counts]})`}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
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

                <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
                    <Table className="min-w-[860px]">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Asociado</TableHead>
                                <TableHead>Concepto</TableHead>
                                <TableHead>Medio</TableHead>
                                <TableHead>Monto</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Enviado</TableHead>
                                <TableHead className="text-right">
                                    Acciones
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="py-12 text-center text-muted-foreground"
                                    >
                                        {filter === 'pendiente'
                                            ? 'Nada esperando revisión. Todo al día.'
                                            : 'No hay pagos con este filtro.'}
                                    </TableCell>
                                </TableRow>
                            )}
                            {payments.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2 font-medium text-foreground">
                                            <Building2 className="size-4 shrink-0 text-muted-foreground" />
                                            {p.associate_name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {p.invoice_period}
                                        {p.reference && (
                                            <span className="mt-0.5 block font-mono text-xs">
                                                {p.reference}
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
                                            {p.method === 'bold' ? (
                                                <Zap className="size-3.5 text-primary" />
                                            ) : (
                                                <Banknote className="size-3.5 text-muted-foreground" />
                                            )}
                                            {p.method_label}
                                        </span>
                                    </TableCell>
                                    <TableCell className="font-medium tabular-nums text-foreground">
                                        {formatCurrency(p.amount)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                STATUS_VARIANT[p.status] ??
                                                'outline'
                                            }
                                        >
                                            {p.status}
                                        </Badge>
                                        {p.applied && (
                                            <span className="mt-1 block text-xs text-primary">
                                                vigencia aplicada
                                            </span>
                                        )}
                                        {p.admin_notes && (
                                            <span className="mt-1 block max-w-[220px] text-xs text-muted-foreground">
                                                {p.admin_notes}
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {p.created_at}
                                        {p.reviewer_name && (
                                            <span className="mt-0.5 block">
                                                por {p.reviewer_name}
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {p.status === 'pendiente' &&
                                        p.method === 'bold' &&
                                        !p.can_review ? (
                                            <span
                                                className="inline-flex items-center gap-1 text-xs text-muted-foreground"
                                                title="Esperando la confirmación de la pasarela"
                                            >
                                                <Hourglass className="size-3.5" />
                                                pasarela
                                            </span>
                                        ) : (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        aria-label={`Acciones de ${p.associate_name}`}
                                                    >
                                                        <MoreHorizontal className="size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {p.can_review && (
                                                        <>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    setApproving(
                                                                        p,
                                                                    )
                                                                }
                                                            >
                                                                Aprobar y
                                                                aplicar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    rejection.reset();
                                                                    rejection.clearErrors();
                                                                    setRejecting(
                                                                        p,
                                                                    );
                                                                }}
                                                            >
                                                                Rechazar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                        </>
                                                    )}
                                                    {p.proof_url && (
                                                        <DropdownMenuItem
                                                            asChild
                                                        >
                                                            <a
                                                                href={
                                                                    p.proof_url
                                                                }
                                                                target="_blank"
                                                                rel="noreferrer"
                                                            >
                                                                <FileText className="size-4" />
                                                                Ver comprobante
                                                            </a>
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            href={route(
                                                                'admin.invoices.index',
                                                            )}
                                                        >
                                                            Ver en facturación
                                                        </Link>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Aprobar */}
            <Dialog
                open={!!approving}
                onOpenChange={(o) => !o && setApproving(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Aprobar pago</DialogTitle>
                        <DialogDescription>
                            {approving &&
                                `${approving.associate_name} · ${approving.invoice_period} · ${formatCurrency(approving.amount)}. Se aplicará la vigencia al asociado.`}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancelar</Button>
                        </DialogClose>
                        <Button onClick={confirmApprove}>
                            Aprobar y aplicar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Rechazar */}
            <Dialog
                open={!!rejecting}
                onOpenChange={(o) => !o && setRejecting(null)}
            >
                <DialogContent>
                    <form onSubmit={submitReject}>
                        <DialogHeader>
                            <DialogTitle>Rechazar pago</DialogTitle>
                            <DialogDescription>
                                {rejecting &&
                                    `${rejecting.associate_name} · ${rejecting.invoice_period} · ${formatCurrency(rejecting.amount)}. La cuenta de cobro sigue pendiente y el asociado podrá reintentar.`}
                            </DialogDescription>
                        </DialogHeader>
                        <Field className="my-4">
                            <FieldLabel htmlFor="admin_notes">
                                Motivo del rechazo
                            </FieldLabel>
                            <Textarea
                                id="admin_notes"
                                rows={3}
                                value={rejection.data.admin_notes}
                                onChange={(e) =>
                                    rejection.setData(
                                        'admin_notes',
                                        e.target.value,
                                    )
                                }
                                placeholder="El asociado verá esto. Sé concreto: qué falló y qué debe hacer."
                            />
                            {rejection.errors.admin_notes && (
                                <p className="text-sm text-destructive">
                                    {rejection.errors.admin_notes}
                                </p>
                            )}
                        </Field>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">
                                    Cancelar
                                </Button>
                            </DialogClose>
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={rejection.processing}
                            >
                                {rejection.processing
                                    ? 'Rechazando…'
                                    : 'Rechazar pago'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
