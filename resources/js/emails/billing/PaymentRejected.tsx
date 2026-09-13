/**
 * Correo de pago rechazado — migrado a React (plan 0004, corte 4E).
 * Compila a resources/views/emails/billing/payment_rejected.blade.php.
 * Vars del Mailable PaymentRejected: $paymentRequest (->plan->name, ->admin_notes).
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
            title="Aviso sobre su Pago"
            preview="Detectamos un inconveniente con tu solicitud de pago."
        >
            <Text>Hola,</Text>
            <Text>
                Le informamos que tras revisar su solicitud de pago para el plan{' '}
                <strong>{blade('$paymentRequest->plan->name')}</strong> en{' '}
                <strong>CAMEP</strong>, hemos detectado un inconveniente que
                impide su aprobación.
            </Text>

            <EmailInfoBox background="#fff5f5" border="#feb2b2">
                <Text style={{ margin: '4px 0' }}>
                    <strong>Motivo de la observación:</strong>
                </Text>
                <Text style={{ margin: '4px 0' }}>
                    {blade('$paymentRequest->admin_notes')}
                </Text>
            </EmailInfoBox>

            <Text>
                Le invitamos a verificar la información de su pago y volver a
                adjuntar el comprobante correcto desde su panel de facturación.
            </Text>

            <Section style={{ textAlign: 'center' }}>
                <EmailButton href={blade("route('associate.company.billing')")}>
                    Subir Nuevo Comprobante
                </EmailButton>
            </Section>
        </EmailLayout>
    );
}
