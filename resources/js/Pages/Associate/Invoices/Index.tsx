import { Head, Link } from '@inertiajs/react';
import {
    CreditCard,
    Download,
    ExternalLink,
    FileText,
    Inbox,
    Receipt,
} from 'lucide-react';

import { Badge } from '@/Components/base/Badge';
import { Button } from '@/Components/base/Button';
import { Card, CardContent } from '@/Components/base/Card';
import AppLayout from '@/Layouts/AppLayout';
import { cn } from '@/lib/utils';

interface InvoiceItem {
    id: number;
    type: string;
    period: string;
    amount: number | null;
    status: string;
    external_link: string | null;
    notes: string | null;
    document_url: string | null;
    created_at: string;
    is_unread: boolean;
}

interface Props {
    invoices: InvoiceItem[];
}

const TYPE_LABELS: Record<string, string> = {
    factura: 'Factura',
    cuenta_cobro: 'Cuenta de cobro',
};

const formatCurrency = (v: number | null) =>
    v != null
        ? new Intl.NumberFormat('es-CO', {
              style: 'currency',
              currency: 'COP',
              maximumFractionDigits: 0,
          }).format(v)
        : null;

export default function AssociateInvoicesIndex({ invoices }: Props) {
    const unread = invoices.filter((i) => i.is_unread).length;

    return (
        <AppLayout>
            <Head title="Mis Facturas" />

            <div className="mx-auto max-w-4xl space-y-6">
                <div>
                    <h1 className="flex items-center gap-2 font-display text-h3">
                        <Receipt className="size-6 text-muted-foreground" />
                        Mis Facturas
                        {unread > 0 && (
                            <Badge>
                                {unread} nueva{unread > 1 ? 's' : ''}
                            </Badge>
                        )}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Facturas y cuentas de cobro emitidas por CAMEP.
                    </p>
                </div>

                {invoices.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                            <Inbox className="size-10 text-muted-foreground" />
                            <p className="font-medium text-foreground">
                                Sin facturas por ahora
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Aquí aparecerán las facturas y cuentas de cobro
                                de CAMEP.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {invoices.map((inv) => {
                            const isPaid = inv.status === 'pagada';
                            return (
                                <Card
                                    key={inv.id}
                                    className={cn(
                                        'gap-0 p-0',
                                        inv.is_unread && 'ring-primary/30',
                                    )}
                                >
                                    <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                            {inv.type === 'factura' ? (
                                                <Receipt className="size-5" />
                                            ) : (
                                                <FileText className="size-5" />
                                            )}
                                        </span>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge variant="secondary">
                                                    {TYPE_LABELS[inv.type] ??
                                                        inv.type}
                                                </Badge>
                                                {inv.is_unread && (
                                                    <Badge>Nueva</Badge>
                                                )}
                                                <Badge
                                                    variant={
                                                        isPaid
                                                            ? 'secondary'
                                                            : 'outline'
                                                    }
                                                >
                                                    {inv.status}
                                                </Badge>
                                            </div>
                                            <p className="mt-1 font-medium text-foreground">
                                                {inv.period}
                                            </p>
                                            {inv.amount != null && (
                                                <p className="text-sm text-muted-foreground">
                                                    {formatCurrency(inv.amount)}
                                                </p>
                                            )}
                                            {inv.notes && (
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {inv.notes}
                                                </p>
                                            )}
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Emitida el {inv.created_at}
                                            </p>
                                        </div>

                                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                                            {!isPaid && (
                                                <Button size="sm" asChild>
                                                    <Link
                                                        href={route(
                                                            'associate.invoice.pay',
                                                            inv.id,
                                                        )}
                                                    >
                                                        <CreditCard className="size-4" />{' '}
                                                        Pagar
                                                    </Link>
                                                </Button>
                                            )}
                                            {inv.external_link && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    asChild
                                                >
                                                    <a
                                                        href={inv.external_link}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        <ExternalLink className="size-4" />{' '}
                                                        Ver enlace
                                                    </a>
                                                </Button>
                                            )}
                                            {inv.document_url && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    asChild
                                                >
                                                    <a
                                                        href={inv.document_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        <Download className="size-4" />{' '}
                                                        Descargar
                                                    </a>
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
