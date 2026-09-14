import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    Banknote,
    Building2,
    CheckCircle2,
    ExternalLink,
    MoreHorizontal,
    Plus,
    Receipt,
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
import { Input } from '@/Components/base/Input';
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

interface Associate {
    id: number;
    company_name: string;
}
interface InvoiceRow {
    id: number;
    associate_name: string;
    type: string;
    period: string;
    cycle: string | null;
    amount: number | null;
    due_date: string | null;
    status: string;
    has_document: boolean;
    external_link: string | null;
    creator_name: string;
    payment_method: string | null;
    payment_reference: string | null;
    paid_at: string | null;
    payer_name: string | null;
    created_at: string;
    read_at: string | null;
}

interface Props {
    invoices: InvoiceRow[];
    associates: Associate[];
}

const TYPE_LABELS: Record<string, string> = {
    factura: 'Factura',
    cuenta_cobro: 'Cuenta de cobro',
};

const METHOD_LABELS: Record<string, string> = {
    efectivo: 'Efectivo',
    transferencia: 'Transferencia',
    consignacion: 'Consignación',
    otro: 'Otro',
};

const today = () => new Date().toISOString().slice(0, 10);

const formatCurrency = (v: number | null) =>
    v != null
        ? new Intl.NumberFormat('es-CO', {
              style: 'currency',
              currency: 'COP',
              maximumFractionDigits: 0,
          }).format(v)
        : '—';

