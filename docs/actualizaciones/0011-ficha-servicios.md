# Plan de actualización — Ficha del asociado · Servicios

- **Estado:** Borrador
- **Fecha:** 2026-09-14
- **Alcance:** La **sección Servicios** de la ficha del asociado, **completa: lado asociado y lado
  admin**. Se reconstruye sobre el sistema de diseño y se alinea con
  [ADR-0005](../adr/0005-fichas-de-asociado-por-seccion.md) y las reglas propias de
  [ADR-0005-d](../adr/0005-d-servicios.md) *(se crea en 11-A)*. Se apoya en el **catálogo admin de
  Servicios** ya migrado ([plan 0010](0010-admin-servicios.md)). **No entra:** el módulo admin de
  servicios (ya hecho), el directorio público (solo se respeta su contrato de lectura:
  `associate.description` + servicios), ni la vista general del admin (`Associates/Index` / Resumen).

> Este plan no se ejecuta hasta `#go`. Solo se implementa lo aquí descrito, corte a corte.

---

## 1. Componentes *(primer punto, obligatorio)*

La pantalla actual usa **legacy** (`ui/Button`, `SectionReviewBanner`, `<textarea>`/`<input>`/`<select>`
crudos, tarjetas ad-hoc) con colores hardcodeados (`slate-*`, `emerald-*`). Se reconstruye con `base/`
+ tokens y los patrones de **design.md §6**.

**No hay componente nuevo.** Se auditó cada control: el selector de servicios (buscar + filtrar por
categoría + alternar servicios + chips de selección) se **compone localmente** con primitivos ya
existentes (como los repetidores de Contactos), en un *part* `ServicePicker`.

Tabla auditada contra el código real:

| Componente | Rol en Servicios | Estado | Acción |
| --- | --- | --- | --- |
| **Card** (familia) | bloques "Propuesta de valor" y "Portafolio" | ✅ en `base/` | Reutilizar |
| **Textarea** | `description` (propuesta de valor) | ✅ en `base/` | Reutilizar |
| **Field** (`Field`, `FieldLabel`, `FieldError`, `FieldDescription`) | etiqueta + ayuda + error (vía `FormField`) | ✅ en `base/` | Reutilizar |
| **Input Group** | buscador del catálogo (con ícono) | ✅ en `base/` | Reutilizar |
| **Select** *(o RadioGroup)* | filtro por categoría | ✅ en `base/` | Reutilizar |
| **Checkbox** | alternar cada servicio del catálogo (tarjeta seleccionable) | ✅ en `base/` | Reutilizar |
| **Badge** | contador "N / límite" y chips de servicios elegidos | ✅ en `base/` | Reutilizar |
| **Button** | quitar chip, limpiar, guardar, enviar, editar | ✅ en `base/` | Reutilizar |
| **Alert** (`Alert`, `AlertTitle`, `AlertDescription`, `AlertAction`) | banner de estado, mensajes y **aviso de límite de plan** | ✅ en `base/` | Reutilizar |
| **Progress** | avance del formulario | ✅ en `base/` | Reutilizar |

- **Reutilizar:** `Card*`, `Textarea`, `Field*`, `Input Group`, `Select`/`RadioGroup`, `Checkbox`,
  `Badge`, `Button`, `Alert`, `Progress`. Iconos por `lucide-react`.
- **Crear en `base/`:** **nada**. Segunda sección de la ficha (tras Contactos) que se migra sin crear
  primitivos.
- **Composición local (no es `base/`):** `FormField` (0007) reutilizado; y un *part* **`ServicePicker`**
  que compone el buscador + filtro de categoría + grid de servicios seleccionables + chips.
- **Reemplazar / retirar (solo en esta sección):** `Components/SectionReviewBanner` → banner con
  `base/Alert` + botón **Editar** (reabre); `ui/Button` → `base/Button`; `<textarea>`/`<input>`/
  `<select>` crudos → `base/Textarea`/`Input Group`/`Select`; tarjetas y colores `slate/emerald` → `base/`
  + tokens; props muertas de auditoría por campo → eliminadas.

