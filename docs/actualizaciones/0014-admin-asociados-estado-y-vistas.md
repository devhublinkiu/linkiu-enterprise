# Plan de actualización — Admin · Asociados: estado unificado + vistas (Index & Show)

- **Estado:** Hecho
- **Fecha:** 2026-09-14
- **Alcance:** Reorganizar el **ciclo de vida del asociado** en un **estado derivado único** y modernizar
  las dos vistas admin que lo muestran: la **lista** (`admin/associates` → `Index`, una sola tabla, el
  estado habla) y el **detalle/auditoría** (`admin/associates/{id}` → `Show`, shell + Resumen + galería
  como gestión). Incluye: gate de admisión (5 secciones aprobadas), flag de **desactivación manual**
  (`deactivated_at`), y limpieza del `SectionAuditPanel` muerto. **NO entra:** el motor de cobro
  (solo se **lee** la suscripción vía `SubscriptionService`), ni la migración de la galería del asociado
  a S3 (aquí la galería admin es solo gestión de UI sobre rutas existentes).

> Este plan no se ejecuta hasta `#go`. Solo se implementa lo aquí descrito, corte a corte.

---

## 1. Componentes *(primer punto, obligatorio)*

Ambas vistas están en idioma **legacy**: `Index` usa `@/Components/ui/*` + `<table>` cruda + `Tabs`
de filtros + colores hardcodeados; `Show` (shell), `TabOverview` y `TabGallery` usan `ui/*` + colores
crudos. Los 5 tabs de contenido (Básica, Caracterización, Contactos, Servicios, Documentación) **ya
están migrados** (base/ + tokens + AuditPanel local) — **no se tocan**.

**Componentes nuevos: NINGUNO** (a confirmar por corte). Todo sale de `base/`.

| Componente | Rol | Estado | Acción |
| --- | --- | --- | --- |
| **Table** (familia) | la lista de asociados (reemplaza `<table>` cruda) | ✅ base/ | Reutilizar |
| **Pagination** | pie de la lista | ✅ base/ | Reutilizar |
| **InputGroup** / **Select** | buscador + filtro por estado (reemplaza los 4 tabs) | ✅ base/ | Reutilizar |
| **Badge** | **Estado derivado** + secciones + verificada | ✅ base/ | Reutilizar |
| **Switch** | toggle `is_verified` (se conserva) | ✅ base/ | Reutilizar |
| **Avatar** | logo de la empresa en la tarjeta del Show | ✅ base/ | Reutilizar |
| **Progress** | avance de secciones en Show/Resumen | ✅ base/ | Reutilizar |
| **Card** | tarjetas del Show/Resumen/galería | ✅ base/ | Reutilizar |
| **Dialog** | confirmación de borrado de imagen + admitir/desactivar | ✅ base/ | Reutilizar |
| **Alert** | flash y avisos de estado | ✅ base/ | Reutilizar |
| **Button** | acciones (auditar, admitir, desactivar/reactivar) | ✅ base/ | Reutilizar |
| `ui/Tabs` (`Tabs`/`TabsContent`) | contenedor de tabs del Show | se **conserva** | No hay `base/Tabs` (migrarlo requiere spec aparte); ya lo usan los tabs migrados |

- **Reutilizar:** `Table*`, `Pagination`, `InputGroup`, `Select`, `Badge`, `Switch`, `Avatar`,
  `Progress`, `Card*`, `Dialog*`, `Alert`, `Button`. Iconos `lucide-react`.
- **Composición local:** helper de **estado derivado** en el front (badge + color + label) a partir del
  `estado` que ya calcula el servidor.
- **Reemplazar / retirar:** `Index` `<table>`/`Tabs`-filtros/`ui/*`/colores → `base/` + tokens;
  `TabOverview`/`TabGallery`/shell de `Show` `ui/*`/colores/`confirm()`/`window.open` → `base/` + tokens
  + `Dialog`; **borrar `SectionAuditPanel.tsx`** (componente muerto) tras extraer su tipo.

## 2. Documentación *(segundo punto, obligatorio)*

- [ ] Este plan (`0014-admin-asociados-estado-y-vistas.md`).
- [x] **ADR-0007 — Ciclo de vida del asociado (estado derivado)**: el estado admin se **deriva** de
      `status` + suscripción + `deactivated_at`, no se guarda; admisión gateada a 5 secciones; regla de
      desactivación manual vs vencimiento. `docs/adr/README.md` — fila 0007. ✅
- [ ] `README.md` de actualizaciones — fila 0014.
- [ ] `orden-componentes.md` — **sin cambios** (no se crea ningún componente).

## 3. Flujo actual *(obligatorio, antes de proponer cambios)*

- **Lista** (`GET admin/associates`, `AssociateController@index`): filtra por `?status=` (default
  `approved`) → `where('status', $status)` y renderiza `Admin/Associates/Index`. La vista tiene **4 tabs**
  (Activas=`approved`, Admitidas=`verified`, Pendientes=`pending`, Inactivas=`inactive`) + toggles
  `is_verified` e `is_public`.
