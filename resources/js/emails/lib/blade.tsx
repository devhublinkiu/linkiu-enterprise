/**
 * Helpers para emitir Blade desde plantillas React de correo (react-email).
 *
 * Contexto (plan 0004): las plantillas se AUTOR­an en React y se COMPILAN a
 * vistas Blade en build (`npm run emails:build`). El runtime sigue en PHP puro;
 * los Mailables no cambian. Ver docs/adr/0004-*.md.
 *
 * Problema que resuelve: en JSX no se puede escribir `{{ $var }}` literal, y si
 * se mete como texto, React ESCAPA los caracteres especiales (`$user->name`
 * se volvería `$user-&gt;name` y rompería Blade). Solución: cada helper devuelve
 * un TOKEN alfanumérico seguro (no se escapa) y registra a qué Blade se traduce.
 * Tras `render()`, `scripts/build-emails.ts` sustituye los tokens por el Blade
 * real (después del escapado, así el `>` sobrevive intacto).
 *
 * Este módulo es de USO EN BUILD (Node), no se importa en el bundle del navegador.
 */
import * as React from 'react';

type Entry = { token: string; value: string };

let registry: Entry[] = [];
let counter = 0;

/** Vacía el registro antes de renderizar cada plantilla. Lo llama el build. */
export function resetBladeRegistry(): void {
    registry = [];
    counter = 0;
}

/** Devuelve las sustituciones token→Blade acumuladas en el último render. */
export function getBladeRegistry(): Entry[] {
    return registry.slice();
}

function token(value: string): string {
    const t = `RXB${counter++}XBR`;
    registry.push({ token: t, value });
    return t;
}

/** Emite `{{ expr }}` (Blade escapado). Uso: `{blade("$user->name")}`. */
export function blade(expr: string): string {
    return token(`{{ ${expr} }}`);
}

/** Emite `{!! expr !!}` (Blade SIN escapar). Solo para HTML de confianza. */
export function bladeRaw(expr: string): string {
    return token(`{!! ${expr} !!}`);
}

/** Emite un snippet/directiva Blade tal cual. Uso: `{raw("@csrf")}`. */
export function raw(snippet: string): string {
    return token(snippet);
}

/**
 * Envuelve hijos en una directiva de control Blade (`@if` / `@foreach`).
 * Uso: `<Blade foreach="$items as $item"> … </Blade>`.
 */
export function Blade({
    if: ifExpr,
    foreach: forExpr,
    children,
}: {
    if?: string;
    foreach?: string;
    children?: React.ReactNode;
}): React.ReactElement {
    let open = '';
    let close = '';
    if (forExpr) {
        open = `@foreach (${forExpr})`;
        close = '@endforeach';
    } else if (ifExpr) {
        open = `@if (${ifExpr})`;
        close = '@endif';
    }
    // Cada directiva va en su propia línea: Blade NO reconoce `@if` pegado a un
    // `@endif` anterior (`@endif@if` deja el segundo sin compilar). Los saltos se
    // añaden al VALOR (no al render), y el build colapsa los sobrantes.
    return (
        <>
            {raw(`\n${open}\n`)}
            {children}
            {raw(`\n${close}\n`)}
        </>
    );
}
