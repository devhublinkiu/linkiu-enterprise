# Seguridad — CAMEPG

Modelo de amenazas y reglas vigentes. Lo que se observa hoy en el código, más los riesgos
detectados. Complementa a [`../AGENTS.md`](../AGENTS.md) y a los ADR de seguridad.

## Autenticación y acceso

- **OTP por correo** para registro y recuperación ([ADR-0003](adr/0003-sistema-otp-por-correo.md)).
- Roles: `associate`, `admin`, `superadmin`. Puerta por middleware (`superadmin`,
  `subscription.active`, `associate.onboarding`, `feature:<clave>`) — ver
  [ADR-0006](adr/0006-autorizacion-panel-admin.md) y [`arquitectura.md`](arquitectura.md).
- **Aislamiento entre asociados:** un asociado nunca consulta datos de otro. La separación por
  carpetas (`Admin/`, `Associate/`, `Public/`) es claridad, **no** seguridad: la que impide la fuga
  es la **autorización en servidor** (middleware + Policies/Gates + queries siempre acotadas al
  dueño). Toda ruta con datos sensibles pasa por su Policy.
- **Mensajería interna** ([ADR-0012](adr/0012-mensajeria-interna.md)): `ConversationPolicy` acota
  cada hilo a su empresa — un asociado nunca ve ni responde una conversación de otra. La difusión a
  grupos hace **fan-out a hilos privados por asociado** (jamás un hilo compartido donde se filtren
  destinatarios). Cerrar/reabrir un hilo es acción solo de admin. Los canales de tiempo real
  (`conversation.{id}`, `inbox.{userId}`) se autorizan en `routes/channels.php` con la misma Policy.

## Validación y entrada

- **El servidor manda:** toda entrada se valida en servidor con FormRequest (fuente de verdad); el
  cliente valida solo para UX. Nunca confiar en IDs ni datos del cliente.
- Consultas vía Eloquent (parametrizadas); nada de SQL concatenado con entrada del usuario.

## Pagos y webhook de Bold

- El webhook de Bold (`webhooks/bold`) está **fuera de CSRF** y se autentica por **firma** (HMAC),
  idempotente por `payment_id`. Detalle en [`bold-integracion.md`](bold-integracion.md).
- Las **rutas de facturación y pago nunca se bloquean** (un vencido siempre puede pagar); el bloqueo
  escalonado lo hace `CheckSubscription`.
- **PCI:** el cobro con tarjeta ocurre en el checkout de Bold (SAQ A); la plataforma no toca datos de
  tarjeta. Ver `bold-integracion.md`.

## Documentos y archivos

- **Documentos de cobro** (comprobantes, facturas) y **documentos de licitación** no son públicos:
  disco privado y descarga **gateada** por autorización
  ([ADR-0010](adr/0010-documentos-licitacion-privados.md)). No accesibles por URL directa sin sesión.
- **Adjuntos de mensajería** en **disco privado** (`local`), con descarga gateada por
  `ConversationPolicy` (solo participantes del hilo). Nunca en disco público.
- Media de perfil/empresa vía Spatie MediaLibrary sobre Minio/S3.

## Secretos y datos

- Secretos (`.env`, llaves de Bold, Minio, Resend, Ably) **fuera de git**. En commits jamás van
  `.env*` ni archivos generados.
- No registrar datos personales ni secretos en logs. En producción, el detalle técnico de un error
  va al log; al usuario solo un mensaje amable + código de referencia.

## Riesgos detectados (ver prioridad en [`pendientes.md`](pendientes.md))

- **Trabajo directo sobre `production` sin CI ni staging:** los gates locales (preflight) son la
  única barrera antes de `*push`. Deben estar en verde.
- **Entregabilidad de correo (infra):** alineación de dominio remitente, DKIM/DMARC y calentamiento
  pendientes (plan 0004 §10) — riesgo de que los correos caigan en spam o parezcan phishing.
- **Suite de seguridad del motor de cobro:** reforzar tests de firma del webhook, idempotencia y
  gateo de documentos (parcial hoy).
