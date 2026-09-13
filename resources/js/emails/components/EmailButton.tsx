/**
 * Botón/CTA de marca para los correos (plan 0004 §5.3).
 * Sólido neutro #151515, texto blanco, píldora. Reemplaza al viejo `.btn`
 * (degradado rojo→naranja) de las plantillas Blade.
 */
import { Button } from '@react-email/components';
import * as React from 'react';

const style = {
    backgroundColor: '#151515',
    color: '#ffffff',
    padding: '12px 25px',
    borderRadius: '100px',
    fontWeight: 500,
    textDecoration: 'none',
    display: 'inline-block',
    marginTop: '20px',
};

export function EmailButton({
    href,
    children,
}: {
    href: string;
    children: React.ReactNode;
}): React.ReactElement {
    return (
        <Button href={href} style={style}>
            {children}
        </Button>
    );
}
