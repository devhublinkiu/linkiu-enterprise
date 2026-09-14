# Plan de actualización — Admin · Documentos Requeridos

- **Estado:** Hecho
- **Fecha:** 2026-09-14
- **Alcance:** Modernizar la pantalla **`/admin/document-requirements`** (catálogo de documentos que
  los asociados deben subir) al sistema visual actual: `base/` + tokens + **design.md §6/§7.4**,
  endurecer sus **tipos** y **añadir cobertura de pruebas** del controlador. Alimenta la sección
  **Documentación del asociado** (siguiente plan). **NO entra:** la ficha Documentación del asociado
  (va después, apoyada en este catálogo) ni **cambio alguno de modelo, BD, rutas o reglas de
  validación** — el backend ya está **completo y correcto** (ver §3).

> Este plan no se ejecuta hasta `#go`. Solo se implementa lo aquí descrito, corte a corte.

---

## 1. Componentes *(primer punto, obligatorio)*

La pantalla actual (`Admin/DocumentRequirements/Index.tsx`, 27-may) usa idioma **legacy**: componentes
`@/Components/ui/*` (`Button`, `Input`, `Label`), **modal casero** (`fixed inset-0 … bg-black/50`),
**toggle casero** para `is_active`, **`confirm()`** del navegador, buscador con `<input>` crudo, header
y breadcrumb escritos a mano, y colores hardcodeados (**`slate-*`, `indigo-*`, `emerald-*`, `red-*`,
`amber-*`, `blue-*`**). Se reconstruye con `base/` + tokens.

**Componentes nuevos: NINGUNO.** Todos los que hacen falta ya existen en `base/` (los primitivos
`Table`, `Pagination` y `Switch` se crearon en el corte 0010). No se pide spec de componente nuevo.

Tabla auditada control por control contra el código real:

| Componente | Rol en Documentos Requeridos | Estado | Acción |
| --- | --- | --- | --- |
| **Table** (`Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`) | **una sola** tabla del catálogo (columna "Obligatorio") | ✅ en `base/` | Reutilizar |
| **Dialog** (familia) | form crear/editar documento **y** confirmación de borrado (reemplaza `confirm()`) | ✅ en `base/` | Reutilizar |
| **Switch** | `is_active` inline en la fila **y** `is_required` / `is_active` en el form (reemplazan toggles caseros) | ✅ en `base/` | Reutilizar |
| **Field** (`Field`, `FieldLabel`, `FieldError`, `FieldDescription`) + helper `FormField` (0007) | campos del form | ✅ en `base/` | Reutilizar |
| **Input** | nombre visible, clave (slug), leyenda | ✅ en `base/` | Reutilizar |
| **Input Group** | buscador con ícono | ✅ en `base/` | Reutilizar |
| **Button** | nuevo, editar, borrar, guardar, subir plantilla, cerrar | ✅ en `base/` | Reutilizar |
| **Badge** | "Obligatorio"/"Opcional" y tipos MIME | ✅ en `base/` | Reutilizar |
| **Alert** | flash de éxito/error | ✅ en `base/` | Reutilizar |

- **Reutilizar:** `Table*`, `Dialog*`, `Switch`, `Field*`, `Input`, `Input Group`, `Button`, `Badge`,
  `Alert`. Iconos por `lucide-react` (mapa `@/lib/documentIcons`, sin cambios).
- **Composición local (no es `base/`, se re-estiliza a tokens):**
  - **Selector de íconos**: grilla de botones lucide (multi-opción única) — markup local con tokens.
  - **Chips de MIME permitidos**: multi-selección de `pdf/jpg/png/docx/xlsx` — chips tipo `Badge`
    conmutables; markup local con tokens (no hay primitivo de multi-chip; alternativa descartada:
    grupo de `Checkbox`, más verboso para 5 opciones).
  - **Reorden por arrastre** (decisión del usuario, ver §6): asa (`GripVertical`) en la primera celda
    de la fila; drag & drop HTML5 nativo sobre `TableRow`. **Sin dependencia ni componente nuevo.**
