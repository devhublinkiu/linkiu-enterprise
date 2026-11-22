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
                Hola, equipo de{' '}
                <strong>{blade('$associate->company_name')}</strong>,
            </Text>

            <Blade if="$isChangeRequest">
                <Text>
                    Tu solicitud de modificación de la sección{' '}
                    <strong>{blade('$sectionName')}</strong> fue aprobada. Ya
                    puedes ingresar a tu panel y hacer los cambios.
                </Text>
            </Blade>
            <Blade if="! $isChangeRequest">
                <Text>
                    La sección <strong>{blade('$sectionName')}</strong> de tu
                    perfil fue revisada y aprobada por nuestro equipo.
                </Text>
            </Blade>

            <EmailInfoBox background="#f0fdf4" border="#86efac">
                <Text
                    style={{ margin: 0, color: '#15803d', fontWeight: 'bold' }}
                >
                    ✓ Sección aprobada: {blade('$sectionName')}
                </Text>
            </EmailInfoBox>

            <Blade if="$showNextSteps">
                <Text>
                    Continúa completando las demás secciones de tu perfil para
                    avanzar en tu afiliación a CAMEP.
                </Text>
            </Blade>

            <Section style={{ textAlign: 'center' }}>
                <EmailButton href={blade('$sectionUrl')}>
                    Ver mi perfil
                </EmailButton>
            </Section>
        </EmailLayout>
    );
}
