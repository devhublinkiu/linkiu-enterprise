# Plan de actualización — Bienes y Servicios · Corte 0022-B (UI a /base)

- **Estado:** Implementado en local (gates verdes) — sin commit.
- **Fecha:** 2026-09-16
- **Decisión del usuario:** migrar **ambas** superficies de panel (Admin + Asociado) a `/base`,
  respetando la consistencia del sistema (solo componentes de `/base`, sin inventar nuevos; si hiciera
  falta uno, se pregunta antes).
- **Alcance:** Reescribir las **7 pantallas de panel** del módulo para que usen `@/Components/base/*`
  y tokens del design system, en lugar del set viejo `@/Components/ui/*` con paleta cruda
  (slate/green/emerald/purple). **NO entra:** la superficie **pública** (`Public/BusinessServices/*`),
  que por convención mantiene su paleta propia (Regla 10); ni paginación server-side / N+1 (queda para
  otro corte); ni el interruptor de plan.

> Este plan documenta el corte que se está ejecutando tras el `#go`.

## 1. Componentes (solo `/base`, sin nuevos)

- **Reutilizar/Integrar:** `Card`, `Button`, `Badge`, `Input`, `Textarea`, `Label`, `Field`,
  `Select`, `RadioGroup`, `Table`, `InputGroup`. `TiptapEditor` (compartido) se mantiene.
- **Sin componentes nuevos.** Inputs nativos solo donde `/base` no cubre (fecha `datetime-local` y
  subida de archivos), como hace el resto del panel.
- **Se retira** todo import de `@/Components/ui/*` en estas 7 pantallas y `framer-motion` del
  directorio del asociado (el panel no anima).

## 2. Documentación

- [x] Este plan. No requiere ADR (no cambia arquitectura; es migración visual).

## 3. Flujo actual

Las 7 pantallas funcionan, pero importan de `ui/`, arman la tabla del admin a mano (`<table>`),
usan `<select>`/`<textarea>`/radios nativos y **colores crudos** (emerald/purple/blue/green). El
directorio del asociado además muestra "No definida" porque el controlador **no envía**
`ciudad`/`departamento` (bug).

## 4. Accesibilidad

`/base` aporta foco visible, `aria-*` y roles correctos (RadioGroup/Select de Radix). Se añaden
`aria-label` a los botones de icono. Contraste por tokens.

## 5. Seguridad

Sin cambios de autorización. Se conserva el `dangerouslySetInnerHTML` **con DOMPurify** del contenido
y las URLs de documento **gateadas** de 0022-A (no se vuelve a `getUrl()`).

## 6. Funcional

- **Igual:** rutas, CRUD admin, búsqueda (client-side), navegación, subida/borrado de archivos,
  descarga gateada.
- **Cambia:** aspecto → estética `/base` (como `Admin/Services`); acento pasa de verde a `primary`
  (marca). **Bug corregido:** el directorio del asociado ahora muestra ciudad/departamento reales.

## 7. Pasos

1. **Controladores del asociado** (`Associate\BienesServiciosController`): añadir `departamento` y
   `ciudad` al map de empresas (index/showCompany/showTender). *(Backend mínimo, corrige el bug.)*
2. **Admin** → `/base`: `Companies/Index`, `Companies/Form`, `Tenders/Index`, `Tenders/Form`.
3. **Asociado** → `/base`: `BusinessServices/Index`, `CompanyTenders`, `TenderDetail`.
4. **Gates:** `types:check` · ESLint · Prettier (escopado) · Vitest · `npm run build`.

## 8. Aprobación

- [x] Superficie confirmada (Ambas) · [x] `#go` · [x] Entregado
- **Gates verdes:** types:check · ESLint · Prettier · Vitest (131) · build · Pint · Larastan (0).
- **Nota de revisión:** las choice-cards de "Público objetivo" se rehicieron con borde consistente
  (ambas con `border-input`; seleccionada con `border-primary` + `bg-primary/5`) tras el feedback.
