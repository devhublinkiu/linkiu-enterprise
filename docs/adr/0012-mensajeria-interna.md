# ADR-0012 — Mensajería interna: modelo de datos, fan-out y autorización

- **Estado:** Aceptada
- **Fecha:** 2026-10-30
- **Contexto del cambio:** plan [0026 — Bandeja interna de mensajería](../modulos/0026-bandeja-interna-mensajeria.md);
  depende de la cola de [ADR-0011](0011-cola-y-worker-redis-horizon.md).

## Contexto

Se necesita una **bandeja de mensajería en tiempo real** entre admin y asociados (ambos inician).
El admin puede escribir a un asociado o a **grupos**. Existían dos modelos **huérfanos**
(`Ticket`/`TicketReply`, sin controlador/rutas/UI) de sabor "soporte" (asunto/estado/prioridad).

## Decisión

**Modelo limpio**, no reusar los tickets:

- `conversations` — `associate_id` (empresa del hilo), `subject?`, `status` (`open`/`closed`),
  `created_by`, `last_message_at`.
- `messages` — `conversation_id`, `sender_id`, `body`.
- `conversation_user` (pivote de estado por participante) — `role`, `last_read_at`, `archived_at`.
  Los **no leídos** y el **archivado** son **por usuario** (cada lado administra su bandeja).
- `message_attachments` — adjunto en **disco privado** (`disk`/`path`/`name`/`mime`/`size`).
- `message_groups` + `message_group_associate` — **grupos con nombre** que el admin crea
  seleccionando asociados.

**Acceso/autorización:** por `associate_id` vía Policy — un asociado ve/responde **solo** las
conversaciones de **su** empresa; admin/superadmin, todas. No hay hilos compartidos entre
asociados (`ConversationPolicy`). La misma regla gobierna la auth de canal (corte 5).

**Grupos → fan-out:** enviar a un grupo **crea/reutiliza un hilo privado por asociado** del grupo
y coloca el mensaje en cada uno (Job en cola, ADR-0011). Nunca un hilo compartido.

**Se retiran `Ticket`/`TicketReply`:** se eliminan los modelos (huérfanos). Las tablas `tickets`/
`ticket_replies` se dejan como están (vacías) — **no** se hace `DROP` (regla de solo migraciones
aditivas); pueden retirarse a mano más adelante.

## Consecuencias

- Estado de lectura/archivado **por participante** (no por conversación): más filas pero refleja
  una bandeja real.
- El acceso se deriva de `associate_id`; `conversation_user` se puebla **bajo demanda** (al leer/
  archivar), no exige pre-cargar a todos los usuarios de la empresa.
- Adjuntos privados + descarga gateada (patrón [ADR-0010](0010-documentos-licitacion-privados.md)).

## Alternativas consideradas

- **Reusar `tickets`/`ticket_replies`:** traen `priority`/`status` de soporte que no aplican a una
  bandeja de correo; preferimos un modelo limpio. Descartada.
- **Archivado por conversación** (no por usuario): más simple, pero un lado archivaría para el otro.
  Descartada.
