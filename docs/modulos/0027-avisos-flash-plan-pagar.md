# Plan de actualización — Avisos flash en "Gestión del Plan" y "Pagar"

- **Estado:** Implementado (types:check verde) — sin commit.
- **Fecha:** 2026-11-18
- **Alcance:** Mostrar los mensajes de éxito/error (flash) en `Associate/Billing/Index.tsx`
  (Gestión del Plan) y `Associate/Invoices/Pay.tsx` (Pagar), que el backend ya envía pero esas
  pantallas no leían. **NO entra:** backend (el flash ya se comparte global), ni otras pantallas.

> Este plan se ejecutó tras `*go`.

---

## 1. Componentes

- **Reutilizar:** `Alert`, `AlertTitle` de `@/Components/base/Alert`; íconos `CheckCircle2` /
  `AlertCircle` de `lucide-react`. Sin componentes nuevos.

## 2. Documentación

- [x] Este plan. Sin ADR (no cambia arquitectura; es render de UI).

## 3. Flujo actual (antes del cambio)

- `HandleInertiaRequests` comparte `flash.success` / `flash.error` desde la sesión en **todas** las
  páginas (prop global).
- `CheckoutController@store` redirige a **Pagar** con `->with('success', 'Listo. Ahora elige cómo
  quieres pagar.')`.
- `InvoicePaymentController@submitProof` redirige a **Gestión del Plan** con `->with('success',
  '¡Comprobante enviado! CAMEP lo está revisando.')`.
- **Bug:** Pagar y Gestión del Plan no leían `flash`, así que el aviso nunca se mostraba. El resto
  del panel (Información Básica, Caracterización, admin) sí usa el patrón `notice` + `useEffect`.

## 4. Revisión de accesibilidad

Sin regresión: se reusa el `Alert` aprobado (ícono + título), con `variant` según éxito/error (el
color no es el único portador: hay ícono y texto).

## 5. Revisión de seguridad

Sin cambios. No se toca backend ni autorización; el `flash` ya se enviaba a estas páginas.

## 6. Revisión funcional

- "Continuar al pago" → aterriza en Pagar con "Listo. Ahora elige cómo quieres pagar.".
- "Enviar comprobante" → aterriza en Gestión del Plan con "¡Comprobante enviado! CAMEP lo está
  revisando.".
- Cualquier `flash.error` se muestra con variante destructiva. Auto-cierre a los 5 s.

## 7. Plan de actualización (pasos)

1. [x] `Pay.tsx`: prop `flash`, estado `notice` + `useEffect`, `<Alert>` al inicio del contenido;
   imports `useEffect`, `AlertCircle`.
2. [x] `Billing/Index.tsx`: lo mismo; imports `useState`/`useEffect` de react, `AlertCircle`.

**Gates ejecutados:** `tsc --noEmit` ✓ 0 errores. ESLint/Prettier/Vitest pendientes en el `*commit`
(Pest/Larastan N/A: sin cambios PHP). Verificación visual pendiente del usuario en ambas pantallas.

## 8. Deuda anotada

El patrón flash→`notice` está duplicado en ~16 páginas. Candidato a extraer a un hook
`useFlashNotice()` en un corte aparte (requiere autorización). No se aborda aquí.

## 9. Aprobación

- [x] Plan revisado
- [x] `*go` recibido → implementado
