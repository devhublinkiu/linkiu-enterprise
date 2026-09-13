/**
 * Correo de pago recibido / suscripción al día — migrado a React (plan 0004, 4E).
 * Compila a resources/views/emails/billing/payment_settled.blade.php.
 * Vars del Mailable PaymentSettled: $invoice (opcional, ->period), $payment
 * (->amount, ->methodLabel(), ->reference, ->paid_at), $newExpiration.
 */
import { Section, Text } from '@react-email/components';
import * as React from 'react';

import { EmailButton } from '../components/EmailButton';
import { EmailInfoBox } from '../components/EmailInfoBox';
import { EmailLayout } from '../components/EmailLayout';
import { Blade, blade } from '../lib/blade';

export const view = 'emails/billing/payment_settled';

const row = { margin: '4px 0' };

export default function PaymentSettled(): React.ReactElement {
    return (
        <EmailLayout
            title="Pago recibido"
            preview="Registramos tu pago; tu suscripción quedó al día."
        >
            <Text>Hola,</Text>
            <Text>
                Registramos tu pago y tu suscripción en <strong>CAMEP</strong>{' '}
                quedó al día.
            </Text>

            <EmailInfoBox background="#f0fff4" border="#c6f6d5">
                <Blade if="$invoice">
                    <Text style={row}>
                        <strong>Concepto:</strong> {blade('$invoice->period')}
                    </Text>
                </Blade>
                <Text style={row}>
                    <strong>Monto:</strong> $
                    {blade(
                        "number_format((float) $payment->amount, 0, ',', '.')",
                    )}
                </Text>
                <Text style={row}>
                    <strong>Medio de pago:</strong>{' '}
                    {blade('$payment->methodLabel()')}
                </Text>
                <Blade if="$payment->reference">
                    <Text style={row}>
                        <strong>Referencia:</strong>{' '}
                        {blade('$payment->reference')}
                    </Text>
                </Blade>
                <Text style={row}>
                    <strong>Fecha del pago:</strong>{' '}
                    {blade("optional($payment->paid_at)->format('d/m/Y')")}
                </Text>
                <Text style={row}>
                    <strong>Tu suscripción va hasta:</strong>{' '}
                    {blade("$newExpiration->format('d/m/Y')")}
                </Text>
            </EmailInfoBox>

            <Text>
                Tu perfil sigue visible en el directorio público y conservas
                todos los beneficios de tu plan.
            </Text>

            <Section style={{ textAlign: 'center' }}>
                <EmailButton href={blade("route('associate.company.billing')")}>
                    Ver mi facturación
                </EmailButton>
            </Section>
        </EmailLayout>
    );
}
