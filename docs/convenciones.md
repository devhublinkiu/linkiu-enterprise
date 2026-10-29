# Convenciones — CAMEPG

Reglas que el código ya sigue (nombres, carpetas, estilo de pruebas, commits) y reglas de
producto/contenido. Complementa a [`../AGENTS.md`](../AGENTS.md). Lo visual está en
[`../design.md`](../design.md).

## Git y commits

- **Conventional Commits** (en inglés el tipo, mensaje en español): `feat:`, `fix:`, `docs:`,
  `refactor:`, `test:`, `chore:`… A menudo con el nº de plan entre paréntesis (ej.
  `feat: admin · finanzas … (plan 0018)`). Historial: ver `git log`.
- Rama única `production`; `*push` a `origin`. Rutas explícitas al hacer `git add` (nunca `git add .`
  con archivos ajenos).

## Nombres y estructura

- **Backend (Laravel):** convención estándar — `App\Http\Controllers\{Admin,Associate,Public}\…`,
  `App\Services\…`, `App\Models\…`, FormRequests en `App\Http\Requests`. Identificadores, rutas y
  claves de BD en **inglés**.
- **Frontend (Inertia/React):** páginas en `resources/js/Pages/{Admin,Associate,Public}/…`;
  componentes de diseño en `@/Components/base` (tokens) y `@/Components/ui` (shadcn legacy en
  migración). Rutas con nombre vía Ziggy.
- **Separación por carpetas** (`Admin/`, `Associate/`, `Public/`) = claridad, **no** seguridad: la
  seguridad la dan middleware + Policies/Gates + queries acotadas al dueño (ver
  [`seguridad.md`](seguridad.md)).
- **Archivos cortos:** una responsabilidad por archivo. Se parte en `Index.tsx` + `parts/` cuando
  pasa de ~250 líneas o tiene 2+ secciones claras (el preflight lo avisa, no bloquea).

## Pruebas

- **PHP:** Pest en `tests/{Feature,Unit}` sobre SQLite `:memory:` (`phpunit.xml`). Estilo descriptivo
  (`it('…')`, en español). **Frontend:** Vitest + Testing Library en `resources/js/**/tests`.
- Todo cambio con sus pruebas en el mismo corte. El motor de cobro, los interruptores de plan y las
  section reviews **siempre** llevan o actualizan test.

## Scripts y automatización

- Un script solo para **muchos** cambios, escrito como archivo (no heredoc). Toca solo lo de la
  tarea, comprueba que encontró lo que iba a cambiar, aborta sin escribir si el resultado quedaría
  vacío, y se revisa `git diff --stat` después. Por defecto se edita con reemplazo exacto (Edit).

## Producto y contenido

### Idioma
- Todo el **texto visible** (plataforma, web, correos, errores, botones, placeholders, etiquetas) va
  en **español**. Nunca inglés de cara al usuario. El **código** sigue en inglés/convención Laravel.
- Proyecto **100% colombiano y español-only**: español directo en el código (sin `lang/` de
  traducción).
- **Registro:** cercano y claro (**tuteo**), sin tecnicismos. Ni acartonado ni coloquial de más.
- **Formatos Colombia:** fechas `DD/MM/AAAA`, moneda **COP** sin decimales y con separador de miles.
- **Ejemplos/placeholders:** genéricos y neutros (NIT `900.123.456-7`, `nombre@empresa.com`). Nada
  de datos reales ni internos.

### Errores
- **Validación:** mensaje en español, específico y accionable (qué campo y qué corregir).
- **Sistema / bug:** al usuario, mensaje amable **+ código de referencia** ("Ocurrió un error
  inesperado. Código: A7F3."). El detalle técnico va al **log**, nunca a pantalla en producción. En
  **local** sí se muestra crudo.

### Validación
- **El servidor manda:** toda entrada se valida en servidor (FormRequest = fuente de verdad). El
  cliente valida para UX, pero no sustituye al servidor.

## Componentes

- Se **respetan al 100%** los componentes entregados (ver [`../design.md`](../design.md)). **Crear
  uno nuevo requiere autorización explícita** y solo si es netamente necesario; primero reutilizar o
  usar una variante existente. Prioridad: **reutilizar → estandarizar → documentar → mejorar →
  crear**.
