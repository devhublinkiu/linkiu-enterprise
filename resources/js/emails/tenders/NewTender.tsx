/**
 * Correo de nueva licitación — React (plan 0004, corte 4J).
 * Compila a resources/views/emails/tenders/new_tender.blade.php.
 * Vars del Mailable NewTenderPublished: $tender (->titulo, ->empresa->nombre,
 * ->empresa->ciudad, ->empresa->departamento, ->empresa->slug, ->slug, ->fecha_cierre).
 */
import { Section, Text } from '@react-email/components';
import * as React from 'react';

import { EmailButton } from '../components/EmailButton';
import { EmailInfoBox } from '../components/EmailInfoBox';
import { EmailLayout } from '../components/EmailLayout';
import { Blade, blade } from '../lib/blade';

export const view = 'emails/tenders/new_tender';

const row = { margin: '4px 0' };

export default function NewTender(): React.ReactElement {
    return (
        <EmailLayout
            title="Nueva Oportunidad de Negocio"
            preview="Se publicó una nueva licitación en el portal de CAMEP."
        >
            <Text>Hola,</Text>
            <Text>
                Se ha publicado una nueva licitación en el portal de{' '}
                <strong>CAMEP</strong> que podría ser de su interés:
            </Text>

            <EmailInfoBox background="#f8f9fa" border="#dee2e6">
                <Text style={row}>
                    <strong>Título:</strong> {blade('$tender->titulo')}
                </Text>
                <Text style={row}>
                    <strong>Entidad:</strong>{' '}
                    {blade("$tender->empresa->nombre ?? '—'")}
                </Text>
                <Text style={row}>
                    <strong>Ubicación:</strong>{' '}
                    {blade(
                        "trim(($tender->empresa->ciudad ?? '') . ($tender->empresa->departamento ? ', ' . $tender->empresa->departamento : ''), ', ') ?: '—'",
                    )}
                </Text>
                <Blade if="$tender->fecha_cierre">
                    <Text style={row}>
                        <strong>Cierre:</strong>{' '}
                        {blade("$tender->fecha_cierre->format('d/m/Y')")}
                    </Text>
                </Blade>
            </EmailInfoBox>

            <Text>
                Para ver todos los detalles y descargar los pliegos, ingrese a
                la sección de Licitaciones.
            </Text>

            <Section style={{ textAlign: 'center' }}>
                <EmailButton
                    href={blade(
                        "route('associate.company.bienes-servicios.tender', [$tender->empresa->slug, $tender->slug])",
                    )}
                >
                    Ver Detalles de Licitación
                </EmailButton>
            </Section>
        </EmailLayout>
    );
}