> Decisión menor: filtro de categoría con **`Select`** (compacto) vs. lista de `Button`/`RadioGroup`
> (más visible). Propuesta: `Select` en móvil + segmento simple en desktop, o solo `Select` para
> mantenerlo simple. A confirmar en §8.

## 2. Documentación *(segundo punto, obligatorio)*

- [ ] Este plan (`0011-ficha-servicios.md`).
- [x] **Sub-ADR [0005-d](../adr/0005-d-servicios.md)** — reglas propias: `description` + `service_ids`,
      **límite de servicios por plan al servidor** (ADR-0002), reapertura con Editar, admin no edita,
      contrato con el catálogo (solo servicios activos).
- [x] `docs/adr/README.md` — fila 0005-d.
- [x] `README.md` de actualizaciones — fila 0011.
- [x] `docs/ejemplos/empresa-ficticia.md` — empresa (PSL) **extendida** con Servicios (propuesta de
      valor + servicios elegidos del catálogo sembrado).
- [ ] Hereda las reglas generales de [ADR-0005](../adr/0005-fichas-de-asociado-por-seccion.md).

## 3. Flujo actual *(obligatorio, antes de proponer cambios)*

- **Entrada:** `GET /company/services` → `AssociateController@editServices` →
  `Associate/Company/Services.tsx` (archivo plano) con `initialAssociate`, `availableServices`
  (`is_active`), `serviceCategories`.
- **Datos:** `associates.description` (texto; **es la descripción pública** de la empresa) +
  `service_ids` (pivot `associate_service`, sincronizado con `sync`).
- **Acciones asociado:** Guardar borrador (`POST .../services/draft`, laxo) · Enviar a revisión
  (`POST .../services`, exige `description` + ≥1 servicio) · **hoy** "Solicitar cambio" vía
  `SectionReviewBanner`.
- **Regla de negocio hoy:** al enviar, el servidor limita el nº de servicios con
  `$associate->plan?->limitFor('servicios')` (ADR-0002; `null` = ilimitado). El cliente **adivina** el
  límite desde `plan.limit_services` (puede no venir cargado → muestra "ilimitado" por error).
- **Estados hoy:** `draft/pending/approved/rejected/change_pending` (este último se elimina para esta
  sección, ADR-0005). Bloqueo por sección.
- **Lado admin hoy:** `Admin/Associates/Show` → `TabServices` con **lectura + edición**
  (`SearchableSelect`, `description` + `service_ids`) que escribe por `PUT admin.associates.update`
  (`update()` aún acepta `description` y sincroniza servicios) + `SectionAuditPanel` con `change_pending`.
- **Público:** usa `associate.description` y los servicios (nombre/slug). Debe preservarse.
- **No hay migración de BD.** Columnas y pivot ya existen; el catálogo trae `order` (plan 0010).

## 4. Revisión de accesibilidad

- **ServicePicker:** buscador con etiqueta; filtro de categoría con `Select` etiquetado; cada servicio
  es un `Checkbox` con `FieldLabel` asociado (rol checkbox, foco por teclado); estado seleccionado
  comunicado por **texto + marca**, no solo color; chips de selección con botón "quitar" con
  `aria-label` ("Quitar {servicio}").
- **Límite de plan:** el aviso "N / límite" va con texto + `Badge` (aria-live al acercarse/alcanzar el
  tope); al llegar al tope, los servicios no seleccionados quedan `disabled` con explicación.
- **Errores:** `FieldError` (`role=alert`) por campo + `Alert` de resumen al fallar el envío; foco al
  primer error. Bloqueo (`pending`/`approved`) con `disabled` legible.

## 5. Revisión de seguridad

- Regla dura de [ADR-0005](../adr/0005-fichas-de-asociado-por-seccion.md): **el admin no edita**. Se
  retiran `description` y `service_ids` del `PUT update()` y el modo edición de `TabServices`.
