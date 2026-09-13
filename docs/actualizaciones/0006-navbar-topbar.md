# Plan de actualización — Navbar / Topbar del panel

- **Estado:** ✅ Hecho (2026-09-13). Cortes: 6A·Avatar, 6B·Dropdown Menu (+ Badge, aportado por el
  usuario aunque estaba fuera de alcance; queda como primitivo listo), 6C·Topbar (menú de usuario con
  Avatar+Dropdown, "Mi perfil"/"Salir" movidos desde el `SidebarFooter`, campana como `Button ghost`,
  borrado del `ui/Avatar` legacy, backfill del índice). La campana sigue **sin** centro de
  notificaciones (§6): es su propio módulo. Pendiente de `#commit`.
- **Fecha:** 2026-09-13
- **Alcance:** El **topbar del panel de gestión** (`resources/js/Layouts/AppLayout.tsx`),
  hermano del sidebar del plan [0005](0005-sidebar-navegacion.md). Entra: migrar el topbar al
  sistema de diseño, montar el **menú de usuario** (avatar → "Mi perfil" / "Salir") y **mover esas
  dos acciones desde el footer del sidebar** al topbar. **No entra:** el navbar público
  (`Components/Navbar.tsx`, otro módulo), ni el centro de notificaciones (campana) —ver §6—, ni
  cambios de backend.

> Este plan no se ejecuta hasta `#go`. Solo se implementa lo aquí descrito.

---

## 1. Componentes *(primer punto, obligatorio)*

El topbar hoy arma el avatar a mano (un `div` con imagen/inicial) y la campana es un `<button>`
sin comportamiento. Para el menú de usuario se necesitan dos primitivos que aún no existen en
`base/`; se crean **desde su spec de shadcn** (solo se adaptan tipografía/colores/tokens) en el
orden de dependencias de [`orden-componentes.md`](orden-componentes.md).

| Componente | Rol en el topbar | Estado | Acción |
| --- | --- | --- | --- |
| **SidebarTrigger** / **SidebarInset** | disparador del sidebar y contenedor del topbar | ✅ en `base/` | Reutilizar |
| **Separator** | divisores verticales del topbar | ✅ en `base/` | Reutilizar |
| **Tooltip** (`TooltipProvider`) | ya montado en `AppLayout` (lo exige el sidebar) | ✅ en `base/` | Reutilizar |
| **Avatar** | avatar del usuario (foto → logo → inicial), *trigger* del menú | ❌ no existe | **Crear (6A)** — fase 1, sin deps |
| **Dropdown Menu** (familia) | menú de usuario: "Mi perfil" / "Salir" | ❌ no existe | **Crear (6B)** — fase 3, Radix |
| **Badge** | contador de notificaciones en la campana | ❌ no existe | **Fuera de alcance** (campana sin comportamiento, ver §6) |

- **Reutilizar:**
  - `base/Sidebar` → `SidebarTrigger`, `SidebarInset` (ya en uso).
  - `base/Separator` → divisores verticales (ya en uso).
  - `base/Tooltip` → `TooltipProvider` ya está en `AppLayout` (lo exige el sidebar); disponible.
  - `lucide-react` → iconos (`Bell`, `LogOut`, `UserCircle`, `ChevronDown`).
- **Integrar (crear en `base/` desde spec, en este orden):**
  - **Avatar** *(fase 1, `[ ] ↻`)* — reemplaza el avatar hecho a mano del topbar (imagen de
    perfil → logo del asociado → inicial como *fallback*). Primitivo sin dependencias.
  - **Dropdown Menu** *(fase 3, `[ ] ↻`)* — el menú de usuario que se abre desde el avatar, con
    "Mi perfil" y "Salir". Radix (`radix-ui`).
- **Reemplazar / retirar:**
  - El avatar manual del topbar → `base/Avatar`.
  - Los ítems **"Mi perfil"** y **"Salir"** del `SidebarFooter` en
    `Components/AppSidebar/index.tsx` → pasan al menú de usuario del topbar (y se elimina el
    `SidebarFooter` del sidebar).
- **Nuevo (solo si es necesario):** ninguno fuera de los dos primitivos de `base/` anteriores.
  `Badge` (para un contador de notificaciones) queda **fuera de alcance** porque la campana no
  gana comportamiento en este corte (ver §6).

> Nota de convivencia: el `ui/DropdownMenu` (legacy) seguirá usándose en `Navbar.tsx`,
> `Forums/TopicShow.tsx` y `Admin/Contacts/Index.tsx` hasta que esos módulos entren en alcance.
> Este corte crea `base/DropdownMenu` y lo usa **solo en el topbar**; el viejo se borra cuando
> quede sin referencias (regla incremental de `agents.md`/`design.md`).

## 2. Documentación *(segundo punto, obligatorio)*

- [x] Este plan (`0006-navbar-topbar.md`).
- [ ] `orden-componentes.md` — marcar **Avatar** y **Dropdown Menu** como `[x]` al crearlos y
      registrarlos en la galería `/dev/componentes`.
- [ ] `README.md` de actualizaciones — añadir la fila 0006 (y backfill de 0004/0005, que faltan).
- [ ] Resolver la nota de memoria *sidebar → navbar pendiente* al terminar el corte.
- [ ] Sin **ADR**: es migración/consolidación de UI, no una decisión de arquitectura nueva.

## 3. Flujo actual *(obligatorio, antes de proponer cambios)*

- **Punto de entrada:** `resources/js/Layouts/AppLayout.tsx` (envoltura de todas las pantallas del
  panel: `TooltipProvider` → `SidebarProvider` → `AppSidebar` + `SidebarInset`). El topbar es el
  `<header sticky h-16>` dentro de `SidebarInset`.
