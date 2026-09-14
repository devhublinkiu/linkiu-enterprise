# Plan de actualización — Asociado: dashboard, galería y card del sidebar

- **Estado:** Hecho
- **Fecha:** 2026-09-14
- **Alcance:** área de **asociado**. (1) mover la card del plan del encabezado al **pie** del sidebar y
  depurar su información; (2) **quitar** el ítem "Soporte Técnico" del menú; (3) marcar los módulos aún
  no disponibles (**EmpleAmep**, **Reseñas**) con un badge **Próximamente**; (4) migrar **Galería de
  Fotos** al sistema `base/`; (5) rediseñar el **dashboard** del asociado con datos reales.
  **NO entra:** el dashboard de admin (se mantiene como está), ni backend nuevo (todos los datos ya
  llegan por `HandleInertiaRequests`: `subscription`, `unread_invoices`, `plan_features`, `auth.associate`).

---

## 1. Componentes *(primer punto, obligatorio)*

Todo de `base/`; **cero componentes nuevos**.

| Componente | Rol | Estado | Acción |
| --- | --- | --- | --- |
| **Card / CardHeader / CardContent** | dashboard y galería | ✅ base/ | Reutilizar |
| **Button** | subir/eliminar imágenes, CTAs del dashboard | ✅ base/ | Reutilizar |
| **Badge** | estado de membresía · "Próximamente" · portada | ✅ base/ | Reutilizar |
| **Progress** | avance de perfil y de galería | ✅ base/ | Reutilizar |
| **Alert** | consejo/aviso en galería | ✅ base/ | Reutilizar |
| **Sidebar (SidebarFooter, SidebarMenuBadge)** | card del plan al pie + badge del menú | ✅ base/ | Reutilizar |

- **Reemplazar / retirar:** `Gallery.tsx` y `Dashboard.tsx` usan `Components/ui/*` (legado) → se
  reescriben en `base/`.
- **Nuevo:** ninguno.

## 2. Documentación *(segundo punto, obligatorio)*

- [x] Este plan (`0020-asociado-dashboard-galeria-sidebar.md`).
- [x] `README.md` de actualizaciones — fila 0020.
- Sin ADR: no hay decisión de arquitectura (solo UI del área de asociado).

## 3. Flujo actual *(obligatorio, antes de proponer cambios)*

- **Card del plan** (`plan-widget.tsx`) vive en `SidebarHeader` (arriba). Muestra color del plan,
  nombre, estado, progreso, y avisos "Activar perfil" / "Sin suscripción" en dos sitios sueltos. La
  barra de progreso usa `days_total` derivado de `PaymentRequest.reviewed_at` (legado) → con el motor
  unificado puede venir `null` y no pinta.
- **Menú de asociado** (`nav-items.ts`) tiene "Soporte Técnico" (`href '#'`), y "EmpleAmep" y "Reseñas"
  también con `href '#'` (módulos aún no construidos; `enabled_default=false` en el catálogo).
- **Galería** (`Gallery.tsx`) en legado `ui/*`, estilo `font-black uppercase tracking-widest`. Sube
  logo y fotos, marca portada, respeta límite del plan (`limit_gallery`).
- **Dashboard** (`Dashboard.tsx`, ruta compartida admin+asociado, cierre en `web.php`) en legado.
  Solo recibe `company_name` + `section_reviews`; las otras dos cards son relleno ("analíticas en
  desarrollo" y actividad ficticia `[1,2,3,4]`).

## 4. Revisión de accesibilidad

- Estados por **texto + color** (Badge), nunca solo color. "Próximamente" es texto, no solo estilo.
- Card del plan al pie: sigue oculta en modo icono (`group-data-[collapsible=icon]:hidden`).
- Galería/dashboard: encabezados jerárquicos, botones con label, foco visible de `base/`.

## 5. Revisión de seguridad

- Sin cambios de backend ni de permisos. La compuerta real de módulos vive en el servidor
  (middleware `feature:*`, ADR-0002); el badge "Próximamente" y los accesos del dashboard son solo
  reflejo de UI. Subida/borrado de imágenes usa las rutas existentes (sin tocar).

## 6. Revisión funcional

- **Sidebar.** La card del plan pasa a `SidebarFooter`; consolida estado de membresía (Al día / En
  gracia / Vencido), días restantes, vencimiento y CTA de pago cuando aplica, más los avisos de
  perfil/suscripción. El progreso se deriva del **ciclo mensual** (no del legado) para que sea correcto.
- **Menú.** Se elimina "Soporte Técnico"; "EmpleAmep" y "Reseñas" muestran badge **Próximamente**
  (no navegan; `href '#'`).
- **Galería.** Misma funcionalidad (logo, grid, portada, límite, estados carga/vacío) en `base/`.
- **Dashboard (asociado).** Bloques con datos reales: identidad + estado de membresía; avance de perfil
  (secciones aprobadas); accesos rápidos a los módulos (con "Próximamente" donde aplica); facturas sin
  leer. Se elimina el relleno. **Admin** conserva su vista actual (fuera de alcance).
- **Casos límite:** sin suscripción → card muestra "Sin suscripción" + CTA; perfil no público → aviso
  de directorio; galería en el límite → botón de subir deshabilitado.

## 7. Plan de actualización (cortes)

- **20-A · Sidebar** — card del plan al pie (`SidebarFooter`), info depurada; quitar "Soporte Técnico";
  badge "Próximamente" en EmpleAmep y Reseñas (`nav-items.ts` + `nav-menu.tsx`).
- **20-B · Galería** — reescritura `Gallery.tsx` en `base/`.
- **20-C · Dashboard** — reescritura de la vista de asociado en `base/` con datos reales.
- **Tests:** Vitest para sidebar (badge Próximamente), galería y dashboard. Gates **7/7**.
- **Ampliación (mismo #go):** se marcan también **Mi Ranking** (asociado) y, en admin,
  **Roles y permisos** y **Reseñas** con badge Próximamente; Ranking se suma a los accesos rápidos
  del dashboard. Además, corrección **solo local**: `FILESYSTEM_DISK=public` en `.env` (Minio no
  instalado); el código usa `config('filesystems.default')`, no `MEDIA_DISK`. Producción intacta.

**Gates:** Pint · Larastan · Pest (backend) · types:check · ESLint · Prettier · Vitest (frontend).
Recordatorio: no correr `npm run lint` (reformatea todo el árbol); usar gates escopados o el preflight.

## 8. Aprobación

- [x] Propuesta debatida y ampliada (badge "Próximamente") por el usuario.
- [x] `#go` recibido → 20-A → 20-B → 20-C. Preflight 7/7 al cierre.
