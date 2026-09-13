# Plan de actualización — 0005 · Sidebar y navegación (shell de la app)

- **Estado:** ✅ COMPLETADO (2026-09-13, pendiente de `#commit`). Cortes: 5A·Tooltip, 5B·Sheet,
  5C·Sidebar+Skeleton (+ hook `use-mobile`, tokens `--sidebar-*`), 5D·Navegación (`AppSidebar`,
  cableado de `AppLayout`, borrado del `Components/Sidebar.tsx` viejo), 5E·Ajustes (logo `h-14`,
  card "Sin suscripción" tras los ítems) y 5Z·Cierre (preflight en verde, sin residuos de `ui/`).
  Adaptación al `Button` con `forwardRef` (React 18). Nota: "Mi perfil"/"Salir" se moverán al
  navbar cuando se intervenga ese módulo. Avisos Regla 6 (>250 líneas) en `base/Sidebar.tsx`
  (primitivo shadcn, no se parte), `nav-items.ts` y la galería: aceptados.
- **Fecha:** 2026-09-13
- **Alcance:** Rehacer el `Sidebar` del panel (admin y asociado) con componentes de
  `@/Components/base/` (tokens), creando antes sus primitivos faltantes (**Tooltip**, **Sheet**) y el
  primitivo **Sidebar** de shadcn, tal cual la spec (solo color→tokens y tipografía). Se **conserva
  toda la lógica actual** (items por rol, bloqueos por suscripción, widget de plan, submenús,
  colapsado, contadores) y se **borra** el `Components/Sidebar.tsx` viejo. Se alinea el shell
  (`AppLayout`) a tokens. **No entra:** rediseñar cada página interior ni tocar el backend (los props
  de navegación ya se comparten por Inertia); tampoco el menú público (`Navbar`/`PublicLayout`).

> Se trabaja por **cortes** (5A, 5B, …); cada corte se implementa con su propio `#go`. Los
> componentes de `base/` se crean **desde cero, tal cual la spec** (adaptación v4→v3, `dark:` fuera,
> color→tokens, tipografía). Se agregan a la galería `/dev/componentes` y se marca el chulo en
> `orden-componentes.md`.

---

## 1. Componentes *(primer punto, obligatorio)*

El `Sidebar` de shadcn es un **compuesto** (Fase 6) que depende de `[Sheet, Button, Separator,
Tooltip]`. Estado de esas dependencias:

| Componente | Rol en el sidebar | Estado | Acción |
| --- | --- | --- | --- |
| **Button** | trigger, botones de acción | ✅ en `base/` | Reutilizar |
| **Separator** | separadores de grupo | ✅ en `base/` | Reutilizar |
| **Tooltip** | etiqueta del ítem cuando está colapsado (modo icono) | ❌ no existe | **Crear** (5A) |
| **Sheet** | panel off-canvas en móvil (lo usa el propio Sidebar) | ❌ no existe | **Crear** (5B) |
| **Sidebar** (familia) | el primitivo completo | ❌ no existe | **Crear** (5C) |
| **Skeleton** | `SidebarMenuSkeleton` (carga) | ❌ no existe | Opcional (ver §Decisiones) |

- **Reutilizar:** `Button`, `Separator` (ya en `base/`); `Input` (ya en `base/`) si se usa
  `SidebarInput` (no previsto por ahora).
- **Integrar (crear en `base/`, spec de shadcn):** `Tooltip` (Radix), `Sheet` (Radix Dialog) y la
  familia `Sidebar` (`SidebarProvider`, `Sidebar`, `SidebarTrigger`, `SidebarRail`, `SidebarInset`,
  `SidebarHeader`, `SidebarContent`, `SidebarFooter`, `SidebarGroup*`, `SidebarMenu`,
  `SidebarMenuItem`, `SidebarMenuButton`, `SidebarMenuAction`, `SidebarMenuBadge`, `SidebarMenuSub*`,
  `useSidebar`).
- **Reemplazar:** `resources/js/Components/Sidebar.tsx` (hecho a mano, colores hardcodeados) →
  navegación reconstruida sobre `base/Sidebar`. El viejo **se borra** al quedar sin referencias
  (§2 agents.md, "no conviven dos versiones").
- **Nuevo fuera de shadcn:** ninguno. Toda pieza sale de la spec de shadcn; la navegación concreta
  (lista de items admin/asociado) es composición, no un componente nuevo.

> **Tokens del sidebar:** la spec de shadcn define su propia sub-paleta (`--sidebar`,
> `--sidebar-foreground`, `--sidebar-primary`, `--sidebar-accent`, `--sidebar-border`,
> `--sidebar-ring`). Se añaden a `resources/css/app.css` (tema claro) y a `tailwind.config.js`,
> **mapeados a los tokens de marca existentes** (design.md §2), no a colores crudos.

