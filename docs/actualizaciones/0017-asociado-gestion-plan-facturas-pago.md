# Plan de actualización — Asociado · Gestión del Plan + Mis Facturas + Pago

- **Estado:** Borrador
- **Fecha:** 2026-09-14
- **Alcance:** Modernizar a `base/` las **cuatro pantallas del asociado** del área de facturación:
  **Gestión del Plan** (`Billing/Index`), **Mis Facturas** (`Invoices/Index`), **Pago de una cuenta**
  (`Invoices/Pay`, transferencia + comprobante) y **Pago en línea** (`Invoices/PayOnline`, Bold).
  Incluye alinear el **panel del plan** con el catálogo real de módulos (post-0016) y **retirar del lado
  asociado** los restos de `payment_requests` (banners + consulta en `AssociateController::billing()`).
  **NO entra:** el motor de cobro (solo se **lee**), la lógica de la pasarela (`BoldGateway`, se conserva
  intacta la inyección del script), el **borrado** de la tabla/modelo `payment_requests` (va en 0019), ni
  la reorganización del menú admin (0018).

> Este plan no se ejecuta hasta `#go`. Solo se implementa lo aquí descrito, corte a corte.

---

## 1. Componentes *(primer punto, obligatorio)*

Las cuatro pantallas están en idioma **legacy** (`@/Components/ui/*`, `slate-*`, `uppercase font-black`).
Todo sale de `base/`; **cero componentes nuevos** (verificado: el inventario cubre todo).

| Componente | Rol | Estado | Acción |
| --- | --- | --- | --- |
| **Card** (familia) | plan actual, planes disponibles, facturas, cuentas bancarias, resumen del cobro | ✅ base/ | Reutilizar |
| **Badge** | estado de suscripción, tipo de factura, estado pagada/pendiente, módulos y *Pronto* | ✅ base/ | Reutilizar |
| **Alert** | avisos (vencida/gracia, comprobante en revisión, intento rechazado, pago en línea no disponible) | ✅ base/ | Reutilizar |
| **Progress** | barras de uso (servicios / galería) sobre el límite del plan | ✅ base/ | Reutilizar |
| **Button** | acciones (pagar, renovar, subir comprobante, pagar en línea, volver) | ✅ base/ | Reutilizar |
| **Input / Textarea / Field** | nota del comprobante | ✅ base/ | Reutilizar |
| dropzone de comprobante | `<label>` + `<input type=file>` con tokens (patrón propio, sin componente) | — | Reutilizar patrón |

- **Reutilizar:** `Card*`, `Badge`, `Alert*`, `Progress`, `Button`, `Input`, `Textarea`, `Field`. Iconos
  `lucide-react`.
- **Reemplazar / retirar:** en las 4 pantallas, `ui/*` + colores crudos → `base/` + tokens de `design.md`.
  En `Billing/Index`, **retirar** los banners de `payment_requests` y el display de **banderas muertas**
  del plan (se pasa a **módulos reales**).
- **Nuevo:** ninguno.

## 2. Documentación *(segundo punto, obligatorio)*

- [ ] Este plan (`0017-asociado-gestion-plan-facturas-pago.md`).
- [ ] `README.md` de actualizaciones — fila 0017.
- [ ] Sin ADR nuevo: el modelo ya está en ADR-0001 (motor de cobro) y ADR-0008 (alta). Solo se **consume**.
- [ ] `orden-componentes.md` — **sin cambios** (no se crea ningún componente).

## 3. Flujo actual *(obligatorio, antes de proponer cambios)*

- **Gestión del Plan** (`GET my-company/billing`, `AssociateController@billing`): calcula
  `subscriptionStatus` (none/active/grace/expired) y `daysRemaining`; consulta **`payment_requests`**
  (tabla congelada) para pintar banners "Solicitud en revisión / rechazada"; emite factura de
  **reactivación** si el vencido no tiene nada pendiente; pasa `currentPlan` + `availablePlans` (modelos
  crudos) → `Billing/Index` muestra el plan con **banderas legacy** (`has_priority_directory`,
  `has_job_board`, `has_priority_support`…) y barras de uso con `limit_services`/`limit_gallery`.
- **Mis Facturas** (`GET mis-facturas`, `Associate\InvoiceController@index`): lista facturas/cuentas de
  cobro; marca todas como leídas; botón **Pagar** por factura pendiente.
- **Pago** (`GET my-company/facturas/{invoice}/pagar`, `InvoicePaymentController@show`): resumen del cobro,
  **pago en línea** (si `BoldGateway::isEnabled`), **transferencia** (cuentas + subir comprobante →
  `submitProof`), estados **comprobante en revisión** (`pendingReview`) e **intento rechazado**
  (`lastRejected`).
- **Pago en línea** (`InvoicePaymentController@online`): inyecta el script de Bold con los `data-bold-*`
  (`BoldGateway::checkoutAttributes`); al terminar redirige a facturación.
- **Estados/validaciones:** rutas **siempre accesibles** aunque esté vencido (ADR-0001); comprobante
  `jpg/png/pdf ≤ 5 MB`; el vencido oculto se re-publica al aplicarse el pago (`SubscriptionService`).
- **Dependencias:** `AssociateController`, `Associate\InvoiceController`, `InvoicePaymentController`,
  `BillingService`, `SubscriptionService`, `BoldGateway`, `Plan`, `Feature`, `Invoice`, `Payment`,
  `BankAccount`.
