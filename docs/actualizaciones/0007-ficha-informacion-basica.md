# Plan de actualización — Ficha del asociado · Información Básica

- **Estado:** Borrador
- **Fecha:** 2026-09-13
- **Alcance:** La **sección Información Básica** de la ficha del asociado, **completa: lado asociado
  y lado admin**. Se reconstruye sobre el sistema de diseño y se alinea con el flujo acordado en
  [ADR-0005](../adr/0005-fichas-de-asociado-por-seccion.md): máquina de 4 estados, asociado único
  autor, admin solo aprueba/rechaza, independencia entre secciones. **No entra:** ninguna otra
  sección (Caracterización, Contactos, Documentación, Servicios), ni imágenes (logo/galería, ver
  ADR-0005 · pendientes por Amazon), ni el `status` global del asociado / `is_public`, ni la
  **vista general del admin** (listado `Associates/Index` y pestaña **Resumen**), que se trabajará
  al **final**. Del lado admin, este plan toca **solo** la pestaña de Información Básica.

> Este plan no se ejecuta hasta `#go`. Solo se implementa lo aquí descrito, corte a corte.

---

## 1. Componentes *(primer punto, obligatorio)*

El formulario actual usa componentes **legacy** (`@/Components/ui/Input`, `ui/Button`) y un
`FieldWrapper` que arrastra la auditoría **campo a campo** ya retirada (`auditLog`,
`onRequestChange`, `setChangeRequestField`). Se reconstruye con `base/` + tokens. La **búsqueda** de departamento/ciudad (debate cerrado; 100+
municipios por departamento) la resuelve el **`Combobox` de Base UI** (autocontenido, usa
`Input Group`). Ya están creados: `Select`, `Textarea`, `Progress`, `Input Group`, `Combobox`.
`Popover` y `Dialog` quedan como base (popovers / confirmaciones); **`Command` (cmdk) se descartó**
(no lo usa el Combobox).

Tabla auditada contra el código real:

| Componente | Rol en Información Básica | Estado | Acción |
| --- | --- | --- | --- |
| **Card** | contenedores de bloque (asociado) y ficha de lectura del admin | ✅ en `base/` | Reutilizar |
| **Field** (familia: `Field`, `FieldLabel`, `FieldError`, `FieldDescription`) | etiqueta + ayuda + error por campo (vía `FormField`) | ✅ en `base/` | Reutilizar |
| **Input** | campos de texto (razón social, NIT, dirección, teléfono…) | ✅ en `base/` | Reutilizar |
| **Select** (familia) | tipo de sociedad, país, tipo de documento *(departamento/ciudad pasan a Combobox en 7-J)* | ✅ en `base/` | **Creado (7-A)** |
| **Button** | guardar · enviar · editar (asociado) · aprobar · rechazar (admin) | ✅ en `base/` | Reutilizar |
| **Alert** (`Alert`, `AlertTitle`, `AlertDescription`, `AlertAction`) | banner de estado y mensajes (asociado y admin) | ✅ en `base/` | Reutilizar |
| **Spinner** | carga de ciudades del catálogo | ✅ en `base/` | Reutilizar |
| **Textarea** | motivo de rechazo del admin (multilínea, ≤1000) | ✅ en `base/` | **Creado (7-E)** |
| **Progress** | indicador de avance del formulario del asociado | ✅ en `base/` | **Creado (7-F)** |
| **Popover** (Radix) | capa flotante base del `Combobox` | ✅ en `base/` | **Creado (7-G)** |
| **Dialog** (Radix) | modal que usa `CommandDialog` (paleta) | ✅ en `base/` | **Creado (7-H)** |
| **Input Group** | ícono de búsqueda + caja en `CommandInput` (reusa `Input`/`Button`) | ✅ en `base/` | **Creado (7-I)** |
| **Combobox** | **departamento y ciudad con búsqueda** (`@base-ui/react`, autocontenido; usa `Input Group`) | ✅ en `base/` | **Creado (7-K)** — reemplazará `ui/SearchableSelect` |