## 2. Documentación *(segundo punto, obligatorio)*

- [ ] **Sin ADR nuevo.** No hay decisión de arquitectura de dominio: el sidebar es presentación. La
      compuerta por plan ya vive en servidor (ADR-0002 + middleware `feature:`/`CheckSubscription`);
      aquí solo se **refleja** ese estado. Se anota explícitamente que el sidebar **no es** control de
      acceso.
- [ ] **`orden-componentes.md`:** marcar chulo de `Tooltip`, `Sheet`, `Sidebar` (y `Skeleton` si se
      crea) al entrar en `base/` + galería.
- [ ] **Galería `/dev/componentes`:** añadir Tooltip, Sheet y un ejemplo de Sidebar con sus variantes.
- [ ] Nota breve en este plan del **mapeo de tokens `--sidebar-*`** elegido (para mantenimiento).

## 3. Flujo actual *(obligatorio, antes de proponer cambios)*

- **Punto de entrada:** `resources/js/Layouts/AppLayout.tsx` monta `Components/Sidebar.tsx` en todas
  las pantallas autenticadas (admin y asociado).
- **Datos:** vienen por `usePage().props` (compartidos por `HandleInertiaRequests`): `auth`,
  `associate_counts`, `subscription`, `pending_payment_requests`, `unread_invoices`, `tenant`.
- **Acciones principales:**
  - Colapsar/expandir (`isOpen` en `AppLayout`, ancho `w-72`/`w-20`; el main ajusta `pl-72`/`pl-20`).
  - Navegación por `Link` de Inertia; submenús expandibles con estado local (`openMenus`).
  - Auto-apertura del submenú cuyo hijo está activo; tooltip en modo colapsado.
- **Estados:**
  - **Rol:** `adminItems` vs `associateItems` según `auth.user.is_superadmin`/`role === 'admin'`.
  - **Suscripción** (`subscription.status`: `none|active|grace|expired`): calcula bloqueos
    (`isGeneralLocked`, `isCompanyLocked`, `isBillingLocked`), widget de progreso del plan, avisos
    "Activar perfil" / "Sin suscripción".
  - **Contadores:** empresas por estado, pagos pendientes, facturas sin leer.
- **Validaciones/errores/redirecciones:** ninguna propia (es navegación); los `href` usan `route()`.
- **Dependencias relevantes:** `lucide-react` (iconos), `@/lib/utils` (`cn`), `Components/ui/Separator`.
- **Resultado esperado:** el mismo mapa de navegación y bloqueos, sin cambios de comportamiento; solo
  cambia la implementación visual (tokens + primitivos base) y se gana el modo móvil.

## 4. Revisión de accesibilidad

- **Ítem activo** con `aria-current="page"` (hoy no existe) — el `SidebarMenuButton` lo soporta con
  `isActive`.
- **Modo colapsado:** cada ítem icono lleva su **Tooltip** accesible (reemplaza al div hover actual,
  que no es accesible por teclado).
- **Navegación por teclado y foco visible** con `ring-sidebar-ring` (token), no outline crudo.
- **Submenús:** `aria-expanded`/`aria-controls` en el disparador; el móvil (Sheet) atrapa foco y
  cierra con `Esc` (Radix Dialog lo da).
- **No comunicar estado solo por color** (bloqueo lleva icono `Lock` + texto atenuado; el badge de
  estado del plan lleva etiqueta textual además del color).
- **`alt` del logo** descriptivo.

## 5. Revisión de seguridad

- **El sidebar es UX, no autorización.** Ocultar/bloquear un ítem **no** protege la ruta: la barrera
  real es servidor (middleware `superadmin`, `subscription.active`, `feature:<clave>`, Policies) —
  ver CLAUDE.md/ADR-0002. Se documenta para que nadie confíe el acceso al frontend.
- **Rutas de facturación/pago nunca se bloquean** en el sidebar (un vencido siempre puede pagar):
  se preserva que "Gestión del Plan"/"Mis Facturas" sigan la regla actual.
- Sin nuevos datos expuestos: se usan exactamente los props que ya se comparten.

## 6. Revisión funcional

- **Debe seguir igual:** mismo conjunto de items por rol; mismos bloqueos por estado de suscripción;
  contadores; auto-apertura del submenú activo; colapsado con tooltips; footer (Mi Perfil / Salir).
- **Cambia:** implementación con `base/` + tokens; estética alineada a design.md (fuera
  `uppercase font-black`, sombras marcadas, colores crudos); **nuevo modo móvil** (off-canvas con
  Sheet + trigger en el topbar).
- **Casos límite:** rol superadmin vs admin; asociado en `none`/`grace`/`expired`; sin
  `associate` (onboarding); contadores en 0/undefined; ruta activa dentro de submenú; viewport móvil.
