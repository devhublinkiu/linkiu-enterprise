/**
 * Caja de datos/aviso reutilizable en los cuerpos de correo (plan 0004).
 * Porta las cajas `.plan-box` / `.invoice-box` / `.reason-box` / `.alert-box`
 * / `.error-box` de las plantillas Blade. Los colores se pasan por prop para
 * conservar los de cada plantilla (fidelidad). `align="center"` = banner.
 */
import { Section } from '@react-email/components';
import * as React from 'react';

export function EmailInfoBox({
    background,
    border,
    color,
    align = 'left',
    children,
}: {
    background: string;
    border: string;
    color?: string;
    align?: 'left' | 'center';
    children: React.ReactNode;
}): React.ReactElement {
    return (
        <Section
            style={{
                background,
                border: `1px solid ${border}`,
                color,
                padding: '15px',
                borderRadius: '5px',
                margin: '15px 0',
                textAlign: align,
            }}
        >
            {children}
        </Section>
    );
}