> `Command` (cmdk) se **descartó**: se creó para el patrón Popover+Command, pero el Combobox
> resultó ser de Base UI (autocontenido) y no lo usa. `base/Command.tsx` y `cmdk` **eliminados**
> para no dejar basura. `Popover` y `Dialog` se conservan como base (popovers / confirmaciones).

- **Reutilizar:** `Card`, `Field*`, `Input`, `Select`, `Button`, `Alert`, `Spinner`. Iconos por
  `lucide-react`.
- **Crear en `base/` desde spec:** `Select` (7-A ✅), `Textarea` (7-E ✅), `Progress` (7-F ✅) y,
  para la búsqueda de ubicación, `Popover` (7-G), `Command` (7-H) y `Combobox` (7-I). Ninguno se
  crea hasta que el usuario pase su spec (regla de `agents.md`).
- **Composición local (no es `base/`):** `FormField` (envuelve `Field` + control + error para no
  repetir); vive junto a los *parts*, no en `base/`.
- **Evaluados pero NO usados:** `Badge`, `Separator`, `Skeleton` (el estado va en `Alert`, no en
  chip; no hubo divisores; la carga usa `Spinner`). Se retiran de la lista para no prometer de más.
- **Reemplazar / retirar (solo en esta sección):**
  - `Components/FieldWrapper` → `base/Field` (sin auditoría campo a campo; el bloqueo es por sección).
  - `Components/SectionReviewBanner` (colores hardcodeados + modal "solicitar cambio") → banner de
    estado con `base/Alert`; **sin modal de cambio**. El botón **Editar** reemplaza a "Solicitar cambio".
  - `ui/Input`, `ui/Button` → `base/Input`, `base/Button`.
  - `ui/SearchableSelect` (legacy) → `base/Combobox` en departamento/ciudad (7-J); el legacy se
    retira cuando quede sin referencias (aún lo usan Servicios y Blog).
  - Props muertas `auditLog={{}}`, `setChangeRequestField(){}`, `isLocked/fieldStatus` por campo →
    eliminadas; lo editable se deriva del estado **de la sección**.

> Convivencia: `FieldWrapper` y `SectionReviewBanner` **siguen existiendo** para las demás secciones
> hasta que se migren; aquí solo se dejan de usar en Información Básica.

## 2. Documentación *(segundo punto, obligatorio)*

- [x] Este plan (`0007-ficha-informacion-basica.md`).
- [x] **Sub-ADR [0005-a](../adr/0005-a-informacion-basica.md)** — reglas propias de la sección:
      lista de campos y obligatorios, unicidad por **NIT**, razón social libre, semántica de
      **Editar** (reabre a `draft`), guardas de servidor y decisión de ubicación (catálogo DANE).
- [ ] `orden-componentes.md` — marcar **Select** como `[x]` al crearlo y registrarlo en `/dev/componentes`.
- [ ] `README.md` de actualizaciones — fila 0007.
- [ ] Hereda las reglas generales de [ADR-0005](../adr/0005-fichas-de-asociado-por-seccion.md); no se repiten aquí.

## 3. Flujo actual *(obligatorio, antes de proponer cambios)*

- **Entrada asociado:** `GET /company/basic-info` → `AssociateController@editBasicInfo` →
  `Associate/Company/BasicInfo/Index.tsx` (con `initialAssociate`).
- **Datos (3 bloques, mismos que hoy):** Identidad (`company_name`, `initials`, `nit`,
  `legal_status`, `constitution_date`, `country_origin`), Representante (`rep_name`, `rep_position`,
  `rep_doc_type`, `rep_doc`), Ubicación (`department`/`city` con sus `*_id`, `address`, `phone`,
  `website`).
- **Acciones asociado:** Guardar borrador (`POST .../draft`, validación laxa) · Enviar a revisión
  (`POST .../basic-info`, valida 12 obligatorios) · **hoy** "Solicitar cambio" sobre sección aprobada.
