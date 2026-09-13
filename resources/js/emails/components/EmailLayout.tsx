/**
 * Envoltorio compartido de los correos (plan 0004 / ADR-0004).
 *
 * Reemplaza en React a resources/views/emails/_layout.blade.php. Cada correo
 * nuevo se autora como `<EmailLayout title="…" preview="…">{cuerpo}</EmailLayout>`
 * y se compila a una vista Blade autónoma (sin @extends).
 *
 * NOTA de transición: el `_layout.blade.php` heredado NO se toca en el corte 4B
 * porque 3 plantillas que lo extienden dependen de sus clases `<style>`
 * (.btn/.data-row/.plan-box/.warn-box). Se migran en su corte y el layout viejo
 * se retira en 4Z.
 */
import {
    Body,
    Container,
    Head,
    Html,
    Preview,
    Section,
} from '@react-email/components';
import * as React from 'react';

import { EmailFooter } from './EmailFooter';
import { EmailHeader } from './EmailHeader';

const styles = {
    body: {
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        lineHeight: '1.6',
        color: '#333',
        margin: '0',
        padding: '0',
    },
    container: {
        maxWidth: '600px',
        margin: '20px auto',
        padding: '20px',
        border: '1px solid #eee',
        borderRadius: '10px',
    },
};

export function EmailLayout({
    title = 'CAMEP',
    preview,
    logoSrc,
    children,
}: {
    title?: React.ReactNode;
    preview?: string;
    logoSrc?: string;
    children?: React.ReactNode;
}): React.ReactElement {
    return (
        <Html lang="es">
            <Head />
            {preview ? <Preview>{preview}</Preview> : null}
            <Body style={styles.body}>
                <Container style={styles.container}>
                    <EmailHeader title={title} logoSrc={logoSrc} />
                    <Section>{children}</Section>
                    <EmailFooter />
                </Container>
            </Body>
        </Html>
    );
}