- **Detalle** (`GET admin/associates/{id}`, `@show`): tabs de contenido (migrados) + `TabOverview`
  (Resumen, legacy) + `TabGallery` (legacy) + shell (legacy). El botón **"Admitir Socio"** llama
  `approve()`.
- **Ciclo de vida real (verificado en código):**
  `draft → pending → verified (ADMITIDO) → approved (ACTIVO)` [+ `rejected`].
  - `approve()`: `status='verified'`, `is_verified=true` (hoy **sin** exigir secciones aprobadas).
  - El pago pone `approved` + `is_public=true` (`PaymentService` webhook / `PaymentRequestController`).
  - `togglePublic()` / `toggleVerified()`: toggles manuales.
- **Suscripción:** **derivada** por `SubscriptionService::statusOf()` → `none|active|grace|expired`
  (de `plan_expires_at` + `plan.grace_days`); el corte por vencimiento apaga `is_public` y
  `republishIfDue()` lo reactiva al pagar. **No** vive en `status`.
- **Cruft detectado:** el ENUM incluye `active` (**nunca se escribe**); `inactive` **no está en el ENUM**
  y **nadie lo escribe** (la pestaña "Inactivas" y el contador del layout siempre dan vacío);
  `Associate::REVIEWABLE_SECTIONS` (4, sin Servicios) está **definido pero sin uso**, mientras el front
  cuenta 5 → barra de progreso inconsistente (`/4` en Resumen vs `/5` en el sidebar).

## 4. Revisión de accesibilidad

- **Tabla:** semántica nativa (`base/Table`), `aria-label` en acciones de fila (Auditar, Desactivar…),
  estado por **texto + color** (Badge), no solo color.
- **Filtro por estado:** `Select` etiquetado (reemplaza los tabs); buscador con etiqueta.
- **Dialogs** (admitir, desactivar, borrar imagen): foco atrapado, `Esc`, título asociado; reemplazan
  `confirm()`.
- **Botón "Admitir" deshabilitado**: cuando falten secciones, se explica **por qué** (texto, no solo
  disabled).

## 5. Revisión de seguridad

- Todo bajo middleware `admin` (ADR-0006). Sin cambios de autorización.
- **Gate de admisión al servidor** (autoridad): `approve()` rechaza si no están las 5 secciones
  aprobadas — el front solo asiste deshabilitando el botón.
- **Desactivación manual**: acción admin explícita (`deactivate`/`reactivate`) que sella `deactivated_at`
  y ajusta `is_public`; reactivar recomputa visibilidad según suscripción (`republishIfDue`).
- El **estado derivado** se calcula en el servidor (no se confía en el cliente).

## 6. Revisión funcional

- **Estado derivado (única fuente).** Método en `Associate` (p. ej. `adminState()`), calculado del
  `status` + `SubscriptionService::statusOf` + `deactivated_at`:
  | Estado | Regla | Bucket/label |
  |---|---|---|
  | **Pendiente** | `status ∈ {draft, pending, rejected}` | en proceso / revisión / correcciones |
  | **Admitida · sin pago** | `status = verified` | admitida, falta pagar |
  | **Activa** | `status = approved` y suscripción `active` | pública (hint "en gracia · N días" si `grace`) |
  | **Inactiva · vencida** | `status = approved` y suscripción `expired` | fuera del directorio (por fecha) |
  | **Inactiva · desactivada** | `deactivated_at` no nulo | apagada por el admin (precede a lo demás) |
  El front pinta el badge/label a partir de ese `estado` (+ dato de suscripción).
- **Admisión gateada.** `approve()` exige `allSectionsApproved()` (5 secciones). `REVIEWABLE_SECTIONS`
  pasa a **5** (incluye `services`) como única fuente para gate + progreso. El botón del Show se
  deshabilita e indica qué falta.
- **Desactivación manual.** Migración: `associates.deactivated_at` (nullable). `deactivate()` sella la
  marca + `is_public=false`; `reactivate()` la limpia + `republishIfDue()`. En la lista, acción de fila
  Desactivar/Reactivar. (`is_public` sigue siendo la visibilidad efectiva; `is_verified` **se conserva**
  como toggle, se escalará a futuro.)
- **Lista = una sola tabla.** `index()` deja de filtrar por `?status`; devuelve los asociados con su
  `estado` derivado + dato de suscripción, paginados, con **buscador** y **filtro opcional por estado**
  (`Select`, no tabs). Columnas: Empresa · NIT · Ubicación · Secciones (dots) · Verificada (Switch) ·
  **Estado** (badge) · Acciones (Auditar, Desactivar/Reactivar).
- **Show.** Shell + `TabOverview` + `TabGallery` reconstruidos en `base/` + tokens; Resumen usa el
  `estado` y el gate de admisión; galería = **gestión sin aprobación** (subir/portada/ver/eliminar con
  `Dialog`). `SectionReviewData` se extrae a `Parts/section-review.ts` (sin `change_pending`) y se borra
  el `SectionAuditPanel` muerto (6 imports actualizados).
