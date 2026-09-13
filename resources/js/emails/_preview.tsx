/**
 * Página de PREVIEW del chrome de correo (plan 0004). Solo para `npm run emails:dev`.
 *
 * No exporta `view`, así que `emails:build` la IGNORA (no genera Blade). Sirve
 * para ver Header/Footer/Layout y el botón de marca en el navegador sin enviar.
 * Aquí el logo usa una URL real (en runtime lo resuelve `{{ asset(...) }}`).
 */
import { Text } from '@react-email/components';
import * as React from 'react';

import { EmailButton } from './components/EmailButton';
import { EmailLayout } from './components/EmailLayout';

export default function Preview(): React.ReactElement {
    return (
        <EmailLayout
            title="Vista previa del correo"
            preview="Así se ve el chrome de los correos de CAMEP."
            logoSrc="https://camepg.test/images/camep/logo_camep_horizontal_correos_header.png"
        >
            <Text>Hola,</Text>
            <Text>
                Este es un cuerpo de ejemplo para revisar la cabecera, el pie y
                el botón de marca. El contenido real de cada correo entra aquí.
            </Text>
            <div style={{ textAlign: 'center' }}>
                <EmailButton href="https://camepg.org">Ir al panel</EmailButton>
            </div>
        </EmailLayout>
    );
}
