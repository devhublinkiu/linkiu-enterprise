# Integración de Bold — hallazgos y plan

- **Fecha:** 2026-08-07
- **Contexto:** el Corte 2 dejó el riel de Bold construido pero con el contrato del
  webhook *sin confirmar* (riesgo abierto de [ADR-0001](adr/0001-motor-de-cobro-unificado.md)).
  Este documento recoge lo confirmado contra la documentación oficial de Bold y el plan
  para dejarlo listo para producción.
- **Fuentes:** portal oficial `developers.bold.co` (botón de pagos, webhook, API de pagos).

---

## 1. Decisión de arquitectura: Botón de pagos, no la API de pagos

Bold ofrece dos productos distintos:

| | **Botón de pagos** (lo que usamos) | **API de pagos en línea** |
|---|---|---|
| Quién muestra el formulario de pago | Bold (checkout alojado) | Nuestro servidor |
| Dónde viajan los datos de tarjeta | Nunca tocan CAMEP | **Pasan por nuestro servidor** |
| Carga PCI-DSS | Mínima (SAQ A) | Máxima (SAQ D) |
| Manejo de 3DS, PSE, Nequi | Lo resuelve Bold | Lo implementamos nosotros |
| Confirmación | Webhook `x-bold-signature` | Polling + webhook |

**Nos quedamos con el Botón de pagos.** La API de pagos (`api.online.payments.bold.co`)
obligaría a que los datos de tarjeta pasen por CAMEP, lo que dispara el alcance de
cumplimiento PCI a SAQ D. No hay razón para asumir eso: el botón cubre tarjeta, PSE, Nequi,
Botón Bancolombia y QR sin que ningún dato sensible toque nuestros servidores.

Esto coincide con lo que ya está construido en `App\Services\Bold\BoldGateway` y
`resources/js/Pages/Associate/Invoices/PayOnline.tsx`.

---

## 2. Contrato confirmado

### 2.1 Botón — atributos del `<script>`

Script: `https://checkout.bold.co/library/boldPaymentButton.js`

Atributos `data-*` válidos (confirmados):

| Atributo | Uso |
|---|---|
| `data-bold-button` | Marca el script como botón (acepta variante de estilo, ej. `dark-L`) |
| `data-api-key` | Llave de **identidad** (pública) |
| `data-order-id` | Referencia única de la venta → vuelve en el webhook como `metadata.reference` |
| `data-amount` | Monto en **unidades enteras** como string (COP no tiene decimales) |
| `data-currency` | ISO 4217, ej. `COP` |
| `data-integrity-signature` | Hash de integridad (ver 2.2) |
| `data-redirection-url` | A dónde vuelve el usuario tras pagar |
| `data-description` | Descripción visible del cobro |
| `data-tax`, `data-customer-data`, `data-billing-address`, `data-expiration-date`, `data-origin-url`, `data-extra-data-1/2`, `data-render-mode` | Opcionales |

Los atributos que usa hoy `PayOnline.tsx` (`data-bold-button`, `data-api-key`,
`data-order-id`, `data-amount`, `data-currency`, `data-integrity-signature`,
`data-redirection-url`, `data-description`) son **todos válidos**. ✅

### 2.2 Firma de integridad del botón — CORRECTA en el código

```
integrity = SHA256( {order-id}{amount}{currency}{secret-key} )   // hex
```

`BoldGateway::integritySignature()` ya lo calcula en ese orden exacto, con el monto en
unidades enteras. **No requiere cambios.** ✅

> La llave secreta se usa aquí en el **servidor**; nunca se expone al navegador. El monto y
> la firma se calculan en `InvoicePaymentController::online()` antes de renderizar el botón.

### 2.3 Webhook — estructura del cuerpo

Eventos (campo `type`, nivel raíz): **`SALE_APPROVED`**, **`SALE_REJECTED`**,
**`VOID_APPROVED`**, **`VOID_REJECTED`**.

```json
{
  "id": "uuid-de-la-notificación",
  "type": "SALE_APPROVED",
  "subject": "id-transacción-Bold",
  "source": "/payments",
  "spec_version": "1.0",
  "time": 1234567890,
  "datacontenttype": "application/json",
  "data": {
    "payment_id": "id-transacción-Bold",
    "amount": { "total": 100000, "currency": "COP" },
    "metadata": { "reference": "CAMEP-123-XXXX" },
    "payment_method": "CARD",
    "created_at": "2026-08-07T10:00:00-05:00"
  }
}
```

