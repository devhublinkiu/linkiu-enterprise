import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    ArrowRight,
    Building2,
    CheckCircle2,
    CreditCard,
    FileText,
    Hash,
    Hourglass,
    Upload,
    User,
    Zap,
} from 'lucide-react';
import { useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/Components/base/Alert';
import { Badge } from '@/Components/base/Badge';
import { Button } from '@/Components/base/Button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/Components/base/Card';
import { Input } from '@/Components/base/Input';
import { Label } from '@/Components/base/Label';
import AppLayout from '@/Layouts/AppLayout';
import { cn } from '@/lib/utils';

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

interface Invoice {
    id: number;
    period: string;
    type: string;
    cycle: string | null;
    amount: string | null;
    currency: string;
    due_date: string | null;
    is_overdue: boolean;
    status: string;
    notes: string | null;
    document_url: string | null;
}

interface Props {
    invoice: Invoice;
    bankAccounts: BankAccount[];
    onlineEnabled: boolean;
    pendingReview: { id: number; created_at: string } | null;
    lastRejected: {
        method: string;
        admin_notes: string | null;
        reviewed_at: string | null;
    } | null;
}

export default function Pay({
    invoice,
    bankAccounts,
    onlineEnabled,
    pendingReview,
    lastRejected,
}: Props) {
    const [preview, setPreview] = useState<string | null>(null);

    const { data, setData, post, processing, errors } = useForm<{
        proof: File | null;
        notes: string;
    }>({
        proof: null,
        notes: '',
    });

    const formatCurrency = (value: string | null) =>
        value != null
            ? new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: invoice.currency || 'COP',
                  maximumFractionDigits: 0,
              }).format(parseFloat(value))
            : '—';

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setData('proof', file);
        setPreview(
            file && file.type.startsWith('image/')
                ? URL.createObjectURL(file)
                : null,
        );
    };

    const submitProof = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('associate.invoice.proof', invoice.id), {
            forceFormData: true,
        });
    };

    const isPaid = invoice.status === 'pagada';

    return (
        <AppLayout>
            <Head title={`Pagar — ${invoice.period}`} />

            <div className="mx-auto max-w-4xl space-y-5">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        asChild
                        aria-label="Volver a facturación"
                    >
                        <Link href={route('associate.company.billing')}>
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="font-display text-h3">Pagar</h1>
                        <p className="text-sm text-muted-foreground">
                            {invoice.period}
                        </p>
                    </div>
                </div>

                {/* Resumen del cobro */}
                <Card>
                    <CardContent className="flex flex-wrap items-center gap-x-8 gap-y-4">
                        <div className="min-w-[200px] flex-1">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                Concepto
                            </p>
                            <p className="mt-0.5 font-semibold text-foreground">
                                {invoice.period}
                            </p>
                            {invoice.notes && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {invoice.notes}
                                </p>
                            )}
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                {invoice.is_overdue ? 'Venció' : 'Vence'}
                            </p>
                            <p
                                className={cn(
                                    'mt-0.5 font-medium',
                                    invoice.is_overdue
                                        ? 'text-destructive'
                                        : 'text-foreground',
                                )}
                            >
                                {invoice.due_date ?? '—'}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                Total
                            </p>
                            <p className="font-display text-2xl tabular-nums text-foreground">
                                {formatCurrency(invoice.amount)}
                            </p>
                        </div>
                        {isPaid && <Badge variant="secondary">Pagada</Badge>}
                    </CardContent>
                </Card>

                {invoice.document_url && (
                    <a
                        href={invoice.document_url}
                        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                        <FileText className="size-4" />
                        Descargar el documento de esta cuenta de cobro
                    </a>
                )}

                {pendingReview && (
                    <Alert>
                        <Hourglass />
                        <AlertTitle>Comprobante en revisión</AlertTitle>
                        <AlertDescription>
                            Lo enviaste el {pendingReview.created_at}. CAMEP lo
                            está revisando y te avisaremos cuando quede
                            aplicado. Si subes otro, reemplazará a este.
                        </AlertDescription>
                    </Alert>
                )}

                {lastRejected && !pendingReview && !isPaid && (
                    <Alert variant="destructive">
                        <AlertTriangle />
                        <AlertTitle>
                            Tu intento anterior no se pudo aplicar
                        </AlertTitle>
                        <AlertDescription>
                            {lastRejected.admin_notes && (
                                <span>
                                    <strong>Motivo:</strong>{' '}
                                    {lastRejected.admin_notes}.{' '}
                                </span>
                            )}
                            Puedes intentarlo de nuevo por cualquiera de los
                            medios de abajo.
                        </AlertDescription>
                    </Alert>
                )}

                {isPaid ? (
                    <Alert>
                        <CheckCircle2 />
                        <AlertTitle>
                            Esta cuenta de cobro ya está pagada
                        </AlertTitle>
                        <AlertDescription>
                            No tienes que hacer nada más.
                            <Button
                                size="sm"
                                variant="outline"
                                asChild
                                className="mt-2 w-fit"
                            >
                                <Link
                                    href={route(
                                        'associate.company.invoices.index',
                                    )}
                                >
                                    Ver mis facturas
                                </Link>
                            </Button>
                        </AlertDescription>
                    </Alert>
                ) : (
                    <>
                        <h2 className="font-display text-lg text-foreground">
                            Elige cómo quieres pagar
                        </h2>

                        {/* Pago en línea */}
                        {onlineEnabled ? (
                            <Card>
                                <CardContent className="flex flex-wrap items-center gap-4">
                                    <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <Zap className="size-5" />
                                    </span>
                                    <div className="min-w-[220px] flex-1">
                                        <p className="font-medium text-foreground">
                                            Pago en línea
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Tarjeta, PSE o Nequi. Se confirma
                                            solo, en segundos, y tu suscripción
                                            queda al día.
                                        </p>
                                    </div>
                                    <Button asChild>
                                        <Link
                                            href={route(
                                                'associate.invoice.online',
                                                invoice.id,
                                            )}
                                        >
                                            Pagar en línea
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <Alert>
                                <AlertTriangle />
                                <AlertDescription>
                                    El pago en línea no está disponible por
                                    ahora. Puedes pagar por transferencia
                                    siguiendo los pasos de abajo.
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Transferencia */}
                        <div className="space-y-3">
                            <div>
                                <h3 className="flex items-center gap-2 font-medium text-foreground">
                                    <CreditCard className="size-4 text-muted-foreground" />
                                    Transferencia bancaria
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Transfiere a cualquiera de estas cuentas y
                                    sube el comprobante. CAMEP lo revisa y
                                    aplica el pago.
                                </p>
                            </div>

                            {bankAccounts.map((account) => (
                                <Card key={account.id}>
                                    <CardContent>
                                        <div className="flex items-start gap-4">
                                            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                                <Building2 className="size-5" />
                                            </span>
                                            <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-3">
                                                <div>
                                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                                        Banco
                                                    </p>
                                                    <p className="font-medium text-foreground">
                                                        {account.bank_name}
                                                    </p>
                                                    <Badge
                                                        variant="secondary"
                                                        className="mt-1"
                                                    >
                                                        {account.account_type}
                                                    </Badge>
                                                </div>
                                                <div>
                                                    <p className="flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground">
                                                        <Hash className="size-3" />{' '}
                                                        Cuenta
                                                    </p>
                                                    <p className="select-all font-mono text-sm text-foreground">
                                                        {account.account_number}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground">
                                                        <User className="size-3" />{' '}
                                                        Titular
                                                    </p>
                                                    <p className="text-sm text-foreground">
                                                        {account.holder_name}
                                                    </p>
                                                    <p className="font-mono text-xs text-muted-foreground">
                                                        {
                                                            account.holder_document_type
                                                        }
                                                        :{' '}
                                                        {
                                                            account.holder_document
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {bankAccounts.length === 0 && (
                                <Card>
                                    <CardContent className="py-10 text-center text-sm text-muted-foreground">
                                        No hay cuentas bancarias configuradas.
                                        Contacta a CAMEP para coordinar el pago.
                                    </CardContent>
                                </Card>
                            )}

                            {/* Subir comprobante */}
                            <Card>
                                <CardHeader className="border-b">
                                    <CardTitle className="text-sm">
                                        Ya transferí — subir comprobante
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form
                                        onSubmit={submitProof}
                                        className="space-y-4"
                                    >
                                        <label
                                            className={cn(
                                                'flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors',
                                                data.proof
                                                    ? 'border-primary/40 bg-primary/5'
                                                    : 'border-border bg-muted/40 hover:bg-muted',
                                            )}
                                        >
                                            {preview ? (
                                                <img
                                                    src={preview}
                                                    alt="Vista previa del comprobante"
                                                    className="h-36 w-full rounded-md object-contain p-1"
                                                />
                                            ) : data.proof ? (
                                                <div className="flex flex-col items-center gap-2 text-primary">
                                                    <CheckCircle2 className="size-8" />
                                                    <p className="text-sm font-medium">
                                                        {data.proof.name}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                    <Upload className="size-7" />
                                                    <p className="text-sm font-medium">
                                                        Arrastra o haz clic para
                                                        subir
                                                    </p>
                                                    <p className="text-xs">
                                                        JPG, PNG o PDF — máx 5
                                                        MB
                                                    </p>
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                className="sr-only"
                                                accept=".jpg,.jpeg,.png,.pdf"
                                                onChange={handleFileChange}
                                            />
                                        </label>
                                        {errors.proof && (
                                            <p className="text-sm text-destructive">
                                                {errors.proof}
                                            </p>
                                        )}

                                        <div className="space-y-1.5">
                                            <Label htmlFor="notes">
                                                Nota para CAMEP{' '}
                                                <span className="text-muted-foreground">
                                                    (opcional)
                                                </span>
                                            </Label>
                                            <Input
                                                id="notes"
                                                value={data.notes}
                                                onChange={(e) =>
                                                    setData(
                                                        'notes',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Ej. número de operación…"
                                            />
                                            {errors.notes && (
                                                <p className="text-sm text-destructive">
                                                    {errors.notes}
                                                </p>
                                            )}
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={processing || !data.proof}
                                            className="w-full"
                                        >
                                            <Upload className="size-4" />
                                            {processing
                                                ? 'Enviando…'
                                                : 'Enviar comprobante'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
