# design.md — Sistema visual

Reglas del sistema visual de CAMEPG. De obligado cumplimiento junto con
[`agents.md`](agents.md). El objetivo es una interfaz **consistente** con un conjunto **reducido**
de colores, tamaños tipográficos, componentes y variantes. Se evita crear variaciones visuales
innecesarias.

---

## 1. Componentes

- **Ubicación:**
  - `@/Components/base/` → **componentes nuevos o migrados, con tokens** (el sistema de diseño
    vigente). Aquí va todo lo que construyamos de ahora en adelante.
  - `@/Components/ui/` → shadcn actual, aún con color incrustado (**legacy**, se migra a `base/`).
  - `@/Components/` (raíz) → componentes viejos propios (**legacy a retirar**).
  - Migración incremental: al rehacer un componente, la versión nueva va en `base/` y **se borra
    la vieja**; no conviven dos versiones.
- Base shadcn (config en `components.json`: estilo `new-york`, base `slate`, `cssVariables: true`,
  iconos **lucide**).
- Una vez entregado un componente, **se respeta su estructura**. Se permiten sus **variantes
  existentes**; **no** se crean versiones innecesarias ni se altera su comportamiento.
- Ajustes visuales permitidos de forma general: **tipografía, colores y tokens/variables** aquí
  definidos. Nada más.
- Antes de crear un componente, revisar si ya existe (ver inventario) — prioridad
  reutilizar > estandarizar > documentar > mejorar > crear.
- **Crear un componente nuevo requiere autorización explícita** y solo si es netamente necesario.
- **Cero hardcode de estilos.** Los colores y estilos salen **solo de los tokens** (§2); nunca
  clases de color crudas (`bg-slate-900`, `text-red-500`…) en componentes nuevos o rehechos. Los
  estilos "son los que son": no se inventan tonos ni variantes por pantalla. (El legacy aún con
  color incrustado se migra incrementalmente por módulo; al rehacer un componente se borra el
  viejo y queda solo el nuevo, ya con tokens.)

### Inventario actual (`@/Components/ui`)

`Avatar` · `Badge` · `Button` · `Card` · `Checkbox` · `DropdownMenu` · `Input` · `Label` ·
`SearchableSelect` · `Select` · `Separator` · `Switch` · `Table` · `Tabs` · `Textarea` ·
`YesNoToggle`.

Iconografía: **lucide-react**. Editor de texto enriquecido: **Tiptap**. Toasts: **sonner**.

## 2. Colores de marca

Uso controlado; no crear múltiples tonos derivados salvo necesidad real (estados, accesibilidad,
jerarquía).

| Color | Hex | Uso previsto |
|---|---|---|
| Amarillo | `#FBDC1D` | Acento de marca |
| Verde | `#00B53C` | Éxito / positivo |
| Rojo | `#D9141B` | Error / destructivo |
| Casi negro | `#151515` | Texto / superficies oscuras |

### Escala de 3 pasos (colores cromáticos)

Los tres colores cromáticos (amarillo/`accent`, verde/`success`, rojo/`destructive`) tienen **tres
pasos con propósito** — no tonos sueltos:

| Paso | Utilidad | Uso |
|---|---|---|
| `subtle` | `bg-accent-subtle` … | Fondo tenue: badges, alertas suaves, resaltados. |
| `DEFAULT` | `bg-accent` … | Color sólido: botones, énfasis. Texto encima = su `-foreground`. |
| `strong` | `bg-accent-strong`, `text-accent-strong` | Hover/activo, o **texto legible** sobre el `subtle`. |

