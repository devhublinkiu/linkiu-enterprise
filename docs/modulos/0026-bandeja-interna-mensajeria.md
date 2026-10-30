# Plan de actualización — Bandeja interna de mensajería (tiempo real)

- **Estado:** Borrador
- **Fecha:** 2026-10-29
- **Alcance:** Módulo nuevo de **mensajería tipo bandeja, en tiempo real**, entre admin y
  asociados (ambos inician). Admin → asociado específico o **grupos** (fan-out a hilos privados).
  **Incluye adjuntos (v1).** Incluye el cambio de infraestructura a **Redis + Horizon + Ably**.
  **NO entra:** videollamada, reacciones/emojis, edición/borrado de mensajes enviados, búsqueda
  global entre conversaciones (sí dentro del hilo), chat entre asociados.
- **Propuesta base:** [`../propuestas/bandeja-interna-mensajeria.md`](../propuestas/bandeja-interna-mensajeria.md).
- **Boceto de todas las vistas:** entregado en claude.ai (bandeja, hilo con lupa + menú ⋯, grupos,
  compositor con fan-out, adjuntos, no leídos, archivados, móvil).

> Este plan no se ejecuta hasta `*go`. Solo se implementa lo aquí descrito.

---

## 1. Componentes *(primer punto, obligatorio)*

UI en `@/Components/base` (y `ui` legacy), respetando su estructura; ajustes solo de
tipografía/colores/tokens de `design.md`. Páginas en `Admin/` y `Associate/` con patrón
`Index.tsx` + `parts/`.

- **Reutilizar:** `Avatar`, `Badge` (no leídos/estado), `Button`, `Card`, `Input`, `Textarea`,
  `DropdownMenu` (menú ⋯), `Checkbox` (selección de asociados en grupos), `Separator`, `Tabs`
  (destinatario: Un asociado / Un grupo), `SearchableSelect` (elegir asociado), `Alert` (estados
  vacíos/flash), el patrón de diálogo del micrositio (`ProjectDialog`) para el compositor y
  "Grupos". Badge de no leídos en el sidebar (patrón de `unread_invoices`).
- **Integrar (si falta en base/):** un `Dialog`/`Sheet` base y, opcional, `ScrollArea` para el
  hilo. **Requiere autorización explícita** (regla `design.md`); primero se verifica si
  `ProjectDialog`/el patrón actual basta.
- **Reemplazar:** nada. Los modelos huérfanos `Ticket`/`TicketReply` se **retiran** (o se marcan
  obsoletos) por decisión del ADR-B — no se reutilizan.
- **Nuevo (solo si es necesario):** burbujas de mensaje, barra de búsqueda del hilo y lista de
  conversaciones son **composición con componentes existentes**, no componentes nuevos. Si surge
  un control realmente nuevo, se pide autorización antes.

## 2. Documentación *(segundo punto, obligatorio)*

- [x] **ADR-A · Cola y worker con Redis + Horizon.** Enmienda el "sin worker" (correos `defer()`):
      qué pasa a cola, qué queda; config, local y producción.
- [x] **ADR-B · Mensajería interna.** Modelo de datos, fan-out a hilos privados, canales de tiempo
      real, autorización, retiro de `Ticket`/`TicketReply`.
- [ ] Actualizar [`../despliegue.md`](../despliegue.md): Redis + `horizon` supervisado +
      `horizon:terminate` en el deploy.
- [ ] Actualizar [`../arquitectura.md`](../arquitectura.md) (cola/worker, tiempo real) y
      [`../seguridad.md`](../seguridad.md) (aislamiento de hilos, adjuntos privados, auth de canal).
- [ ] Índice de ADR (`../adr/README.md`) y de módulos (este índice).

## 3. Flujo actual *(antes de proponer cambios)*

Es un módulo **nuevo**; no hay bandeja hoy. Lo relevante que ya existe:

- **Tiempo real:** Ably ya configurado (`config/broadcasting.php`), canales privados en
  `routes/channels.php` (`associate.{userId}`, `admin.notifications`), cliente `resources/js/lib/echo.ts`.
- **Cola:** `QUEUE_CONNECTION=database` **sin worker** (correos con `defer()`, imágenes
  `nonQueued()`). → hoy un `ShouldQueue`/`ShouldBroadcast` quedaría parado.
- **Modelos huérfanos:** `tickets`/`ticket_replies` (sin controlador/rutas/UI) — se retiran.
- **Usuarios:** `User belongsTo Associate`; un asociado tiene varios usuarios; `isAdmin()`/
  `isSuperadmin()`. Contador no leídos ya se comparte al layout (`unread_invoices` en
  `HandleInertiaRequests`).
- **Resultado esperado del módulo:** admin y asociado intercambian mensajes en hilos, en vivo,
  con no leídos, adjuntos, archivado, y envío a grupos por fan-out sin que un asociado vea a otro.

