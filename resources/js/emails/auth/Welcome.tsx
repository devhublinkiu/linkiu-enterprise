/**
 * Correo de bienvenida al nuevo usuario — migrado a React (plan 0004, corte 4D).
 * Compila a resources/views/emails/auth/welcome.blade.php.
 *
 * El Mailable App\Mail\WelcomeUser le pasa a la vista: $user (con ->name).
 * (No cambia el Mailable: sigue apuntando a 'emails.auth.welcome'.)
 */
import { Section, Text } from '@react-email/components';
import * as React from 'react';

import { EmailButton } from '../components/EmailButton';
import { EmailLayout } from '../components/EmailLayout';
import { blade } from '../lib/blade';

export const view = 'emails/auth/welcome';

export default function Welcome(): React.ReactElement {
    return (
        <EmailLayout
            title="¡Bienvenido a CAMEP!"
            preview="Te damos la bienvenida a la plataforma de CAMEP."
        >
            <Text>
                Hola, <strong>{blade('$user->name')}</strong>,
            </Text>
            <Text>
                Es un gusto darte la bienvenida a la plataforma de{' '}
                <strong>
                    CAMEP (Cámara de Empresas del Sector Energético)
                </strong>
                .
            </Text>
            <Text>
                A partir de ahora, tienes acceso a un ecosistema diseñado para
                potenciar tu empresa en el sector energético, acceso a
                licitaciones exclusivas y una red de contactos estratégicos.
            </Text>
            <Text>
                Para comenzar, te invitamos a completar el perfil de tu empresa
                y subir la documentación requerida para el proceso de auditoría.
            </Text>

            <Section style={{ textAlign: 'center' }}>
                <EmailButton href={blade("route('associate.company.basic')")}>
                    Completar Perfil de Empresa
                </EmailButton>
            </Section>
        </EmailLayout>
    );
}
