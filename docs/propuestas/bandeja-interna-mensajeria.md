# Propuesta — Bandeja interna de mensajería (tiempo real) admin ↔ asociados

- **Fecha:** 2026-10-29
- **Estado:** Propuesta (a debatir antes de los ADR). Ver [`AGENTS.md`](../../AGENTS.md).
- **Tipo:** módulo nuevo + cambio de infraestructura (cola/worker).

## 1. Objetivo

Una **bandeja tipo correo, en tiempo real**, entre la administración de CAMEP y los
asociados: lista de conversaciones, hilos con mensajes, no leídos, adjuntos, y entrega en
vivo (el mensaje nuevo aparece sin recargar). Ambos lados pueden iniciar. El admin puede
escribir a **un asociado específico** o a **grupos** (fan-out).

## 2. Decisiones tomadas (del debate)

1. **Modelo limpio** (`conversations` / `messages`), no reusar `tickets`/`ticket_replies`.
2. **Bidireccional** y **ambos inician**.
3. Admin → **asociado específico o grupos**, con **fan-out a hilos privados** (un asociado
   nunca ve a otro).
4. **Adjuntos en v1.**
5. **Infra: Redis + Horizon + Ably, desde ya.** Esto **revierte** el "sin worker" actual.

## 3. Infraestructura — Redis + Horizon + Ably

Hoy: correos con `defer()`, imágenes `nonQueued()`, `QUEUE_CONNECTION=database` sin worker,
broadcasting Ably ya configurado (`config/broadcasting.php`, `routes/channels.php`,
`resources/js/lib/echo.ts`). Se adopta una cola real:

- **Dependencias:** `laravel/horizon` + cliente Redis (`predis/predis` o extensión `phpredis`).
- **Config:** `QUEUE_CONNECTION=redis`, `BROADCAST_CONNECTION=ably` (ya existe la conexión).
  Horizon gestiona los workers de la cola Redis con su dashboard (`/horizon`, gateado a
  superadmin).
- **Local (Herd/Windows):** Redis vía Memurai/WSL/Docker; correr `php artisan horizon`.
- **Producción:** Redis + `horizon` supervisado (systemd/supervisor) + `horizon:terminate` en
  el deploy. Actualizar [`docs/despliegue.md`](../despliegue.md).
- **Consecuencia positiva:** los broadcasts y notificaciones pasan a `ShouldBroadcast`/
  `ShouldQueue` (cola), la request responde rápido y el worker entrega. Los ~20 Mailables y
  las conversiones de imagen pueden migrar a cola más adelante (opcional).

> **Requiere ADR** (ver §12): este cambio afecta a todo el proyecto, no solo a la bandeja.

## 4. Modelo de datos

- **`conversations`** — `id`, `associate_id` (empresa del hilo), `subject` (nullable),
  `status` (`open`/`archived`), `created_by` (user), `last_message_at`, timestamps.
- **`messages`** — `id`, `conversation_id`, `sender_id` (user), `body`, timestamps.
- **`conversation_user`** (pivote de participantes) — `conversation_id`, `user_id`, `role`
  (`admin`/`associate`), `last_read_at`. Los **no leídos** = mensajes posteriores a mi
  `last_read_at`.
- **`message_attachments`** — `id`, `message_id`, `path` (disco privado), `name`, `mime`,
  `size`. (Alternativa: Spatie MediaLibrary; se decide en el plan — ver §8.)
- **`message_groups`** — `id`, `name`, `created_by` (user), timestamps. **Grupos con nombre**
  que el admin crea y administra.
- **`message_group_associate`** (pivote) — `message_group_id`, `associate_id`. Los asociados
  seleccionados **a mano** en cada grupo.

Modelos: `Conversation`, `Message`, `MessageAttachment` (+ pivote). Relaciones acotadas al
dueño en todas las queries.

## 5. Grupos y envío (fan-out) y privacidad

Los **grupos son listas con nombre que el admin crea y administra** (CRUD), seleccionando **a
mano** los asociados de cada uno (p. ej. "Juntas directivas", "Plan Corporativo", "En mora").
Se gestionan desde un botón **"Grupos"** junto a "Nuevo mensaje" (crear/editar grupo →
nombre + selección de asociados). *(Opcional: ayudar a poblar la selección con un filtro por
plan/estado/categoría; pero el grupo guardado es la lista, no el filtro.)*

