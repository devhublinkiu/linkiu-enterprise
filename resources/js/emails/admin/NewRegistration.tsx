/**
 * Aviso al admin: nuevo registro de usuario — React (plan 0004, corte 4G).
 * Compila a resources/views/emails/admin/new_registration.blade.php.
 * Vars del Mailable NewRegistrationToAdmin: $user (->name, ->email, ->created_at).
 */
import { Text } from '@react-email/components';
import * as React from 'react';

import { EmailLayout } from '../components/EmailLayout';
import { blade } from '../lib/blade';

export const view = 'emails/admin/new_registration';

const row = { margin: '4px 0' };

export default function NewRegistration(): React.ReactElement {
    return (
        <EmailLayout
            title="Nuevo registro"
            preview="Se registró un nuevo usuario en la plataforma."
        >
            <Text>
                Se registró un nuevo usuario en la plataforma de{' '}
                <strong>CAMEP</strong>:
            </Text>

            <Text style={row}>
                <strong>Nombre:</strong> {blade('$user->name')}
            </Text>
            <Text style={row}>
                <strong>Correo:</strong> {blade('$user->email')}
            </Text>
            <Text style={row}>
                <strong>Fecha:</strong>{' '}
                {blade("$user->created_at?->format('d/m/Y H:i')")}
            </Text>

            <Text style={{ marginTop: '20px' }}>
                El usuario continuará con el proceso de afiliación y
                facturación.
            </Text>
        </EmailLayout>
    );
}
