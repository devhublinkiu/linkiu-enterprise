/**
 * Correo de acción requerida (auditoría rechazada) — React (plan 0004, corte 4F).
 * Compila a resources/views/emails/associate/audit_rejected.blade.php.
 * Vars del Mailable AssociateAuditRejected: $associate (->company_name),
 * $fieldName, $reason.
 */
import { Section, Text } from '@react-email/components';
import * as React from 'react';

import { EmailButton } from '../components/EmailButton';
import { EmailInfoBox } from '../components/EmailInfoBox';
import { EmailLayout } from '../components/EmailLayout';
import { blade } from '../lib/blade';

export const view = 'emails/associate/audit_rejected';

const row = { margin: '4px 0' };

export default function AuditRejected(): React.ReactElement {
    return (
        <EmailLayout
            title="Acción requerida en tu perfil"
            preview="Hay información de tu perfil que requiere corrección."
        >
            <Text>
                Hola, equipo de{' '}
                <strong>{blade('$associate->company_name')}</strong>,
            </Text>
            <Text>
                Durante la revisión de tu perfil en CAMEP encontramos
                información que necesita tu atención:
            </Text>

            <EmailInfoBox background="#fff5f5" border="#feb2b2">
                <Text style={row}>
                    <strong>Sección:</strong> {blade('$fieldName')}
                </Text>
                <Text style={row}>
                    <strong>Observación:</strong> {blade('$reason')}
                </Text>
            </EmailInfoBox>

            <Text>
                Ingresa a tu panel, haz las correcciones y vuelve a enviar la
                sección a revisión.
            </Text>

            <Section style={{ textAlign: 'center' }}>
                <EmailButton href={blade('$sectionUrl')}>
                    Corregir la sección
                </EmailButton>
            </Section>
        </EmailLayout>
    );
}
