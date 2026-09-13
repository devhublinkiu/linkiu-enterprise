# Components/base — componentes del sistema de diseño (con tokens)

Aquí viven los **componentes nuevos o migrados** del sistema de diseño CAMEPG. Import:
`@/Components/base/...`.

## Reglas (ver `design.md` y `agents.md`)

- **Solo tokens, cero hardcode de estilos.** Nada de `bg-slate-*`, `text-red-*`, `dark:*`. Se usan
  las utilidades de marca: `bg-primary`, `text-destructive`, `bg-accent`, `border`, `ring-ring`,
  y la escala tipográfica `text-h1`/`text-body`/etc.
- **Se respeta la estructura de cada componente**; solo variantes existentes. Crear uno nuevo
  requiere autorización explícita.
- Cada componente que agreguemos aquí se muestra en la **galería local** con sus variantes.

## Relación con las otras carpetas

- `Components/base/` → **lo nuevo**, con tokens (esta carpeta).
- `Components/ui/` → shadcn actual, aún con color incrustado (**legacy**, se migra a `base/`).
- `Components/` (raíz) → componentes viejos propios (`PrimaryButton`, `Checkbox` viejo…),
  **legacy a retirar**.

**Migración incremental:** cuando se rehace un componente, la versión nueva va en `base/` y **se
borra la vieja** (de `ui/` o de la raíz). No conviven dos versiones del mismo componente.
