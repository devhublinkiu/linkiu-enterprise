# Plan de actualización — Integraciones (Bold) + retiro del legado de solicitudes

- **Estado:** Borrador
- **Fecha:** 2026-09-14
- **Alcance:** (1) **Integraciones**: una ubicación admin para **Bold** (pasarela de pago en línea);
  (2) **retiro del legado `payment_requests`**: la superficie admin legacy (páginas, rutas, controlador
  y eventos) que quedó sin uso tras el motor unificado (ADR-0001) y sin entrada de menú (plan 0018).
  **NO entra** (queda como paso manual gated): el **borrado físico** de la tabla `payment_requests` en
  producción, que solo debe correrse **después** de ejecutar y verificar `billing:backfill-payment-requests`.

> Este plan no se ejecuta hasta `#go`. Tiene **dos decisiones abiertas** (§8) que deben resolverse
> antes de tocar código, por tratarse de **secretos de pasarela** y de **datos históricos**.

---

## 1. Componentes *(primer punto, obligatorio)*

Todo de `base/`; **cero componentes nuevos**.

| Componente | Rol | Estado | Acción |
| --- | --- | --- | --- |
| **Card** | pantalla de Integraciones (estado/llaves de Bold) | ✅ base/ | Reutilizar |
| **Badge** | estado de conexión (activo / sin configurar / sandbox) | ✅ base/ | Reutilizar |
| **Field / Input / Switch** | (solo si las llaves se editan en admin) formulario de credenciales | ✅ base/ | Reutilizar |
| **Alert** | avisos y guía de configuración | ✅ base/ | Reutilizar |
| **Button** | guardar / probar conexión | ✅ base/ | Reutilizar |

- **Reemplazar / retirar:** `Admin/PaymentRequests/Index.tsx` + `Show.tsx` (legacy `ui/*`) → **se borran**
  (no se migran). Sus rutas y controlador se retiran.
- **Nuevo:** ninguno.

## 2. Documentación *(segundo punto, obligatorio)*

- [ ] Este plan (`0019-integraciones-bold-y-limpieza-legacy.md`).
- [ ] `README.md` de actualizaciones — fila 0019.
- [ ] **ADR** — solo si la decisión de Integraciones es "llaves en BD" (nuevo store de settings cifrado):
      documentar el almacenamiento y el manejo de secretos. Si es "env + estado", basta una nota.
- [ ] Actualizar el "Pendiente" de **ADR-0001** (retiro de `payment_requests`): marcar la superficie
      retirada y dejar el borrado físico como paso manual post-backfill.

## 3. Flujo actual *(obligatorio, antes de proponer cambios)*

- **Bold**: `App\Services\Bold\BoldGateway` lee TODO de `config('services.bold.*')`, que a su vez lee de
  `.env` (`BOLD_API_KEY`, `BOLD_SECRET_KEY`, `BOLD_WEBHOOK_SECRET`, script_url, eventos). `isEnabled()` =
  hay `api_key` + `secret_key`. No existe ninguna pantalla admin ni store en BD: configurar Bold hoy es
  editar `.env`. El webhook (`POST /webhooks/bold`) verifica firma e idempotencia (intacto, no se toca).
- **`payment_requests` (legacy)**: tabla + modelo `PaymentRequest`; admin `PaymentRequestController`
  (index/show/approve/reject) con rutas en `routes/admin.php` y páginas `Admin/PaymentRequests/*` (aún
  accesibles por URL; sin entrada de menú desde 0018); eventos `PaymentRequestSubmitted/Reviewed`. El
  **asociado ya no la usa** (retirado en 0017) y el motor unificado no la escribe (ADR-0001). Existe
  `billing:backfill-payment-requests` (idempotente, `--dry-run`, **no borra**) que traslada el histórico a
  `invoices` + `payments`.
- **Dependencia sensible**: el comando de backfill usa el modelo `PaymentRequest`; por eso el modelo y la
  tabla deben sobrevivir hasta que el backfill se haya corrido y verificado en producción.
- **Resultado esperado**: Bold tiene su lugar en admin (Integraciones) y la superficie legacy de
  solicitudes desaparece de la aplicación, sin perder el histórico ni romper el backfill.

## 4. Revisión de accesibilidad

- Integraciones: estado por **texto + color** (Badge), formulario (si aplica) con `Field`/`Label` y errores
  accesibles; el secreto nunca se muestra completo (enmascarado).

## 5. Revisión de seguridad

- **Secretos de pasarela** (decisión §8-1). Si se editan en admin: guardarlos **cifrados** (cast
  `encrypted`), **no** devolver el secreto completo al frontend (mostrar "configurado" / últimos dígitos),
  solo `superadmin`, y auditar el cambio. Si se quedan en `.env`: cero secretos en BD (más seguro), pero
  editarlos sigue siendo tarea de ops.