- **Reemplazar / retirar (solo en esta pantalla):** `ui/Button`/`ui/Input`/`ui/Label` → `base/*`;
  **modal casero** → `base/Dialog`; **toggle casero** de estado → `base/Switch`; **`confirm()`** →
  `base/Dialog` de confirmación; **breadcrumb + header manual** → breadcrumb del `AppLayout` (el
  nav-item ya existe) + header estándar de índice admin; **colores hardcodeados** → tokens.

## 2. Documentación *(segundo punto, obligatorio)*

- [ ] Este plan (`0012-admin-document-requirements.md`).
- [ ] **Sin ADR nuevo.** No hay decisión de arquitectura nueva: la autorización del panel ya la fija
      **ADR-0006** (middleware `admin`), que este grupo de rutas ya aplica. Es modernización de UI.
- [ ] `README.md` de actualizaciones — fila 0012.
- [ ] `orden-componentes.md` — **sin cambios** (no se crea ningún componente).
- [ ] `docs/ejemplos/empresa-ficticia.md` — **sin cambios** (es catálogo global, no de una empresa).

## 3. Flujo actual *(obligatorio, antes de proponer cambios)*

- **Entrada:** `GET /admin/document-requirements` → `Admin\DocumentRequirementController@index` →
  `Admin/DocumentRequirements/Index.tsx`. `index` trae `DocumentRequirement::ordered()->get()` mapeado
  (id, key, label, icon, accepts, is_required, is_active, legend, template_path/url, display_order) +
  `allowedIcons` (19 lucide) + `allowedMimes` (`pdf,jpg,jpeg,png,docx,xlsx`).
- **Modelo:** `document_requirements` (`key` **único e inmutable**, `label`, `icon`, `accepts` json,
  `is_required`, `is_active`, `legend`, `template_path`, `display_order`). `toCatalogEntry()` es lo que
  consume el asociado; `template_url` (append) resuelve URL firmada S3 / asset legacy / URL absoluta.
- **Acciones admin hoy (todas ya validadas y seguras):**
  - `store`: valida label, icon ∈ lista, `accepts` (min 1, ∈ mimes), `is_required`/`is_active` bool,
    `legend?`, `template_file?` (mimes, ≤10 MB). Genera `key` (regex `^[a-z0-9_]+$`, único) o slug del
    label; `display_order = max+1`; sube plantilla al disco por defecto.
  - `update`: misma validación; **`key` inmutable** (se descarta); reemplaza/quita plantilla gestionada.
  - `toggleActive`: invierte `is_active`.
  - `destroy`: **borrado seguro** — bloquea si algún asociado ya subió archivo para esa `key`
    (`JSON_EXTRACT(files, '$."<key>"')`; `key` viene validada por regex, sin inyección) y obliga a
    **desactivar** en su lugar; si no, borra y limpia la plantilla gestionada.
  - `reorder`: transacción que fija `display_order` según el arreglo de ids.
- **Seguridad hoy:** el grupo `admin.` ya está bajo **middleware `admin`** (ADR-0006,
  `is_superadmin || role==='admin'`). Sin hueco pendiente.
- **UI hoy:** lista agrupada Obligatorios/Opcionales con filas custom y **drag & drop** para reordenar;
  buscador por label/key; modal casero de crear/editar (selector de ícono, chips de MIME, segmentados
  obligatorio/estado, subida de plantilla); `confirm()` para borrar; toggle casero para activar.
- **Resultado esperado:** idéntico comportamiento y contrato de datos; solo cambia la **piel** (base/ +
  tokens), los **tipos** (fuera `any`) y se **añaden pruebas**.

## 4. Revisión de accesibilidad

- **Table:** semántica nativa (`<th scope>`); acciones de fila con `aria-label` explícito
  ("Editar {documento}", "Eliminar {documento}", "Activar/Desactivar {documento}").
