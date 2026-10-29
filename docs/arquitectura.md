# Arquitectura — CAMEPG

Cómo está armado el sistema hoy y qué hay que respetar. Complementa a [`../AGENTS.md`](../AGENTS.md)
(forma de trabajo) y a los ADR en [`adr/`](adr/) (el porqué de cada decisión). El sistema visual
vive en [`../design.md`](../design.md).

## Qué es

Plataforma B2B (Laravel 12 + Inertia/React/TS) para las empresas asociadas de CAMEP (minería e
hidrocarburos, Colombia). El asociado llena su perfil por secciones, un admin lo revisa, y si se
aprueba la empresa sale en el directorio público. Encima van membresía/cobro, foros (Red CAMEP),
bienes y servicios, convocatorias/licitaciones y blog.

**Stack:** Laravel 12 · PHP 8.2+ · Inertia 2 + React 18 + TypeScript · Tailwind 3 + Radix/shadcn ·
Tiptap · Framer Motion · MySQL (`camepg`) · Spatie MediaLibrary sobre Minio/S3 · Resend (correo) ·
Ably + Laravel Echo (realtime) · stancl/tenancy (previsto para Vitrina) · Ziggy · Bold (pagos).

## Entorno de desarrollo (Windows)

- **Usa PowerShell** para `php`, `composer` y `artisan` (Laravel Herd los pone en el PATH de
  PowerShell, no de Git Bash). `npm` funciona en cualquier shell.
- Sitio local: `https://camepg.test/`.
- Base de datos: **MySQL `camepg`** en `127.0.0.1:3306` (no SQLite, aunque `.env.example` lo traiga;
  las **pruebas** sí usan SQLite `:memory:`, ver `phpunit.xml`).
- Archivos/media: **Minio/S3**. Si falla la escritura de storage:
  `icacls G:\Camepg\storage /grant Todos:(OI)(CI)F /T`.
- Repositorio en `G:\Camepg`. **Rama única de trabajo: `production`** (atípico; cuidado con commits
  directos). `*push` sube a `origin`.

## Comandos útiles

```powershell
php artisan migrate --seed
php artisan test                               # o: php vendor/bin/pest
php artisan db:seed --class=FeatureSeeder      # cataloga módulos preservando acceso actual
php artisan create:admin "Nombre" correo pass  # crea superadmin
php artisan schedule:list
npm run dev            # o npm run build
npm run lint           # ESLint + Prettier (resources/js) — OJO: corre con --fix (reformatea)
npm run emails:build   # compila plantillas React de correo (resources/js/emails) -> vistas Blade
npm run emails:dev     # previsualiza los correos en el navegador (react-email)
./vendor/bin/pint      # formato PHP
npm run preflight      # gates proporcionales al cambio (desde PowerShell)
```

## Arquitectura — lo que hay que respetar

- **Una sola aritmética de vigencia.** Todo pago aprobado pasa por
  `App\Services\SubscriptionService`; base `max(hoy, plan_expires_at)`, anclado al **día 19**.
  No dupliques ese cálculo. Ver [ADR-0001](adr/0001-motor-de-cobro-unificado.md).
- **Un solo punto de entrada de pagos.** Los tres rieles (Bold, transferencia, efectivo) entran por
  `App\Services\PaymentService`. El webhook de Bold vive en `App\Services\Bold\BoldGateway` (firma
  verificada, idempotente por `payment_id`).
- **Todo módulo del área de asociados lleva interruptor de plan** aplicado **en el servidor**
  (controlador o middleware `feature:<clave>`), no solo oculto en el frontend. Regla del
  [ADR-0002](adr/0002-interruptores-de-modulo-por-plan.md). Un módulo nuevo es una fila en
  `features`, no una migración sobre `plans`.
- **Estados de suscripción se derivan, no se guardan.** `al_dia` / `en_gracia` / `vencida` salen de
  `plan_expires_at` + `plan.grace_days`. No toques el ENUM de `associates.status` para esto.
- **Las rutas de facturación y pago nunca se bloquean**, en ningún estado (un vencido siempre puede
  pagar). El bloqueo escalonado lo hace `CheckSubscription`.
- **Perfil por secciones:** `section_reviews` (JSON, máquina de estados) reemplazó al viejo
  `audit_log` campo a campo. Estados: `draft → pending → approved | rejected → change_pending`.
  Lógica en `App\Models\Associate` (`getSectionReview`, `setSectionStatus`, `canEditSection`).

## Middleware (alias, ver `bootstrap/app.php`)

- `superadmin` — solo superadmin.
- `subscription.active` — bloqueo escalonado por estado de suscripción.
- `associate.onboarding` — flujo de alta del asociado.
- `feature:<clave>` — compuerta de plan (404 si el módulo está apagado globalmente; redirige a
  facturación si el plan no lo incluye).
- `webhooks/*` está **fuera de CSRF** (Bold firma sus avisos).

## Correo y notificaciones

- Correo saliente por **Resend**. Hay ~20 Mailables en `app/Mail`.
- **Plantillas de correo en React** (`react-email`), en `resources/js/emails/`. Se **autoran en
  React** y se **compilan a Blade** con `npm run emails:build` (ver
  [ADR-0004](adr/0004-plantillas-correo-react.md)). El runtime no cambia: los Mailables siguen
  apuntando a `resources/views/emails/**.blade.php` (archivos **generados**, no editar a mano). Los
  estilos van inline con hex literal (los clientes de correo no soportan tokens).
- Los correos de facturación se envían con `defer()` (tras la respuesta), así que **hoy no hace
  falta un worker de cola**. Si se corre `queue:work`, se pueden migrar a `ShouldQueue`.
- Realtime con **Ably + Laravel Echo**. La unificación de notificaciones venía en curso en la rama
  `feature/camep-unified-notifications`; aún no hay `app/Notifications` — confírmalo antes de asumir.

## Pruebas

- Suite en `tests/` con **Pest** (Feature + Unit) sobre SQLite `:memory:`, y **Vitest** para el
  frontend. Hoy hay cobertura real (section reviews, servicios, micrositio, auth…), no solo los
  tests de Breeze. El estado de los gates y su deuda viva en [`pendientes.md`](pendientes.md).
- **Regla:** todo cambio en el motor de cobro, los interruptores de plan o las section reviews lleva
  o actualiza pruebas.