- **Borrado destructivo** (decisión §8-2). El drop físico de `payment_requests` **no** va en una migración
  automática de este plan: se hace a mano tras `billing:backfill-payment-requests` verificado, para no
  perder histórico en un despliegue. Retirar la **UI/rutas** legacy no toca datos.
- Todo bajo middleware `admin`/`superadmin` (ADR-0006). El webhook de Bold no cambia.

## 6. Revisión funcional

- **Integraciones (Bold).** Nueva ruta admin `admin/integraciones` (o `admin/integrations`) + entrada de
  menú. Muestra el estado de Bold (activo / sin configurar), moneda y eventos, y guía. La edición de llaves
  depende de §8-1.
- **Retiro de solicitudes legacy.** Se borran `Admin/PaymentRequests/Index.tsx` y `Show.tsx`, el
  `PaymentRequestController` y sus 4 rutas; se retiran los eventos `PaymentRequest*` si nada más los usa.
  Se **conservan** el modelo `PaymentRequest`, la tabla y el comando de backfill hasta el drop manual.
- **Borrado físico (fuera de este plan, paso manual documentado):** correr
  `php artisan billing:backfill-payment-requests --dry-run`, revisar, correrlo en firme, verificar, y solo
  entonces una migración `drop` de `payment_requests` + retiro del modelo y del comando.
- **Casos límite:** `isEnabled()` sigue gobernando que el pago en línea aparezca solo si Bold está
  configurado; retirar las rutas legacy no rompe ninguna ruta viva (nada enlaza a `payment-requests.*` tras
  0018 — verificar en el corte).

## 7. Plan de actualización (cortes) — depende de §8

- **19-A · Integraciones (Bold). ✅** Migración `bold_settings` (secretos con cast `encrypted`) + modelo
  `BoldSetting`; `BoldGateway` resuelve llaves de BD con fallback a `config`/`.env` y respeta `is_active`.
  `Admin\IntegrationController` (index/updateBold), rutas `admin.integrations.*`, entrada de menú
  pantalla `Admin/Integrations/Index` en `base/` (el secreto nunca vuelve al front). **Acceso a nivel admin**
  (como el resto de Finanzas). En el menú es **Integraciones ▸ Bold** (grupo con sub-ítems, para futuras
  pasarelas). La pantalla tiene **pestañas Pruebas/Producción**, cada una con sus llaves (`bold_settings`
  guarda ambos juegos cifrados; `environment` marca el activo), muestra la **URL del webhook** (solo
  lectura, para pegar en Bold) y el secreto de webhook opcional. `BoldGateway` resuelve las llaves del
  entorno activo con fallback a `.env`. **Pest** `BoldIntegrationTest` (4) + **Vitest** `AdminIntegrations` (2).
- **19-B · Retiro de la superficie legacy de solicitudes. ✅** Borradas páginas `Admin/PaymentRequests/*`,
  `PaymentRequestController`, rutas `payment-requests.*` y eventos `PaymentRequest{Submitted,Reviewed}`
  (huérfanos en PHP; sus entradas de baseline retiradas). Se **conservan** modelo `PaymentRequest`, tabla y
  `billing:backfill-payment-requests`. `HandleInertiaRequests` sigue usando el modelo (intacto). Nota:
  `useNotifications.ts` aún escucha esos nombres de evento por string (quedan inertes; su unificación es el
  esfuerzo aparte de la rama de notificaciones).
- **(Manual, fuera de cortes) · Borrado físico** tras backfill verificado en producción. Preflight **7/7**.

**Gates:** Pint · Larastan · Pest (backend) · types:check · ESLint · Prettier · Vitest (frontend).
Recordatorio: no correr `npm run lint` (reformatea todo el árbol); usar gates escopados o el preflight.

## 8. Aprobación — **decisiones abiertas**

- [x] **Decisión 1 — Llaves de Bold: EDITABLES EN ADMIN (cifradas).** Tabla `bold_settings` (fila única)
  con `api_key`/`secret_key`/`webhook_secret` con cast `encrypted` + `is_active`; `BoldGateway` resuelve de
  BD con fallback a `config`/`.env` (compatibilidad). La pantalla nunca devuelve el secreto completo (solo
  "configurado"); solo `superadmin`.
- [x] **Decisión 2 — `payment_requests`: RETIRAR SOLO UI/RUTAS (no destructivo).** Se borran páginas admin,
  rutas, controlador y eventos huérfanos; se **conservan** tabla+modelo+`billing:backfill-payment-requests`.
  El borrado físico queda como paso manual tras backfill verificado en producción.
- [x] Plan revisado.
- [x] `#go` recibido → **19-A ✅ → 19-B ✅**. Plan 0019 implementado (preflight 7/7 verde). Pendiente
  `#commit`. El borrado físico de `payment_requests` sigue siendo un paso manual post-backfill.