- **Estados hoy:** `draft/pending/approved/rejected/change_pending` (este último se elimina, ADR-0005).
  Bloqueo **por sección** (todo o nada).
- **Lado admin hoy:** `Admin/Associates/Show` → `TabBasicInfo` con **lectura + modo edición**
  (`PUT admin.associates.update`, catch-all) + `SectionAuditPanel` (aprobar/rechazar/solicitud).
- **Dependencias:** departamentos/ciudades se piden **en vivo** a `https://api-colombia.com` desde
  el navegador. Correos de aprobación/rechazo de sección.
- **Restos muertos:** `VerificationDashboard.tsx` (mock, sin uso real).

## 4. Revisión de accesibilidad

- **Select (Radix):** foco, teclado (flechas/Esc/typeahead), `aria` y roles los da Radix; cada
  Select con su `FieldLabel` asociado.
- **Errores:** `FieldError` (`role="alert"`) por campo + `Alert` de resumen al fallar el envío;
  el foco salta al primer campo con error.
- **Estado de sección:** el banner (`Alert`) comunica por texto + icono, no solo por color.
- **Bloqueo:** en `pending`/`approved` los campos van `disabled` con contraste legible (tokens),
  no solo atenuados.

## 5. Revisión de seguridad

- Regla dura de [ADR-0005](../adr/0005-fichas-de-asociado-por-seccion.md): **el admin no edita**.
  Se retira la escritura de campos de Información Básica del `PUT update()` y su UI. El servidor
  valida el estado de la sección antes de aceptar draft/envío/reapertura (no confiar en el front).
- **Independencia:** las acciones de esta sección tocan **solo** sus campos y `section_reviews.basicinfo`.
- Unicidad de **NIT** en servidor (ya existe en el envío del asociado; se revisa que siga).
- Logout/CSRF y autorización de rol siguen en middleware; el front no decide acceso.

## 6. Revisión funcional

- **Debe seguir igual:** los 3 bloques y sus campos; borrador laxo / envío estricto; correos de
  aprobación y rechazo; bloqueo por sección.
- **Cambia:**
  - Sección aprobada → botón **Editar** → vuelve a `draft` (edita con calma, decide cuándo enviar).
    Se retira "Solicitar cambio", el modal y `change_pending` **para esta sección**.
  - Admin: `TabBasicInfo` pasa a **solo lectura + aprobar/rechazar**; se quita el modo edición.
  - UI reconstruida con `base/` + tokens; banner de estado con `Alert`.
- **Alertas / mensajes / validaciones (contrato explícito):**
  | Situación | Mensaje | Componente |
  |---|---|---|
  | Borrador guardado | "Borrador guardado · {hora}" | `Alert success` (toast) |
  | Enviado a revisión | "Información básica enviada a revisión." | `Alert success` |
  | Faltan obligatorios | "Faltan campos obligatorios" + error por campo | `Alert destructive` + `FieldError` |
  | NIT duplicado | "Ya existe una empresa con este NIT." | `FieldError` en NIT |
  | En revisión (`pending`) | "CAMEP está validando esta sección." | `Alert default`, campos bloqueados |
  | Aprobada | "Sección aprobada." + botón **Editar** | `Alert success` |
  | Rechazada | "Sección rechazada — {motivo}." | `Alert destructive`, campos editables |
- **Casos límite con pruebas:** borrador incompleto persiste; envío sin obligatorios no pasa;
  aprobada→Editar vuelve a `draft`; rechazo con motivo reabre; **el admin no puede editar** los
  campos; guardar Información Básica **no altera** el estado de Caracterización.

## 7. Plan de actualización (cortes)

- **7-A · Select** — crear `base/Select.tsx` desde spec (Radix, tokens), añadir a `/dev/componentes`
  con ejemplos (simple, con grupos, deshabilitado) y test. Marcar `[x]` en `orden-componentes.md`.
