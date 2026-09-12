import React, { useEffect, useRef, useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent } from '@/Components/ui/Card';
import { Button } from '@/Components/ui/Button';
import { ArrowLeft, ShieldCheck, AlertTriangle } from 'lucide-react';

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
        script.setAttribute('data-integrity-signature', checkout.integritySignature);
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
            ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
                  .format(parseFloat(value))
            : '—';

    return (
        <AppLayout>
            <Head title={`Pago en línea — ${invoice.period}`} />

            <div className="max-w-xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link
                        href={route('associate.invoice.pay', invoice.id)}
                        className="h-10 w-10 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-900 transition-all shadow-sm"
                        aria-label="Volver"
                    >
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Pago en línea</h1>
                        <p className="text-slate-500 text-sm mt-0.5 font-medium">{invoice.period}</p>
                    </div>
                </div>

                <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                    <div className="h-2 bg-emerald-500" />
                    <CardContent className="p-8 text-center space-y-6">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total a pagar</p>
                            <p className="text-4xl font-black text-slate-900 tabular-nums mt-1">
                                {formatCurrency(invoice.amount)}
                            </p>
                            <p className="text-[11px] font-mono text-slate-400 mt-2">Referencia {checkout.orderId}</p>
                        </div>

                        {failed ? (
                            <div className="rounded-xl border-2 border-amber-200 bg-amber-50/60 p-5 flex items-start gap-3 text-left">
                                <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-black text-xs uppercase text-amber-800">No pudimos abrir la pasarela</p>
                                    <p className="text-xs font-medium text-amber-700 mt-1">
                                        Revisa tu conexión e inténtalo de nuevo, o paga por transferencia bancaria.
                                    </p>
                                    <Link href={route('associate.invoice.pay', invoice.id)} className="inline-block mt-3">
                                        <Button className="h-9 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase px-4">
                                            Volver a las opciones de pago
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div ref={containerRef} className="flex justify-center min-h-[60px]" />
                        )}

                        <div className="flex items-center justify-center gap-2 text-[11px] font-medium text-slate-400 pt-2 border-t border-slate-100">
                            <ShieldCheck size={14} />
                            El pago se procesa en la pasarela. CAMEP no almacena los datos de tu tarjeta.
                        </div>
                    </CardContent>
                </Card>

                <p className="text-xs font-medium text-slate-400 text-center">
                    Al terminar volverás a tu facturación. La confirmación puede tardar unos segundos en reflejarse.
                </p>
            </div>
        </AppLayout>
    );
}
