# Plan de actualización — Admin · Módulo de Servicios

- **Estado:** Borrador
- **Fecha:** 2026-09-14
- **Alcance:** El **módulo de administración de Servicios** (`/admin/services`): catálogo de servicios y
  sus **categorías**, que alimenta la sección **Servicios del asociado** (siguiente) y el **directorio
  público**. Incluye lado servidor (seguridad, validación, modelo) y lado admin (UI). **No entra:** la
  sección Servicios del asociado (va después, apoyada en este catálogo), ni el directorio público
  (solo se respeta su contrato de lectura: `name` + `slug`).

> Este plan no se ejecuta hasta `#go`. Solo se implementa lo aquí descrito, corte a corte.

---

## 1. Componentes *(primer punto, obligatorio)*

La pantalla actual usa componentes **legacy** (`ui/Button`, `ui/Card`, `ui/Input`, `ui/Label`), una
**`<table>` cruda**, `<select>` nativos, `confirm()` del navegador, paginación escrita a mano y colores
hardcodeados (**`slate-*`, `indigo-*`, `emerald-*`** → fuera de la paleta/tokens). Se reconstruye con
`base/` + tokens siguiendo **design.md §6**.

Los **componentes nuevos** son **dos**, ambos de **alto reúso** en todo el admin (Empresas, Usuarios,
Pagos, Facturas…) — por eso valen como primitivos de `base/` en vez de markup ad-hoc, y se crean
**desde la spec que pase el usuario** (regla de `agents.md` §7.5), como RadioGroup (0008) y Breadcrumb:

- **`Table`** (familia): la tabla del catálogo.
- **`Pagination`** (familia): el pie de paginación (hoy escrito a mano con `Link`); se repite en **todas**
  las listas del admin.

Un tercero, **`Switch`**, para el interruptor `is_active` (decidido: interruptor, no Checkbox).

Tabla auditada control por control contra el código real:

