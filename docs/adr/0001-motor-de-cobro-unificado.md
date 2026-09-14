# ADR-0001 · Motor de cobro unificado

- **Estado:** Aceptada
- **Fecha:** 2026-08-06
- **Afecta a:** `invoices`, `payment_requests`, `associates.plan_expires_at`, checkout, panel de administración

---

## Contexto

El cobro de CAMEPG funciona hoy con **dos circuitos independientes** que escriben sobre el mismo
campo `associates.plan_expires_at`, con aritmética distinta:

| Circuito | Tabla | Quién lo cierra | Cómo mueve el vencimiento |
|---|---|---|---|
| Alta y cambio de plan | `payment_requests` | `Admin\PaymentRequestController::approve()` | `now() + ciclo`, anclado al día 19 |
| Recurrencia mensual | `invoices` | `Admin\InvoiceController::markPaid()` | `plan_expires_at + 1 mes`, anclado al día 19 |

De esa duplicidad salen cuatro problemas concretos, todos verificados en el código de la rama
`production`:

1. **Un asociado vencido no tiene por dónde pagar.** El único camino de pago
   (`associate.checkout.*`) está pensado para el alta. No existe una pantalla que diga
   «debes esto, págalo aquí» a alguien que ya venció.

2. **El moroso deja de recibir cobros.** `GenerateMonthlyInvoices` filtra con
   `whereMonth('plan_expires_at', $now->month)`. Si no paga, su vencimiento se queda en el mes
   anterior y el mes siguiente ya no coincide con el filtro: el sistema deja de cobrarle
   justo a quien debe.

3. **Renovar antes de tiempo cuesta días.** `approve()` calcula desde `now()` en vez de partir del
   vencimiento vigente, a diferencia de `markPaid()`. Quien paga adelantado pierde los días
   que le quedaban.

4. **No hay forma de registrar un pago en efectivo.** Si alguien paga en ventanilla, el asociado
   no tiene nada que subir y el admin no tiene dónde asentarlo. La única salida hoy es editar
   la base de datos a mano.

A esto se suma que **el dinero nunca pasa por la plataforma**: todo el sistema depende de que un
humano mire una foto de una transferencia y decida.

---

## Decisión

Se adopta un modelo de **documento y transacción**, con un único punto de extensión de la
suscripción.

### 1. La factura es el documento; el pago es la transacción

- **`invoices`** pasa a ser el único documento de cobro del sistema. Toda deuda —inscripción,
  mensualidad, semestralidad, anualidad, reactivación— es una factura.
- **`payments`** (tabla nueva) registra cada intento o asiento de pago contra una factura.

Una factura puede tener varios pagos (un rechazo y luego uno aprobado). Un pago pertenece
siempre a una factura.

```
invoices                       payments
─────────────────────          ──────────────────────────────
associate_id                   invoice_id
plan_id                        method      bold|transferencia|efectivo|otro
type                           status      pendiente|aprobado|rechazado|fallido
concept                        amount
period                         reference   nº de orden Bold / nº de recibo
cycle                          proof_path  comprobante subido
amount                         gateway_payload  respuesta cruda de la pasarela
due_date                       registered_by    admin que lo asentó (efectivo)
status                         reviewed_by      admin que lo aprobó (transferencia)
paid_at                        applied_at       cuándo extendió la suscripción
```

### 2. Un solo lugar extiende la suscripción

Todo pago aprobado, venga por donde venga, pasa por el mismo servicio:

```php
// App\Services\SubscriptionService::apply(Payment $payment): void

$base  = max(now(), $associate->plan_expires_at);
$nuevo = $base->addMonthsNoOverflow($mesesDelCiclo)
              ->day(Associate::BILLING_DAY);   // 19
```

El servicio es **idempotente**: si el pago ya tiene `applied_at`, no hace nada. Esto protege
contra webhooks repetidos y contra doble clic en el panel.

La base `max(now(), plan_expires_at)` resuelve el problema 3 y unifica las dos aritméticas de hoy.

