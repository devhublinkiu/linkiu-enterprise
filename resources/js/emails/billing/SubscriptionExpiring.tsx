/**
 * Correo de suscripción próxima a vencer — migrado a React (plan 0004, corte 4E).
 * Compila a resources/views/emails/billing/subscription_expiring.blade.php.
 * Vars del Mailable SubscriptionExpiringSoon: $associate (->name), $daysRemaining.
 */
import { Section, Text } from '@react-email/components';
import * as React from 'react';

import { EmailButton } from '../components/EmailButton';
import { EmailInfoBox } from '../components/EmailInfoBox';
import { EmailLayout } from '../components/EmailLayout';
import { blade } from '../lib/blade';

export const view = 'emails/billing/subscription_expiring';

export default function SubscriptionExpiring(): React.ReactElement {
    return (
        <EmailLayout
            title="Aviso de Vencimiento de Suscripción"
            preview="Tu suscripción a CAMEP está próxima a vencer."
        >
            <Text>
                Hola, <strong>{blade("$associate->name ?? 'Socio'")}</strong>,
            </Text>
            <Text>
                Te informamos que tu suscripción a los servicios de{' '}
                <strong>CAMEP</strong> está próxima a vencer.
            </Text>

            <EmailInfoBox
                background="#fff3cd"
                border="#ffeeba"
                color="#856404"
                align="center"
            >
                Restan aproximadamente{' '}
                <strong>{blade('$daysRemaining')} días</strong> de vigencia.
            </EmailInfoBox>

            <Text>
                Para evitar la interrupción de tus beneficios (visibilidad en el
                directorio, acceso a licitaciones y participación en la
                comunidad), te recomendamos renovar tu plan hoy mismo.
            </Text>

            <Section style={{ textAlign: 'center' }}>
                <EmailButton href={blade("route('associate.company.billing')")}>
                    Renovar Suscripción Ahora
                </EmailButton>
            </Section>

            <Text style={{ marginTop: '20px' }}>
                Si ya realizaste el pago, por favor ignora este mensaje o
                adjunta tu comprobante en el portal para su validación.
            </Text>
        </EmailLayout>
    );
}
