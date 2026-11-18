import { Building2, Copy, Hash, KeyRound, QrCode, User } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/Components/base/Badge';
import { Button } from '@/Components/base/Button';
import { Card, CardContent } from '@/Components/base/Card';

export interface BankAccount {
    id: number;
    type: 'cuenta' | 'bre_b' | 'qr';
    bank_name: string | null;
    account_type: string | null;
    account_number: string | null;
    payment_key: string | null;
    qr_url: string | null;
    holder_name: string | null;
    holder_document: string | null;
    holder_document_type: string | null;
    color_hex: string;
}

/**
 * Tarjeta de un medio de pago según `account.type`: cuenta bancaria, llave Bre-B
 * o código QR. Compartida por las pantallas "Pagar" y "Activar membresía" para que
 * ambas rendericen idéntico (antes "Activar membresía" mostraba la llave y el QR
 * como si fueran cuentas bancarias).
 */
export default function BankAccountCard({ account }: { account: BankAccount }) {
    return (
        <Card>
            <CardContent>
                {account.type === 'bre_b' ? (
                    <div className="flex items-start gap-4">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                            <KeyRound className="size-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                Llave Bre-B
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                                <span className="select-all break-all font-mono text-sm text-foreground">
                                    {account.payment_key}
                                </span>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        navigator.clipboard?.writeText(
                                            account.payment_key ?? '',
                                        );
                                        toast.success('Llave copiada');
                                    }}
                                >
                                    <Copy className="size-4" />
                                    Copiar
                                </Button>
                            </div>
                            {account.holder_name && (
                                <p className="mt-2 text-xs text-muted-foreground">
                                    A nombre de {account.holder_name}
                                </p>
                            )}
                        </div>
                    </div>
                ) : account.type === 'qr' ? (
                    <div className="flex flex-col items-center gap-3 text-center">
                        <p className="flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground">
                            <QrCode className="size-3.5" />{' '}
                            {account.bank_name || 'Paga con QR'}
                        </p>
                        {account.qr_url && (
                            <img
                                src={account.qr_url}
                                alt="Código QR para pagar"
                                className="size-52 rounded-lg border border-border object-contain p-2"
                            />
                        )}
                        <p className="text-xs text-muted-foreground">
                            Escanea el código desde tu app para pagar.
                        </p>
                    </div>
                ) : (
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
                                <Badge variant="secondary" className="mt-1">
                                    {account.account_type}
                                </Badge>
                            </div>
                            <div>
                                <p className="flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground">
                                    <Hash className="size-3" /> Cuenta
                                </p>
                                <p className="select-all font-mono text-sm text-foreground">
                                    {account.account_number}
                                </p>
                            </div>
                            <div>
                                <p className="flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground">
                                    <User className="size-3" /> Titular
                                </p>
                                <p className="text-sm text-foreground">
                                    {account.holder_name}
                                </p>
                                <p className="font-mono text-xs text-muted-foreground">
                                    {account.holder_document_type}:{' '}
                                    {account.holder_document}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