- **Reorden por arrastre:** el asa es `button`/`[role]` con `aria-label` ("Reordenar {documento}");
  como el drag no es operable por teclado, se documenta como limitación conocida (mismo alcance que
  hoy) — no se degrada la accesibilidad existente. Se deshabilita el arrastre mientras hay búsqueda
  activa (evita reordenar sobre una lista filtrada).
- **Dialog de form y de confirmación:** foco atrapado, `Esc` cierra, `aria-labelledby` al título, cierre
  etiquetado. Reemplaza al `confirm()` nativo.
- **Selector de íconos / chips de MIME:** botones con `aria-pressed`/`aria-label`; selección visible por
  **texto + color**, no solo color.
- **Estado y obligatoriedad:** comunicados con **texto + Badge** además de color; el `Switch` lleva
  etiqueta asociada.
- **Errores de validación:** `FieldError` (`role="alert"`) por campo + `Alert` de resumen del flash.

## 5. Revisión de seguridad

- **Autorización:** ya resuelta por el middleware `admin` del grupo (ADR-0006). Sin cambios.
- **Validación de entrada:** ya es autoritativa en servidor (`store`/`update`), incluida la plantilla
  (mimes + tamaño) y el `key` (regex + único, inmutable). **No se relaja** nada en el front.
- **`destroy` (JSON_EXTRACT):** interpola `key`, pero `key` está restringida por regex `^[a-z0-9_]+$` al
  crearse → sin superficie de inyección. Se conserva tal cual (revisado).
- **Plantillas:** `template_url` firma URL de S3 a 1 h; el borrado solo elimina archivos **gestionados**
  (no toca assets legacy ni URLs externas). Sin cambios.
- **Exposición de datos:** la pantalla es catálogo global (no datos de empresas). El front deja de tipar
  `flash` como `any` (endurecimiento, no seguridad).

## 6. Revisión funcional

- **Debe seguir igual:** buscar por nombre/clave; crear/editar (con selector de ícono, tipos MIME,
  obligatoriedad, leyenda, plantilla); activar/desactivar; **reordenar por arrastre**; borrado seguro
  (bloqueado si hay archivos de asociados); `key` inmutable tras crear; slug auto desde label.
- **Cambia (solo piel + tipos):**
  - **Listado:** una **sola `base/Table`** con columna **"Obligatorio"** (Badge) — decisión del
    usuario — en vez de dos listas separadas; filtrable por el buscador. `is_active` como `Switch`
    inline en la fila.
  - **Reorden:** **se conserva el drag & drop** (decisión del usuario), ahora arrastrando `TableRow` por
    un asa; **deshabilitado si el buscador tiene texto** (no reordenar una vista filtrada).
  - **Form:** en `base/Dialog`; `is_required` y `is_active` con `base/Switch`; resto re-estilado a
    tokens (selector de íconos y chips de MIME como composición local).
  - **Borrado:** `confirm()` → `base/Dialog` de confirmación, con el mensaje real (bloqueo si en uso).
  - **Cabecera:** breadcrumb del layout + header de índice estándar; fuera el header/breadcrumb manual.
  - **Tipos:** fuera todos los `any` (`flash`, props); interfaces reales. Gate `no-explicit-any` verde.
- **Alertas / mensajes (contrato, se preservan los textos del backend):**
  | Situación | Mensaje | Componente |
  |---|---|---|
  | Documento creado / actualizado | "Documento agregado al catálogo." / "Documento actualizado." | `Alert success` |
  | Activar / desactivar | "Documento activado." / "…desactivado del catálogo." | `Alert success` |
  | Borrar documento en uso | "No puedes eliminar este documento: algunos asociados ya cargaron archivos… Desactívalo en su lugar." | `Alert error` + `Dialog` |
  | Borrar documento sin uso | "¿Eliminar «{documento}» del catálogo? No se puede deshacer." | `Dialog` de confirmación |
  | Reorden guardado | "Orden actualizado." | `Alert success` |