- **7-B · Catálogo de ubicaciones** — tablas `departments`/`cities` sembradas desde el dataset
  oficial DANE (DIVIPOLA) empaquetado; endpoint interno que alimenta los Select. **Retirar
  `api-colombia.com`** del frente: el catálogo pasa a ser **propio, completo, offline y rápido**.
  Prueba de humo del seeder y del endpoint.
- **7-C · Backend Información Básica** ✅ — acción `reopenBasicInfo` (`approved → draft`, guard
  `canReopenSection`) + ruta; guardas de servidor en draft/envío; basicinfo retirado del flujo
  `change_pending` / `requestSectionChange`; `reopen.basic` habilitada en el middleware de
  onboarding (pending/verified). **Pest** (8): ciclo completo, guardas, rechazo, independencia,
  y basicinfo fuera de solicitud de cambio. Sub-ADR **0005-a** redactado.
  *(La remoción de la edición del admin —`update()` + UI— se hace completa y atómica en 7-E.)*
- **7-D · UI asociado** ✅ — `BasicInfo/Index.tsx` + 3 *parts* reconstruidos con `base/` (Card,
  Field, Input, Select, Button, Alert): banner de estado por `Alert`, botón **Editar**
  (→ `reopen.basic`), validaciones y mensajes de §6. Nuevos: `FormField` (envoltura),
  `types.ts`. Los Select de departamento/ciudad leen del **catálogo propio** (7-B) — **retirado
  `api-colombia` del frente**. Fuera `FieldWrapper`/`SectionReviewBanner` y props muertas en esta
  pantalla. Test de la página (banner/Editar/rechazo).
  *(El indicador de avance del formulario **no** entró aquí: debe ser el componente `Progress`, no
  UI inline; se saca a 7-F.)*
- **7-E · UI admin (solo Información Básica)** ✅ — **(1)** `base/Textarea` creado + galería + test
  (`[x]` en `orden-componentes.md`); **(2)** `TabBasicInfo` reconstruido a **solo lectura +
  aprobar/rechazar** con `base/` (ficha de lectura + `AuditPanel` con `Alert`/`Button`/`Textarea`,
  sin `change_pending`); **(3)** edición del admin retirada: sin modo edición en el Tab y **campos de
  basicinfo fuera del `PUT update()`** (+ Pest de que el admin ya no escribe basicinfo). `Associates/
  Index`, pestaña Resumen y el mock `VerificationDashboard.tsx` quedan para la pasada final.
  > Nota: `Show.tsx` conserva 5 `any` **preexistentes** (commit 03c9834) que ESLint marca; mi cambio
  > fue 1 línea (quitar prop). Tiparlos cascada a otras pestañas → fuera de alcance de este corte.
- **7-F · Progress (avance del formulario)** ✅ — `base/Progress` creado desde spec + galería + test;
  marcado `[x]` en `orden-componentes.md`; conectado en `BasicInfo/Index.tsx` (asociado) para mostrar
  los obligatorios completados mientras la sección es editable.
  > **Nota a11y:** la spec de shadcn desestructura `value` y lo usa **solo** en el `transform` del
  > indicador; no lo reenvía a `Root`, así que el `progressbar` no expone `aria-valuenow`. Se dejó
  > fiel a la spec. Si se quiere que lectores de pantalla anuncien el %, basta añadir `value={value}`
  > al `Root` (decisión del usuario, no la tomo por mi cuenta).

_Búsqueda de ubicación (debate cerrado tras 7-F; se implementa después del `#commit` de 7-A…7-F):_

- **7-G · Popover** ✅ — `base/Popover` creado desde spec (Radix) + galería + test; `[x]` en `orden-componentes.md`.
- **7-H · Dialog** ✅ — `base/Dialog` creado desde spec (Radix) + galería + test; `[x]`. Lo exige
  `CommandDialog`; de paso habilita `Alert Dialog` a futuro.
- **7-I · Input Group** ✅ — `base/InputGroup` (+`Addon`/`Button`/`Text`/`Input`/`Textarea`) creado
  desde spec (reusa `Input`/`Button`/`Textarea`) + galería + test; `[x]`. Lo exige `CommandInput`.
