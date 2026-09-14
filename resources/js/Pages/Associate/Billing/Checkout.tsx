import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Building2,
    CheckCircle2,
    CreditCard,
    Hash,
    Info,
    User,
} from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/Components/base/Alert';
import { Badge } from '@/Components/base/Badge';
import { Button } from '@/Components/base/Button';
import { Card, CardContent } from '@/Components/base/Card';
import AppLayout from '@/Layouts/AppLayout';

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

interface Plan {
    id: number;
    name: string;
    color_hex: string;
    price_monthly: string;
    price_semiannual: string;
    price_annual: string;
    currency: string;
    description: string;
    signup_fee: string;
}

interface OpenInvoice {
    id: number;
    period: string;
    amount: string | null;
    pay_url: string;
}

interface Props {
    plan: Plan;
    bankAccounts: BankAccount[];
    associateStatus?: string;
    isSignupOnly?: boolean;
    onlineEnabled?: boolean;
    openInvoice?: OpenInvoice | null;
}

const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
    }).format(val);

export default function Checkout({
    plan,
    bankAccounts,
    isSignupOnly = false,
    onlineEnabled = false,
    openInvoice = null,
}: Props) {
    // El alta unificada (plan 0016): la primera vez se cobra la cuota inicial
    // (exonera el mes 1); si no hay cuota inicial, la primera mensualidad. El
    // ciclo recurrente arranca mensual, sin selector. El servidor decide el monto.
    const { post, processing } = useForm({});

    const monthly = parseFloat(plan.price_monthly || '0');
    const signupFee = parseFloat(plan.signup_fee || '0');
    const total = isSignupOnly ? signupFee : monthly;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('associate.checkout.store', plan.id));
    };

    return (
        <AppLayout>
            <Head title={`Activar ${plan.name}`} />

            <div className="mx-auto max-w-4xl space-y-6">
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
                        <h1 className="font-display text-h3">
                            Activar membresía
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Confirma el plan{' '}
                            <span className="font-medium text-foreground">
                                {plan.name}
                            </span>{' '}
                            y genera tu cuenta de cobro.
                        </p>
                    </div>
                </div>

                {openInvoice && (
                    <Alert>
                        <Info />
                        <AlertTitle>
                            Ya tienes un cobro abierto de este plan
                        </AlertTitle>
                        <AlertDescription>
                            {openInvoice.period}
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="mt-2 w-fit"
                            >
                                <Link href={openInvoice.pay_url}>
                                    Ir a pagarlo
                                </Link>
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Resumen y total */}
                    <div className="space-y-4 lg:col-span-1">
                        <Card>
                            <CardContent className="space-y-2">
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Plan seleccionado
                                </p>
                                <h2 className="font-display text-lg text-foreground">
                                    {plan.name}
                                </h2>
                                {plan.description && (
                                    <p className="text-sm text-muted-foreground">
                                        {plan.description}
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {isSignupOnly && (
                            <Alert>
                                <Info />
                                <AlertTitle>
                                    Hoy pagas solo la cuota inicial
                                </AlertTitle>
                                <AlertDescription>
                                    La cuota inicial exonera tu primer mes. La
                                    mensualidad se empieza a cobrar a partir del
                                    mes siguiente.
                                </AlertDescription>
                            </Alert>
                        )}

                        <Card className="bg-primary text-primary-foreground">
                            <CardContent className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs uppercase tracking-wide opacity-80">
                                        Total a pagar hoy
                                    </p>
                                    <p className="text-sm opacity-80">
                                        {isSignupOnly
                                            ? 'Cuota inicial'
                                            : 'Mensualidad'}
                                    </p>
                                </div>
                                <p className="font-display text-2xl">
                                    {formatCurrency(total)}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Métodos de pago activos + CTA */}
                    <div className="space-y-4 lg:col-span-2">
                        <div>
                            <h3 className="flex items-center gap-2 font-medium text-foreground">
                                <CreditCard className="size-4 text-muted-foreground" />
                                Cómo vas a pagar
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Eliges el método en el siguiente paso. Estos son
                                los disponibles hoy.
                            </p>
                        </div>

                        {onlineEnabled && (
                            <Card>
                                <CardContent className="flex items-center gap-3">
                                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <CreditCard className="size-4" />
                                    </span>
                                    <div>
                                        <p className="font-medium text-foreground">
                                            Pago en línea
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Tarjeta, PSE o Nequi. Se confirma
                                            solo, en segundos.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {bankAccounts.length > 0 && (
                            <p className="text-sm font-medium text-foreground">
                                Transferencia bancaria
                            </p>
                        )}

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
                                                    : {account.holder_document}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {bankAccounts.length === 0 && !onlineEnabled && (
                            <Card>
                                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                                    No hay métodos de pago disponibles por
                                    ahora. Contacta a CAMEP para coordinar tu
                                    pago.
                                </CardContent>
                            </Card>
                        )}

                        <form onSubmit={handleSubmit} className="pt-2">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full"
                                size="lg"
                            >
                                <CheckCircle2 className="size-5" />
                                {processing
                                    ? 'Generando tu cuenta de cobro…'
                                    : 'Continuar al pago'}
                                <ArrowRight className="size-4" />
                            </Button>
                            <p className="mt-3 text-center text-xs text-muted-foreground">
                                Generamos tu cuenta de cobro por{' '}
                                {formatCurrency(total)} y eliges cómo pagarla en
                                el siguiente paso.
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