- **Límite de plan al servidor** (ADR-0002): `updateServices` rechaza si se superan los servicios del
  plan; el cliente solo asiste (autoridad = servidor). No se empuja como prop dedicada para no ampliar
  la deuda de análisis estático de la relación `plan` (aún sin tipar).
- El servidor valida el **estado de la sección** antes de draft/envío/reapertura (`canEditSection` en
  `saveServicesDraft`, `canSubmitSection` en `updateServices`, `canReopenSection` en `reopenServices`).
- Solo se pueden elegir servicios **activos** (`is_active`) y existentes (`exists:services,id`).
- **Independencia:** las acciones tocan solo `description`, el pivot `associate_service` y
  `section_reviews.services`.

## 6. Revisión funcional

- **Debe seguir igual:** propuesta de valor + selección de servicios del catálogo; buscar y filtrar por
  categoría; borrador laxo / envío estricto (`description` + ≥1 servicio); límite por plan; correos de
  aprobación/rechazo; contrato público.
- **Cambia:**
  - Sección aprobada → botón **Editar** → vuelve a `draft`. Fuera "Solicitar cambio", modal y
    `change_pending` **para esta sección**.
  - Admin: `TabServices` a **solo lectura + aprobar/rechazar**; sin modo edición.
  - **`description`/`service_ids` fuera del `PUT update()`** del admin (con esto el `update()` queda sin
    campos → se puede reducir/retirar; se documenta según qué quede tras Documentación).
  - **Límite de plan al servidor** (ya existía en `updateServices`; autoritativo). `editServices` ordena
    categorías por `order` (catálogo 0010).
  - UI reconstruida con `base/` + tokens; `ServicePicker` compuesto.
  - La pantalla pasa de archivo plano a carpeta `Services/` (`Index.tsx` + `Parts/`), como el resto de
    la ficha (§7.4); el controlador renderiza `Associate/Company/Services/Index`.
- **Alertas / mensajes (contrato):**
  | Situación | Mensaje | Componente |
  |---|---|---|
  | Borrador guardado | "Borrador guardado · {hora}" (hora Colombia) | `Alert success` |
  | Enviado a revisión | "Servicios enviados a revisión." | `Alert success` |
  | Falta propuesta / sin servicios | error por campo | `Alert destructive` + `FieldError` |
  | Supera el límite del plan | "Tu plan ({plan}) permite hasta {N} servicios." | `Alert destructive` |
  | En revisión (`pending`) | "CAMEP está validando esta sección." | `Alert default`, bloqueado |
  | Aprobada | "Sección aprobada." + botón **Editar** | `Alert success` |
  | Rechazada | "Sección rechazada — {motivo}." | `Alert destructive`, editable |
- **Casos límite con pruebas:** borrador laxo persiste; envío sin propuesta o sin servicios no pasa;
  **superar el límite del plan no pasa**; solo servicios activos/existentes; aprobada→Editar vuelve a
  `draft`; **el admin no puede editar**; guardar Servicios **no altera** otras secciones.

## 7. Plan de actualización (cortes)

- **11-A · Backend + contrato** ✅ — Sub-ADR [0005-d](../adr/0005-d-servicios.md) + índices; acción
  `reopenServices` (`approved→draft`, guard `canReopenSection`) + ruta `reopen.services` + allowlist del
  middleware (pending/verified); guard `canEditSection` en `saveServicesDraft`; `editServices` ordena
  categorías por `order` y renderiza `Services/Index`; services retirada de `change_pending`/
  `requestSectionChange`/`auditChangeRequest`; **`update()` del admin vaciado** (Servicios era su último
  campo; se retira del todo —ruta incl.— en 11-C). Límite de plan sigue enforced en `updateServices`.
  **Pest** (`ServicesSectionTest`, **13 tests**): ciclo, guardas, sin propuesta/sin servicios, límite de
  plan, inexistentes, reapertura, admin no edita, hora local, independencia. Gates: Pest 13/13, suite
  98/98, Pint, Larastan `[OK]`.
