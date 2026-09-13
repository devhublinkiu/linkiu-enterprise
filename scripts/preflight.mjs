// Preflight: orquesta los gates de calidad de forma proporcional al cambio.
// Uso:
//   node scripts/preflight.mjs            -> carriles con cambios vs HEAD (lo que corre #commit)
//   node scripts/preflight.mjs --push     -> incluye commits sin subir (lo que corre #push)
//   node scripts/preflight.mjs --all      -> fuerza prueba/análisis completo de ambos carriles
//
// Criterio: los gates de PRUEBA/ANÁLISIS (Pest, Vitest, Larastan+baseline, tsc) corren COMPLETOS.
// Los gates de FORMATO/LINT (Pint, ESLint, Prettier) corren solo sobre los archivos CAMBIADOS,
// para no bloquear por el legacy sin formatear. Los chequeos de reglas §7 (hardcode, 250 líneas)
// son AVISOS no bloqueantes. Ver docs/actualizaciones/0002-preflight.md y agents.md §5.

import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const PUSH = args.includes('--push');
const ALL = args.includes('--all');
const LINE_LIMIT = 250;

function git(cmd) {
    try {
        return execSync(`git ${cmd}`, { encoding: 'utf8' }).trim();
    } catch {
        return '';
    }
}

function changedFiles() {
    const set = new Set();
    for (const f of git('diff --name-only HEAD').split('\n')) if (f) set.add(f);
    for (const f of git('ls-files --others --exclude-standard').split('\n'))
        if (f) set.add(f);
    if (PUSH) {
        const up = git('diff --name-only @{upstream}..HEAD');
        if (up) for (const f of up.split('\n')) if (f) set.add(f);
    }
    // Excluye archivos borrados: no se pueden formatear/analizar y romperían Pint/ESLint.
    return [...set].filter((f) => existsSync(f));
}

const isPhp = (f) => /^(app|routes|database|config|tests)\/.*\.php$/.test(f);
const isFrontSrc = (f) => /^resources\/js\/.*\.(ts|tsx|js|jsx)$/.test(f);
const touchesFront = (f) =>
    isFrontSrc(f) ||
    /^resources\/css\//.test(f) ||
    /^(tailwind\.config\.js|vite\.config\.js|tsconfig\.json|package\.json)$/.test(
        f,
    );

const changed = ALL ? [] : changedFiles();
const phpChanged = changed.filter(isPhp);
const frontChanged = changed.filter(isFrontSrc);
const runPhp = ALL || phpChanged.length > 0;
const runFront = ALL || changed.some(touchesFront);

const results = [];
function gate(name, cmd) {
    process.stdout.write(`\n▶ ${name}\n`);
    try {
        execSync(cmd, { stdio: 'inherit' });
        results.push({ name, ok: true });
    } catch {
        results.push({ name, ok: false });
    }
}
const quote = (arr) => arr.map((f) => `"${f}"`).join(' ');

if (!runPhp && !runFront) {
    console.log('Sin cambios de código (PHP/Frontend). Nada que verificar. ✅');
    process.exit(0);
}

if (runPhp) {
    if (phpChanged.length)
        gate(
            'Pint (formato PHP, cambios)',
            `php vendor/bin/pint --test ${quote(phpChanged)}`,
        );
    gate('Larastan (análisis estático)', 'composer analyse');
    gate('Pest (pruebas PHP)', 'php vendor/bin/pest');
}

if (runFront) {
    gate('types:check (TypeScript)', 'npx tsc --noEmit');
    if (frontChanged.length) {
        gate('ESLint (cambios)', `npx eslint ${quote(frontChanged)}`);
        gate(
            'Prettier (cambios)',
            `npx prettier --check ${quote(frontChanged)}`,
        );
    }
    gate('Vitest (pruebas frontend)', 'npx vitest run');
}

// --- Avisos de reglas §7 (no bloquean) ---
const warnings = [];
const HARDCODE =
    /\b(?:bg|text|border|ring|from|via|to|fill|stroke|divide|outline|shadow)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b|(?:^|\s)dark:/;

for (const f of changed) {
    if (!existsSync(f)) continue;
    let text;
    try {
        text = readFileSync(f, 'utf8');
    } catch {
        continue;
    }
    const lines = text.split('\n').length;
    if (/\.(ts|tsx|js|jsx|php)$/.test(f) && lines > LINE_LIMIT) {
        warnings.push(
            `Regla 6: ${f} tiene ${lines} líneas (umbral ${LINE_LIMIT}). Considera partir en parts/.`,
        );
    }
    if (/^resources\/js\/.*\.(tsx|jsx)$/.test(f) && HARDCODE.test(text)) {
        warnings.push(
            `Regla 10: ${f} usa color crudo o dark:. Usa tokens (bg-primary, text-destructive…).`,
        );
    }
}

// --- Deuda de conexión entre componentes base (repo-wide, no bloquea) ---
// El marcador suele vivir en el componente que espera la dependencia (p. ej. Field
// esperando Input), no en el archivo que se acaba de cambiar. Por eso se escanea todo
// resources/js, no solo lo modificado. Ver orden-componentes.md ("Deuda de conexión").
for (const f of git(
    'ls-files --cached --others --exclude-standard resources/js',
).split('\n')) {
    if (!f || !isFrontSrc(f) || !existsSync(f)) continue;
    let text;
    try {
        text = readFileSync(f, 'utf8');
    } catch {
        continue;
    }
    const n = (text.match(/PENDIENTE\(base\)/g) || []).length;
    if (n)
        warnings.push(
            `Deuda de conexión: ${f} tiene ${n} marcador(es) PENDIENTE(base). Conecta la dependencia y pásalo a [x] en orden-componentes.md.`,
        );
}

console.log('\n──────── Resumen preflight ────────');
for (const r of results) console.log(`${r.ok ? '✓' : '✗'}  ${r.name}`);
if (warnings.length) {
    console.log('\nAvisos (no bloquean):');
    for (const w of warnings) console.log(`  ⚠ ${w}`);
}

const failed = results.filter((r) => !r.ok);
if (failed.length) {
    console.log(
        `\n❌ ${failed.length} gate(s) en rojo. Corrige antes de commitear/subir.`,
    );
    process.exit(1);
}
console.log('\n✅ Todo en verde.');
process.exit(0);
