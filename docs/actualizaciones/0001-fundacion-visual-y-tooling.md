# Plan de actualización — 0001 · Fundación: sistema visual + tooling/gates

- **Estado:** Hecho (2026-09-12)
- **Fecha:** 2026-09-12
- **Alcance:** Base transversal previa al trabajo por módulos. **Parte A:** definir y aplicar el
  sistema visual (tokens de color de marca + tipografía) sobre shadcn. **Parte B:** dejar los
  gates de calidad operativos (Larastan, Pest, Vitest, `types:check`) y configurar el remoto
  `apolo`. **No entra:** rediseñar pantallas de módulos concretos ni cambiar su comportamiento.

> Este plan no se ejecuta hasta `#go`. Antes hay **decisiones requeridas** (ver §8).

---

## Contexto / hallazgos (estado real hoy)

- Los componentes de `@/Components/ui` **no usan tokens semánticos**: tienen los colores
  incrustados (`bg-slate-900`, `bg-red-500`, `text-slate-50`, con variantes `dark:`), pese a que
  `components.json` declara `cssVariables: true`. → Cambiar colores hoy no se logra con variables
  CSS: hay que introducir la capa de tokens y migrar los componentes a ella.
- `tailwind.config.js` **no** mapea colores de shadcn (`primary`, `destructive`, `border`, `ring`…);
  solo extiende `fontFamily.sans = Figtree`.
- `resources/css/app.css` **no** define variables `:root` de tema.
- Falta el plugin **`tailwindcss-animate`** (requerido por el patrón shadcn).
- Fuente actual **Figtree**; objetivo **Inter** (app) + **Cal Sans Semibold** (web).
- Gates: **Pint** y **ESLint/Prettier** existen. **Larastan, Pest, Vitest** y `types:check` **no**.
- Remotos git: solo **`origin`** (`linkiu-enterprise`). **`apolo` no existe.**

---

# PARTE A — Sistema visual

## A.1 Componentes *(primer punto)*

- **Reutilizar:** los 16 componentes existentes de `@/Components/ui` (Avatar, Badge, Button,
  Card, Checkbox, DropdownMenu, Input, Label, SearchableSelect, Select, Separator, Switch, Table,
  Tabs, Textarea, YesNoToggle). No se añaden ni se crean nuevos en este plan.
- **Integrar:** plugin `tailwindcss-animate` (dependencia del patrón, no un componente visual nuevo).
- **Cambio sobre los existentes:** migrar sus clases de color **incrustadas** (`slate-*`, `red-*`,
  `dark:*`) a **tokens semánticos** (`bg-primary`, `text-primary-foreground`, `border-input`,
  `ring-ring`, `bg-destructive`…). Es alinear cada componente al sistema de tokens que ya declara
  `components.json` — **no** se cambia su estructura, sus variantes ni su API; solo de dónde toma
  el color. Se respeta la regla de "ajustes permitidos: tipografía, colores, tokens".
- **Decisión de alcance de la migración:** ver §8 (todos ahora vs. incremental por módulo).

## A.2 Documentación

- [x] `design.md` — completar el **mapeo color→token** y la **escala tipográfica** (hoy están como
  "pendiente de definir"). Es el entregable documental central de la Parte A.
- [ ] No se requieren ADR: no es una decisión estructural del dominio, es sistema visual.

## A.3 Flujo actual (capa visual)

- **Punto de entrada:** `resources/css/app.css` + `tailwind.config.js` → clases Tailwind en
  componentes `.tsx`.
- **Estado:** sin capa de tokens; colores por componente; fuente Figtree.
- **Resultado esperado tras el cambio:** un único origen de color (tokens de marca) y tipografía
  consistente, sin alterar el comportamiento ni el layout de los componentes.

## A.4 Propuesta de tokens (recomendada — confirmar en §8)

Colores de marca → HSL aproximado (el valor exacto se computa al implementar):