- **Casos límite con pruebas:** `approve()` rechaza sin 5 secciones aprobadas y admite con ellas;
  `adminState()` devuelve cada estado (pendiente/admitida/activa/gracia/vencida/desactivada);
  `deactivate`/`reactivate` sellan y limpian `deactivated_at` y ajustan `is_public`; la lista responde
  sin `?status` y filtra por estado.

## 7. Plan de actualización (cortes)

- **14-A · Backend (estado + admisión + desactivación).** ✅ Migración `deactivated_at`;
  `REVIEWABLE_SECTIONS` → 5; `allSectionsApproved()`; `adminState()` (delega en `SubscriptionService`);
  `approve()` gateado; `deactivate()`/`reactivate()` + rutas; `index()` a **lista única** (paginada, con
  `estado` derivado + `subscription_status` por fila, búsqueda `q` y filtro coarse `filterByEstado`).
  `@property string $status` en el modelo (corrige el tipo estrecho del ENUM y retira 2 falsos "always
  false" del baseline); baseline ajustado (`plan` 2→3 por el `with('plan')`, `users` 2→1 al quitar el
  `with('users')` viejo). **Pest** `AssociatesLifecycleTest` (8 tests). Gates: Pint ✅ · Larastan `[OK]` ✅
  · Pest **123/123** ✅. (La UI vieja del Index queda desalineada con el paginator hasta 14-B.)
- **14-B · Index (una sola tabla).** ✅ `Admin/Associates/Index.tsx` reconstruido con `base/Table` +
  `Pagination` (local `TablePagination`) + `InputGroup` (búsqueda `q`) + `Select` (filtro por estado),
  **Estado** derivado en badge (con hint de suscripción "vence en N d" / "hace N d"), `SectionDots` con
  tokens, `Switch` de `is_verified`, acciones de fila en un **`DropdownMenu` con texto** ("Acciones" →
  "Auditar perfil" · "Desactivar/Reactivar empresa", con `Dialog` de confirmación) — sin iconos que
  confundan. Fuera los 4 tabs de filtro, la `<table>` cruda, `ui/*`, `StatusToggle` y colores.
  `types.ts` propio (Paginator, AssociateRow, ESTADO_BADGE). **Vitest** `AdminAssociates.test.tsx`.
  Gates: types:check ✅ · ESLint ✅ · Prettier ✅ · Vitest **91/91** ✅.
- **14-C · Show (shell + Resumen + galería + limpieza).** ✅ `Show.tsx` shell reconstruido en `base/` +
  tokens (Avatar del logo, badge de **estado derivado**, `Progress`, nav, botón "Admitir socio" gateado a
  las 5 secciones con explicación); `show()` pasa `estado`. `TabOverview` reescrito (conteo `/5`, estado y
  gate de admisión). **La Galería se retiró del Show** (confundía entre los tabs de auditoría siendo
  contenido de marketing sin aprobación; la administra el asociado en su sección Galería): fuera el tab,
  el nav y `TabGallery.tsx` (borrado). Las rutas admin `associates.gallery.*` quedan sin uso en el front
  (backend intacto; retiro opcional futuro). `SectionReviewData` extraído a `Parts/section-review.ts` (sin
  `change_pending`) y **`SectionAuditPanel.tsx` borrado** (6 imports actualizados). **Vitest**
  `AdminAssociateShow.test.tsx`. Gates: types:check ✅ · ESLint ✅ · Prettier ✅ · Vitest **92/92** ✅.

**Gates a ejecutar** (proporcionales): **PHP** — Pint · Larastan · Pest (14-A) · **Frontend** —
types:check · ESLint · Prettier · Vitest (14-B/14-C).

## 8. Aprobación

- [x] Decisión: **admitir solo con las 5 secciones aprobadas**.
- [x] Decisión: **flag de desactivación manual** (`deactivated_at`) para distinguir de "vencida".
- [x] Decisión: **`is_verified` se conserva** (se escalará a futuro); no se retira.
- [x] Decisión: **una sola tabla**, el **estado derivado** comunica ciclo de vida + pago (sin tabs).
- [x] Plan revisado.
- [x] `#go` recibido → **14-A ✅ → 14-B ✅ → 14-C ✅**. Plan 0014 implementado.

## Decisiones cerradas

1. **Estado derivado, no guardado.** El estado admin se calcula de `status` + suscripción +
   `deactivated_at`; `active`/`inactive` del ENUM quedan sin uso (no se escriben). Va en **ADR-0007**.
2. **Admisión = perfil 100%.** `approve()` exige las 5 secciones aprobadas; `REVIEWABLE_SECTIONS` = 5.
3. **Desactivación manual explícita.** `deactivated_at` separa "desactivada por admin" de "vencida".
4. **`is_verified` permanece** como marca escalable a futuro.
5. **Una sola tabla** con Estado que habla (incluye el pago); filtro por estado en `Select`, no tabs.
6. **Galería sin aprobación** (gestión); no es sección revisable ni gatea la completitud del perfil.
7. **Cero componentes nuevos**; `ui/Tabs` se conserva (su migración a `base/` es otro corte con spec).