### 3. Tres rieles de entrada

| Riel | Quién confirma | Cuándo se aprueba el pago |
|---|---|---|
| **Bold** | el webhook de la pasarela | automático, en segundos |
| **Transferencia** | un administrador | al revisar el comprobante |
| **Efectivo u otro** | un administrador | en el momento de asentarlo |

El riel de efectivo es un formulario en el panel —medio, monto, fecha real del pago, número de
recibo y nota— que crea un `payment` ya aprobado con `registered_by` apuntando al admin. Queda
auditado quién lo registró y cuándo, cosa que hoy no ocurre.

Bold se integra como **un cobro por factura**, no como débito automático: la plataforma abre el
checkout con el hash de integridad del cobro y espera la notificación firmada. Se añade un
conciliador horario (`payments:reconcile-bold`) que revisa los pagos que quedaron pendientes por
si la notificación se perdió.

### 4. El vencido siempre puede pagar

- Las rutas de facturación y pago quedan **fuera de cualquier bloqueo**, en todos los estados.
- Si un asociado vencido entra a facturación y no tiene ninguna factura pendiente, el sistema le
  **emite una factura de reactivación en el acto**. Esto cierra el problema 2 desde el lado del
  usuario, además del arreglo en el cron.
- El cron mensual pasa a facturar a quien **deba** (`plan_expires_at <= fin del mes actual`), no
  solo a quien vence este mes.

### 5. Estados de suscripción derivados, no almacenados

El estado de suscripción se calcula a partir de `plan_expires_at` y `plan.grace_days`.
**No se guarda en `associates.status`** y no se toca el ENUM de esa columna.

| Estado | Condición | Qué puede hacer el asociado |
|---|---|---|
| `al_dia` | `hoy <= plan_expires_at` | Todo. Perfil público. |
| `en_gracia` | hasta `plan_expires_at + grace_days` | Todo, con aviso persistente. Sigue público. |
| `vencida` | pasada la gracia | Solo facturación, pago, su perfil y cerrar sesión. Perfil oculto. |

Esto conserva el comportamiento actual de `isSubscriptionActive()`, que ya considera la gracia.

---

## Opciones consideradas

**A. Mantener las dos tablas y añadirles método de pago.** Menos migración, pero conserva los dos
motores con aritmética distinta — es decir, conserva el problema 3 y duplica el trabajo cada vez
que se agregue un riel.

**B. Añadir `payments` solo como bitácora contable.** Menos riesgo, pero la lógica de renovación
seguiría repartida en dos controladores.

**C. Débito automático con tokenización.** Depende de que la cuenta Bold tenga habilitado cobro
recurrente y cambia el sentido del día 15. Se descarta para esta iteración; el diseño lo admite
después como un cuarto riel sin tocar la aritmética.

Se elige el modelo documento/transacción porque es el único que deja **un solo lugar** donde se
escribe la fecha de vencimiento.

---

## Restricción: producción tiene datos

Ninguna migración de esta decisión es destructiva.

- `payment_requests` **no se borra ni se altera**. Se deja de escribir; queda en solo lectura para
  el histórico y un respaldo copia sus filas a `invoices` + `payments`.
- `invoices` solo **suma** columnas (`plan_id`, `cycle`, `due_date`, `concept`, `paid_at`,
  consecutivo). Las filas existentes se rellenan con valores derivados del periodo y del plan
  vigente del asociado.
- `associates` y `plans` no cambian de esquema.
- El modelo `Payment` huérfano que hoy existe sin referencias se retira al final, no al principio.

---

## Consecuencias

**A favor**

- Un vencido puede pagar sin que intervenga nadie. Era el vacío más grave.
- Los tres medios de pago comparten trazabilidad: siempre se sabe quién pagó, cómo, cuándo y quién
  lo aprobó.
- Añadir un riel futuro no toca la aritmética de la suscripción.
- Bold reduce la revisión manual, sin eliminarla: transferencia y efectivo siguen siendo válidos.

