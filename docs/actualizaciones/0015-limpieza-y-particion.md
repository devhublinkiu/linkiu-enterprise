# Plan de actualización — Limpieza de huérfanos + ajustes de lista + partición

- **Estado:** Hecho
- **Fecha:** 2026-09-14
- **Alcance:** Cerrar la deuda que quedó tras 0014: (1) retirar código huérfano **que no sea galería**;
  (3) borrar el mock muerto `VerificationDashboard`; (6) ajustes de la lista admin (quitar columna
  **Ubicación**, validar **NIT numérico**); (5) partir en `parts/` los archivos que exceden la regla 6.
  **NO entra:** tocar el **módulo de galería** (asociado ni sus rutas admin) — se preserva íntegro
  (caución del usuario); ni corrección de datos ya guardados (el NIT malo existente se ajusta aparte).

> Este plan no se ejecuta hasta `#go`. Solo se implementa lo aquí descrito, corte a corte.

---

## 1. Componentes *(primer punto, obligatorio)*

Sin componentes nuevos. Se **retiran** piezas muertas y se **reorganiza** código existente.

- **Retirar (huérfano, verificado sin uso ni tests):** `resources/js/Components/StatusToggle.tsx`
  (lo usaba solo el Index viejo) y `togglePublic()` + ruta `admin.associates.toggle-public` (solo en
  `ziggy.js` generado; sin llamador; reemplazado por `deactivate`/`reactivate`).
- **Retirar (mock muerto):** `resources/js/Pages/Admin/VerificationDashboard.tsx` — no lo renderiza
  ninguna ruta; superado por el `Index` + `Show` reales.
- **Retirar (gestión admin de galería, huérfana):** rutas `admin.associates.gallery.upload/delete/cover`
  + métodos `adminGalleryUpload/adminGalleryDelete/adminGalleryCover`. Se quitó la galería del auditar
  (14-C), así que su gestión/aprobación desde el admin queda sin uso y se retira.
- **Conservar (módulo de galería del asociado):** `company/gallery` (editGallery, updateGallery,
  deleteGalleryImage, setCoverImage) + logo (`uploadLogo`/`deleteLogo`) y sus rutas — **intactos**. Es la
  galería de fotos del asociado; solo salió del auditar admin, el módulo sigue vivo.

## 2. Documentación *(segundo punto, obligatorio)*

- [ ] Este plan (`0015-limpieza-y-particion.md`).
- [ ] `README.md` de actualizaciones — fila 0015.
- [ ] Sin ADR nuevo (limpieza + reorganización; ninguna decisión de arquitectura nueva).

## 3. Flujo actual *(obligatorio, antes de proponer cambios)*

- **Lista admin** (`Index`): tras 0014 muestra Empresa · NIT · **Ubicación** · Secciones · Verificada ·
  Estado · Acciones. La columna Ubicación (`city`) aporta poco y ensancha la tabla.
- **NIT**: se valida en `saveBasicInfoDraft`/`updateBasicInfo` como
  `string|max:30|unique` — **sin formato**, por eso hay registros con un **nombre** en el NIT.
- **Huérfanos**: `StatusToggle` y `togglePublic` quedaron sin uso al reconstruir el Index (0014);
  `VerificationDashboard` nunca tuvo ruta.
- **Regla 6 (aviso de preflight):** exceden 250 líneas: `AssociateController.php` (1536),
  `routes/web.php` (412), `Show.tsx` (402), `Index.tsx` (396), y los tabs admin
  `TabDocumentation` (415), `TabContacts` (393), `TabCharacterization` (380), `TabBasicInfo` (297).

## 4. Revisión de accesibilidad

- Quitar Ubicación no afecta a11y (menos columnas, tabla más legible). El error de NIT se muestra con
  `FieldError` (`role="alert"`) en el form de Información Básica.

## 5. Revisión de seguridad

- Retirar `togglePublic` reduce superficie (una ruta admin menos, ya redundante).
- **NIT numérico**: la validación es autoritativa al servidor (`BasicInfo`); el front asiste. Se conserva
  `unique`. No se corrige data existente automáticamente (se listará para ajuste manual).

## 6. Revisión funcional

- **Debe seguir igual:** todo el flujo de asociados/admin; la galería (módulo + rutas admin) intacta;
  `is_public` gobernado por suscripción + `deactivate`/`reactivate`.
