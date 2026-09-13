/**
 * Correo de pago aprobado — migrado a React (plan 0004, corte 4E).
 * Compila a resources/views/emails/billing/payment_approved.blade.php.
 * Vars del Mailable PaymentApproved: $paymentRequest (->plan->name, ->amount).
 */
import { Section, Text } from '@react-email/components';
import * as React from 'react';

import { EmailButton } from '../components/EmailButton';
import { EmailInfoBox } from '../components/EmailInfoBox';
import { EmailLayout } from '../components/EmailLayout';
import { blade } from '../lib/blade';

export const view = 'emails/billing/payment_approved';

const row = { margin: '4px 0' };

export default function PaymentApproved(): React.ReactElement {
    return (
        <EmailLayout
            title="¡Pago Aprobado!"
            preview="Tu pago fue verificado y aprobado en CAMEP."
        >
            <Text>Hola,</Text>
            <Text>
                Nos complace informarle que su pago ha sido verificado y
                aprobado con éxito en <strong>CAMEP</strong>.
            </Text>

            <EmailInfoBox background="#f0fff4" border="#c6f6d5">
                <Text style={row}>
                    <strong>Plan Activado:</strong>{' '}
                    {blade('$paymentRequest->plan->name')}
                </Text>
                <Text style={row}>
                    <strong>Monto:</strong> $
                    {blade('number_format($paymentRequest->amount, 2)')}
                </Text>
                <Text style={row}>
                    <strong>Estado:</strong> Activo
                </Text>
            </EmailInfoBox>

            <Text>
                Su perfil ahora cuenta con todos los beneficios del plan
                adquirido y su visibilidad pública en el directorio ha sido
                habilitada.
            </Text>

            <Section style={{ textAlign: 'center' }}>
                <EmailButton href={blade("route('dashboard')")}>
                    Ir al Panel de Socio
                </EmailButton>
            </Section>
        </EmailLayout>
    );
}
