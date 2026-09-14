import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/Components/base/Alert';
import { Button } from '@/Components/base/Button';
import { Card, CardContent } from '@/Components/base/Card';
import AppLayout from '@/Layouts/AppLayout';

interface Props {
    invoice: { id: number; period: string; amount: string | null };
    scriptUrl: string;
    checkout: {
        apiKey: string;
        orderId: string;
        amount: string;
        currency: string;
        integritySignature: string;
        redirectionUrl: string;
        description: string;
    };
}

/**
 * Monta el botón de la pasarela.
 *
 * El script de Bold busca un contenedor con los atributos data-bold-* y se
 * dibuja dentro. Por eso el botón se inyecta con JS en vez de renderizarlo
 * como JSX: React no debe volver a tocar ese nodo una vez montado.
 */
export default function PayOnline({ invoice, scriptUrl, checkout }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const script = document.createElement('script');
        script.src = scriptUrl;
        script.async = true;

        script.setAttribute('data-bold-button', 'dark-L');
        script.setAttribute('data-api-key', checkout.apiKey);
        script.setAttribute('data-order-id', checkout.orderId);
        script.setAttribute('data-amount', checkout.amount);
        script.setAttribute('data-currency', checkout.currency);
        script.setAttribute(
            'data-integrity-signature',
            checkout.integritySignature,
        );
        script.setAttribute('data-redirection-url', checkout.redirectionUrl);
        script.setAttribute('data-description', checkout.description);

        script.onerror = () => setFailed(true);

        container.appendChild(script);

        return () => {
            container.innerHTML = '';
        };
    }, [scriptUrl, checkout]);

    const formatCurrency = (value: string | null) =>
        value != null
            ? new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  maximumFractionDigits: 0,
              }).format(parseFloat(value))
            : '—';

    return (
        <AppLayout>
            <Head title={`Pago en línea — ${invoice.period}`} />

            <div className="mx-auto max-w-xl space-y-5">
                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        asChild
                        aria-label="Volver"
                    >
                        <Link href={route('associate.invoice.pay', invoice.id)}>
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="font-display text-h3">Pago en línea</h1>
                        <p className="text-sm text-muted-foreground">
                            {invoice.period}
                        </p>
                    </div>
                </div>

                <Card>
                    <CardContent className="space-y-6 text-center">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                Total a pagar
                            </p>
                            <p className="mt-1 font-display text-4xl tabular-nums text-foreground">
                                {formatCurrency(invoice.amount)}
                            </p>
                            <p className="mt-2 font-mono text-xs text-muted-foreground">
                                Referencia {checkout.orderId}
                            </p>
                        </div>

                        {failed ? (
                            <Alert variant="destructive" className="text-left">
                                <AlertTriangle />
                                <AlertTitle>
                                    No pudimos abrir la pasarela
                                </AlertTitle>
                                <AlertDescription>
                                    Revisa tu conexión e inténtalo de nuevo, o
                                    paga por transferencia bancaria.
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        asChild
                                        className="mt-2 w-fit"
                                    >
                                        <Link
                                            href={route(
                                                'associate.invoice.pay',
                                                invoice.id,
                                            )}
                                        >
                                            Volver a las opciones de pago
                                        </Link>
                                    </Button>
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <div
                                ref={containerRef}
                                className="flex min-h-[60px] justify-center"
                            />
                        )}

                        <div className="flex items-center justify-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
                            <ShieldCheck className="size-4" />
                            El pago se procesa en la pasarela. CAMEP no almacena
                            los datos de tu tarjeta.
                        </div>
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-muted-foreground">
                    Al terminar volverás a tu facturación. La confirmación puede
                    tardar unos segundos en reflejarse.
                </p>
            </div>
        </AppLayout>
    );
}
