# Pendientes — CAMEPG

**Único** lugar de pendientes del proyecto (deuda técnica, riesgos y gates en rojo), priorizados.
Las casillas se marcan al cerrar. Reglas en [`../AGENTS.md`](../AGENTS.md).

Prioridad: **P0** bloquea / urgente · **P1** importante · **P2** conviene · **P3** menor.

> El backlog de **documentación y gobernanza** aún vive en
> [`pendientes-documentacion.md`](pendientes-documentacion.md) y se irá trasladando aquí a medida que
> se intervenga cada módulo (decisión de migración incremental). Cuando quede huérfano, se mueve a
> `temporal/` para borrar.

---

## Gates en rojo (barrera de `*push`; se corrigen a medida que se avanza)

- [ ] **P1 · Larastan (~52 errores).** Tres focos, ninguno nuevo del corte 7: (a) `nonQueued()` del
      refactor de media en `BlogPost`/`Licitacion`/`BienesServiciosEmpresa`/`Announcement`
      (`method.notFound`) + entradas *stale* del `phpstan-baseline.neon` que ya no casan; (b) deuda
      de **genéricos** en mensajería (`$conversation->messages()->create()` devuelve `Model`, no
      `Message` → `storeAttachments`/`MessageSent::dispatch`): se cierra anotando
      `@return HasMany<Message, $this>` en las relaciones; (c) el viejo `->through()` de
      `PublicCompanyController`. Arreglar tipos y regenerar/limpiar el baseline.
- [ ] **P1 · Pest (1 de 213).** `tests/Feature/MicrositeTest.php` — "el directorio oculta los
      micrositios en borrador" espera `associates` = 1 y ve 13. Revisar el filtro de publicación del
      directorio y/o el aislamiento de datos del test.
- [ ] **P2 · Vitest (4 de 131 + flakiness).** `Dashboard.test.tsx` (el mock de `@inertiajs/react` no
      exporta `useForm` que usa `Dashboard.tsx`) y `PublicMicrosite.test.tsx` (`getByRole` encuentra
      varios "Servicios"). Más *timeouts* de arranque al aislar workers. Evaluar `isolate:false`.
- [ ] **P2 · Preflight da "rojo" falso desde Git Bash.** `php`/`composer` (Herd) no están en el PATH
      fuera de PowerShell → los gates PHP fallan por *command not found*. Ya documentado en
      `AGENTS.md`/`arquitectura.md`; opcional: que `scripts/preflight.mjs` avise si no encuentra `php`.

## Limpieza del repositorio

- [ ] **P3 · Basura de raíz.** `characterization_audit.md`, `routes.json`, `routes.txt`,
      `route_names.txt`, `logo_b64.txt`, `ziggy.json` y el archivo con nombre corrupto `toArray())`.
      Mover a `temporal/` (para que el usuario borre) o gitignorar, según el caso. **No borrar sin
      confirmar.** (`.env.bak-disk` ya quedó cubierto por `.gitignore` con el patrón `.env.bak*`.)

## Deuda de arquitectura/tests (resumen; detalle en `pendientes-documentacion.md`)

- [ ] **P1 · Suite mínima del motor de cobro:** `SubscriptionService` (aritmética, día 19,
      idempotencia), `PaymentService` (tres rieles, un solo punto que extiende), `BoldGateway`
      (firma HMAC, idempotencia por `payment_id`).
- [ ] **P2 · ADRs faltantes:** section reviews (decisión ya tomada, solo en memoria), notificaciones
      unificadas, Vitrina/subdominios (stancl/tenancy ya es dependencia), roles y autorización.
- [ ] **P2 · Entregabilidad de correo (infra, plan 0004 §10):** dominio remitente `camepg.org`,
      DKIM completo, DMARC `p=quarantine`, calentamiento.
- [ ] **P2 · Mensajería: correo `NewMessageMail` en Blade a mano.** Contradice
      [ADR-0004](adr/0004-plantillas-correo-react.md) (plantillas en react-email compiladas a Blade).
      Migrar `resources/views/emails/messaging/new-message.blade.php` a `resources/js/emails/` +
      `npm run emails:build`.
- [ ] **P3 · Mensajería: "Silenciar notificaciones" (diferido por el usuario).** Requiere migración
      aditiva `muted_at` en `conversation_user` + saltar correo/ping de inbox en `HandleNewMessage`,
      y su prueba. Definir alcance (¿solo admin?, ¿apaga correo, badge o ambos?) antes de implementar.
- [ ] **P3 · Referencia:** diagrama ER del núcleo (Associate ↔ Invoice ↔ Payment ↔ Plan ↔ Feature),
      glosario de dominio, mapa de módulos con su interruptor de plan, modelos huérfanos
      `Ticket`/`TicketReply`.
