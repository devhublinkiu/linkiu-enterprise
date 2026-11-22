# Plan de actualización — Perfil: migas, títulos y confirmación

- **Estado:** Implementado (gates verdes) — sin commit.
- **Fecha:** 2026-11-22
- **Alcance:** menores del Perfil (12): (D) migas con "Mi perfil"; (E) títulos repetidos; (F) confirmación
  con toast.

> Ejecutado tras `*go`. Alcance acotado: no se reescriben los Partials al design system (colores crudos
> y componentes legacy) — eso es otro corte.

---

## Cortes

### D — Migas de páginas del menú de usuario
- [x] `breadcrumbs.ts`: helper `offNavBreadcrumbs` para rutas que viven en el menú de usuario del topbar
  (no en el sidebar). `/profile` → "Mi perfil". `AppLayout` lo usa cuando no hay tramo de sidebar.

### E — Títulos repetidos
- [x] `Edit.tsx` ya titula cada tarjeta; se quitan los `<h2>` internos duplicados de los tres Partials
  (`UpdateProfileInformationForm`, `UpdatePasswordForm`, `DeleteUserForm`), conservando su descripción.

### F — Confirmación con toast
- [x] Perfil y contraseña confirman con `toast.success` (sonner, como el resto de la app) en `onSuccess`;
  se quita el texto inline `recentlySuccessful`. El `status` del servidor queda para
  `verification-link-sent`.

## Pruebas

- `Breadcrumbs.test.tsx`: `offNavBreadcrumbs('/profile')` = `[{label:'Mi perfil'}]`; vacío para otras rutas.

## Aprobación

- [x] Plan revisado · `*go` recibido → implementado