`BoldGateway::parseWebhook()` ya lee `type` (raíz), `data.metadata.reference`,
`data.payment_id` y `data.amount.total`. **Funciona con esta estructura.** ✅
(Los fallbacks `spec.*` que trae de más son inofensivos; se limpian por prolijidad.)

### 2.4 Verificación de firma — ⚠️ AQUÍ ESTÁ EL BUG

**Header:** `x-bold-signature`. **Algoritmo confirmado por Bold:**

1. Tomar el cuerpo **crudo** de la petición.
2. Codificarlo en **Base64**.
3. HMAC-SHA256 de *ese Base64*, con la **llave secreta**.
4. Salida en **hexadecimal**.
5. Comparar con `x-bold-signature`.

Referencia oficial (Python):

```python
encoded = base64.b64encode(request.get_data())
hashed  = hmac.new(secret, encoded, hashlib.sha256).hexdigest()
valid   = hmac.compare_digest(hashed, request.headers["x-bold-signature"])
```

**Lo que hace hoy `BoldGateway::verifySignature()` está mal:** calcula el HMAC sobre el
cuerpo crudo directamente (y una variante que hace base64 del *digest*). Ninguna de las dos
coincide con Bold, así que **rechazaría todos los webhooks legítimos**.

Corrección exacta:

```php
// Bold firma el base64 del cuerpo, no el cuerpo. Salida hex.
$expected = hash_hmac('sha256', base64_encode($rawBody), $secret);
return hash_equals($expected, (string) $signature);
```

> Detalle de sandbox: en el entorno de pruebas de Bold la llave secreta es la cadena vacía
> `""`. La verificación debe **calcular con `""`**, no saltarse el chequeo. El guard actual
> (`empty($secret) → null → en producción 503`) está bien para producción, pero en no-producción
> debe verificar con `""` en vez de aceptar a ciegas.

### 2.5 Reglas operativas del webhook

- Debe responder **HTTP 200 en ≤ 2 segundos**, si no Bold **reintenta 5 veces**
  (15 min, 1 h, 4 h, 8 h, 24 h).
- Se registran hasta 5 endpoints en `panel.bold.co/panel/integrations`.
- Bold recomienda **idempotencia por `payment_id`** ante reintentos.

Implicación: el trabajo pesado (extender vigencia + correo) no debe hacer esperar la
respuesta. Ver tarea T3 del plan.

---

## 3. Estado del código actual (gap analysis)

| Pieza | Estado |
|---|---|
| Elección botón vs API | ✅ correcto (botón) |
| Firma de integridad del botón | ✅ correcta |
| Atributos `data-*` del botón | ✅ válidos |
| `parseWebhook` (estructura del cuerpo) | ✅ compatible |
| **`verifySignature` (firma webhook)** | ✅ **corregida en T1** (HMAC hex sobre base64 del cuerpo; maneja el secreto vacío del sandbox) |
| Idempotencia (`applied_at` + bloqueo de fila) | ✅ correcta |
| Nombres de eventos en `config/services.php` | ✅ ajustados a los reales (T2) |
| Respuesta del webhook ≤ 2 s | ✅ corregido (T3): el correo se difiere con `defer()`, fuera del camino crítico |
| Manejo de `VOID_*` (anulaciones/reembolsos) | ✅ contemplado (T2): se registra, no revierte |
| Conciliador (`payments:reconcile-bold`) | 🔧 puede mejorar consultando estado a Bold |

---

## 4. Plan

### T1 — Corregir la verificación de firma del webhook  · *bloqueante* · ✅ HECHO (2026-08-07)
- `BoldGateway::verifySignature()`: HMAC-SHA256 hex sobre `base64_encode($rawBody)`.
- Secreto vacío del sandbox manejado: se distingue `""` (válido, sandbox) de `null` (sin
  configurar). Con `""` se verifica; con `null` se devuelve null y el controlador decide
  (503 en producción). `BOLD_WEBHOOK_SECRET` se documentó en `.env.example`.
- Archivo: `app/Services/Bold/BoldGateway.php`.
- Verificado: firma real de Bold aceptada, el algoritmo viejo ahora se rechaza, sandbox con
  `""` verifica, sin secreto devuelve null.

