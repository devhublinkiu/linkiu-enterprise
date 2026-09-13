# Plan de actualización — 0002 · Preflight (orquestador de gates)

- **Estado:** Hecho (2026-09-12)
- **Fecha:** 2026-09-12
- **Alcance:** Un comando único que corre los gates de calidad de forma **proporcional al cambio**,
  para usarse antes de `#commit`/`#push`. **No entra:** cambiar los gates en sí, ni instalar hooks
  de git de forma automática (el hook queda documentado como opción).

> No se ejecuta hasta `#go`. Ver decisiones en §8.

---

## Contexto / hallazgos

- Los gates ya existen y están verdes (plan 0001): Pint, Larastan (`composer analyse`, con
  baseline), Pest, `types:check`, ESLint, Prettier, Vitest.
- Hoy se corren **a mano y por separado**; `agents.md` §5 los exige pero no hay un orquestador.
- Entorno: Windows + PowerShell + Herd; Node ya es dependencia (Vite). Git disponible.

## 1. Componentes *(primer punto)*

- **No aplica.** Es tooling/script, sin UI. No se crea ni modifica ningún componente de
  `@/Components/ui`.

## 2. Documentación

- [x] `agents.md` §5 — referenciar el comando (`npm run preflight`) como la forma de correr los
  gates; `#commit` usa la versión proporcional y `#push` la completa.
- [x] `README.md` — una línea en la sección de pruebas.
- [ ] No requiere ADR (no es decisión de arquitectura del dominio).

## 3. Flujo actual

- **Punto de entrada:** el desarrollador/agente corre manualmente `pint`, `composer analyse`,
  `pest`, `types:check`, `lint`, `vitest`.
- **Estados:** cada gate pasa/falla por su lado; fácil olvidar alguno.
- **Resultado esperado:** un comando que decide qué correr según los archivos cambiados y termina
  en verde/rojo con un resumen claro (en español).

## 4. Diseño propuesto

**Orquestador en Node** (`scripts/preflight.mjs`, invocado con `npm run preflight`), porque es
cross-platform (evita PowerShell vs bash) y no añade dependencias (usa `node:child_process` y
`node:fs`).

### Detección de cambios
- Por defecto: archivos con cambios en working tree + staged respecto a `HEAD`
  (`git diff --name-only HEAD`).
- `--push`: además los commits locales sin subir (`git diff --name-only @{upstream}..HEAD`) y corre
  **todo** el carril que aplique, sin depender del working tree.
- `--all`: corre todos los gates sin importar qué cambió.

### Carriles (proporcional)
| Si cambió… | Corre |
|---|---|
| `app/**`, `routes/**`, `database/**`, `config/**`, `tests/**` (`.php`) | Pint (`--test`) · `composer analyse` · Pest |
| `resources/js/**` (`.ts/.tsx`), `tailwind.config.js`, `resources/css/**` | `types:check` · ESLint · Prettier (`--check`) · Vitest |

- Larastan/Pest/Vitest se corren **completos** al inicio (simple y confiable); optimizar a
  "solo afectados" queda para después si molesta el tiempo.
- Salida: resumen final con ✓/✗ por gate, en español. Código de salida ≠ 0 si algún gate
  **bloqueante** falla.

### Chequeos de reglas §7 (ligeros, **no bloqueantes** al inicio)
Solo sobre archivos **cambiados**, como avisos (no rompen el preflight todavía):
- **Regla 10 (hardcode):** buscar clases de color crudas (`bg-slate-*`, `text-red-*`, `dark:*`) en
  `.tsx` cambiados → aviso.
- **Regla 6 (250 líneas):** listar archivos cambiados que superen el umbral → aviso.
- (La regla 1 —inglés en UI— se deja **fuera** por ser ruidosa/falible; se revisa a mano.)

## 5. Pasos (con `#go`)

1. Crear `scripts/preflight.mjs`: parseo de flags (`--push`, `--all`), detección de cambios,
   despacho por carril, ejecución con `execSync` (heredando stdio), resumen y exit code.
2. Añadir scripts a `package.json`: `"preflight"`, `"preflight:all"`, `"preflight:push"`.
3. Chequeos §7 no bloqueantes (grep de hardcode y conteo de líneas sobre archivos cambiados).
4. Actualizar `agents.md` §5 y `README.md`.
5. (Opcional, según §8) documentar un hook `pre-push` en `.githooks/` sin instalarlo por defecto.

## 6. Revisión de accesibilidad / seguridad

- Accesibilidad: no aplica (herramienta de consola).
- Seguridad: el script no toca red ni secretos; solo lee git y ejecuta binarios locales del repo.

## 7. Gates a ejecutar al implementar

- Frontend (es un `.mjs` + `package.json`): `types:check` no aplica (JS puro), ESLint/Prettier sí
  sobre el script. Se prueba corriendo el propio `preflight` en sus tres modos.

## §8 Decisiones requeridas antes de `#go`

1. **Alcance de test/análisis:** ¿correr Larastan/Pest/Vitest **completos** (recomendado, simple) o
   invertir ya en "solo afectados"?
2. **Chequeos §7:** ¿los dejamos como **avisos no bloqueantes** (recomendado, por el legacy) o
   quieres que bloqueen desde el inicio?
3. **Hook de git:** ¿instalamos un `pre-push` que corra `preflight --push`, o dejamos el comando
   manual y solo documentamos el hook? (recomiendo manual + hook documentado, para no sorprender).
4. **Nombre/uso:** ¿`npm run preflight` está bien como entrada única?

## §9 Aprobación

- [x] Decisiones de §8 resueltas (§10)
- [x] Plan revisado
- [x] `#go` recibido → implementado

## §10 Resultado (implementación)

**Decisiones:** gates de prueba/análisis **completos**; chequeos §7 como **avisos no bloqueantes**;
hook **manual + documentado** (no instalado); entrada `npm run preflight`.

**Hecho:**
- `scripts/preflight.mjs` (Node, sin dependencias nuevas). Detecta cambios por git y despacha por
  carril. Ajuste técnico: los gates de **formato/lint (Pint, ESLint, Prettier) corren sobre los
  archivos cambiados** (no sobre el legacy sin formatear), mientras que **Pest, Vitest, Larastan y
  `tsc` corren completos**. Salida en español con ✓/✗, avisos §7 y código de salida.
- Scripts `preflight`, `preflight:push`, `preflight:all` en `package.json`.
- Hook `.githooks/pre-push` documentado (se activa con `git config core.hooksPath .githooks`).
- `agents.md` §5 y `README.md` actualizados: **el agente corre el preflight automáticamente** en
  `#commit` (`preflight`) y `#push` (`preflight:push`).
- Verificado end-to-end: orquestación, escopado de formato, avisos y exit codes correctos. Pint,
  Larastan, `types:check`, ESLint, Prettier y Vitest → verdes.

**Hallazgo (fuera de este plan):** el gate **Pest queda en rojo** por un problema pre-existente de
infraestructura de pruebas: las migraciones usan DDL de MySQL (`ALTER TABLE … MODIFY COLUMN …
ENUM(...)`) que **no es válido en sqlite**, y los tests corren con `RefreshDatabase` sobre sqlite
`:memory:` (`phpunit.xml`). Ni siquiera migran → 24 tests de Breeze fallan. Arreglarlo (migraciones
agnósticas de motor, o test DB en MySQL) es un **plan aparte** y enlaza con el Bloque 3 de
`docs/pendientes-documentacion.md` (suite del motor de cobro + factories). Hasta entonces, el
preflight reportará Pest en rojo con honestidad.
