# Plan de actualización — Admin · Finanzas (Pagos, Facturación, Datos bancarios) + menú

- **Estado:** Borrador
- **Fecha:** 2026-09-14
- **Alcance:** Modernizar a `base/` las tres pantallas admin de **Finanzas**: **Pagos**
  (`Admin/Payments/Index`), **Facturación** (`Admin/Invoices/Index`) y **Datos bancarios**
  (`Admin/BankAccounts/Index` + `Form`). Además, **limpiar el menú**: retirar la entrada
  "Solicitudes (histórico)" (`payment-requests`), que es legacy. **NO entra:** el motor de cobro
  (solo se **consume**; `PaymentService`, `BillingService` intactos), la pantalla de **Integraciones**
  (Bold) ni el **borrado** de `payment_requests` (tabla + páginas + rutas) → van en **0019**.

> Este plan no se ejecuta hasta `#go`. Solo se implementa lo aquí descrito, corte a corte.

---

## 1. Componentes *(primer punto, obligatorio)*

Las tres pantallas están en idioma **legacy** (`@/Components/ui/*`, `<table>` cruda, `confirm()`,
modales a mano con `fixed inset-0`, `slate-*`). Todo sale de `base/`; **cero componentes nuevos**
(inventario verificado).

| Componente | Rol | Estado | Acción |
| --- | --- | --- | --- |
| **Table** (familia) | listas de pagos y facturas (reemplaza `<table>` cruda) | ✅ base/ | Reutilizar |
| **Select** | filtro de estado de pagos (reemplaza los tabs-Link) | ✅ base/ | Reutilizar |
| **Dialog** | rechazar pago, registrar pago manual, crear factura, confirmar borrados (reemplaza modales a mano + `confirm()`) | ✅ base/ | Reutilizar |
| **DropdownMenu** | acciones de fila en texto (aprobar/rechazar/ver, registrar/marcar/eliminar) | ✅ base/ | Reutilizar |
| **Badge** | estado del pago/factura, medio, "vigencia aplicada" | ✅ base/ | Reutilizar |
| **Switch** | activar/desactivar cuenta bancaria | ✅ base/ | Reutilizar |
| **Field / Input / Textarea / Select** | formularios (nueva factura, registrar pago, cuenta bancaria) | ✅ base/ | Reutilizar |
| **Card** | tarjetas de datos bancarios y contenedores | ✅ base/ | Reutilizar |
| **Alert** | flash y avisos | ✅ base/ | Reutilizar |
| **Button** | acciones | ✅ base/ | Reutilizar |

- **Reutilizar:** `Table*`, `Select`, `Dialog*`, `DropdownMenu*`, `Badge`, `Switch`,
  `Field`/`Input`/`Textarea`, `Card*`, `Alert*`, `Button`. Iconos `lucide-react`.
- **Reemplazar / retirar:** `ui/*`, `<table>` cruda, `confirm()`, modales `fixed inset-0` a mano y
  colores crudos → `base/` + tokens. Sin trazos superiores decorativos (consistencia con `Card`).
- **Nuevo:** ninguno.

## 2. Documentación *(segundo punto, obligatorio)*

- [ ] Este plan (`0018-admin-finanzas.md`).
- [ ] `README.md` de actualizaciones — fila 0018.
- [ ] Sin ADR nuevo (el motor ya está en ADR-0001; aquí solo se moderniza la UI que lo opera).
- [ ] `orden-componentes.md` — **sin cambios** (no se crea ningún componente).

## 3. Flujo actual *(obligatorio, antes de proponer cambios)*

- **Pagos** (`GET admin/payments`, `Admin\PaymentController@index`): bandeja de todos los pagos con
  filtro `?estado=` (pendiente/aprobado/rechazado/todos) por tabs-Link; acciones **aprobar**
  (`confirm()` + `router.patch`) y **rechazar** (modal a mano con motivo → `payments.reject`); enlace a
  facturación; ver comprobante. Bold pendiente se muestra como "esperando pasarela".
- **Facturación** (`GET admin/invoices`, `Admin\InvoiceController@index`): lista de facturas/cuentas de
  cobro; **crear** (form colapsable → `invoices.store`, `forceFormData`); **registrar pago manual**
  (riel 3, modal → `invoices.register-payment`); **marcar pagada** sin detalle (`invoices.mark-paid`);
  **eliminar** (`invoices.destroy`, `confirm()`).
- **Datos bancarios** (`GET admin/bank-accounts`, `Admin\BankAccountController`): lista en tarjetas;
  crear/editar (`Form`), eliminar (`confirm()`), `is_active`/`order`.
- **Menú** (`nav-items.ts`): grupo **Finanzas** = Datos bancarios · Pagos (con contador de pendientes) ·
  Facturación · **Solicitudes (histórico)**.
- **Estados/validaciones/seguridad:** todo bajo middleware `admin` (ADR-0006); el rechazo exige
  `admin_notes`; el registro manual valida medio/fecha (`before_or_equal:today`). El motor aplica la
  vigencia; la UI solo dispara acciones.
