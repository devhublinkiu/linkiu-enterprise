# CAMEPG

Plataforma B2B para las empresas asociadas de **CAMEP** (sector minero e hidrocarburos, Colombia).
Cada empresa completa su perfil, un administrador lo revisa por secciones y, si se aprueba, la
empresa aparece en el **directorio público**. Sobre eso se montan la membresía y el cobro, la Red
CAMEP (foros), bienes y servicios, convocatorias y el blog.

## Stack

| Capa | Tecnología |
|---|---|
| Backend | Laravel 12 · PHP 8.2+ |
| Frontend | Inertia.js 2 + React 18 + TypeScript · Tailwind 3 · Radix UI · Tiptap · Framer Motion |
| Base de datos | MySQL (`camepg`) |
| Archivos / media | Spatie MediaLibrary sobre Minio/S3 (`league/flysystem-aws-s3-v3`) |
| Correo | Resend | 
| Realtime / broadcast | Ably + Laravel Echo (notificaciones) |
| Multi-tenant | stancl/tenancy (previsto para Vitrina Empresarial) |
| Rutas en JS | Ziggy |
| Pasarela de pago | Bold (botón de pagos) |

## Módulos

- **Asociados y perfil por secciones** — `basicinfo`, `characterization`, `contacts`,
  `documentation`, `services`, cada una con flujo de revisión (`section_reviews`).
- **Membresía y cobro** — motor unificado factura/pago, tres rieles (Bold, transferencia,
  efectivo). Ver [`docs/adr/0001-motor-de-cobro-unificado.md`](docs/adr/0001-motor-de-cobro-unificado.md).
- **Planes e interruptores de módulo** — catálogo `features` + `plan_feature`.
  Ver [`docs/adr/0002-interruptores-de-modulo-por-plan.md`](docs/adr/0002-interruptores-de-modulo-por-plan.md).
- **Directorio público**, **Red CAMEP (foros)**, **Bienes y Servicios**, **Convocatorias /
  Licitaciones**, **Blog**.

Toda la documentación de arquitectura vive en [`docs/`](docs/). Empieza por
[`docs/adr/README.md`](docs/adr/README.md).

## Puesta en marcha (desarrollo local, Windows + Laravel Herd)

PHP lo sirve **Laravel Herd** (`php` ya está en el PATH). Usa **PowerShell** para `php`/`composer`.
El sitio queda en `https://camepg.test/`.

```powershell
composer install
npm install
copy .env.example .env      # luego ajusta DB, Minio, Resend, Bold (ver abajo)
php artisan key:generate
php artisan migrate --seed
npm run dev                 # o: npm run build
```

Base de datos: MySQL `camepg` en `127.0.0.1:3306`. Ajusta `DB_*` en `.env`
(el `.env.example` trae SQLite por defecto; en este proyecto se usa MySQL).

Permisos de storage (una vez, si hay problemas de escritura):

```powershell
icacls G:\Camepg\storage /grant Todos:(OI)(CI)F /T
```

Crear un administrador:

```powershell
php artisan create:admin "Nombre" correo@dominio.com "contraseña"
```

## Variables de entorno clave

Además de las estándar de Laravel:

- `DB_*` → MySQL `camepg`.
- `AWS_*` / `FILESYSTEM_DISK` → Minio/S3 para media y documentos.
- `RESEND_KEY` / `MAIL_*` → envío de correo (Resend).
- `ADMIN_EMAIL` → destino de los avisos de comprobantes por revisar.
- `BOLD_API_KEY`, `BOLD_SECRET_KEY`, `BOLD_WEBHOOK_SECRET` → pasarela de pago. Sin las dos
  primeras, el pago en línea no aparece y la plataforma cobra por transferencia/efectivo.
  Detalles y matices de sandbox en [`.env.example`](.env.example) y
  [`docs/bold-integracion.md`](docs/bold-integracion.md).

## Tareas programadas

Requieren el cron de Laravel en el servidor (`* * * * * php artisan schedule:run`). Definidas en
[`routes/console.php`](routes/console.php):

| Comando | Cuándo | Qué hace |
|---|---|---|
| `invoices:generate-monthly` | día 15, 08:00 | Emite la cuenta de cobro (vence el 19) |
| `billing:send-reminders` | diario 09:00 | Avisos escalonados de corte y mora |
| `subscription:check-expiration` | diario | Oculta el perfil de quien pasó gracia |
| `payments:reconcile-bold` | cada hora | Cierra intentos de pago colgados |

## Pruebas y estilo

```powershell
npm run preflight       # orquesta los gates según lo que cambió (recomendado)
php artisan test        # PHPUnit / Pest
npm run lint            # ESLint + Prettier sobre resources/js
./vendor/bin/pint       # formato PHP (Laravel Pint)
```

El **preflight** (`scripts/preflight.mjs`) corre los gates que aplican al cambio; ver
[docs/actualizaciones/0002-preflight.md](docs/actualizaciones/0002-preflight.md).

## Despliegue

Checklist completo en [`docs/despliegue.md`](docs/despliegue.md).