- **Acciones principales (hoy):**
  - Izquierda: `SidebarTrigger` + `Separator` + título (`tenant.company_name` o "Panel de Gestión").
  - Derecha: campana (`<button aria-label="Notificaciones">` **sin acción**) + `Separator` +
    bloque de usuario (nombre + rol "Administrador CAMEP"/"Asociado") + avatar (div a mano:
    `profile_photo_url` → `associate.logo_url` → inicial del nombre).
  - "Mi perfil" (`route('profile.edit')`) y "Salir" (`route('logout')`, POST) viven **en el
    `SidebarFooter`** del `AppSidebar`, no en el topbar (ubicación provisional del plan 0005).
- **Estados:** `isAdmin = is_superadmin || role==='admin'` cambia solo la etiqueta de rol. El
  avatar tiene 3 estados de *fuente* (foto / logo / inicial).
- **Validaciones / errores:** ninguna en el topbar (es navegación). El logout es un POST de
  Inertia (CSRF por token de Inertia).
- **Redirecciones:** "Mi perfil" → edición de perfil; "Salir" → logout y a `welcome/login`.
- **Dependencias relevantes:** props de Inertia `auth.user` (`name`, `role`, `is_superadmin`,
  `profile_photo_url`), `auth.associate.logo_url`, `tenant.company_name`. Notificaciones en tiempo
  real por `useNotifications` (Ably/Echo) → `NotificationToastStack` (toasts flotantes,
  independiente del topbar).
- **Resultado esperado:** cabecera consistente con el sistema de diseño; el usuario accede a su
  perfil y cierra sesión desde un único menú en el avatar; el sidebar deja de duplicar esas
  acciones en su footer.

## 4. Revisión de accesibilidad

- **Dropdown Menu (Radix):** foco, navegación con teclado (flechas/Esc), `aria-haspopup`/roles y
  cierre por foco los gestiona Radix. El *trigger* debe ser accesible (botón con nombre: el
  nombre del usuario o `aria-label`).
- **Avatar:** imagen con `alt` significativo; *fallback* con la inicial cuando no hay imagen (no
  comunicar identidad solo por color).
- **Salir:** acción real vía `<Link method="post" as="button">` (no un enlace GET), foco visible.
- **Campana:** mantiene `aria-label="Notificaciones"` y foco visible (sin cambio de comportamiento).
- **Contraste:** todo por tokens (`text-muted-foreground`, `bg-primary`/`text-primary-foreground`,
  `border-border`), coherente con `design.md`.

## 5. Revisión de seguridad

- Sin cambios de servidor: el topbar solo consume props ya expuestas por Inertia.
- Logout conserva CSRF (POST de Inertia). No se exponen datos nuevos ni secretos.
- El rol mostrado es informativo; la autorización real sigue en servidor (middleware/policies,
  `agents.md` §7.4). No se toma ninguna decisión de acceso en el cliente.

## 6. Revisión funcional

- **Debe seguir igual:** título del panel, `SidebarTrigger`, divisores, avatar con sus 3 fuentes,
  rutas de "Mi perfil" y "Salir" (mismo destino y método), toasts en tiempo real.
- **Cambia:** "Mi perfil" y "Salir" pasan del footer del sidebar al **menú de usuario** del topbar;
  el avatar pasa a ser el *trigger* del menú; el avatar y el bloque de rol se rehacen con
  `base/Avatar` + tokens.
- **Campana / centro de notificaciones — fuera de alcance (justificación):** hoy no hay almacén de
  notificaciones (solo toasts en tiempo real; `CLAUDE.md` indica que la unificación de
  notificaciones está *en curso* en la rama y que **aún no existe `app/Notifications`**). Montar un
  panel de campana con historial y contador implica backend nuevo → es **su propio módulo**. En
  este corte la campana solo se deja limpia con tokens (mismo comportamiento actual). Igual queda
  **fuera** el rediseño de `NotificationToastStack` (usa colores hardcodeados; se migrará con el
  módulo de notificaciones).
- **Casos límite a cubrir con pruebas:** Avatar sin imagen (muestra inicial); Dropdown abre y
  ofrece "Mi perfil"/"Salir"; el menú renderiza con nombre largo (truncado).

## 7. Plan de actualización (pasos / cortes)

- **6A · Avatar** — crear `base/Avatar.tsx` desde spec (tokens), añadir a la galería
  `/dev/componentes` con estados (imagen / *fallback* inicial) y test. Marcar `[x]` en
  `orden-componentes.md`.
- **6B · Dropdown Menu** — crear `base/DropdownMenu.tsx` desde spec (Radix, tokens), añadir a la
  galería con un ejemplo (trigger + ítems + separador) y test. Marcar `[x]`.
- **6C · Topbar** — en `AppLayout.tsx`: montar el menú de usuario (`base/Avatar` como *trigger* de
  `base/DropdownMenu`) con "Mi perfil" y "Salir"; limpiar la campana a tokens; y en
  `Components/AppSidebar/index.tsx` **quitar el `SidebarFooter`** con esas dos acciones. Actualizar
  el índice `README.md` (0004/0005/0006) y resolver la nota de memoria del pendiente.

Cada primitivo se crea **tal cual su spec** (solo tipografía/colores/tokens y las adaptaciones
Tailwind v4→v3 ya documentadas en los componentes previos). El usuario pega la spec con cada `#go`.

**Gates a ejecutar** (proporcionales al cambio): solo **frontend** —
`types:check` · ESLint · Prettier · Vitest. (Sin PHP; no hay cambios de servidor.)

## 8. Aprobación

- [ ] Plan revisado
- [ ] `#go` recibido → implementar (corte a corte: 6A → 6B → 6C)
