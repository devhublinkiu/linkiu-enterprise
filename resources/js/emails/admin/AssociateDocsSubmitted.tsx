/**
 * Aviso al admin: empresa lista para auditoría — React (plan 0004, corte 4G).
 * Compila a resources/views/emails/admin/associate_docs_submitted.blade.php.
 * Vars del Mailable AssociateDocsSubmitted: $associate (->company_name, ->id).
 */
import { Section, Text } from '@react-email/components';
import * as React from 'react';

import { EmailButton } from '../components/EmailButton';
import { EmailLayout } from '../components/EmailLayout';
import { blade } from '../lib/blade';

export const view = 'emails/admin/associate_docs_submitted';

export default function AssociateDocsSubmitted(): React.ReactElement {
    return (
        <EmailLayout
            title="Empresa para Auditoría"
            preview="Una empresa completó su documentación y espera auditoría."
        >
            <Text>Administrador,</Text>
            <Text>
                La empresa <strong>{blade('$associate->company_name')}</strong>{' '}
                ha completado el envío de su documentación y su perfil está
                listo para ser auditado.
            </Text>
            <Text>
                Por favor, ingrese al panel para revisar los datos y validar los
                documentos adjuntos.
            </Text>

            <Section style={{ textAlign: 'center' }}>
                <EmailButton
                    href={blade("url('/admin/associates/' . $associate->id)")}
                >
                    Revisar Empresa
                </EmailButton>
            </Section>
        </EmailLayout>
    );
}