| Marca | Hex | HSL aprox. |
|---|---|---|
| Amarillo | `#FBDC1D` | `52 96% 55%` |
| Verde | `#00B53C` | `140 100% 35%` |
| Rojo | `#D9141B` | `358 74% 46%` |
| Casi negro | `#151515` | `0 0% 8%` |

Mapeo semántico shadcn (tema claro) **recomendado**:

| Token | Valor | Motivo |
|---|---|---|
| `--background` / `--foreground` | blanco / `0 0% 8%` | Fondo claro, texto casi negro |
| `--primary` / `--primary-foreground` | `0 0% 8%` / blanco | **Neutro como acción principal** (elegante, contraste garantizado) |
| `--accent` / `--accent-foreground` | `52 96% 55%` / `0 0% 8%` | Amarillo de marca como acento (texto negro encima) |
| `--destructive` / `--destructive-foreground` | `358 74% 46%` / blanco | Rojo de marca |
| `--success`* / `--success-foreground` | `140 100% 35%` / blanco | Verde de marca (token extra, no estándar en shadcn) |
| `--border` / `--input` / `--ring` | grises neutros / `--ring` = primary | Bordes y foco visibles |
| `--muted`, `--secondary`, `--card`, `--popover` | grises neutros del preset slate | Sin cambio de marca |

\* `--success` no existe en shadcn base; se añade como token de marca para estados positivos.

> **Decisión de producto (§8):** el punto discutible es `--primary`. Recomiendo **neutro
> (#151515)** por accesibilidad (el amarillo `#FBDC1D` no da contraste con blanco y satura si es
> el color de todos los botones). Alternativa: **amarillo como `--primary`** con texto negro, más
> "de marca" pero más ruidoso. Se decide antes de `#go`.

## A.5 Propuesta de tipografía (recomendada — confirmar en §8)

- **App:** Inter (peso 400/500/600). **Web pública:** Inter para cuerpo + **Cal Sans Semibold**
  para títulos.
- Escala reducida recomendada (rem):

| Rol | Tamaño / peso |
|---|---|
| Display (web hero) | 2.25rem / Cal Sans 600 |
| H1 | 1.875rem / 600 |
| H2 | 1.5rem / 600 |
| H3 | 1.25rem / 600 |
| Body | 1rem / 400 |
| Small | 0.875rem / 400 |
| Caption | 0.75rem / 500 |

- **Carga de fuentes:** Inter vía `@fontsource`/CDN local; Cal Sans es fuente de pago/específica →
  confirmar disponibilidad de los archivos (§8).

## A.6 Pasos (Parte A) — solo con `#go`

1. `npm i -D tailwindcss-animate` y registrarlo en `tailwind.config.js`.
2. `tailwind.config.js`: añadir el mapeo `colors` de shadcn (`hsl(var(--token))`), `borderRadius`
   y `fontFamily` (Inter/Cal Sans en vez de Figtree).
3. `resources/css/app.css`: definir `:root` con los tokens aprobados (y `.dark` solo si se decide
   soportar modo oscuro — hoy fuera de alcance).
4. Migrar los 16 componentes `ui/*` de clases incrustadas a tokens (según alcance de §8).
5. Cargar las fuentes y verificar render.
6. Completar `design.md` con los valores finales.
7. **Gates:** `types:check`, ESLint, Prettier, Vitest (smoke de un par de componentes).

## A.7 Accesibilidad / seguridad (Parte A)

- Verificar contraste AA de texto sobre cada token (sobre todo amarillo).
- Foco visible (`--ring`) en todos los interactivos.
- Sin implicaciones de seguridad.

---

# PARTE B — Tooling y gates

## B.1 Componentes

- No aplica (no hay UI). Son dependencias de desarrollo y configuración.

## B.2 Documentación

- [x] `agents.md` §5 — actualizar el estado de los gates cuando queden operativos.
- [ ] Breve nota en `README.md` (sección Pruebas) con los comandos nuevos.

## B.3 Flujo actual

- `composer.json` tiene script `test` (PHPUnit). `package.json` tiene `build`, `dev`, `lint`.
- No hay análisis estático PHP, ni Pest, ni tests de frontend, ni `types:check` aislado.