- **7-J · Command** ❌ **descartado** — se creó (cmdk) para el patrón Popover+Command, pero el
  Combobox resultó ser de Base UI (autocontenido). `base/Command.tsx`, su test/galería y la
  dependencia `cmdk` se **eliminaron** para no dejar basura. Se recreará si hace falta una paleta ⌘K.
- **7-K · Combobox** ✅ — `base/Combobox` creado desde spec sobre **`@base-ui/react`** (`npm i
  @base-ui/react ^1.8.0`), **autocontenido** (trae popup, filtrado, chips, multi; **no** usa
  `Popover`/`Command`) + galería + test; `[x]`. Ajuste: el trigger se invirtió a
  `<ComboboxTrigger render={<InputGroupButton/>}/>` (nuestro `InputGroupButton` no acepta `render`).
  > **Giro:** la spec del Combobox resultó ser de **Base UI**, no el patrón `Popover`+`Command` que
  > preveía la hoja de ruta. Se decidió con el usuario (opción A: un componente más rico y menos
  > código propio, a cambio de `@base-ui/react`). Consecuencia: **`Command` (7-J) se eliminó**
  > (basura); **`Popover` (7-G) y `Dialog` (7-H) se conservan** como base (popovers / confirmaciones).
- **7-L · Búsqueda en ubicación** ✅ — `LocationContact` reconstruido: departamento y ciudad ahora
  son `Combobox` (Base UI) con **búsqueda**, leyendo del catálogo DANE; `onDepartment`/`onCity`
  reconcilian el id del catálogo. `ui/SearchableSelect` queda **marcado para retiro** cuando quede
  sin referencias (aún lo usan Servicios y Blog). Refs de `Input`/`InputGroup*`/`Dialog*` migradas a
  `forwardRef` (React 18) para el `render` de Base UI.
  > Cada primitivo (7-H…7-K) se crea **solo cuando el usuario pase su spec** (regla de `agents.md`).

> `change_pending`, `requestSectionChange`, `auditChangeRequest`, el `PUT update()` completo y sus
> correos se **eliminan del todo** cuando la última sección migre (limpieza registrada en ADR-0005);
> mientras tanto siguen vivos para las secciones aún no intervenidas.

**Gates a ejecutar** (proporcionales): **PHP** — Pint · Larastan · Pest (7-B/7-C/7-E) · **Frontend**
— types:check · ESLint · Prettier · Vitest (7-A/7-D/7-E/7-F y 7-G→7-L).

## 8. Aprobación

- [ ] Plan revisado
- [ ] `#go` recibido → implementar (corte a corte: 7-A → 7-B → 7-C → 7-D → 7-E → 7-F, y luego la
      cadena de búsqueda 7-G → 7-H → 7-I → 7-J → 7-K → 7-L)

## Decisiones cerradas

1. **`api-colombia.com` → catálogo propio.** Se internaliza: tablas `departments`/`cities`
   sembradas desde el dataset oficial DANE (DIVIPOLA) y servidas desde nuestra base. Se retira la
   dependencia del navegador con `api-colombia`. Es el corte **7-B**. (Descartada la idea de
   "guardar al seleccionar": no completa la lista de opciones que hay que *mostrar*.)
2. **Tipo de sociedad:** **`Select`** con opción "Otro" → `Input`. Confirmado.
3. **Búsqueda en departamento/ciudad:** **sí**, con `Combobox` (búsqueda), por las listas largas
   (100+ municipios). Ambos campos, no solo ciudad. shadcn no tiene "Select con búsqueda": el
   se resolvió con el `Combobox` de **Base UI** (`@base-ui/react`, autocontenido). En el camino se
   crearon `Popover`/`Dialog`/`Input Group` (se conservan `Popover`/`Dialog` como base; `Command`
   se descartó). Reemplazará al legacy `ui/SearchableSelect`.