- **Pruebas:** humo de Vitest para los primitivos nuevos (render + variantes) y para que la
  navegación monte sin `ui/`. (No hay lógica de negocio nueva que cubrir con Pest.)

---

## Cortes (orden por dependencias)

### Corte 5A · Tooltip (`base/`)
- Crear `resources/js/Components/base/Tooltip.tsx` tal cual la spec de shadcn (Radix Tooltip:
  `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`), color→tokens, v4→v3.
- Galería + chulo en `orden-componentes.md`.
- **Gate:** types:check · ESLint · Prettier · Vitest (humo) · build.

### Corte 5B · Sheet (`base/`)
- Crear `resources/js/Components/base/Sheet.tsx` tal cual la spec (Radix Dialog: `Sheet`,
  `SheetTrigger`, `SheetContent`, `SheetHeader`, `SheetFooter`, `SheetTitle`, `SheetDescription`,
  `SheetClose`), 4 lados, color→tokens, v4→v3.
- Galería + chulo.
- **Gate:** igual que 5A.

### Corte 5C · Primitivo Sidebar (`base/`)
- Añadir tokens **`--sidebar-*`** a `app.css` (tema claro) y `tailwind.config.js`, mapeados a marca.
- Crear `resources/js/Components/base/Sidebar.tsx` con la familia completa de la spec, usando
  `Sheet` (móvil) y `Tooltip` (colapsado). Hook `useIsMobile` (`resources/js/hooks/`) si la spec lo
  pide. `Skeleton` según §Decisiones.
- Galería: ejemplo mínimo (header + grupo + menú con sub-ítems + footer, colapsable). Chulo.
- **Gate:** igual que 5A + verificación de que el ejemplo colapsa y el móvil abre el Sheet.

### Corte 5D · Rehacer la navegación y el shell
- Reconstruir la navegación admin/asociado sobre `base/Sidebar` en
  `resources/js/Components/AppSidebar.tsx` (nombre nuevo), **portando 1:1** la lógica actual
  (items, `show`, `locked`, contadores, widget de plan, avisos, submenús, footer).
- Cablear en `AppLayout.tsx`: `SidebarProvider` + `SidebarInset`; **topbar** con `SidebarTrigger`
  (móvil) y alineado a tokens (hoy usa `slate-*`, `bg-white/80`…). El main deja de manejar
  `pl-72/pl-20` a mano (lo da `SidebarInset`).
- **Borrar `resources/js/Components/Sidebar.tsx`** al quedar sin referencias; sin imports de `ui/`.
- Si el archivo supera ~250 líneas o tiene 2+ secciones, partir en `parts/` (§7.4 agents.md):
  p. ej. `parts/nav-admin.tsx`, `parts/nav-associate.tsx`, `parts/plan-widget.tsx`.
- **Gate:** types:check · ESLint · Prettier · Vitest · build; revisión visual admin y asociado
  (`active`, colapsado, móvil, bloqueos, contadores).

---

## Decisiones a confirmar (recomendación incluida; se puede vetar en el `#go`)

1. **Modo móvil:** **incluirlo** (lo trae el `Sheet` de fábrica; hoy no existe y es un hueco real).
   *Recomendado: sí.*
2. **Shell/topbar:** alinear el topbar de `AppLayout` a tokens en 5D (hoy `slate-*` hardcode) para no
   dejar un topbar crudo junto a un sidebar tokenizado. *Recomendado: sí, dentro de 5D.*
3. **Estética:** quitar el `uppercase font-black` y las sombras marcadas, usar la escala tipográfica
   de design.md (coherente con auth). *Recomendado: sí.* Si prefieres conservar el look actual solo
   tokenizado, se marca aquí.
4. **Submenús animados:** por defecto se conserva el **estado local** actual (sin traer `Collapsible`,
   que es Fase 5) para no ensanchar. Si quieres animación/accesibilidad de disclosure completa, se
   agrega `Collapsible` como corte previo. *Recomendado: estado local ahora, `Collapsible` luego.*
5. **Skeleton:** el `SidebarMenuSkeleton` de la spec necesita `Skeleton` (Fase 1, trivial). Como no
   usamos estados de carga en el sidebar, por defecto **se omite ese sub-componente**. *Recomendado:
   omitir; crear `Skeleton` cuando un módulo lo pida.*

**Gates a ejecutar** (proporcionales): frontend — `types:check` · ESLint · Prettier · Vitest · build.
Sin cambios PHP previstos → sin Pint/Larastan/Pest salvo que algo del backend entre en alcance.

## Aprobación

- [ ] Decisiones (§ arriba) confirmadas
- [ ] Plan revisado
- [ ] `#go` por corte (empezando por **5A · Tooltip**)
