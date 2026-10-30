# ADR-0011 — Cola de trabajos y worker con Redis + Horizon

- **Estado:** Aceptada
- **Fecha:** 2026-10-29
- **Contexto del cambio:** plan [0026 — Bandeja interna de mensajería](../modulos/0026-bandeja-interna-mensajeria.md).

## Contexto

Hasta ahora el proyecto operaba **sin worker de cola**: los correos salen con `defer()` (tras la
respuesta), las conversiones de imagen son `nonQueued()`, y `QUEUE_CONNECTION=database` sin un
proceso que consuma la tabla `jobs`. Broadcasting con **Ably** ya está configurado
(`config/broadcasting.php`, `routes/channels.php`, `resources/js/lib/echo.ts`) y se usa para
avisos en vivo.

La **bandeja de mensajería** (plan 0026) necesita:
- entrega en **tiempo real** fiable de muchos eventos de mensaje;
- **fan-out** de envíos a grupos (crear un hilo por asociado) sin bloquear la request;
- reintentos y visibilidad de los trabajos.

Un `ShouldBroadcast` normal quedaría parado sin worker, y resolverlo todo con
`ShouldBroadcastNow` (síncrono) no escala para el fan-out masivo ni da reintentos/observabilidad.

## Decisión

Adoptar una **cola real con Redis** y **Laravel Horizon** como supervisor y dashboard:

- `QUEUE_CONNECTION=redis` · `BROADCAST_CONNECTION=ably` (la conexión Ably ya existe).
- Cliente Redis: **`predis/predis`** (PHP puro; evita depender de la extensión en Windows/Herd).
- **Horizon** gestiona los workers y expone `/horizon`, **gateado a superadmin**
  (`Gate::define('viewHorizon', fn($u) => $u->isSuperadmin())`).
- Pasan a **cola**: los broadcasts de mensajería (`ShouldBroadcast`), el **fan-out** a grupos
  (Job dedicado) y las notificaciones nuevas del módulo.
- **Se mantienen por ahora**: los correos con `defer()` y las conversiones de imagen `nonQueued()`
  (pueden migrarse a `ShouldQueue` más adelante, fuera de este corte).

## Consecuencias

- **Nueva dependencia de infraestructura: Redis.**
  - Local (Windows/Herd): Horizon **no corre** (requiere `ext-pcntl`/`ext-posix`, propias de
    Unix, que PHP en Windows no tiene). En local se usa `php artisan queue:work redis` con Redis
    local (Memurai/WSL/Docker). Las operaciones de `composer` en Windows ignoran esos requisitos
    (`--ignore-platform-req=ext-pcntl,ext-posix`; además `config.platform-check=false` evita que
    el autoload falle en tiempo de ejecución). Horizon se usa **solo donde hay pcntl/posix** (prod).
  - Producción (**Laravel Forge**): Redis viene **por defecto** al aprovisionar (localhost, 6379,
    cerrado al exterior). Se activa el **toggle "Laravel Horizon"** del sitio, que crea el daemon
    (`php artisan horizon` bajo Supervisor) y **añade `php artisan horizon:terminate`** al deploy
    script automáticamente. Con `predis` no se depende de `ext-redis`. Se actualiza
    [`../despliegue.md`](../despliegue.md).
- Nuevo punto de fallo (Redis/worker) → se **monitorea con Horizon**; si el worker cae, los
  mensajes siguen persistidos en BD y se entregan al reconectar (Ably solo es entrega en vivo).
- **Enmienda** la guía previa de "no hace falta worker" (CLAUDE.md/arquitectura): a partir de aquí
  sí hay worker en los entornos donde corra la bandeja.

## Alternativas consideradas

- **Seguir "sin worker" con `ShouldBroadcastNow`** (síncrono en la request): cero infra nueva, pero
  bloquea en fan-out masivo y no da reintentos ni observabilidad. Descartada para este módulo.
- **Cola `database` con `queue:work`**: evita Redis, pero sin dashboard ni la robustez/paralelismo
  de Horizon. Descartada (el equipo ya opera Horizon en otros proyectos).
- **SQS u otro backend cloud**: más infraestructura externa de la necesaria hoy. Descartada.