### T2 — Ajustar los eventos y limpiar `parseWebhook`  · ✅ HECHO (2026-08-07)
- `config/services.php`: `approved_events = ['SALE_APPROVED']`,
  `rejected_events = ['SALE_REJECTED']`, `void_events = ['VOID_APPROVED','VOID_REJECTED']`.
  Quitadas las grafías inventadas.
- `VOID_*` se trata como anulación/reembolso: se maneja **antes** del guard de idempotencia
  (llega sobre un pago ya aplicado), se registra en el log y se anota en el pago para
  revisión, y **no revierte la vigencia**. `VOID_REJECTED` (la anulación falló) no hace nada.
- `parseWebhook` limpiado a la estructura real (`data.*` + un fallback de raíz); ya no usa
  `id` de la raíz como payment_id (ese es el id de la notificación, no del pago).
- Verificado: clasificación de los 5 casos, aplicación + idempotencia, VOID no revierte pero
  anota, SALE_REJECTED deja la factura pendiente, firma inválida → 401.

### T3 — Hacer el webhook rápido (≤ 2 s)  · ✅ HECHO (2026-08-08)
- Los correos de facturación (`PaymentSettled`, `PaymentProofUploaded`) se envían con
  `defer()`: la respuesta se devuelve primero y el correo sale después, sin depender de un
  worker de cola (la app hoy no corre uno; todos los mailables envían síncrono).
- El efecto en base (aplicar el pago, extender la vigencia) sigue siendo síncrono y rápido;
  lo único diferido es el correo.
- Verificado: el webhook responde 200 y aplica el pago sin enviar el correo durante la
  petición; el correo sale una sola vez al ejecutarse los callbacks diferidos.
- Nota: si más adelante se corre un worker de cola, se puede migrar estos mailables a
  `ShouldQueue` sin otros cambios.

### T4 — Configuración y panel
- `.env` de producción: `BOLD_API_KEY`, `BOLD_SECRET_KEY`, `BOLD_WEBHOOK_SECRET`
  (si Bold entrega uno distinto; si no, usa `BOLD_SECRET_KEY`).
- Registrar `https://camepg.org/webhooks/bold` en `panel.bold.co/panel/integrations`.
- Confirmar que la ruta `webhooks/bold` está fuera de CSRF (ya lo está) y responde por HTTPS.

### T5 — Pruebas en sandbox (antes de producción)
- Llaves de prueba de Bold; recordar que el secreto de webhook de sandbox es `""`.
- Verificar de punta a punta:
  1. El botón abre el checkout con el monto y la referencia correctos.
  2. `SALE_APPROVED` llega, la firma valida, el pago se aplica **una sola vez**.
  3. El `data-order-id` vuelve como `data.metadata.reference` (confirmar el mapeo real).
  4. `SALE_REJECTED` deja la factura pendiente y el asociado puede reintentar.
  5. Un reenvío del mismo webhook no extiende dos veces (idempotencia).
- Montos especiales de sandbox para 3DS: `555001` aprobado, `555002` rechazado.

### T6 — Mejorar el conciliador (opcional, recomendado)
- `payments:reconcile-bold` hoy cierra intentos viejos a ciegas. Con la API de estado
  (`GET /v1/payment/{reference_id}`, auth `x-api-key`) puede **preguntarle a Bold** qué pasó
  realmente antes de cerrar: si Bold dice aprobado, aplicarlo; si no, cerrarlo.
- Verificar primero en sandbox que ese endpoint responde para pagos creados vía botón.

### T7 — Documentar y cerrar el riesgo del ADR
- Actualizar el "riesgo abierto" de ADR-0001: el contrato queda confirmado por este documento.

---

## 5. Preguntas que solo el sandbox responde

1. ¿El `data-order-id` del botón vuelve exactamente en `data.metadata.reference`? (asumido sí)
2. ¿Bold acepta guiones en el `order-id` (`CAMEP-123-XXXX`)? (asumido sí)
3. ¿`GET /v1/payment/{reference_id}` funciona para pagos creados con el botón, o solo con la
   API de pagos? (afecta a T6)
4. ¿El secreto de firma del webhook es el mismo `secret_key` o uno propio del panel?

Ninguna bloquea el diseño; se cierran con una cuenta de sandbox.
