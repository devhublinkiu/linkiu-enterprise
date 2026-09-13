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
            title="Acción Requerida en su Perfil"
            preview="Hay información de tu perfil que requiere corrección."
        >
            <Text>
                Estimado equipo de{' '}
                <strong>{blade('$associate->company_name')}</strong>,
            </Text>
            <Text>
                Durante la auditoría de su perfil en CAMEP, hemos detectado
                información que requiere su atención:
            </Text>

            <EmailInfoBox background="#fff5f5" border="#feb2b2">
                <Text style={row}>
                    <strong>Campo:</strong> {blade('$fieldName')}
                </Text>
                <Text style={row}>
                    <strong>Observación:</strong> {blade('$reason')}
                </Text>
            </EmailInfoBox>

            <Text>
                Por favor, ingrese a su panel para realizar las correcciones
                necesarias y volver a enviar su perfil a revisión.
            </Text>

            <Section style={{ textAlign: 'center' }}>
                <EmailButton href={blade("route('associate.company.basic')")}>
                    Corregir Información
                </EmailButton>
            </Section>
        </EmailLayout>
    );
}