| Componente | Rol en Servicios | Estado | Acción |
| --- | --- | --- | --- |
| **Table** (`Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, …) | lista del catálogo | ⬜ por crear | **Crear (10-A) desde spec** — reutilizable en todo el admin |
| **Pagination** (`Pagination`, `PaginationContent`, `PaginationItem`, `PaginationLink`, `PaginationPrevious`, `PaginationNext`, `PaginationEllipsis`) | pie de paginación de la lista | ⬜ por crear | **Crear (10-A) desde spec** — reutilizable en todo el admin |
| **Dialog** (familia) | form crear/editar servicio, gestión de categoría y **confirmación de borrado** (reemplaza `confirm()`) | ✅ en `base/` | Reutilizar |
| **Field** (`Field`, `FieldLabel`, `FieldError`, `FieldDescription`) | campos del form | ✅ en `base/` | Reutilizar |
| **Input** | nombre, búsqueda | ✅ en `base/` | Reutilizar |
| **Input Group** | búsqueda con ícono | ✅ en `base/` | Reutilizar |
| **Select** (familia) | filtro por categoría + selector de categoría en el form | ✅ en `base/` | Reutilizar |
| **Switch** | `is_active` (interruptor; reemplaza el doble botón Activo/Inactivo) | ⬜ por crear | **Crear (10-A) desde spec** |
| **Button** | nuevo, editar, borrar, guardar, filtros, paginación | ✅ en `base/` | Reutilizar |
| **Badge** | estado (activo/inactivo) y conteo de empresas por servicio | ✅ en `base/` | Reutilizar |
| **Alert** | mensajes de éxito/error (flash) | ✅ en `base/` | Reutilizar |
| **Card** | contenedores de la gestión de categorías | ✅ en `base/` | Reutilizar |

- **Reutilizar:** `Dialog*`, `Field*`, `Input`, `Input Group`, `Select*`, `Button`, `Badge`,
  `Alert`, `Card`. Iconos por `lucide-react`. Reordenar categorías = `Button` (subir/bajar), sin
  dependencia de drag&drop ni componente nuevo.
- **Crear en `base/` desde spec:** `Table`, `Pagination` y `Switch` (10-A) — **creados** ✅.
- **Auditoría cerrada:** se recorrió cada control de la pantalla actual (búsqueda, filtros, per-page,
  tabla, badges de estado/conteo, acciones de fila, form, paginación) y de lo nuevo (categorías CRUD,
  confirmaciones). Todo queda cubierto por `base/` existente salvo **la tabla**, **la paginación** y el
  **interruptor** (`Switch`) de `is_active` — los tres creados en 10-A.
- **Composición local (no es `base/`):** helper `FormField` (0007) para envolver `Field` + control +
  error, reutilizado aquí.
- **Reemplazar / retirar (solo en esta pantalla):** `ui/Button`/`ui/Card`/`ui/Input`/`ui/Label` →
  `base/*`; `<table>` cruda → `base/Table`; `<select>` nativos → `base/Select`; `confirm()` →
  `base/Dialog` de confirmación; doble botón Activo/Inactivo → `base/Checkbox`; colores `slate/indigo/
  emerald` → tokens.

> Decisión abierta menor: `is_active` como **Checkbox** (sin componente nuevo) vs. un **Switch**
> (`base/Switch` no existe; requeriría spec aparte). Propuesta: Checkbox ahora; Switch queda para el
> futuro si se pasa su spec.

## 2. Documentación *(segundo punto, obligatorio)*

- [ ] Este plan (`0010-admin-servicios.md`).
- [x] **ADR-0006 — Autorización del panel admin**: el panel `/admin/*` se protege con middleware de rol
      (`is_superadmin || role==='admin'`); documenta el hueco (solo `auth`) y la regla adoptada.
- [x] `docs/adr/README.md` — fila 0006.
- [ ] `README.md` de actualizaciones — fila 0010.
- [x] `orden-componentes.md` — **Table**, **Pagination** y **Switch** marcados `[x]` (creados y en galería).
- [ ] `docs/ejemplos/empresa-ficticia.md` — sin cambios (es catálogo global, no de una empresa).

## 3. Flujo actual *(obligatorio, antes de proponer cambios)*

- **Entrada:** `GET /admin/services` → `Admin\ServiceController@index` → `Admin/Services/Index.tsx`.
  `index` trae servicios `with('category')->withCount('associates')`, filtra por `search` y
  `category_id`, pagina (`per_page` ∈ {10,25,50}).
- **Modelo:** `service_categories` (`name`, `slug` **único**) → `services` (`category_id`, `name`,
  `slug`, `is_active`) → pivot `associate_service`. `slug` se genera en `boot()::creating` **solo si
  viene vacío**; en `services` **no** es único y **no** se regenera al renombrar.
- **Acciones admin hoy:**
  - `store`: valida `name`, y `category_id` **o** `new_category_name` (crea categoría al vuelo),
    `is_active`.
  - `update`: **`$service->update($request->all())` sin validación**.
  - `destroy`: **hard-delete**; el pivot cascada → el servicio desaparece de todas las empresas.
- **Consumo del catálogo:**
  - **Asociado** (`editServices`): elige servicios **agrupados por categoría** (`SearchableSelect` por
    categoría) + una `description` libre de la empresa. (Se migra en el plan siguiente.)
  - **Público** (`serviceShow`/`categoryShow`): usa **solo** `name` y `slug` de servicio y categoría.
    → cualquier cambio de modelo debe preservar ese contrato; el slug de servicio debe ser estable/único.
- **Seguridad hoy:** el grupo `admin.` (bootstrap `routes/web.php:297`) está **solo bajo `auth`**
  (confirmado con `route:list -v`: únicamente `Authenticate`). El middleware `superadmin`
  (`SuperAdminMiddleware`, solo `is_superadmin`) **existe pero no se aplica** al grupo.
- **Categorías:** se **crean** inline pero **no** se pueden renombrar, borrar, fusionar ni reordenar.

## 4. Revisión de accesibilidad

- **Table:** `role`/semántica de tabla nativa (`<table>` con `<th scope>`); orden y foco por teclado en
  acciones de fila; cada acción-ícono con `aria-label` explícito ("Editar {servicio}", "Eliminar
  {servicio}").
- **Dialog de form y de confirmación:** foco atrapado, `Esc` cierra, título asociado (`aria-labelledby`),
  botón de cierre con etiqueta. Reemplaza al `confirm()` nativo (inaccesible y sin estilo).
- **Filtros:** `Select` y búsqueda con etiquetas asociadas; estado vacío con texto claro.
- **Estado (activo/inactivo):** comunicado con **texto + color** (Badge), no solo color.
- **Errores de validación:** `FieldError` (`role="alert"`) por campo + `Alert` de resumen.

## 5. Revisión de seguridad *(eje de este plan)*

- **🔴 Hueco de autorización (crítico).** Todo `/admin/*` es accesible por **cualquier usuario
  autenticado** (un asociado podría `store/update/destroy` servicios y ver/editar datos de otras
  empresas). **Fix:** aplicar un middleware de rol al **grupo `admin.` completo**. Regla propuesta,
  consistente con el `isAdmin` que ya usa el front (`HandleInertiaRequests`, `AppLayout`):
  **`is_superadmin || role === 'admin'`**. Se registra en **ADR-0006**.
  - *Decisión a confirmar:* ¿existe un rol `admin` no-superadmin con acceso legítimo? **Sí** → gate
    inclusivo (`is_superadmin || role==='admin'`). **No** → basta `superadmin`. Recomiendo el inclusivo.
- **Limpieza de `SuperAdminMiddleware`:** hoy hace `Log::info` **en cada request** (ruido + fuga de
  email/URL a logs) y responde un `403` de texto plano. Se limpia el log y se da una respuesta 403
  consistente.
- **`update()` sin validación:** se valida igual que `store` (nombre, categoría existente o nueva,
  `is_active` boolean). El servidor es la autoridad (§7.3).
- **Borrado seguro:** un servicio con empresas asociadas **no se borra en duro** (rompería el pivot y
  falsea el aviso actual). Regla: si `associates_count > 0` → **solo desactivar** (`is_active=false`);
  hard-delete permitido **solo con 0 empresas**. Confirmación por `Dialog` con el conteo real.

## 6. Revisión funcional

- **Debe seguir igual:** búsqueda + filtro por categoría + paginación; crear servicio (con categoría
  existente o nueva); estado activo/inactivo; el contrato público (`name`/`slug`).
- **Cambia / se añade:**
  - **Seguridad:** panel admin gateado por rol (§5).
  - **Modelo:** `services.slug` ya era único (migración de marzo) → **generación anti-colisión** y
    **slug estable al renombrar** (permalinks). Migración: `service_categories.order` (orden del
    agrupado). Sin `description`/`icon` (el público no los usa).
  - **Controlador:** `update` validado; `destroy` seguro; slug único garantizado.
  - **Categorías (CRUD):** renombrar, **borrar solo si está vacía**, reordenar (`order`), además de la
    creación inline ya existente. Endpoints propios (`admin.service-categories.*`).
  - **UI:** reconstruida con `base/` + tokens; form y confirmación en `Dialog`; `is_active` con
    `Checkbox`; tabla con `base/Table`; gestión de categorías en la misma pantalla.
- **Alertas / mensajes (contrato):**
  | Situación | Mensaje | Componente |
  |---|---|---|
  | Servicio creado / actualizado | "Servicio guardado." | `Alert success` |
  | Falta nombre/categoría | error por campo | `FieldError` + `Alert destructive` |
  | Borrar servicio con empresas | "Este servicio lo usan N empresas. Se desactivará en vez de borrarse." | `Dialog` de confirmación |
  | Borrar servicio sin empresas | "¿Eliminar «{servicio}»? No se puede deshacer." | `Dialog` de confirmación |
  | Borrar categoría no vacía | "La categoría tiene servicios; muévelos o elimínalos primero." | `Alert destructive` |
  | Acceso no autorizado a `/admin/*` | 403 consistente | middleware de rol |
- **Casos límite con pruebas:** asociado (no admin) **no** puede acceder a `admin.services.*`;
  `update` inválido no pasa; slug único al crear y al renombrar (colisión → sufijo); borrar servicio
  con empresas **desactiva** (no borra); borrar categoría no vacía se rechaza; crear categoría al vuelo
  sigue funcionando.

## 7. Plan de actualización (cortes)

- **10-A · Componentes `Table` + `Pagination`** ✅ — `base/Table.tsx` y `base/Pagination.tsx` creados
  desde spec (tokens, sin `dark:`; adaptaciones: `has-aria-expanded:`→`has-[[aria-expanded=true]]:`,
  `pl-1.5!`→`!pl-1.5`, `cn-rtl-flip` retirado, textos en español) + galería en `/dev/componentes` + `[x]`
  en `orden-componentes.md` + tests de render (Table, Pagination, Switch). Gates: tsc, ESLint, Prettier,
  Vitest 84/84. `is_active` irá con **Switch**.
- **10-B · Seguridad + backend** ✅ — middleware **`admin`** (`is_superadmin || role==='admin'`) en el
  grupo `admin.` (§5) + **ADR-0006** e índices; `SuperAdminMiddleware` limpiado (fuera `Log::info`, 403
  consistente). **Corrección de hallazgo:** `services.slug` **ya era único** (lo hace la migración
  `add_slug` de marzo) — no hubo migración de slug; el fix real fue **generación anti-colisión** (trait
  `HasUniqueSlug`: dos nombres iguales → `-2`, `-3`…) y **slug ESTABLE al renombrar** (preserva
  permalinks públicos). Migración única: `service_categories.order`. `ServiceController` (`update`
  validado; `destroy` seguro: desactiva si tiene empresas, borra si no); `ServiceCategoryController`
  (`store`/`update`/`destroy`-si-vacía/`order`) + rutas. Ajuste para Larastan (nivel 5, sin ensuciar el
  baseline): el conteo por categoría va por `groupBy` y el chequeo de vacío por `Service::where(...)`
  (sin `withCount`/método de relación). **Pest** (`AdminServicesTest`, **12 tests**): asociado 403 /
  admin OK, `update` inválido, slug único, slug estable, borrado seguro (desactiva/borra), categoría
  no-vacía protegida, renombrar, reordenar. Gates: Pest 12/12, suite 85/85, Pint, Larastan `[OK]`.
- **10-C · UI admin** ✅ — `Admin/Services/Index.tsx` + `Parts/` reconstruidos con `base/` + tokens
  (`Table`, `Pagination` con navegación Inertia, `Dialog` de form y de confirmación, `Switch` para
  `is_active` inline, `Select`/`InputGroup` de filtros) + `CategoriesDialog` (**gestión de categorías**:
  crear, renombrar, borrar-si-vacía, reordenar). Fuera `ui/*`, `<table>`/`<select>`/`confirm()` crudos y
  colores `slate/indigo/emerald`. Sigue design.md §6/§7.4 (Index + Parts). **Vitest** de la página.
  Gates: tsc, ESLint, Prettier, Vitest 85/85.

**Gates a ejecutar** (proporcionales): **PHP** — Pint · Larastan · Pest (10-B) · **Frontend** —
types:check · ESLint · Prettier · Vitest (10-A/10-C).

## 8. Aprobación

- [x] Specs de `Table` y `Pagination` recibidas → **10-A hecho**. `is_active` con `Checkbox` (sin `Switch`).
- [x] Decisión §5: gate **inclusivo** `is_superadmin || role==='admin'` (confirmado: 1 admin superadmin, 0 role-admin sueltos).
- [x] `#go` → **10-A ✅ → 10-B ✅ → 10-C ✅**. Plan 0010 implementado.

## Decisiones cerradas

1. **Seguridad primero.** El panel admin se gatea por rol (`is_superadmin || role==='admin'`) en todo
   el grupo `admin.`; queda en ADR-0006. (Confirmar el rol `admin` no-superadmin.)
2. **Modelo lean.** `services.slug` ya único → generación anti-colisión + **estable al renombrar**;
   `service_categories.order`. Sin `description`/`icon` (el directorio público no los usa).
3. **Borrado seguro.** Servicio con empresas → desactivar; hard-delete solo con 0 empresas.
4. **Categorías de primera clase.** CRUD real (renombrar / borrar-si-vacía / reordenar) además de la
   creación inline.
5. **Tres componentes nuevos:** `base/Table`, `base/Pagination` (reutilizables en todo el admin) y
   `base/Switch` (para `is_active`), todos desde spec. El resto se reutiliza; `confirm()`/`<select>`/
   `<table>`/paginación a mano y colores hardcodeados se retiran.
6. **CRUD admin, no ficha.** No aplica ADR-0005 / section-reviews; se rige por design.md y §7 de
   agents.md (validación al servidor, español, formatos Colombia).
