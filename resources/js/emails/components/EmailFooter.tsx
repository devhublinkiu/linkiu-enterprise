/**
 * Pie compartido de los correos (plan 0004 / ADR-0004).
 *
 * Portado de resources/views/emails/_layout.blade.php con dos ajustes de marca
 * (§5 del plan): enlaces en neutro de marca #151515 (antes morado #504ac5) y
 * año por `{{ date('Y') }}` (dinámico en runtime, no congelado en build).
 * El aviso legal se mantiene ÍNTEGRO. Enlaces a .org tal cual (decisión del usuario).
 */
import { Link, Section, Text } from '@react-email/components';
import * as React from 'react';

import { blade } from '../lib/blade';

const link = {
    color: '#151515',
    textDecoration: 'none',
    fontWeight: 'normal' as const,
};
const sep = { color: '#ccc', margin: '0 10px' };

const styles = {
    footer: {
        marginTop: '30px',
        fontSize: '13px',
        color: '#666',
        borderTop: '1px solid #eee',
        paddingTop: '20px',
        textAlign: 'center' as const,
    },
    links: { marginBottom: '15px', lineHeight: 2 },
    info: {
        paddingTop: '15px',
        fontSize: '12px',
        color: '#888',
        borderTop: '1px solid #f9f9f9',
    },
    address: { margin: '4px 0' },
    noReply: {
        fontStyle: 'italic' as const,
        color: '#999',
        marginBottom: '16px',
        fontWeight: 'normal' as const,
        fontSize: '10px',
        textAlign: 'justify' as const,
    },
    copyright: { fontSize: '11px', color: '#aaa' },
};

export function EmailFooter(): React.ReactElement {
    return (
        <Section style={styles.footer}>
            <div style={styles.links}>
                <Link href="mailto:adminfin@camepg.org" style={link}>
                    Equipo Financiero
                </Link>
                <span style={sep}>•</span>
                <Link href="mailto:afiliate@camepg.org" style={link}>
                    Dep. de Auditoría
                </Link>
                <span style={sep}>•</span>
                <Link href="mailto:procesosjuridicos@camepg.org" style={link}>
                    Atención Legal
                </Link>
                <span style={sep}>•</span>
                <Link href="mailto:protecciondedatos@camepg.org" style={link}>
                    Protección de Datos
                </Link>
                <span style={sep}>•</span>
                <br />
                <Link href="mailto:soporte.camep@linkiu.bio" style={link}>
                    Soporte y Tickets
                </Link>
                <span style={sep}>•</span>
                <Link href="https://camepg.org" style={link}>
                    www.camepg.org
                </Link>
                <span style={sep}>•</span>
                <Link href="https://wa.me/573507880664" style={link}>
                    Línea de WhatsApp
                </Link>
            </div>

            <div style={styles.info}>
                <Text style={styles.address}>
                    MZ 8 CA 813 APTO 202 FLOR AMARILLO | Puerto Gaitán - Meta
                </Text>
                <Text style={styles.noReply}>
                    Este es un mensaje automático. Por favor, no respondas a
                    este correo. El contenido de este mensaje puede ser
                    informacion privilegiada y confidencial. Si usted no es el
                    destinatario real del mismo, por favor informe de ello a
                    quien lo envia y destruyalo en forma inmediata. Esta
                    prohibida su retencion, grabacion, utilizacion o divulgacion
                    con cualquier proposito. Este mensaje ha sido verificado con
                    software antivirus, en consecuencia, el remitente de este no
                    se hace responsable por la presencia en el o en sus anexos
                    de algun virus que pueda generar daños en los equipos o
                    programas del destinatario.
                </Text>
                <Text style={styles.copyright}>
                    © {blade("date('Y')")} CAMEP | Un servicio de{' '}
                    <Link
                        href="https://linkiu.bio"
                        style={{ color: '#aaa', textDecoration: 'underline' }}
                    >
                        Linkiu
                    </Link>{' '}
                    | Todos los derechos reservados.
                </Text>
            </div>
        </Section>
    );
}
