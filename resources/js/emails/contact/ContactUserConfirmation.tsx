/**
 * Confirmación al usuario: mensaje de contacto recibido — React (plan 0004, 4H).
 * Compila a resources/views/emails/contact/user_confirmation.blade.php.
 * Vars del Mailable ContactConfirmationToUser: $submission (->full_name, ->service,
 * ->message).
 */
import { Text } from '@react-email/components';
import * as React from 'react';

import { EmailLayout } from '../components/EmailLayout';
import { blade } from '../lib/blade';

export const view = 'emails/contact/user_confirmation';

export default function ContactUserConfirmation(): React.ReactElement {
    return (
        <EmailLayout
            title="¡Hemos recibido tu mensaje!"
            preview="Recibimos tu solicitud; te contactaremos pronto."
        >
            <Text>
                Hola, <strong>{blade('$submission->full_name')}</strong>,
            </Text>
            <Text>
                Gracias por ponerte en contacto con nosotros. Hemos recibido tu
                solicitud sobre{' '}
                <strong>&quot;{blade('$submission->service')}&quot;</strong> y
                estamos revisándola cuidadosamente.
            </Text>
            <Text>
                Nuestro equipo de CAMEP se pondrá en contacto contigo lo antes
                posible a través de este correo electrónico o el teléfono
                registrado.
            </Text>

            <Text>Resumen de tu mensaje:</Text>
            <blockquote
                style={{
                    background: '#f9f9f9',
                    padding: '15px',
                    borderLeft: '5px solid #DD301B',
                    fontStyle: 'italic',
                    margin: '0',
                }}
            >
                &quot;{blade('$submission->message')}&quot;
            </blockquote>
        </EmailLayout>
    );
}
