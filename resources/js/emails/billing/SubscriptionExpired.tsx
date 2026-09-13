/**
 * Correo de suscripción vencida — migrado a React (plan 0004, corte 4E).
 * Compila a resources/views/emails/billing/subscription_expired.blade.php.
 * Vars del Mailable SubscriptionExpired: $associate (->name).
 */
import { Section, Text } from '@react-email/components';
import * as React from 'react';

import { EmailButton } from '../components/EmailButton';
import { EmailInfoBox } from '../components/EmailInfoBox';
import { EmailLayout } from '../components/EmailLayout';
import { blade } from '../lib/blade';

export const view = 'emails/billing/subscription_expired';

export default function SubscriptionExpired(): React.ReactElement {
    return (
        <EmailLayout
            title="Suscripción Vencida"
            preview="Tu suscripción a CAMEP ha vencido. Reactívala."
        >
            <Text>
                Hola, <strong>{blade("$associate->name ?? 'Socio'")}</strong>,
            </Text>
            <Text>
                Lamentamos informarte que tu suscripción a{' '}
                <strong>CAMEP</strong> ha vencido oficialmente.
            </Text>

            <EmailInfoBox
                background="#f8d7da"
                border="#f5c6cb"
                color="#721c24"
                align="center"
            >
                Tu perfil de socio ya no es visible para el público y has
                perdido acceso a las alertas de licitaciones.
            </EmailInfoBox>

            <Text>
                No pierdas las oportunidades de negocio que la Red CAMEP ofrece.
                Renueva tu suscripción ahora para restaurar todos tus beneficios
                de inmediato.
            </Text>

            <Section style={{ textAlign: 'center' }}>
                <EmailButton href={blade("route('associate.company.billing')")}>
                    Reactivar mi Suscripción
                </EmailButton>
            </Section>
        </EmailLayout>
    );
}