- **11-B · UI asociado** ✅ — `Associate/Company/Services/` (`Index.tsx` + `types.ts` +
  `Parts/ValueProposition` y `Parts/ServicePicker`) con `base/` (Card, Textarea, Field, Input Group,
  Select, Checkbox, Badge, Alert, Progress, Button): banner de estado, botón **Editar**
  (→ `reopen.services`), propuesta de valor, selector con buscador/filtro/chips y aviso de límite
  (best-effort si el plan está cargado). **Escalabilidad (catálogo grande):** el `ServicePicker` no
  lista todo — la selección se ve como chips y el catálogo aparece **solo al buscar o elegir categoría**,
  en un contenedor con **alto máximo + scroll interno** (página acotada). Ver ADR-0005-d regla 3b. Se
  **borró** `Services.tsx` plano. Reusa `FormField`. Sigue design.md §6/§7.4. `empresa-ficticia.md`
  extendida. **Vitest** de la página. Gates: tsc, ESLint, Prettier, Vitest 87/87.
- **11-C · UI admin (solo Servicios)** ✅ — `TabServices` reconstruido a **solo lectura +
  aprobar/rechazar** con `base/` (`AuditPanel` propio; propuesta de valor + servicios elegidos como
  chips, sin edición); `Show.tsx` deja de pasar props de edición (`isEditingServices`, `data/setData`,
  `availableServices`, `toggleService`, `handleUpdate`) y se retira el `useForm` de edición (queda uno
  mínimo para `approve`); controlador `show()` deja de cargar `availableServices` y carga
  `services.category`. El `PUT update()` queda como **no-op** (admin no edita; la ruta se conserva en
  ese estado, verificada por las pruebas de las 3 secciones migradas). Ajuste de baseline: se **retiró**
  la entrada obsoleta de Larastan (`ServiceCategory::services` en `show()`). **Pest:** el admin no
  escribe estos campos (ya cubierto en 11-A). Gates: tsc, ESLint, Prettier, Vitest 87/87, suite 98/98,
  Pint, Larastan `[OK]`.

> `change_pending`, `requestSectionChange`, `auditChangeRequest` y el `PUT update()` (hoy no-op) se
> retiran del todo cuando **Documentación** —la última sección con flujo antiguo— migre (limpieza
> registrada en ADR-0005).

**Gates a ejecutar** (proporcionales): **PHP** — Pint · Larastan · Pest (11-A/11-C) · **Frontend** —
types:check · ESLint · Prettier · Vitest (11-B/11-C).

## 8. Aprobación

- [x] Plan revisado
- [x] Decisiones §8: Select para filtro, `description` required, bloques Card; **selector escalable**
      (acotado + buscar primero, ADR-0005-d 3b).
- [x] `#go` → **11-A ✅ → 11-B ✅ → 11-C ✅**. Plan 0011 implementado.

### Decisiones a confirmar

1. **Filtro de categoría:** `Select` simple vs. lista/segmento visible. Propuesta: `Select`.
2. **`description`:** ¿solo `required` o con **mínimo de caracteres** (p. ej. 50, alineado al progreso
   actual)? Propuesta: `required` + ayuda de cliente sugiriendo detalle (sin mínimo duro).
3. **Layout:** ¿conservar 2 columnas (propuesta | catálogo) o apilado en bloques `Card`? Propuesta:
   bloques `Card` apilados (consistente con el resto de la ficha y más simple/responsive).

## Decisiones cerradas

1. **Sin componente nuevo.** El selector se compone localmente (`ServicePicker`) con primitivos `base/`.
2. **Límite por plan al servidor** (ADR-0002), autoritativo en `updateServices`. El front asiste con el
   conteo (no se empuja el límite como prop, para no ampliar deuda de análisis de la relación `plan`).
3. **`description` es la descripción pública**; se preserva el contrato del directorio.
4. **Reapertura con Editar**; sin `change_pending`; **el admin no edita**.
5. **Sin migración de BD.** Columnas, pivot y `order` del catálogo ya existen.
6. **Carpeta `Services/`** (Index + Parts), como el resto de la ficha.