`primary` (#151515) no lleva escala cromática: sus variaciones son los neutros
(`secondary`/`muted`/`border`).

### Mapeo a tokens shadcn (tema claro, definido en `resources/css/app.css`)

`--primary` es **neutro** (`#151515`) por accesibilidad; el amarillo de marca es `--accent`.
No hay modo oscuro por ahora (solo `:root`).

| Token | HSL | Origen |
|---|---|---|
| `--background` / `--foreground` | `0 0% 100%` / `0 0% 8%` | Blanco / #151515 |
| `--primary` / `--primary-foreground` | `0 0% 8%` / `0 0% 100%` | Acción principal neutra |
| `--accent` / `--accent-foreground` | `52 96% 55%` / `0 0% 8%` | **#FBDC1D** (texto negro encima) |
| `--destructive` / `--destructive-foreground` | `358 74% 46%` / `0 0% 100%` | **#D9141B** |
| `--success` / `--success-foreground` | `140 100% 35%` / `0 0% 100%` | **#00B53C** (token extra de marca) |
| `--secondary` / `--muted` | `0 0% 96%` | Grises neutros |
| `--muted-foreground` | `0 0% 40%` | Texto secundario |
| `--border` / `--input` | `0 0% 90%` | Bordes |
| `--ring` | `0 0% 8%` | Foco (neutro) |
| `--radius` | `0.5rem` | Radio base |

En `tailwind.config.js` estos tokens se exponen como utilidades (`bg-primary`, `text-accent-foreground`,
`bg-destructive`, `bg-success`, `border-input`, `ring-ring`…). Los componentes nuevos usan estas
utilidades; **no** colores incrustados (`slate-*`, `red-*`).

## 3. Tipografía

Evitar demasiados tamaños tipográficos.

| Contexto | Fuentes |
|---|---|
| Página web (público) | **Inter** (cuerpo) · **Google Sans Flex** (títulos) |
| Aplicación | **Inter** |

Se cargan desde bunny.net en `resources/views/app.blade.php`. En Tailwind: `font-sans` = Inter
(por defecto en toda la app); `font-display` = Google Sans Flex (títulos de la web pública).

### Escala tipográfica (codificada en `tailwind.config.js`)

Cada rol es una utilidad que ya trae **tamaño + interlínea + peso**. La familia se combina aparte
(`font-display` en títulos de la web pública; `font-sans`/Inter en la app).

| Rol | Utilidad | Tamaño / interlínea / peso |
|---|---|---|
| Display (hero web) | `text-display` | 2.25rem / 1.15 / 600 |
| H1 | `text-h1` | 1.875rem / 1.2 / 600 |
| H2 | `text-h2` | 1.5rem / 1.25 / 600 |
| H3 | `text-h3` | 1.25rem / 1.3 / 600 |
| Cuerpo | `text-body` | 1rem / 1.5 / 400 |
| Pequeño | `text-small` | 0.875rem / 1.45 / 400 |
| Leyenda | `text-caption` | 0.75rem / 1.4 / 500 |

Ejemplo: título de web `class="font-display text-h1"`; texto de app `class="text-body"`.
Mantener esta escala reducida; no introducir tamaños intermedios sin necesidad real. (Las clases
por defecto de Tailwind —`text-sm`, `text-xl`…— siguen existiendo, pero se prefiere esta escala.)

## 4. Espaciado, estados y accesibilidad

- **Espaciado:** escala reducida y consistente — *pendiente de definir*.
- **Estados** (hover, focus, active, disabled, error, cargando): consistentes entre componentes;
  no ad-hoc por pantalla.
- **Accesibilidad visual:** contraste suficiente sobre los colores de marca (especialmente el
  amarillo `#FBDC1D` sobre blanco), foco visible, y no comunicar estado solo por color.

## 5. Estado de la implementación

Infraestructura visual establecida en el plan
[`docs/actualizaciones/0001-fundacion-visual-y-tooling.md`](docs/actualizaciones/0001-fundacion-visual-y-tooling.md):

- ✅ Tokens de marca en `resources/css/app.css` (`:root`, solo tema claro).
- ✅ Mapeo de tokens y `font-display` en `tailwind.config.js`; `font-sans` = Inter.
- ✅ Plugin `tailwindcss-animate` añadido.
- ✅ Fuentes Inter + Google Sans Flex cargadas (bunny.net), Figtree retirada.
- 🔄 **Migración de componentes: incremental.** Los 16 componentes de `@/Components/ui` aún usan
  colores incrustados (`slate-*`, `red-*`); se migran a tokens a medida que se trabaja cada
  módulo. Al rehacer un componente, se borra el viejo y queda solo el nuevo.

## 6. Galería de componentes (solo local)

Existe una página **temporal y solo de entorno local** para ver los componentes que se van creando
o migrando, con sus **variantes y estados** en uso. Sirve para revisar consistencia visual; no es
parte del producto y **no se despliega**.

- **Ruta:** `GET /dev/componentes` (`dev.componentes`), registrada **solo si `app()->environment('local')`**
  en `routes/web.php`. Página: `resources/js/Pages/Dev/Componentes.tsx` (+ `parts/`).
- Abierta (sin autenticación) porque solo vive en local; no se despliega.
- Hoy muestra los tokens de color y la escala tipográfica; los componentes de `base/` se irán
  agregando con sus variantes a medida que se creen o migren.
