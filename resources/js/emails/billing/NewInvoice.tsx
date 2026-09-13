/**
 * Correo de nueva factura — migrado a React (plan 0004, corte 4E).
 * Compila a resources/views/emails/billing/new_invoice.blade.php.
 * Vars del Mailable NewInvoiceGenerated: $invoice (->associate->company_name,
 * ->amount, ->invoice_number, ->due_date).
 */
import { Section, Text } from '@react-email/components';
import * as React from 'react';

import { EmailButton } from '../components/EmailButton';
import { EmailInfoBox } from '../components/EmailInfoBox';
import { EmailLayout } from '../components/EmailLayout';
import { blade } from '../lib/blade';

export const view = 'emails/billing/new_invoice';

const row = { margin: '4px 0' };

export default function NewInvoice(): React.ReactElement {
    return (
        <EmailLayout
            title="Nueva Factura Generada"
            preview="Se generó un nuevo compromiso de pago de tu afiliación."
        >
            <Text>
                Estimado equipo de{' '}
                <strong>{blade('$invoice->associate->company_name')}</strong>,
            </Text>
            <Text>
                Se ha generado un nuevo compromiso de pago correspondiente a su
                afiliación en <strong>CAMEP</strong>.
            </Text>

            <EmailInfoBox background="#f8f9fa" border="#dee2e6">
                <Text style={row}>
                    <strong>Monto a Pagar:</strong> $
                    {blade('number_format($invoice->amount, 2)')}
                </Text>
                <Text style={row}>
                    <strong>Número:</strong> {blade('$invoice->invoice_number')}
                </Text>
                <Text style={row}>
                    <strong>Vencimiento:</strong>{' '}
                    {blade("optional($invoice->due_date)->format('d/m/Y')")}
                </Text>
            </EmailInfoBox>

            <Text>
                Puede descargar el documento completo y realizar el pago desde
                su panel administrativo.
            </Text>

            <Section style={{ textAlign: 'center' }}>
                <EmailButton href={blade("route('associate.company.billing')")}>
                    Gestionar Pago
                </EmailButton>
            </Section>
        </EmailLayout>
    );
}
