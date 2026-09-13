/**
 * Correo de sección/cambio aprobado — React (plan 0004, corte 4F).
 * Compila a resources/views/emails/associate/audit_approved.blade.php.
 * Vars del Mailable SectionAuditApproved: $associate (->company_name),
 * $isChangeRequest (bool), $sectionName.
 */
import { Section, Text } from '@react-email/components';
import * as React from 'react';

import { EmailButton } from '../components/EmailButton';
import { EmailInfoBox } from '../components/EmailInfoBox';
import { EmailLayout } from '../components/EmailLayout';
import { Blade, blade } from '../lib/blade';

export const view = 'emails/associate/audit_approved';

export default function AuditApproved(): React.ReactElement {
    return (
        <EmailLayout
            title={blade(
                "$isChangeRequest ? 'Solicitud de Cambio Aprobada' : 'Sección Aprobada'",
            )}
            preview="Una sección de tu perfil fue aprobada."
        >
            <Text>
                Estimado equipo de{' '}
                <strong>{blade('$associate->company_name')}</strong>,
            </Text>

            <Blade if="$isChangeRequest">
                <Text>
                    Su solicitud de modificación de la sección{' '}
                    <strong>{blade('$sectionName')}</strong> ha sido aprobada.
                    Ya puede ingresar a su panel y realizar los cambios
                    necesarios.
                </Text>
            </Blade>
            <Blade if="! $isChangeRequest">
                <Text>
                    Nos complace informarle que la sección{' '}
                    <strong>{blade('$sectionName')}</strong> de su perfil ha
                    sido revisada y aprobada por nuestro equipo.
                </Text>
            </Blade>

            <EmailInfoBox background="#f0fdf4" border="#86efac">
                <Text
                    style={{ margin: 0, color: '#15803d', fontWeight: 'bold' }}
                >
                    ✓ Sección aprobada: {blade('$sectionName')}
                </Text>
            </EmailInfoBox>

            <Text>
                Continúe completando las demás secciones de su perfil para
                avanzar en el proceso de afiliación a CAMEP.
            </Text>

            <Section style={{ textAlign: 'center' }}>
                <EmailButton href={blade("url('/my-company/basic-info')")}>
                    Ver mi perfil
                </EmailButton>
            </Section>
        </EmailLayout>
    );
}