## 4. Revisión de accesibilidad

- Foco visible y navegación por teclado en lista, hilo, compositor y menús (`DropdownMenu`,
  `Tabs`, `Checkbox` ya accesibles).
- Estado no solo por color: no leído = punto **+** número/negrita; "en línea" con texto accesible.
- Etiquetas (`aria-label`) en lupa, ⋯, archivar, enviar, adjuntar. Contraste sobre tokens de marca.
- Mensajes anunciables (zona `aria-live`) al llegar en vivo.

## 5. Revisión de seguridad

- **Policies:** un asociado ve/responde **solo** sus conversaciones (query acotada por
  `associate_id`/participación); admin/superadmin, todas. Toda ruta pasa por Policy.
- **Auth de canal** (`channels.php`): `conversation.{id}` solo participantes; `inbox.{userId}`
  solo el dueño. Refleja la Policy (nadie escucha un hilo ajeno).
- **Adjuntos:** disco **privado**, descarga **gateada** por controlador que autoriza según
  participación (patrón [ADR-0010](../adr/0010-documentos-licitacion-privados.md)); validación de
  tipo/tamaño en `FormRequest`.
- **Fan-out a grupos:** solo admin; en cola; idempotente; rate-limit en grupos grandes.
- **Horizon dashboard** (`/horizon`) gateado a **superadmin**.
- Sin fuga de datos entre asociados (nunca un hilo compartido).

## 6. Revisión funcional

- Persistencia = fuente de verdad (BD); Ably solo entrega en vivo. Offline → se ve al entrar.
- No leídos correctos al enviar/recibir/abrir (marca `last_read_at`).
- Archivar/desarchivar mueve el hilo de bandeja a archivados y viceversa.
- Fan-out: crea/reutiliza un hilo por asociado del grupo; no duplica.
- **Pruebas obligatorias** (módulo nuevo + autorización): aislamiento entre asociados, auth de
  canal, fan-out, no leídos, descarga gateada de adjuntos.

## 7. Plan de actualización (cortes)

> Cada corte cierra con sus pruebas. Al terminar todos, avisar que toca `*commit`.

1. **Infra Redis + Horizon (ADR-A).** `laravel/horizon` + cliente Redis; `QUEUE_CONNECTION=redis`,
   `BROADCAST_CONNECTION=ably`; dashboard gateado a superadmin; Redis en local (Memurai/WSL/Docker)
   y notas de despliegue (worker supervisado). Smoke: un job de prueba se procesa por Horizon.
2. **Datos + modelos + Policies.** Migraciones `conversations`, `messages`, `conversation_user`,
   `message_attachments`, `message_groups`, `message_group_associate`. Modelos + Policies.
   Retiro de `Ticket`/`TicketReply`. Tests de Policy (aislamiento).
3. **Backend asociado.** `Associate\ConversationController` (listar, ver, enviar, responder, marcar
   leído, archivar, adjuntar) — queries acotadas. Tests.
4. **Backend admin.** `Admin\ConversationController` (bandeja global agrupada por asociado, a
   asociado específico) + `Admin\MessageGroupController` (CRUD de grupos por selección de
   asociados) + **fan-out a un grupo guardado** (Job en cola). Tests de fan-out.
5. **Tiempo real.** Evento `MessageSent implements ShouldBroadcast` + canales `conversation.{id}` /
   `inbox.{userId}` + auth en `channels.php` + suscripción en el front (Echo). Test de auth de canal.
6. **No leídos.** `unread_messages` en `HandleInertiaRequests` + badge (sidebar admin/asociado) +
   refresco en vivo por Echo. Marca `last_read_at` al abrir.
7. **UI (Inertia + base/).** Bandeja (lista + buscador + archivados), hilo (burbujas, lupa, menú
   ⋯, adjuntos, compositor), grupos (crear/seleccionar), compositor con destinatario/fan-out.
   Responsive (una columna en móvil), español, estados vacíos. Según el boceto aprobado.
8. **Cierre.** Documentación (ADR-A/B, despliegue, arquitectura, seguridad), índices, repaso de
   accesibilidad/seguridad.

**Gates a ejecutar** (completos, por alcance PHP + frontend): Pint · Larastan · Pest ·
`types:check` · ESLint · Prettier · Vitest. Preflight antes de `*commit`/`*push`.

## 8. Aprobación

- [ ] Plan revisado
- [ ] `*go` recibido → implementar (empezando por el corte 1, infra)

> **Nota de alcance mayor:** adoptar Redis + Horizon **revierte** el "sin worker" documentado y
> afecta a todo el proyecto (no solo a la bandeja). Se formaliza en el **ADR-A** antes de tocar
> código de infraestructura.