## B.4 Pasos (Parte B) — solo con `#go`

1. **Larastan:** `composer require --dev larastan/larastan`; crear `phpstan.neon` (nivel inicial
   conservador, p. ej. 5, sobre `app/`); añadir script `composer analyse`.
2. **Pest:** `composer require --dev pestphp/pest pestphp/pest-plugin-laravel` (el plugin ya está
   permitido en `composer.json`); `php artisan pest:install`. Convive con los tests PHPUnit de
   Breeze existentes. Añadir un test de humo.
3. **Vitest:** `npm i -D vitest @testing-library/react @testing-library/jest-dom jsdom`; crear
   `vitest.config.ts` (jsdom); añadir scripts `test` y `test:watch`; un test de humo de un componente.
4. **`types:check`:** añadir script `"types:check": "tsc --noEmit"` en `package.json`.
5. **Remoto `apolo`:** `git remote add apolo <URL>` — **requiere la URL** (§8). Verificar con
   `git remote -v`.
6. Actualizar `agents.md`/`README.md` con el estado y los comandos.

## B.5 Seguridad / accesibilidad

- Sin impacto directo. `apolo` debe ser un remoto de confianza (evitar filtrar `.env`/secretos;
  `.gitignore` ya cubre `.env`).

---

## §7 Gates a ejecutar al implementar (proporcional)

- Parte A (frontend): `types:check` · ESLint · Prettier · Vitest.
- Parte B (según lo que instale): además Pint · Larastan · Pest en verde.

## §8 Decisiones requeridas antes de `#go`

1. **`--primary`:** ¿neutro `#151515` (recomendado) o amarillo de marca?
2. **Migración de componentes:** ¿migrar los 16 `ui/*` a tokens **ahora** (consistencia inmediata)
   o **incremental** por módulo a medida que se trabajen?
3. **Cal Sans Semibold:** ¿tenemos los archivos de la fuente (licencia/ubicación)? Si no, la web
   usa solo Inter hasta conseguirla.
4. **Modo oscuro:** ¿se soporta? (define si `app.css` lleva bloque `.dark`). Recomiendo **no** por ahora.
5. **URL del remoto `apolo`** (obligatoria para el paso B.4.5).
6. **Niveles de gate:** ¿nivel de Larastan inicial 5 y sin bloquear el build todavía? (recomendado).

## §9 Aprobación

- [x] Decisiones de §8 resueltas (ver §10)
- [x] Plan revisado
- [x] `#go` recibido → implementado

## §10 Resultado (implementación)

**Decisiones tomadas:** `--primary` neutro `#151515`; migración de componentes **incremental**
(al rehacer un componente se borra el viejo); tipografía web con **Google Sans Flex** (en vez de
Cal Sans); **sin** modo oscuro; push a **`origin`** (se descarta `apolo`); Larastan nivel 5 no
bloqueante con baseline.

**Hecho:**
- Tokens de marca en `resources/css/app.css` (`:root`, tema claro); mapeo en `tailwind.config.js`
  (`bg-primary`, `bg-accent`, `bg-destructive`, `bg-success`, `border-input`, `ring-ring`…),
  `borderRadius` y `fontFamily` (`sans`=Inter, `display`=Google Sans Flex).
- `tailwindcss-animate` instalado y registrado.
- Fuentes Inter + Google Sans Flex (bunny.net) en `app.blade.php`; Figtree retirada.
- Gates instalados y en verde: Larastan (`composer analyse`, baseline de 222 legacy congelados),
  Pest (`vendor/bin/pest`, test de humo), Vitest (`npm run test`, humo de Button),
  `types:check` (`tsc --noEmit`), Pint, ESLint, Prettier. `npm run build` OK.

**Pendiente (fuera de este plan):** migrar los 16 componentes `ui/*` a tokens (incremental por
módulo); triar los 222 hallazgos de Larastan; conseguir/definir pesos finales de la tipografía en
pantallas reales.