- **Resultado esperado:** las tres pantallas operan igual, en `base/`, y el menú deja de ofrecer el
  histórico legacy.

## 4. Revisión de accesibilidad

- Tablas con semántica nativa (`base/Table`), acciones con `aria-label`/texto (DropdownMenu), estado por
  **texto + color** (Badge).
- Filtro de estado con `Select` etiquetado (reemplaza tabs).
- `Dialog` con foco atrapado, `Esc` y título asociado (reemplaza `confirm()` y modales a mano);
  formularios con `Field`/`Label` y errores accesibles.

## 5. Revisión de seguridad

- Sin cambios de autorización (todo bajo `admin`, ADR-0006).
- Las acciones que mueven dinero/vigencia (aprobar, registrar, marcar pagada) siguen pasando por el
  servidor (`PaymentService`/`BillingService`); la UI no calcula montos ni estados.
- Rechazo con motivo obligatorio (server), registro manual con validación de fecha; sin exposición nueva.
- Retirar la entrada de menú **no** borra rutas ni datos (eso es 0019): el histórico sigue accesible por
  URL hasta su borrado.

## 6. Revisión funcional

- **Pagos.** Una sola `Table` con filtro por estado en `Select` (reemplaza tabs), columnas Asociado ·
  Concepto · Medio · Monto · Estado (+ "vigencia aplicada"/nota) · Enviado; acciones en `DropdownMenu`
  de texto: **Aprobar** (Dialog de confirmación en vez de `confirm()`), **Rechazar** (Dialog con motivo),
  **Ver comprobante**, **Ver en facturación**. Bold pendiente: indicador "esperando pasarela".
- **Facturación.** `Table` de facturas; **Nueva factura** en `Dialog` (asociado, tipo, ciclo si es
  cuenta de cobro, período, valor, documento, enlace, notas); **Registrar pago** en `Dialog` (medio,
  fecha, referencia, notas); **Marcar pagada** y **Eliminar** con `Dialog` de confirmación.
- **Datos bancarios.** Lista en `Card`s a `base/` (sin trazo superior; el color de la cuenta, si se
  conserva, como acento discreto, no barra), `Switch` de `is_active`, crear/editar en `Form` `base/`,
  eliminar con `Dialog`.
- **Menú.** Se retira "Solicitudes (histórico)" del grupo Finanzas en `nav-items.ts`. El resto del grupo
  queda: Datos bancarios · Pagos (contador) · Facturación.
- **Se conserva igual:** todas las acciones del motor (aprobar/rechazar/registrar/marcar/eliminar), el
  filtro por estado de pagos, el contador de pendientes del menú.
- **Casos límite:** sin backend nuevo; se prueban en **Vitest** (render de cada pantalla en `base/`:
  filtro de pagos, apertura de diálogos de rechazo/registro/crear, estado vacío).

## 7. Plan de actualización (cortes)

- **18-A · Pagos (`Admin/Payments/Index`) a `base/` + limpieza de menú. ✅** `Table` + `Select` de estado
  + `DropdownMenu` de acciones + `Dialog` de aprobar/rechazar; retirada "Solicitudes (histórico)" de
  `nav-items.ts`. **Vitest** `AdminPayments.test.tsx` (2). Gates verdes.
- **18-B · Facturación (`Admin/Invoices/Index`) a `base/`. ✅** `Table` + `Dialog` de nueva factura +
  `Dialog` de registrar pago + confirmación de eliminar (Dialog) + marcar pagada (DropdownMenu). **Vitest**
  `AdminInvoices.test.tsx` (2). Gates verdes.
- **18-C · Datos bancarios (`Admin/BankAccounts/Index` + `Form`) a `base/`. ✅** Lista en `Card` (ícono con
  color de la cuenta, sin trazo) + `Dialog` de borrado; `Form` con `Field`/`Select`/`Switch`. **Vitest**
  `AdminBankAccounts.test.tsx` (3). Preflight final **7/7 en verde**.

**Gates a ejecutar:** **Frontend** — types:check · ESLint · Prettier · Vitest (los tres cortes). No hay
cambios de PHP previstos; si alguno surge, se añaden Pint · Larastan · Pest. Preflight completo antes de
`#commit`. Recordatorio: **no** correr `npm run lint` (reformatea todo el árbol); usar `npx
eslint`/`prettier --check` escopado o el preflight.

## 8. Aprobación

- [x] Decisión: **retirar del menú** "Solicitudes (histórico)"; su borrado real (tabla + páginas + rutas)
      va en 0019.
- [x] Decisión: acciones de fila en **texto** (DropdownMenu) y confirmaciones con **Dialog** (sin `confirm()`).
- [x] Decisión: **sin trazos superiores** en tarjetas (consistencia con `Card` de `base/`).
- [x] Plan revisado.
- [x] `#go` recibido → **18-A ✅ → 18-B ✅ → 18-C ✅**. Plan 0018 implementado (preflight 7/7 verde). Pendiente `#commit`.
