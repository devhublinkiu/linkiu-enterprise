/**
 * Correo de código OTP (registro y recuperación) — migrado a React (plan 0004).
 * Compila a resources/views/emails/auth/otp_code.blade.php.
 *
 * El Mailable App\Mail\OtpCode le pasa a la vista: $code, $purpose, $ttlMinutes.
 * (No cambia el Mailable: sigue apuntando a 'emails.auth.otp_code'.)
 *
 * Nota: en `emails:dev` los valores dinámicos se ven como tokens (RXB…); el
 * Blade generado es el correcto. El preview visual del chrome está en _preview.tsx.
 */
import { Section, Text } from '@react-email/components';
import * as React from 'react';

import { EmailLayout } from '../components/EmailLayout';
import { Blade, blade } from '../lib/blade';

export const view = 'emails/auth/otp_code';

const codeBox = {
    display: 'inline-block',
    fontSize: '34px',
    fontWeight: 'bold' as const,
    letterSpacing: '10px',
    color: '#151515',
    background: '#f7f7f7',
    border: '1px solid #eee',
    borderRadius: '10px',
    padding: '16px 24px',
};

export default function OtpCode(): React.ReactElement {
    const title = blade(
        "$purpose === 'password_reset' ? 'Recupera tu contraseña' : 'Verifica tu correo'",
    );
    const preview = blade(
        "$purpose === 'password_reset' ? 'Código para recuperar tu contraseña' : 'Tu código de verificación'",
    );

    return (
        <EmailLayout title={title} preview={preview}>
            <Text>Hola,</Text>

            <Blade if="$purpose === 'password_reset'">
                <Text>
                    Recibimos una solicitud para restablecer la contraseña de tu
                    cuenta en <strong>CAMEP</strong>. Usa este código para
                    continuar:
                </Text>
            </Blade>
            <Blade if="$purpose !== 'password_reset'">
                <Text>
                    Gracias por registrarte en <strong>CAMEP</strong>. Usa este
                    código para verificar tu correo:
                </Text>
            </Blade>

            <Section style={{ textAlign: 'center', margin: '28px 0' }}>
                <span style={codeBox}>{blade('$code')}</span>
            </Section>

            <Text>
                El código vence en{' '}
                <strong>{blade('$ttlMinutes')} minutos</strong>. No lo compartas
                con nadie.
            </Text>
            <Text style={{ color: '#888', fontSize: '13px' }}>
                Si no solicitaste esto, puedes ignorar este mensaje; tu cuenta
                sigue segura.
            </Text>
        </EmailLayout>
    );
}
