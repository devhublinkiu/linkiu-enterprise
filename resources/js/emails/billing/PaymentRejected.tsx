/**
 * Correo de pago rechazado — migrado a React (plan 0004, corte 4E).
 * Compila a resources/views/emails/billing/payment_rejected.blade.php.
 * Vars del Mailable PaymentRejected: $payment (->invoice->period,
 * ->invoice->invoice_number, ->admin_notes, ->invoice_id).
 */
import { Section, Text } from '@react-email/components';
import * as React from 'react';

import { EmailButton } from '../components/EmailButton';
import { EmailInfoBox } from '../components/EmailInfoBox';
import { EmailLayout } from '../components/EmailLayout';
import { blade } from '../lib/blade';

export const view = 'emails/billing/payment_rejected';

export default function PaymentRejected(): React.ReactElement {
    return (
        <EmailLayout
            title="Aviso sobre tu pago"
            preview="Detectamos un inconveniente con tu comprobante de pago."
        >
            <Text>Hola,</Text>
            <Text>
                Revisamos el comprobante que enviaste para{' '}
                <strong>{blade('$payment->invoice?->period')}</strong> en{' '}
                <strong>CAMEP</strong> y encontramos un inconveniente que impide
                aplicarlo.
            </Text>

            <EmailInfoBox background="#fff5f5" border="#feb2b2">
                <Text style={{ margin: '4px 0' }}>
                    <strong>Motivo:</strong>
                </Text>
                <Text style={{ margin: '4px 0' }}>
                    {blade('$payment->admin_notes')}
                </Text>
            </EmailInfoBox>

            <Text>
                Verifica la información de tu pago y vuelve a subir el
                comprobante correcto desde tu panel de facturación.
            </Text>

            <Section style={{ textAlign: 'center' }}>
                <EmailButton
                    href={blade(
                        "route('associate.invoice.pay', $payment->invoice_id)",
                    )}
                >
                    Subir nuevo comprobante
                </EmailButton>
            </Section>
        </EmailLayout>
    );
}