Al redactar, el admin elige destinatario: **un asociado** o **un grupo guardado**. El sistema
hace **fan-out**: crea o reutiliza **un hilo privado por asociado** del grupo y coloca el
mensaje en cada uno. Nunca un hilo compartido (un asociado no ve a otro — regla de
`seguridad.md`). El envío masivo se procesa en **cola (Horizon)** para no bloquear la request.

## 6. Tiempo real (Ably + Echo)

- Evento **`MessageSent implements ShouldBroadcast`** (con Horizon ya hay worker; no hace falta
  `ShouldBroadcastNow`).
- Canales privados: **`conversation.{id}`** (mensajes del hilo) y **`inbox.{userId}`** (para el
  badge de no leídos y refresco de la lista).
- **Auth de canal** en `routes/channels.php`: solo participantes del hilo / el propio usuario
  (misma regla que las Policies).
- Front: `resources/js/lib/echo.ts` ya existe; se suscribe al canal del hilo abierto y al de la
  bandeja, agrega el mensaje y actualiza contadores en vivo.

## 7. No leídos

Contador `unread_messages` compartido al layout en `HandleInertiaRequests` (patrón de
`unread_invoices`) + actualización en vivo por Echo. Badge en el sidebar/topbar de admin y
asociado. Marcar leído al abrir el hilo (actualiza `last_read_at`).

## 8. Adjuntos (v1)

- Subida en el compositor; guardado en **disco privado**; descarga **gateada** por un
  controlador que autoriza según participación (patrón [ADR-0010](../adr/0010-documentos-licitacion-privados.md)).
- Validación de tipo/tamaño en servidor (FormRequest). Decisión de implementación (MediaLibrary
  vs tabla `message_attachments` + paths) se fija en el plan; se prefiere coherencia con lo
  existente.

## 9. Autorización

- **Policies:** un asociado ve/responde **solo sus** conversaciones (query acotada por
  `associate_id`/participación); admin/superadmin ven todas.
- La **auth de canal** replica la Policy (nadie escucha un hilo ajeno).
- Rutas en `Associate/` y `Admin/` con sus controladores separados.

## 10. Disponibilidad / compuerta de plan

Propuesta: la bandeja es un **canal de comunicación institucional disponible para todos los
asociados** (sin interruptor de plan), ya que es el medio por el que CAMEP los contacta. *(A
confirmar: si se quiere gatear por plan, es una fila en `features` + `feature:<clave>`, ADR-0002.)*

## 11. Cortes del plan (actualizado)

1. **Infra Redis + Horizon** (deps, config, dashboard gateado, local + despliegue) — **ADR**.
2. **Migraciones + modelos + Policies** (`conversations`, `messages`, `conversation_user`,
   `message_attachments`).
3. **Backend asociado:** bandeja, hilo, enviar/responder, marcar leído, adjuntos.
4. **Backend admin:** bandeja global (agrupada por asociado), **CRUD de grupos** (nombre +
   selección de asociados), enviar a asociado específico y **fan-out a un grupo guardado** (en cola).
5. **Tiempo real:** `MessageSent` (ShouldBroadcast) + canales + auth + Echo en el front.
6. **No leídos:** `unread_messages` (badge admin + asociado) en vivo.
7. **UI:** páginas Inertia (`Admin/` + `Associate/`) con `@/Components/base`, responsive,
   español, estados; adjuntos.
8. **Pruebas:** Policies (aislamiento entre asociados), fan-out, auth de canal, no leídos.

## 12. ADRs requeridos

- **ADR-A · Cola y worker con Redis + Horizon.** Reemplaza/enmienda el enfoque "sin worker"
  (correos `defer()`); define qué pasa a cola y qué se queda.
- **ADR-B · Mensajería interna.** Modelo, fan-out, canales de tiempo real, autorización.

## 13. Riesgos / pendientes

- Redis en local (Windows/Herd) y en producción (supervisión del worker) — definir en el ADR-A.
- Fan-out masivo: idempotencia y rate-limit del envío a grupos grandes.
- Entrega garantizada: la BD es la fuente de verdad; Ably solo entrega en vivo (si estás
  offline, los ves al entrar).
- Alinear con la unificación de notificaciones en curso (`feature/camep-unified-notifications`).

## 14. Vistas

Boceto navegable de todas las vistas (bandeja admin y asociado, hilo, compositor con selector
de destinatarios/grupos, adjuntos, no leídos): ver el enlace entregado junto a esta propuesta.