- **Cambia:**
  - **Lista:** fuera la columna **Ubicación**. (El buscador sigue por nombre/NIT.)
  - **NIT:** validación **numérica con formato** (dígitos, puntos y guion; ej. `900123456-7`):
    `regex:/^[0-9.\-]+$/` en draft (nullable) y envío (required). Bloquea nombres; permite el formato
    colombiano habitual. Mensaje en español.
  - **Limpieza:** se borran `StatusToggle.tsx`, `VerificationDashboard.tsx`, `togglePublic()` + ruta, y
    la **gestión admin de galería** (`adminGallery*` + rutas `associates.gallery.*`). El **módulo de
    galería del asociado** queda intacto.
  - **Partición (regla 6):** ver cortes; se conserva el comportamiento (solo se mueve código).
- **Casos límite con pruebas:** `updateBasicInfo` rechaza un NIT no numérico (nombre) y acepta
  `900123456-7`; la lista responde sin la columna. La partición no cambia contratos (los tests existentes
  siguen verdes).

## 7. Plan de actualización (cortes)

- **15-A · Limpieza + lista + NIT (rápido, bajo riesgo).** ✅ Borrados `StatusToggle.tsx`,
  `VerificationDashboard.tsx`, `togglePublic()` + ruta `toggle-public`, y la **gestión admin de galería**
  (`adminGalleryUpload/Delete/Cover` + rutas `associates.gallery.*`) — el módulo de galería del asociado
  intacto. Quitada la columna **Ubicación** del `Index` (front + `city` del select/mapping/tipo).
  Validación **NIT numérico** (`regex:/^[0-9.\-]+$/`, mensaje ES) en Información Básica (draft + envío).
  **Pest**: NIT no numérico rechazado / `900.123.456-7` aceptado. Gates: Pint ✅ · Larastan `[OK]` ✅ ·
  Pest **125/125** ✅ · tsc ✅ · ESLint ✅ · Prettier ✅ · Vitest **92/92** ✅.
- **15-B · Partición de archivos grandes (regla 6).** ✅ **Backend:** extraídos los métodos admin de
  asociados (`index`, `filterByEstado`, `show`, `auditSection`, `approve`, `toggleVerified`,
  `deactivate`, `reactivate`) a **`Admin\AssociateReviewController`**; los helpers de archivos/catálogo
  (`appendFileUrls`, `documentCatalog`, `documentSpecsByKey`) a un **trait** `InteractsWithAssociateFiles`
  usado por ambos controladores. Grupo admin movido a **`routes/admin.php`** (cargado desde `web.php`);
  nombres de ruta idénticos → front y tests intactos. Resultado: `AssociateController` 1536→~1030,
  `web.php` 412→260. Baseline de Larastan **regenerado** (falsos positivos de relaciones sin tipar
  reubicados al nuevo controlador; refactor verbatim, sin bug nuevo). **Frontend:** no se dividieron los
  tabs (son vistas de solo-lectura cohesivas; el valor era bajo frente al churn) — queda como opción
  futura, igual que partir `AssociateController` por sección. Gates: Pint ✅ · Larastan `[OK]` ✅ · Pest
  **125/125** ✅ · types:check ✅ · ESLint ✅ · Prettier ✅ · Vitest **92/92** ✅.

**Gates a ejecutar:** PHP — Pint · Larastan · Pest · Frontend — types:check · ESLint · Prettier · Vitest.

## 8. Aprobación

- [x] Decisión: se conserva el **módulo de galería del asociado**; se retira solo la **gestión admin**
      (auditar + aprobación), ya sin UI tras 14-C.
- [x] Decisión: `VerificationDashboard` es mock muerto → se borra.
- [x] Decisión: 15-B con la partición recomendada (controlador admin + `routes/admin.php` + sub-parts).
- [x] Decisión: NIT existente malo se corrige **manual**; la validación frena los nuevos.
- [x] Plan revisado y aprobado.
- [x] `#go` recibido → **15-A ✅ → 15-B ✅**. Plan 0015 implementado.

## Decisiones cerradas

1. **Solo huérfanos no-galería.** Se retiran `StatusToggle`, `togglePublic`/`toggle-public` y el mock
   `VerificationDashboard`. La galería queda intacta.
2. **NIT numérico** validado al servidor en Información Básica (no se corrige data existente aquí).
3. **Ubicación fuera** de la lista admin.
4. **Partición** conserva comportamiento (solo mueve código); su alcance exacto se confirma en 15-B.