export default function InvoicesIndex({ invoices, associates }: Props) {
    const flash = (usePage().props.flash ?? {}) as {
        success?: string;
        error?: string;
    };
    const [notice, setNotice] = useState<{
        variant: 'success' | 'destructive';
        msg: string;
    } | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [payingInvoice, setPayingInvoice] = useState<InvoiceRow | null>(null);
    const [deleting, setDeleting] = useState<InvoiceRow | null>(null);

    const form = useForm({
        associate_id: '',
        type: 'factura',
        period: '',
        cycle: 'monthly',
        amount: '',
        document: null as File | null,
        external_link: '',
        notes: '',
    });

    const payment = useForm({
        payment_method: 'efectivo',
        paid_at: today(),
        payment_reference: '',
        payment_notes: '',
    });

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

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('admin.invoices.store'), {
            forceFormData: true,
            onSuccess: () => {
                form.reset();
                setShowCreate(false);
            },
        });
    };

    const submitPayment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!payingInvoice) return;
        payment.post(
            route('admin.invoices.register-payment', payingInvoice.id),
            {
                preserveScroll: true,
                onSuccess: () => setPayingInvoice(null),
            },
        );
    };

    const confirmDelete = () => {
        if (!deleting) return;
        router.delete(route('admin.invoices.destroy', deleting.id), {
            preserveScroll: true,
            onFinish: () => setDeleting(null),
        });
    };

    return (
        <AppLayout>
            <Head title="Facturación" />
            <div className="mx-auto max-w-6xl space-y-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="flex items-center gap-2 font-display text-h3">
                            <Receipt className="size-6 text-muted-foreground" />
                            Facturación
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Facturas y cuentas de cobro emitidas a los
                            asociados.
                        </p>
                    </div>
                    <Button onClick={() => setShowCreate(true)}>
                        <Plus className="size-4" /> Nueva factura
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

                <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
                    <Table className="min-w-[820px]">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Asociado</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Período</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Emitida</TableHead>
                                <TableHead className="text-right">
                                    Acciones
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="py-12 text-center text-muted-foreground"
                                    >
                                        No hay facturas aún. Usa «Nueva
                                        factura».
                                    </TableCell>
                                </TableRow>
                            )}
                            {invoices.map((inv) => {
                                const isPaid = inv.status === 'pagada';
                                return (
                                    <TableRow key={inv.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2 font-medium text-foreground">
                                                <Building2 className="size-4 shrink-0 text-muted-foreground" />
                                                {inv.associate_name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {TYPE_LABELS[inv.type] ??
                                                    inv.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {inv.period}
                                            {inv.due_date && (
                                                <span className="mt-0.5 block text-xs">
                                                    Vence {inv.due_date}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium tabular-nums text-foreground">
                                            {formatCurrency(inv.amount)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    isPaid
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {inv.status}
                                            </Badge>
                                            {isPaid && inv.payment_method && (
                                                <span className="mt-1 block text-xs text-muted-foreground">
                                                    {METHOD_LABELS[
                                                        inv.payment_method
                                                    ] ?? inv.payment_method}
                                                    {inv.paid_at &&
                                                        ` · ${inv.paid_at}`}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {inv.created_at}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        aria-label={`Acciones de ${inv.associate_name}`}
                                                    >
                                                        <MoreHorizontal className="size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {!isPaid && (
                                                        <>
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    payment.reset();
                                                                    payment.clearErrors();
                                                                    setPayingInvoice(
                                                                        inv,
                                                                    );
                                                                }}
                                                            >
                                                                <Banknote className="size-4" />
                                                                Registrar pago
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    router.patch(
                                                                        route(
                                                                            'admin.invoices.mark-paid',
                                                                            inv.id,
                                                                        ),
                                                                        {},
                                                                        {
                                                                            preserveScroll: true,
                                                                        },
                                                                    )
                                                                }
                                                            >
                                                                <CheckCircle2 className="size-4" />
                                                                Marcar pagada
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                        </>
                                                    )}
                                                    {inv.external_link && (
                                                        <DropdownMenuItem
                                                            asChild
                                                        >
                                                            <a
                                                                href={
                                                                    inv.external_link
                                                                }
                                                                target="_blank"
                                                                rel="noreferrer"
                                                            >
                                                                <ExternalLink className="size-4" />
                                                                Ver enlace
                                                            </a>
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem
                                                        variant="destructive"
                                                        onClick={() =>
                                                            setDeleting(inv)
                                                        }
                                                    >
                                                        Eliminar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Nueva factura */}
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <form onSubmit={submitCreate}>
                        <DialogHeader>
                            <DialogTitle>
                                Nueva factura / cuenta de cobro
                            </DialogTitle>
                            <DialogDescription>
                                Se emite al asociado. Una cuenta de cobro, al
                                pagarse, renueva su vigencia.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="my-4 space-y-4">
                            <Field>
                                <FieldLabel htmlFor="associate_id">
                                    Asociado
                                </FieldLabel>
                                <Select
                                    value={form.data.associate_id}
                                    onValueChange={(v) =>
                                        form.setData('associate_id', v)
                                    }
                                >
                                    <SelectTrigger id="associate_id">
                                        <SelectValue placeholder="Seleccionar asociado…" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {associates.map((a) => (
                                            <SelectItem
                                                key={a.id}
                                                value={String(a.id)}
                                            >
                                                {a.company_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.errors.associate_id && (
                                    <p className="text-sm text-destructive">
                                        {form.errors.associate_id}
                                    </p>
                                )}
                            </Field>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Field>
                                    <FieldLabel htmlFor="type">Tipo</FieldLabel>
                                    <Select
                                        value={form.data.type}
                                        onValueChange={(v) =>
                                            form.setData('type', v)
                                        }
                                    >
                                        <SelectTrigger id="type">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="factura">
                                                Factura
                                            </SelectItem>
                                            <SelectItem value="cuenta_cobro">
                                                Cuenta de cobro
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </Field>

                                {form.data.type === 'cuenta_cobro' && (
                                    <Field>
                                        <FieldLabel htmlFor="cycle">
                                            Ciclo que renueva
                                        </FieldLabel>
                                        <Select
                                            value={form.data.cycle}
                                            onValueChange={(v) =>
                                                form.setData('cycle', v)
                                            }
                                        >
                                            <SelectTrigger id="cycle">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="monthly">
                                                    Mensual (+1 mes)
                                                </SelectItem>
                                                <SelectItem value="semiannual">
                                                    Semestral (+6 meses)
                                                </SelectItem>
                                                <SelectItem value="annual">
                                                    Anual (+12 meses)
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                )}

                                <Field>
                                    <FieldLabel htmlFor="period">
                                        Período
                                    </FieldLabel>
                                    <Input
                                        id="period"
                                        value={form.data.period}
                                        onChange={(e) =>
                                            form.setData(
                                                'period',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Ej. Marzo 2026"
                                    />
                                    {form.errors.period && (
                                        <p className="text-sm text-destructive">
                                            {form.errors.period}
                                        </p>
                                    )}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="amount">
                                        Valor (opcional)
                                    </FieldLabel>
                                    <Input
                                        id="amount"
                                        type="number"
                                        min={0}
                                        value={form.data.amount}
                                        onChange={(e) =>
                                            form.setData(
                                                'amount',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="0"
                                    />
                                </Field>
                            </div>

                            <Field>
                                <FieldLabel htmlFor="document">
                                    Documento (PDF / imagen, opcional)
                                </FieldLabel>
                                <Input
                                    id="document"
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) =>
                                        form.setData(
                                            'document',
                                            e.target.files?.[0] ?? null,
                                        )
                                    }
                                />
                                {form.errors.document && (
                                    <p className="text-sm text-destructive">
                                        {form.errors.document}
                                    </p>
                                )}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="external_link">
                                    Enlace externo (opcional)
                                </FieldLabel>
                                <Input
                                    id="external_link"
                                    type="url"
                                    value={form.data.external_link}
                                    onChange={(e) =>
                                        form.setData(
                                            'external_link',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="https://…"
                                />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="notes">
                                    Observaciones
                                </FieldLabel>
                                <Textarea
                                    id="notes"
                                    rows={2}
                                    value={form.data.notes}
                                    onChange={(e) =>
                                        form.setData('notes', e.target.value)
                                    }
                                />
                            </Field>
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">
                                    Cancelar
                                </Button>
                            </DialogClose>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing
                                    ? 'Subiendo…'
                                    : 'Subir factura'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Registrar pago */}
            <Dialog
                open={!!payingInvoice}
                onOpenChange={(o) => !o && setPayingInvoice(null)}
            >
                <DialogContent>
                    <form onSubmit={submitPayment}>
                        <DialogHeader>
                            <DialogTitle>Registrar pago</DialogTitle>
                            <DialogDescription>
                                {payingInvoice &&
                                    `${payingInvoice.associate_name} · ${payingInvoice.period} · ${formatCurrency(payingInvoice.amount)}`}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="my-4 space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Field>
                                    <FieldLabel htmlFor="payment_method">
                                        Medio de pago
                                    </FieldLabel>
                                    <Select
                                        value={payment.data.payment_method}
                                        onValueChange={(v) =>
                                            payment.setData('payment_method', v)
                                        }
                                    >
                                        <SelectTrigger id="payment_method">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(METHOD_LABELS).map(
                                                ([value, label]) => (
                                                    <SelectItem
                                                        key={value}
                                                        value={value}
                                                    >
                                                        {label}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="paid_at">
                                        Fecha real del pago
                                    </FieldLabel>
                                    <Input
                                        id="paid_at"
                                        type="date"
                                        max={today()}
                                        value={payment.data.paid_at}
                                        onChange={(e) =>
                                            payment.setData(
                                                'paid_at',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    {payment.errors.paid_at && (
                                        <p className="text-sm text-destructive">
                                            {payment.errors.paid_at}
                                        </p>
                                    )}
                                </Field>
                            </div>

                            <Field>
                                <FieldLabel htmlFor="payment_reference">
                                    Recibo o referencia (opcional)
                                </FieldLabel>
                                <Input
                                    id="payment_reference"
                                    value={payment.data.payment_reference}
                                    onChange={(e) =>
                                        payment.setData(
                                            'payment_reference',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Ej. Recibo 00123"
                                />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="payment_notes">
                                    Observaciones (opcional)
                                </FieldLabel>
                                <Textarea
                                    id="payment_notes"
                                    rows={2}
                                    value={payment.data.payment_notes}
                                    onChange={(e) =>
                                        payment.setData(
                                            'payment_notes',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Quién entregó el dinero, dónde se recibió…"
                                />
                            </Field>

                            {payingInvoice?.type === 'cuenta_cobro' && (
                                <p className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                                    Al registrar el pago se extenderá la
                                    vigencia del asociado y, si su perfil estaba
                                    oculto por vencimiento, volverá a
                                    publicarse.
                                </p>
                            )}
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">
                                    Cancelar
                                </Button>
                            </DialogClose>
                            <Button type="submit" disabled={payment.processing}>
                                {payment.processing
                                    ? 'Registrando…'
                                    : 'Registrar pago'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Eliminar */}
            <Dialog
                open={!!deleting}
                onOpenChange={(o) => !o && setDeleting(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Eliminar factura</DialogTitle>
                        <DialogDescription>
                            {deleting &&
                                `¿Eliminar «${deleting.period}» de ${deleting.associate_name}? Esta acción no se puede deshacer.`}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancelar</Button>
                        </DialogClose>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
