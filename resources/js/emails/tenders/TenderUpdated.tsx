/**
 * Correo de actualización de licitación — React (plan 0004, corte 4J).
 * Compila a resources/views/emails/tenders/tender_updated.blade.php.
 * Vars del Mailable TenderUpdatedAlert: $tender (->titulo, ->empresa->slug, ->slug).
 */
import { Section, Text } from '@react-email/components';
import * as React from 'react';

import { EmailButton } from '../components/EmailButton';
import { EmailLayout } from '../components/EmailLayout';
import { blade } from '../lib/blade';

export const view = 'emails/tenders/tender_updated';

export default function TenderUpdated(): React.ReactElement {
    return (
        <EmailLayout
            title="Actualización en Licitación"
            preview="Hay cambios en una licitación que sigues."
        >
            <Text>Hola,</Text>
            <Text>
                Le informamos que se han realizado actualizaciones en la
                licitación{' '}
                <strong>&quot;{blade('$tender->titulo')}&quot;</strong>{' '}
                (documentos, fechas o información adicional).
            </Text>
            <Text>
                Si está siguiendo este proceso, le recomendamos revisar los
                cambios en el portal.
            </Text>

            <Section style={{ textAlign: 'center' }}>
                <EmailButton
                    href={blade(
                        "route('associate.company.bienes-servicios.tender', [$tender->empresa->slug, $tender->slug])",
                    )}
                >
                    Ver Actualizaciones en el Portal
                </EmailButton>
            </Section>
        </EmailLayout>
    );
}
