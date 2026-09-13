/**
 * Aviso al admin: nueva solicitud de contacto — React (plan 0004, corte 4H).
 * Compila a resources/views/emails/contact/admin.blade.php.
 * Vars del Mailable ContactReceivedToAdmin: $submission (->full_name, ->company_name,
 * ->nit, ->email, ->phone, ->service, ->types, ->message, ->ip_address).
 */
import { Text } from '@react-email/components';
import * as React from 'react';

import { EmailLayout } from '../components/EmailLayout';
import { blade } from '../lib/blade';

export const view = 'emails/contact/admin';

const field = {
    marginBottom: '15px',
    padding: '10px',
    background: '#fdfdfd',
    border: '1px solid #f0f0f0',
    borderRadius: '5px',
};
const label = {
    fontWeight: 'bold' as const,
    color: '#555',
    display: 'block',
    marginBottom: '2px',
    fontSize: '12px',
    textTransform: 'uppercase' as const,
};
const value = { color: '#000', fontSize: '15px' };

export default function ContactAdmin(): React.ReactElement {
    return (
        <EmailLayout
            title="Nueva Solicitud de Contacto"
            preview="Llegó una nueva solicitud de contacto desde el sitio."
        >
            <div style={field}>
                <span style={label}>Nombre Completo:</span>
                <span style={value}>{blade('$submission->full_name')}</span>
            </div>

            <div style={field}>
                <span style={label}>Empresa / NIT:</span>
                <span style={value}>
                    {blade("$submission->company_name ?? 'N/A'")} (
                    {blade("$submission->nit ?? 'N/A'")})
                </span>
            </div>

            <div style={field}>
                <span style={label}>Email:</span>
                <span style={value}>{blade('$submission->email')}</span>
            </div>

            <div style={field}>
                <span style={label}>Teléfono:</span>
                <span style={value}>{blade('$submission->phone')}</span>
            </div>

            <div style={field}>
                <span style={label}>Servicio de Interés:</span>
                <span
                    style={{ ...value, color: '#DD301B', fontWeight: 'bold' }}
                >
                    {blade('$submission->service')}
                </span>
            </div>

            <div style={field}>
                <span style={label}>Tipo de Consulta:</span>
                <span style={value}>
                    {blade(
                        "is_array($submission->types) ? implode(', ', $submission->types) : $submission->types",
                    )}
                </span>
            </div>

            <div style={field}>
                <span style={label}>Mensaje:</span>
                <p style={{ ...value, fontStyle: 'italic' }}>
                    &quot;{blade('$submission->message')}&quot;
                </p>
            </div>

            <Text style={{ fontSize: '11px', color: '#999' }}>
                IP del remitente: {blade('$submission->ip_address')}
            </Text>
        </EmailLayout>
    );
}
