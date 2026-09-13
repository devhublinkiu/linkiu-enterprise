/**
 * Aviso al admin: comprobante de transferencia por revisar — React (plan 0004, 4G).
 * Compila a resources/views/emails/admin/payment_proof_uploaded.blade.php.
 * Vars del Mailable PaymentProofUploaded: $payment (->associate->company_name,
 * ->amount, ->created_at, ->notes), $invoice (opcional, ->period).
 */
import { Section, Text } from '@react-email/components';
import * as React from 'react';

import { EmailButton } from '../components/EmailButton';
import { EmailInfoBox } from '../components/EmailInfoBox';
import { EmailLayout } from '../components/EmailLayout';
import { Blade, blade } from '../lib/blade';

export const view = 'emails/admin/payment_proof_uploaded';

const row = { margin: '4px 0' };

export default function PaymentProofUploaded(): React.ReactElement {
    return (
        <EmailLayout
            title="Comprobante por revisar"
            preview="Un asociado subió un comprobante de transferencia."
        >
            <Text>
                Un asociado subió un comprobante de transferencia y está
                esperando revisión.
            </Text>

            <EmailInfoBox background="#fffaf0" border="#feebc8">
                <Text style={row}>
                    <strong>Asociado:</strong>{' '}
                    {blade("$payment->associate?->company_name ?? '—'")}
                </Text>
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
                    <strong>Enviado:</strong>{' '}
                    {blade(
                        "optional($payment->created_at)->format('d/m/Y H:i')",
                    )}
                </Text>
                <Blade if="$payment->notes">
                    <Text style={row}>
                        <strong>Nota del asociado:</strong>{' '}
                        {blade('$payment->notes')}
                    </Text>
                </Blade>
            </EmailInfoBox>

            <Text>
                Mientras no se apruebe, la factura sigue pendiente y la
                suscripción no avanza.
            </Text>

            <Section style={{ textAlign: 'center' }}>
                <EmailButton href={blade("route('admin.payments.index')")}>
                    Revisar el comprobante
                </EmailButton>
            </Section>
        </EmailLayout>
    );
}