**En contra**

- Hay que mantener dos vocabularios durante la transición (`payment_requests` congelada y el
  modelo nuevo conviviendo).
- El webhook introduce una superficie externa que hay que asegurar: firma verificada,
  idempotencia por referencia y conciliación por si la notificación no llega.
- El respaldo de datos históricos es un paso manual que hay que verificar contra producción antes
  de darlo por bueno.

**Riesgo abierto**

Los nombres exactos de los eventos y del encabezado de firma de Bold deben confirmarse contra su
documentación vigente antes de implementar. El diseño no depende de esos nombres, pero la
implementación sí.

---

## Cortes de facturación

Los cortes **no cambian** con esta decisión. Quedan registrados en
[ADR-0002](0002-interruptores-de-modulo-por-plan.md#calendario-de-cortes), junto con los
interruptores de módulo, para que exista un solo sitio donde consultarlos.

---

## Estado de la implementación

### Corte 1 — hecho

- `App\Services\SubscriptionService` es la única aritmética de vigencia.
- `invoices:generate-monthly` factura a quien debe, no solo a quien vence este mes.
- Factura de reactivación al entrar vencido a facturación.
- Registro manual de pago desde el panel.
- Comprobantes y facturas fuera del disco público (`App\Http\Controllers\BillingDocumentController`).

### Corte 2 — hecho

- `payments` es la transacción; `App\Services\PaymentService` es la entrada única de los tres rieles.
- `App\Services\Bold\BoldGateway` aísla todo el contrato de la pasarela.
  `POST /webhooks/bold` verifica firma, es idempotente por `applied_at` con bloqueo de fila, y
  contrasta el monto antes de aplicar.
- `payments:reconcile-bold` (cada hora) cierra los intentos abandonados para desatascar el reintento.
- `billing:send-reminders` (diario) manda los avisos de la víspera, la mora y el aviso final.
- `CheckSubscription` implementa el bloqueo escalonado y se aplica a Bienes y Servicios y a
  participar en Red CAMEP. Las rutas de facturación y pago nunca se bloquean.
- El checkout de alta emite una factura de afiliación o inscripción. **`payment_requests` ya no se
  escribe**: queda en solo lectura para el histórico, y `billing:backfill-payment-requests`
  (con `--dry-run`) lo traslada al modelo nuevo cuando se decida.

### Configuración

`BOLD_API_KEY`, `BOLD_SECRET_KEY` y `BOLD_WEBHOOK_SECRET` en el entorno — ver `.env.example`.
Sin credenciales el riel de pago en línea queda apagado y la plataforma sigue cobrando por
transferencia y efectivo, lo que permite desplegar antes de tenerlas.

Los nombres de los eventos y el encabezado de la firma viven en `config/services.php`, no en el
código: son la parte del contrato de Bold que hay que confirmar contra su documentación vigente,
y así se ajustan sin desplegar.

### Pendiente

- ~~Confirmar con Bold el formato exacto de la firma del webhook y los nombres de los eventos.~~
  **Confirmado** contra la documentación oficial — ver [bold-integracion.md](../bold-integracion.md).
  Reveló un bug en la verificación de firma (HMAC sobre el base64 del cuerpo, no sobre el
  cuerpo crudo); su corrección es la tarea T1 de ese plan.
- Ejecutar `billing:backfill-payment-requests` en producción tras revisar su `--dry-run`.
- Retirar `payment_requests` y el respaldo `payments_legacy_sin_uso` cuando el histórico esté
  trasladado y verificado. **Avance (plan 0019):** ya se retiró la **superficie admin** legacy
  (páginas, rutas, controlador y eventos de solicitudes); se conservan tabla + modelo + backfill.
  Falta el **borrado físico** de la tabla, que es el paso manual post-backfill.
- **Bold configurable desde admin** (plan 0019): las llaves viven cifradas en `bold_settings` y se
  editan en **Integraciones** (solo superadmin); `BoldGateway` cae a `.env` si no hay fila.
