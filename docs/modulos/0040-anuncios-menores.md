# Plan de actualización — Anuncios: vencidos, exclusivo, candado y descarga

- **Estado:** Implementado (gates verdes) — sin commit.
- **Fecha:** 2026-11-22
- **Alcance:** menores de Anuncios (09): (1) ocultar vencidos; (2) bloque exclusivo solo en
  members_only; (3) candado del menú por plan; (4) descarga por feature del módulo.

> Ejecutado tras `*go`. Decisión: la descarga se gatea por `feature:bienes_servicios` (el feature que
> se sembró de la columna `can_download_tenders`), no por `anuncios` (que ya lo exige el middleware y
> dejaría la descarga sin tope).

---

## Cortes

### 1 — Vencidos fuera de la vista del asociado
- [x] Scope `Announcement::scopeNotExpired` (sin `expires_at` o futura). Aplicado al `index` y al `show`
  del asociado (un vencido ni se lista ni se abre → 404). El admin no se toca.

### 2 — "Información exclusiva" solo en members_only
- [x] `Associate/Announcements/Show.tsx`: el aviso se pinta solo si `visibility === 'members_only'`.

### 3 — Candado del menú por plan
- [x] `anunciosLocked = plan_features.anuncios === false` (`AppSidebar`, `nav-items.ts`, call de
  `AppLayout`), espejo de `bienesServiciosLocked`. El servidor es la autoridad (`feature:anuncios`).

### 4 — Descarga por el feature del módulo
- [x] `AnnouncementController@show`: `can_download = $plan->allows('bienes_servicios')` en vez de la
  columna legacy `can_download_tenders`. Mismo valor por plan + kill-switch global; fuera el antipatrón
  ADR-0002.

## Pruebas

- `tests/Feature/AssociateAnnouncementTest.php`: vencido no se lista ni abre (404); con el módulo en el
  plan descarga, sin él queda bloqueado (url null, is_locked true).
- `SidebarNavItems.test.ts`: "Anuncios y Licitaciones" se bloquea con `anunciosLocked`.

## Aprobación

- [x] Plan revisado · `*go` recibido → implementado