- **Casos límite con pruebas (Pest del controlador, hoy inexistente):** asociado (no admin) **no**
  accede a `admin.document-requirements.*` (403); `store` inválido (sin label / icon fuera de lista /
  accepts vacío) no pasa; `key` única al crear y **inmutable** en `update`; `toggleActive` invierte;
  `destroy` **bloqueado** si un asociado tiene archivo para esa `key` y **permitido** si no; `reorder`
  fija `display_order`.

## 7. Plan de actualización (cortes)

- **12-A · UI admin (reconstrucción).** ✅ `Admin/DocumentRequirements/Index.tsx` + `types.ts` +
  `Parts/DocumentDialog.tsx` reconstruidos con `base/` + tokens: una `Table` (columna "Obligatorio",
  `Switch` de estado inline, drag & drop por asa deshabilitado con búsqueda activa + aviso "Limpia la
  búsqueda para reordenar"), `DocumentDialog` en `Dialog` (selector de íconos, chips MIME, `Switch`
  obligatorio/activo, subida/quitado de plantilla, clave auto con `Switch` "generar automáticamente" e
  inmutable en edición) y `Dialog` de confirmación de borrado, `InputGroup` de búsqueda (filtro
  cliente), breadcrumb del layout. Fuera `ui/*`, modal/toggle/`confirm()` caseros, colores
  hardcodeados y todos los `any` (`flash` vía `usePage`, props tipadas). Sigue design.md §6/§7.4.
  **Vitest** `AdminDocumentRequirements.test.tsx`. Gates: types:check ✅ · ESLint ✅ · Prettier ✅ ·
  Vitest **88/88** ✅.
- **12-B · Pest del controlador.** ✅ `tests/Feature/AdminDocumentRequirementsTest.php` (**13 tests**):
  autorización (asociado 403 en index/store, admin OK), alta válida, validación (sin label / icon fuera
  de lista / accepts vacío / clave duplicada), **clave inmutable** en update, `toggle` invierte estado,
  **borrado seguro** (bloqueado si un asociado tiene archivo para esa `key`, permitido si no) y
  `reorder`. Controlador **sin cambios** (no hizo falta). Gates: Pint ✅ · Larastan `[OK]` ✅ ·
  Pest **111/111** ✅.

**Gates a ejecutar** (proporcionales): **Frontend** — types:check · ESLint · Prettier · Vitest (12-A) ·
**PHP** — Pint · Larastan · Pest (12-B).

## 8. Aprobación

- [x] Decisión §6: **una sola Table + columna "Obligatorio"** (no dos listas).
- [x] Decisión §6: **conservar drag & drop** (asa en la fila; deshabilitado con búsqueda activa).
- [x] Plan revisado.
- [x] `#go` recibido → **12-A ✅ → 12-B ✅**. Plan 0012 implementado.

## Decisiones cerradas

1. **Modernización, no rediseño de backend.** El servidor (controlador, modelo, migración, rutas,
   validación, borrado seguro, autorización ADR-0006) queda **intacto**; el corte es piel + tipos + tests.
2. **Cero componentes nuevos.** Todo sale de `base/` existente (`Table`, `Dialog`, `Switch`, `Field`,
   `Input`, `InputGroup`, `Button`, `Badge`, `Alert`); selector de íconos y chips de MIME como
   composición local re-estilada a tokens.
3. **Una sola tabla** con columna "Obligatorio" (consistente con el admin de Servicios), no dos listas.
4. **Drag & drop conservado** sobre filas de la tabla, con asa; deshabilitado mientras hay búsqueda.
5. **CRUD admin, no ficha.** No aplica ADR-0005 / section-reviews; se rige por design.md y §7 de
   agents.md (validación al servidor, español, formatos Colombia).
