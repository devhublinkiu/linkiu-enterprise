# Plan de actualización — Micrositio: página amigable para empresas no aprobadas

- **Estado:** Implementado (gates verdes) — sin commit.
- **Fecha:** 2026-11-22
- **Alcance:** menor del micrositio (01/21): "Ver mi página · borrador" daba 404 crudo a una empresa en
  pending/verified.

> Ejecutado tras `*go`.

---

## ¿Cómo estaba?

`renderVisible()` ya tenía la página "no publicada" y la vista previa del dueño, pero `show()` y
`showBySlug()` filtraban `status='approved'` con `findOrFail`/`firstOrFail` **antes** de llegar ahí: una
empresa en pending/verified daba un 404 crudo.

## ¿Qué se hizo?

Quitar el filtro de estado del lookup y exigirlo en `renderVisible()` para la versión pública.

## ¿Qué se espera?

El dueño en afiliación que entra a "Ver mi página" ve la página amigable "no publicada", no un 404. La
invariante de que solo una empresa aprobada+publicada sale pública se mantiene.

---

## Cortes

### 2 — Lookup sin estado, visibilidad en renderVisible
- [x] `show`/`showBySlug`: buscar por id/slug sin `status='approved'`; `renderVisible()` decide.
- [x] `renderVisible()`: `$live` exige `status==='approved'` (además de `is_public` +
  `microsite_published`). Pending/verified → página "no publicada" (solo expone el nombre).

## Pruebas

- `MicrositeTest`: empresa en pending (por slug y por id) muestra `Public/Companies/Unpublished` en vez
  de 404; lo ya verde (borrador aprobado, vista previa del dueño, slug inexistente → 404, directorio)
  sigue igual.

## Aprobación

- [x] Plan revisado · `*go` recibido → implementado
