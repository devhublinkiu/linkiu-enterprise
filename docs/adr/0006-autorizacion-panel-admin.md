# ADR-0006 · Autorización del panel de administración

- **Estado:** Aceptada
- **Fecha:** 2026-09-14
- **Contexto del plan:** [0010-admin-servicios](../actualizaciones/0010-admin-servicios.md).

---

## Contexto

El grupo de rutas `admin.` (`/admin/*`) estaba protegido **solo por `auth`**: cualquier usuario
autenticado —incluido un asociado— podía acceder a las pantallas y acciones del panel
(`admin.services.*`, `admin.associates.*`, `admin.users.*`, pagos, etc.), incluidos `store`/`update`/
`destroy`. La única "protección" era que el sidebar no mostraba esos enlaces (seguridad por
oscuridad). Confirmado con `php artisan route:list -v` (solo `Illuminate\Auth\Middleware\Authenticate`).

Existía un middleware `superadmin` (`SuperAdminMiddleware`, solo `is_superadmin`) **registrado pero
no aplicado** al grupo. Además hacía `Log::info` en cada request (ruido y fuga de email/URL a los logs).

El front ya define el concepto de administrador como **`is_superadmin || role === 'admin'`**
(`HandleInertiaRequests`, `AppLayout` → `isAdmin`).

## Decisión

1. El panel `/admin/*` se protege con un middleware de rol **`admin`** aplicado a **todo el grupo**,
   con la regla **`is_superadmin || role === 'admin'`** — consistente con el `isAdmin` del front. Un
   asociado (u otro usuario) recibe **403**.
2. Se conserva `superadmin` (solo `is_superadmin`) como gate **más estricto** para lo que en el futuro
   deba ser exclusivo del superadmin; se le retira el `Log::info`.
3. La autorización vive en el **servidor** (middleware), no en la visibilidad del menú.

**Estado de datos al decidir:** un único admin (`is_superadmin = 1`, `role = 'admin'`); **cero**
usuarios `role='admin'` sin superadmin. El gate inclusivo no bloquea a nadie hoy y evita el footgun de
un futuro "admin de staff" (`role='admin'` sin superadmin) que el front trataría como admin pero un
gate solo-`superadmin` dejaría fuera.

## Consecuencias

- Cierra el hueco: las rutas y acciones del panel exigen rol admin en el servidor.
- Regla única de "quién es admin" compartida entre front (`isAdmin`) y back (middleware `admin`).
- Si algún día hay que restringir una sección solo a superadmin, se usa `superadmin` sobre esa
  subruta, no sobre todo el grupo.
- Los cambios de rol/estado siguen derivándose del usuario; no se duplica lógica de autorización en
  los controladores del panel salvo casos que requieran Policy propia.
