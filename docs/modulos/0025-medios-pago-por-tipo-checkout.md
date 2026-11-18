# Plan de actualización — Medios de pago por tipo en "Activar membresía"

- **Estado:** Implementado (gates verdes) — sin commit.
- **Fecha:** 2026-11-18
- **Alcance:** Corregir el render de medios de pago en la pantalla **Activar membresía**
  (`Associate/Billing/Checkout.tsx`), que mostraba la **llave Bre-B** y el **QR** como si fueran
  cuentas bancarias. **Opcional aprobado:** extraer el patrón ya correcto de la pantalla **Pagar** a un
  componente compartido. **NO entra:** backend, modelo de datos ni la pantalla Pagar salvo el reuso.

> Este plan se ejecutó tras `*go` (incluida la opción compartida).

---

## 1. Componentes

- **Reutilizar:** `Card`, `CardContent`, `Button`, `Badge` de `@/Components/base`.
- **Nuevo (autorizado por el usuario):** `resources/js/Components/BankAccountCard.tsx` — tarjeta de un
  medio de pago que ramifica por `account.type` (`cuenta | bre_b | qr`). Exporta además el tipo
  `BankAccount`. Justificación: el render correcto por tipo ya existía **inline** en `Pay.tsx`; se
  centraliza para que Pagar y Activar membresía no diverjan (era la causa del bug).

## 2. Documentación

- [x] Este plan. No requiere ADR (no cambia arquitectura ni el motor de cobro; es render de UI).

## 3. Flujo actual (antes del cambio)

- **Punto de entrada:** `GET /my-company/checkout/{plan}` → `CheckoutController@show` →
  `Associate/Billing/Checkout`.
- **Datos:** `bankAccounts = BankAccount::where('is_active', true)->orderBy('order')->get()`
  — **idéntico** a `InvoicePaymentController@show` (pantalla Pagar). El modelo ya expone `type`,
  `payment_key`, `qr_path` y el accesor `qr_url` (`$appends`).
- **Bug:** `Checkout.tsx` pintaba **toda** fila como cuenta bancaria (`account_type`,
  `account_number`, titular…) sin mirar `type`, y su interfaz TS omitía `type/payment_key/qr_url`.
  Las filas `bre_b`/`qr` salían como cuentas vacías/rotas. `Pay.tsx` sí ramificaba por `type`.
- **Resultado esperado:** Activar membresía muestra llave Bre-B (con botón Copiar) y QR igual que
  Pagar; las cuentas bancarias, idénticas.

## 4. Revisión de accesibilidad

Sin regresión: se reusa el markup aprobado de Pagar (etiquetas, `alt` del QR, botón real con icono +
texto "Copiar"). No se introduce color como único portador de significado.

## 5. Revisión de seguridad

Sin cambios. No se toca backend, ni queries, ni autorización; los datos mostrados ya se enviaban a la
pantalla hermana (Pagar). No se expone ningún dato nuevo.

## 6. Revisión funcional

- Cuentas bancarias (`type=cuenta`): render idéntico al anterior.
- `type=bre_b`: muestra la llave + "Copiar" (toast "Llave copiada").
- `type=qr`: muestra la imagen `qr_url`.
- Pagar (`Pay.tsx`): mismo resultado visual que antes; ahora vía el componente compartido.

## 7. Plan de actualización (pasos)

1. [x] Crear `Components/BankAccountCard.tsx` (ramas `bre_b`/`qr`/`cuenta`, tipo `BankAccount`).
2. [x] `Checkout.tsx`: usar `<BankAccountCard>` en el `.map`; importar el tipo; limpiar imports
   muertos (`Building2`, `Hash`, `User`, `Badge`).
3. [x] `Pay.tsx`: reemplazar el bloque inline por `<BankAccountCard>`; limpiar imports muertos
   (`Building2`, `Copy`, `Hash`, `KeyRound`, `QrCode`, `User`, `toast`).

**Gates ejecutados:** ESLint ✓ · Prettier ✓ · `tsc --noEmit` ✓ 0 errores. (Pest/Larastan N/A: sin
cambios PHP.) Verificación visual pendiente del usuario en ambas pantallas.

## 8. Aprobación

- [x] Plan revisado
- [x] `*go` recibido → implementado
