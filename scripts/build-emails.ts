/**
 * Compila las plantillas React de correo (react-email) a vistas Blade.
 *
 *   npm run emails:build
 *
 * Descubre las "páginas" en resources/js/emails/ (todo .tsx que NO esté en
 * components/ ni lib/ y que exporte `blade` + un componente por defecto),
 * las renderiza con @react-email/render, sustituye los tokens de blade.tsx por
 * el Blade real y escribe el resultado en resources/views/<blade>.blade.php.
 *
 * Cada página exporta:
 *   export const view = 'emails/auth/otp_code';    // ruta de la vista (sin .blade.php)
 *   export const props = { ... };                  // opcional: props de muestra para el render
 *   export default function OtpCode() { ... }
 *
 * Ver docs/adr/0004-*.md y docs/actualizaciones/0004-plantillas-correo-react.md.
 */
import { render } from '@react-email/render';
import {
    existsSync,
    mkdirSync,
    readdirSync,
    statSync,
    writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import * as React from 'react';

import {
    getBladeRegistry,
    resetBladeRegistry,
} from '../resources/js/emails/lib/blade';

const EMAILS_DIR = resolve('resources/js/emails');
const VIEWS_DIR = resolve('resources/views');
const EXCLUDED = ['components', 'lib']; // subdirs que no son páginas

function walk(dir: string): string[] {
    const out: string[] = [];
    for (const name of readdirSync(dir)) {
        const full = join(dir, name);
        if (statSync(full).isDirectory()) {
            const rel = relative(EMAILS_DIR, full).split(/[\\/]/)[0];
            if (EXCLUDED.includes(rel)) continue;
            out.push(...walk(full));
        } else if (name.endsWith('.tsx')) {
            out.push(full);
        }
    }
    return out;
}

type Page = {
    view?: string;
    props?: Record<string, unknown>;
    default?: React.ComponentType<Record<string, unknown>>;
};

async function build(): Promise<void> {
    if (!existsSync(EMAILS_DIR)) {
        console.log('No existe resources/js/emails/. Nada que compilar.');
        return;
    }

    const files = walk(EMAILS_DIR);
    let compiled = 0;
    const skipped: string[] = [];

    for (const file of files) {
        const mod: Page = await import(pathToFileURL(file).href);
        if (!mod.view || !mod.default) {
            skipped.push(relative(process.cwd(), file));
            continue;
        }

        resetBladeRegistry();
        let html = await render(
            React.createElement(mod.default, mod.props ?? {}),
            {
                pretty: true,
            },
        );

        for (const { token, value } of getBladeRegistry()) {
            html = html.split(token).join(value); // sin regex: evita interpretar `$`
        }

        // Limpia artefactos de React: marcadores de límite (<!--$-->, <!--/$-->)
        // y separadores de nodos de texto (<!-- -->). Son comentarios inertes,
        // pero ensucian el Blade generado.
        html = html
            .replace(/<!--\/?\$[^>]*-->/g, '')
            .replace(/<!-- -->/g, '')
            .replace(/\n{3,}/g, '\n\n');

        const banner =
            `{{-- Generado por scripts/build-emails.ts desde ` +
            `${relative(process.cwd(), file).replace(/\\/g, '/')}. NO editar a mano. --}}\n`;

        const outPath = join(VIEWS_DIR, `${mod.view}.blade.php`);
        mkdirSync(dirname(outPath), { recursive: true });
        writeFileSync(outPath, banner + html + '\n', 'utf8');
        console.log(`  ✓ ${mod.view}.blade.php`);
        compiled++;
    }

    if (skipped.length) {
        console.log(
            `\n(omitidos, sin export \`view\`/default: ${skipped.join(', ')})`,
        );
    }
    console.log(`\n${compiled} plantilla(s) compilada(s).`);
}

build().catch((err) => {
    console.error(err);
    process.exit(1);
});
