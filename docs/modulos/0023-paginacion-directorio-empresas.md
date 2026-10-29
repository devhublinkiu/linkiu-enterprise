# Plan de actualización — Paginación del directorio público de empresas · Corte 0023

- **Estado:** Implementado en local — sin commit.
- **Fecha:** 2026-10-13
- **Decisión del usuario:** `*go` sobre el plan 0023 propuesto.
- **Alcance:** Añadir paginación server-side al listado público `/empresas`
  (`PublicCompanyController::index` + `resources/js/Pages/Public/Companies/Index.tsx`).
  **NO entra:** `show`/micrositio, categorías/servicios (vistas individuales), ni limpieza de la
  deuda de lint pre-existente del archivo (ver §5).

> Este plan documenta el corte que se ejecutó tras el `*go`.

## 1. Problema

El índice cargaba **todas** las empresas aprobadas de una sola vez
(`$query->latest()->get()->map(...)`), cada una con logo/cover desde S3 y sus `services.category`.
Sin techo: crece el payload, la memoria y el render del front. Además había orden duplicado
(`orderByDesc('associates.created_at')` **y** `->latest()`).

## 2. Backend — `PublicCompanyController::index`

- Nuevo `$perPage = 12;` (encaja con la grilla de 3 columnas).
- `->latest()->get()->map(...)` → `->paginate($perPage)->withQueryString()->through(...)`:
  - `through()` mapea preservando la estructura del paginador (patrón de `ServiceController`).
  - `withQueryString()` conserva `search`/`category_id`/`service_id` al cambiar de página.
  - Se retira el `->latest()` redundante; el orden lo mantiene el `orderByDesc` de la query.
- El prop `associates` pasa de array plano a paginador (`data`, `current_page`, `last_page`,
  `from`, `to`, `total`, `links`…), serializado por Inertia.

## 3. Frontend — `Public/Companies/Index.tsx`

- Tipo `associates: Paginator<Associate>`; render con `associates.data`.
- Control de paginación **inline**, a juego con la paleta propia de la superficie pública
  (naranja/slate, `rounded-xl`) — **sin componente base nuevo** (Regla 10 / no-preemptive). No se
  usa `@/Components/base/Pagination` porque esta página no sigue el design system del panel.
- `goToPage(page)` navega con `router.get({ ...filters, page }, { preserveScroll, preserveState })`.
- Ventana de páginas `[1 … 4 5 6 … N]` vía helper `getPageWindow`; botones Anterior/Siguiente con
  estado disabled en los bordes; contador «Mostrando X–Y de Z empresas».
- Al cambiar un filtro se navega sin `page` → vuelve a la página 1 (lógica de filtros intacta).

## 4. Gates

- **Pint** (PHP): pass.
- **tsc --noEmit**: sin errores en el archivo tocado.
- **ESLint**: el código nuevo de paginación queda limpio.

## 5. Fuera de alcance / deuda pre-existente

Se limpiaron (a pedido del usuario) los 3 × `target="_blank"` sin `rel="noreferrer"` de las tarjetas
y el `sliders: any[]` → `GalleryItem[]` (tipo exportado desde `HeroGallery`, fuente única).
ESLint del archivo queda en **0 errores**. Quedan solo warnings pre-existentes
`react-hooks/exhaustive-deps` (effects de búsqueda + uno propio de `HeroGallery`), fuera de alcance.

## 6. Pendiente relacionado

Guardrail de UX en la aprobación admin (deshabilitar botón tras submit) — queda para otro corte.
