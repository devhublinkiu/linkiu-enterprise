# Plan de actualización — Anuncios/Licitaciones: route rota, formato de contenido, fechas y compuerta de plan

- **Estado:** Implementado (gates verdes) — sin commit.
- **Fecha:** 2026-11-22
- **Alcance:** (A) route rota que dejaba Anuncios en blanco; (B) contenido del editor con formato +
  fechas en español; (C) detalle/lista de licitaciones mandan público objetivo y cierre; (E)
  Bienes y Servicios como beneficio de plan (ADR-0002) en rutas + menú.
  **NO entra:** migración a Tailwind v4 (corte aparte), gate de la descarga por plan (ruta pública
  compartida, ADR-0010), y los "menores" (abajo).

> Ejecutado tras `*go`. Decisiones: (1) sí, Bienes y Servicios respeta el interruptor de plan;
> (2) formato de contenido con CSS propio ahora, v4 como migración separada.

---

## Cortes

### A — Route rota (crítico)
- [x] `Associate/Announcements/Show.tsx`: `route('associate.billing.index')` (no existe, Ziggy
  reventaba → página en blanco) → `route('associate.company.billing')`.

### B — Formato de contenido + fechas en español
- [x] **B1:** bloque CSS `.tiptap-content, .prose` en `resources/css/app.css` (títulos, párrafos,
  viñetas, negritas, enlaces, citas, imágenes). Funciona en Anuncios, Blog, Licitación y Foro sin
  depender de `@tailwindcss/typography`.
- [x] **B2:** `->format('d M, Y')` → `->translatedFormat('d M, Y')` en `AnnouncementController`,
  `BienesServiciosController` y sus controladores públicos (meses en español).

### C — Detalle/lista de licitaciones
- [x] `BienesServiciosController::showTender` manda `publico_objetivo` (el detalle ya no dice
  siempre "Público abierto").
- [x] `::showCompany` manda `fecha_cierre` por licitación (la línea "Cierre:" ya aparece). Las
  vistas ya los renderizaban.

### E — Compuerta de plan (ADR-0002)
- [x] Rutas del asociado (`bienes-servicios.index/company/tender`): `+ feature:bienes_servicios`.
  El plan sin el módulo → redirige a facturación con aviso de mejora (igual que Anuncios/Foros).
- [x] Menú: el ítem "Bienes y Servicios" se bloquea con `plan_features.bienes_servicios` (ya
  compartido por `HandleInertiaRequests`). El servidor sigue siendo la autoridad.

## Fuera de alcance / follow-up

- **Descarga por plan:** la descarga va por la ruta **pública** `bienes-servicios.document`, gateada
  por `publico_objetivo` en `LicitacionDocumentController` (ADR-0010). Gatearla también por plan
  tocaría esa regla única; se deja anotado (el asociado sin el módulo ya no llega al botón).
- **Tailwind v4:** unificar (hoy corre v3; el paquete v4 está instalado sin conectar) — migración
  propia con riesgo transversal.
- **Menores (09/10):** anuncios vencidos en lista; "Información exclusiva…" en públicos; "despeja los
  filtros" sin filtros; migas/menú sin marcar; botón "Soporte CAMEP" sin acción; correo de nueva
  licitación ("sección de Licitaciones", usted, se manda a todo verificado); `tender_updated` sin uso.

## Pruebas

- `tests/Feature/BienesServiciosGateTest.php`: plan sin el módulo → redirige; con el módulo → entra;
  el detalle manda `publico_objetivo` y la lista `fecha_cierre`.

## Aprobación

- [x] Plan revisado · `*go` recibido → implementado
