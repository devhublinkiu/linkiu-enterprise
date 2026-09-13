/**
 * Aviso al admin: solicitud de modificación de campo — React (plan 0004, 4F).
 * Compila a resources/views/emails/associate/field_change_requested.blade.php.
 * Vars del Mailable AssociateFieldChangeRequested: $associate (->company_name,
 * ->users, ->id), $fieldName, $reason.
 */
import { Section, Text } from '@react-email/components';
import * as React from 'react';

import { EmailButton } from '../components/EmailButton';
import { EmailInfoBox } from '../components/EmailInfoBox';
import { EmailLayout } from '../components/EmailLayout';
import { blade } from '../lib/blade';

export const view = 'emails/associate/field_change_requested';

const row = { margin: '4px 0' };

export default function FieldChangeRequested(): React.ReactElement {
    return (
        <EmailLayout
            title="Solicitud de Modificación de Campo"
            preview="Una empresa solicitó modificar un campo ya aprobado."
        >
            <Text>Estimado equipo CAMEP,</Text>
            <Text>
                La empresa <strong>{blade('$associate->company_name')}</strong>{' '}
                ha solicitado modificar un campo previamente aprobado en su
                perfil.
            </Text>

            <EmailInfoBox background="#fffbeb" border="#fcd34d">
                <Text style={row}>
                    <strong>Campo:</strong> {blade('$fieldName')}
                </Text>
                <Text style={row}>
                    <strong>Motivo de la solicitud:</strong> {blade('$reason')}
                </Text>
                <Text style={row}>
                    <strong>Solicitado por:</strong>{' '}
                    {blade(
                        "$associate->users->first()?->name ?? 'Usuario del associate'",
                    )}
                </Text>
            </EmailInfoBox>

            <Text>
                Por favor ingresa al panel de administración para revisar la
                solicitud y aprobrar o rechazar el cambio.
            </Text>

            <Section style={{ textAlign: 'center' }}>
                <EmailButton
                    href={blade("url('/admin/associates/' . $associate->id)")}
                >
                    Ver perfil del Associate
                </EmailButton>
            </Section>
        </EmailLayout>
    );
}