- **Resultado esperado:** el asociado ve su plan (con **módulos reales**), lo que debe pagar y cómo, y su
  historial; sin restos de `payment_requests`.

## 4. Revisión de accesibilidad

- Estado de suscripción y de factura por **texto + color** (Badge/Alert), no solo color; el `color_hex`
  del plan es decorativo.
- Barras de uso con `Progress` etiquetado (texto "N de M" además de la barra).
- Dropzone del comprobante: `<label>` asociada a `input[type=file]`, foco visible, texto del archivo
  seleccionado; error accesible.
- Botones con `aria-label` donde el texto no basta (volver, etc.).
- El botón de la pasarela lo dibuja Bold; se mantiene el fallback textual si el script no carga.

## 5. Revisión de seguridad

- Sin cambios de autorización: las rutas de facturación/pago **nunca se bloquean** (ADR-0001);
  `InvoicePaymentController::authorizeInvoice` sigue restringiendo cada factura a su asociado.
- El **monto** y el estado los decide el servidor; el front solo muestra. No se confía en el cliente.
- La inyección del script de Bold y sus `data-*` **no cambian** (contrato de la pasarela); solo se
  reestiliza el contenedor.
- Comprobantes fuera del disco público (ya vigente); validación de archivo intacta.

## 6. Revisión funcional

- **Panel del plan con módulos reales.** `AssociateController@billing` pasa a resolver los **módulos del
  catálogo** para `currentPlan` y `availablePlans` (igual criterio que `PlanController@index`: `enabled` +
  `coming_soon` por `is_enabled`), y a exponer los **límites** de servicios/galería resueltos para las
  barras de uso. Se retira del display el uso de las banderas booleanas muertas.
- **Retiro de `payment_requests` (lado asociado).** Se elimina de `billing()` la consulta a
  `PaymentRequest` y el prop `paymentRequest`; `Billing/Index` deja de pintar los banners de
  "Solicitud en revisión / rechazada". El estado de un pago pendiente/rechazado ya vive por factura en la
  pantalla de Pago (`pendingReview` / `lastRejected`). La **tabla y el modelo** `payment_requests` se
  conservan hasta 0019.
- **Dos superficies, roles claros (decidido).** *Gestión del Plan* = tu plan, uso y **qué pagar ahora**
  (+ planes disponibles para cambiar); *Mis Facturas* = **historial** completo. No se consolidan.
- **Se conserva igual:** cálculo de estado/gracia, emisión de reactivación, marcado de leídas, los tres
  medios de pago y el flujo Bold, el gate de "el vencido siempre puede pagar".
- **Casos límite con pruebas (Pest, backend):** `billing()` **no** incluye `paymentRequest` y **sí**
  incluye `modules` resueltos en `currentPlan`/`availablePlans`; un vencido sin pendientes sigue recibiendo
  la factura de reactivación; las barras de uso reciben el límite resuelto. (Front: Vitest de render de las
  4 pantallas en `base/`.)

## 7. Plan de actualización (cortes)

- **17-A · Backend (`billing()` payload). ✅** `AssociateController@billing` resuelve módulos del catálogo
  (helper `resolvePlanModules`) + límites (`limitFor`) para `currentPlan` y `availablePlans`; retirada la
  consulta a `PaymentRequest`, el prop `paymentRequest` y el `use` huérfano. **Pest** `AssociateBillingTest`
  (2). Baseline: +`Model::$key` (1) y +`Model::$pivot` (2) en AssociateController (falso positivo conocido).
  Gates: Pint ✅ · Larastan `[OK]` ✅ · Pest **133/133** ✅.
- **17-B · Gestión del Plan (`Billing/Index`) + Mis Facturas (`Invoices/Index`) a `base/`. ✅** Plan actual
  con módulos reales + `Progress` de uso; avisos con `Alert`; planes disponibles con módulos y cuota
  inicial; historial en `base/`. Retirados los banners de `payment_requests`. **Vitest**
  `AssociateBilling.test.tsx` (2), `AssociateInvoices.test.tsx` (2). Gates: types:check · ESLint · Prettier ·
  Vitest ✅.
- **17-C · Pago (`Invoices/Pay`) + Pago en línea (`Invoices/PayOnline`) a `base/`. ✅** Resumen del cobro,
  opciones (en línea/transferencia), dropzone del comprobante, estados revisión/rechazo/pagada; shell de la
  pasarela reestilizado **sin tocar** la inyección del script Bold. **Vitest** `InvoicePay.test.tsx` (2).
  Gates: types:check · ESLint · Prettier · Vitest ✅. Preflight final **7/7 en verde**.

**Gates a ejecutar** (proporcionales): **PHP** — Pint · Larastan · Pest (17-A) · **Frontend** —
types:check · ESLint · Prettier · Vitest (17-B/17-C). Preflight completo antes de `#commit`.
Recordatorio: **no** correr `npm run lint` (reformatea todo el árbol); usar `npx eslint`/`prettier --check`
escopado o el preflight.

## 8. Aprobación

- [x] Decisión: **dos superficies separadas** (Gestión del Plan vs Mis Facturas), solo se migra diseño.
- [x] Decisión: **retirar `payment_requests` del lado asociado** (banners + consulta); el borrado de la
      tabla/modelo queda para 0019.
- [x] Decisión: el panel del plan muestra **módulos reales** (catálogo), no banderas muertas.
- [x] Plan revisado.
- [x] `#go` recibido → **17-A ✅ → 17-B ✅ → 17-C ✅**. Plan 0017 implementado (preflight 7/7 verde). Pendiente `#commit`.
