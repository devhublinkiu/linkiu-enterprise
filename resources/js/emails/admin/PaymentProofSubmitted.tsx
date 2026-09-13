/**
 * Aviso al admin: pago pendiente de revisión — React (plan 0004, corte 4G).
 * Compila a resources/views/emails/admin/payment_proof_submitted.blade.php.
 * Vars del Mailable PaymentProofSubmitted: $paymentRequest (->associate->company_name,
 * ->amount, ->reference_number, ->id).
 */
import { Section, Text } from '@react-email/components';
import * as React from 'react';

import { EmailButton } from '../components/EmailButton';
import { EmailLayout } from '../components/EmailLayout';
import { blade } from '../lib/blade';

export const view = 'emails/admin/payment_proof_submitted';

const row = { margin: '4px 0' };

export default function PaymentProofSubmitted(): React.ReactElement {
    return (
        <EmailLayout
            title="Pago Pendiente de Revisión"
            preview="Un socio subió un comprobante de pago para revisión."
        >
            <Text>Administrador,</Text>
            <Text>
                El socio{' '}
                <strong>
                    {blade('$paymentRequest->associate->company_name')}
                </strong>{' '}
                ha subido un nuevo comprobante de pago para su revisión.
            </Text>

            <Text style={row}>
                <strong>Monto Reportado:</strong> $
                {blade('number_format($paymentRequest->amount, 2)')}
            </Text>
            <Text style={row}>
                <strong>Referencia:</strong>{' '}
                {blade('$paymentRequest->reference_number')}
            </Text>

            <Text>
                Por favor, ingrese al panel para verificar la transacción en la
                cuenta bancaria y proceder con la aprobación.
            </Text>

            <Section style={{ textAlign: 'center' }}>
                <EmailButton
                    href={blade(
                        "url('/admin/payment-requests/' . $paymentRequest->id)",
                    )}
                >
                    Revisar Pago
                </EmailButton>
            </Section>
        </EmailLayout>
    );
}
