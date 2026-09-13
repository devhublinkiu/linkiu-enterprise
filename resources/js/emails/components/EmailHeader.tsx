/**
 * Cabecera compartida de los correos (plan 0004 / ADR-0004).
 *
 * Logo + título. Estilos INLINE con hex literal (los clientes de correo no
 * soportan tokens ni Tailwind). Portado de resources/views/emails/_layout.blade.php.
 *
 * El logo usa por defecto `{{ asset(...) }}` (URL absoluta en runtime, resuelve
 * el punto 5 del plan). En el preview (`emails:dev`) se le pasa una URL real por
 * `logoSrc` para que se vea la imagen en vez del token.
 */
import { Heading, Img, Section } from '@react-email/components';
import * as React from 'react';

import { blade } from '../lib/blade';

/**
 * Expresión Blade del logo por defecto → `{{ asset('images/...') }}`.
 * OJO: `blade()` se llama DENTRO del render (no a nivel de módulo): el build
 * resetea el registro de tokens por plantilla, así que un token fijado al
 * importar colisionaría con los del cuerpo.
 */
const LOGO_EXPR =
    "asset('images/camep/logo_camep_horizontal_correos_header.png')";

const styles = {
    header: {
        borderBottom: '1px solid #888',
        paddingBottom: '20px',
        marginBottom: '20px',
        textAlign: 'center' as const,
    },
    logoWrap: { textAlign: 'center' as const, marginBottom: '20px' },
    logo: { maxWidth: '200px', height: 'auto', margin: '0 auto' },
    title: {
        color: '#151515',
        margin: '0',
        fontSize: '24px',
        fontWeight: 'bold' as const,
    },
};

export function EmailHeader({
    title = 'CAMEP',
    logoSrc,
}: {
    title?: React.ReactNode;
    logoSrc?: string;
}): React.ReactElement {
    const src = logoSrc ?? blade(LOGO_EXPR);
    return (
        <Section style={styles.header}>
            <div style={styles.logoWrap}>
                <Img
                    src={src}
                    alt="Logo de CAMEP"
                    width="200"
                    style={styles.logo}
                />
            </div>
            <Heading as="h1" style={styles.title}>
                {title}
            </Heading>
        </Section>
    );
}
