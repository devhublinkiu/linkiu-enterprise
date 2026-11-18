# Plan de actualización — Facturación: correos + lista "Mis Facturas"

- **Estado:** Implementado (gates verdes) — sin commit.
- **Fecha:** 2026-11-18
- **Alcance:** (A) consecutivo real de factura, (B) correo de factura nueva (número, monto COP,
  tuteo), (C) aviso al asociado cuando se rechaza un comprobante, (D) lista de Mis Facturas con
  vencimiento y estado derivado. **NO entra:** motor de vigencia, flujo de aprobación, numeración
  legal/DIAN, ni desbloquear Mis Facturas al vencer (el candado se mantiene a propósito).

> Ejecutado tras `*go`. Formato del consecutivo elegido: serie por tipo y año
> (`FC-2026-0001` factura · `CC-2026-0001` cuenta de cobro).

---

## 1. Componentes

- **Reutilizar:** `Badge`, `Card`, `Button` de `@/Components/base`; componentes de correo React
  (`EmailLayout`, `EmailInfoBox`, `EmailButton`). Sin componentes nuevos.

## 2. Documentación

- [x] Este plan. Sin ADR (cambios aditivos; no altera una decisión vigente). El consecutivo es
  interno, no es numeración fiscal.

## 3. Flujo actual (antes del cambio)

- El correo `new_invoice` pintaba `$invoice->invoice_number` (**columna inexistente** → vacío),
  `number_format($amount, 2)` con `$` (formato EE.UU.) y trato de usted.
- `PaymentService::reject()` solo marcaba el pago; **no** avisaba al asociado. El mailable
  `PaymentRejected` existía pero se escribió para el modelo legacy `PaymentRequest` (`->plan->name`),
  distinto del `Payment` real que se rechaza.
- `Associate/InvoiceController@index` enviaba `due_date` pero la UI lo ignoraba, y pasaba `status`
  crudo (`pendiente`/`pagada`, minúscula) sin distinguir vencida / en revisión / rechazada.

## 4. Revisión de accesibilidad

Badges de estado con texto (no solo color); variantes existentes de `Badge`. El vencimiento vencido
usa `text-destructive` **más** el texto "Venció el …" (el color no es el único portador).

## 5. Revisión de seguridad

Sin cambios de autorización. El correo de rechazo sale solo al asociado dueño del pago. El consecutivo
se asigna en servidor. La lista sigue acotada por `associate_id`.

## 6. Revisión funcional

- Consecutivo correlativo por tipo y año; backfill de las existentes.
- Correo de factura: número real, `$150.000`, tuteo.
- Rechazo admin (no fallo de pasarela) → correo con el motivo.
- Mis Facturas: vencimiento visible y estado derivado con color.

## 7. Cortes

### Corte A — Consecutivo real
1. [x] Migración aditiva `invoice_number` (nullable, unique) + backfill por tipo/año en orden de id.
2. [x] Asignación centralizada en el evento `creating` del modelo `Invoice`
   (`nextNumber()` con `lockForUpdate`).

### Corte B — Correo de factura nueva
3. [x] `NewInvoice.tsx`: número real, `number_format($amount, 0, ',', '.')`, tuteo. Rebuild del blade.

### Corte C — Aviso de comprobante rechazado
4. [x] `PaymentRejected.tsx` reescrito para `Payment` (`invoice->period` + `admin_notes`); rebuild.
5. [x] `PaymentService::reject()` encola el correo al asociado vía `defer()` solo cuando es rechazo
   del admin (no fallo de pasarela). Mailable y comando de prueba apuntan a `Payment`.

### Corte D — Lista de Mis Facturas
6. [x] `InvoiceController@index`: `display_status` derivado (misma definición que la pantalla Pagar);
   `due_date`, `is_overdue`, `invoice_number`. Orden portable con `CASE` (antes `FIELD`, solo MySQL).
7. [x] `Associate/Invoices/Index.tsx`: muestra vencimiento, badge de estado capitalizada con color y
   el número de factura.

### Corte E — Candado al vencer
8. [x] **Sin código.** Confirmado intencional (`isGeneralLocked`); Gestión del Plan es la puerta de
   renovación. Se explica al usuario final.

## 8. Pruebas

- `tests/Feature/InvoiceNumberingAndStatusTest.php`: consecutivo por tipo/año; correo de rechazo se
  envía (y no se envía en fallo de pasarela); estados derivados vencida / en revisión / rechazada.
- `resources/js/tests/components/AssociateInvoices.test.tsx`: la tarjeta muestra estado, vencimiento y
  número; una pagada no ofrece "Pagar".

## 9. Aprobación

- [x] Plan revisado
- [x] `*go` recibido → implementado
