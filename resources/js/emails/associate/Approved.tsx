/**
 * Correo de perfil verificado (auditoría aprobada) — React (plan 0004, corte 4F).
 * Compila a resources/views/emails/associate/approved.blade.php.
 * Vars del Mailable AssociateApproved: $associate (->company_name).
 */
import { Section, Text } from '@react-email/components';
import * as React from 'react';

import { EmailButton } from '../components/EmailButton';
import { EmailLayout } from '../components/EmailLayout';
import { blade } from '../lib/blade';

export const view = 'emails/associate/approved';

export default function Approved(): React.ReactElement {
    return (
        <EmailLayout
            title="¡Perfil Verificado con Éxito!"
            preview="Tu perfil fue verificado. Elige tu plan de afiliación."
        >
            <Text>
                Estimado equipo de{' '}
                <strong>{blade('$associate->company_name')}</strong>,
            </Text>
            <Text>
                ¡Excelentes noticias! El proceso de auditoría de su empresa en{' '}
                <strong>CAMEP</strong> ha finalizado satisfactoriamente y su
                perfil ha sido verificado.
            </Text>
            <Text>
                Ustedes ya forman parte oficial de nuestra red. El siguiente
                paso para habilitar su visibilidad pública y acceder a todos los
                beneficios es seleccionar su plan de afiliación.
            </Text>

            <Section style={{ textAlign: 'center' }}>
                <EmailButton href={blade("route('associate.company.billing')")}>
                    Elegir Plan y Activar Cuenta
                </EmailButton>
            </Section>
        </EmailLayout>
    );
}
