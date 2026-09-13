/**
 * Aviso al admin: contenido reportado en el foro — React (plan 0004, corte 4G).
 * Compila a resources/views/emails/admin/forum_report_alert.blade.php.
 * Vars del Mailable ForumReportAlert: $report (->user->name, ->reason).
 */
import { Text } from '@react-email/components';
import * as React from 'react';

import { EmailLayout } from '../components/EmailLayout';
import { blade } from '../lib/blade';

export const view = 'emails/admin/forum_report_alert';

const row = { margin: '4px 0' };

export default function ForumReportAlert(): React.ReactElement {
    return (
        <EmailLayout
            title="ALERTA: Contenido Reportado en el Foro"
            preview="Se recibió un reporte de contenido en el foro."
        >
            <Text>Administrador,</Text>
            <Text>
                Se ha recibido un reporte sobre un contenido en el foro de la
                comunidad.
            </Text>

            <Text style={row}>
                <strong>Reportado por:</strong> {blade('$report->user->name')}
            </Text>
            <Text style={row}>
                <strong>Motivo:</strong> {blade('$report->reason')}
            </Text>

            <Text>
                Por favor, revise el contenido y tome las medidas necesarias
                desde el panel de moderación.
            </Text>
        </EmailLayout>
    );
}
