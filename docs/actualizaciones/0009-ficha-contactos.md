# Plan de actualización — Ficha del asociado · Contactos y Referencias

- **Estado:** Borrador
- **Fecha:** 2026-09-13
- **Alcance:** La **sección Contactos y Referencias** de la ficha del asociado, **completa: lado
  asociado y lado admin**. Se reconstruye sobre el sistema de diseño y se alinea con
  [ADR-0005](../adr/0005-fichas-de-asociado-por-seccion.md) (4 estados, asociado único autor, admin
  solo aprueba/rechaza, independencia) y las reglas propias de
  [ADR-0005-c](../adr/0005-c-contactos.md) *(se crea en 9-A)*. **No entra:** ninguna otra sección
  (Información Básica y Caracterización ya migradas; Documentación, Servicios, Galería pendientes),
  ni el `status` global / `is_public`, ni la **vista general del admin** (`Associates/Index` y pestaña
  **Resumen**), que se trabaja al final. Del lado admin, este plan toca **solo** la pestaña de
  Contactos.

> Este plan no se ejecuta hasta `#go`. Solo se implementa lo aquí descrito, corte a corte.

---

## 1. Componentes *(primer punto, obligatorio)*

El formulario actual usa componentes **legacy** (`ui/Input`, `ui/Button`, `SectionReviewBanner`), un
`FieldWrapper` con auditoría campo a campo ya retirada (`auditLog`, `onRequestChange`,
`setChangeRequestField`), colores hardcodeados (`slate-*`), **chips ad-hoc** para el perfil de
operación y **repetidores escritos a mano** (contactos, referencias) con `<button>` y `<Input>` crudos.
Se reconstruye con `base/` + tokens.

**No hay ningún componente nuevo.** Se recorrieron los 4 *parts* y todos los controles quedan cubiertos
por primitivos ya existentes en `base/` (creados en 0005–0008). Los dos **repetidores** (directorio de
contactos y referencias) se **componen localmente** con `Card` + `Field` + `Input` + `Button` — no
justifican un primitivo nuevo (regla §7.5 / §8 de `agents.md`: primero reutilizar).

Tabla auditada contra el código real:

| Componente | Rol en Contactos | Estado | Acción |
| --- | --- | --- | --- |
| **Card** (familia) | contenedores de bloque (asociado) y fichas de lectura del admin | ✅ en `base/` | Reutilizar |
| **Field** (`Field`, `FieldLabel`, `FieldError`, `FieldDescription`) | etiqueta + ayuda + error por campo (vía `FormField`) | ✅ en `base/` | Reutilizar |
| **Input** | nombre/cargo/área/email/teléfono de contactos y referencias; CIIU (texto libre); email de facturación | ✅ en `base/` | Reutilizar |
| **Checkbox** (familia) | `company_type` (perfil de operación, **multi-select** real) — reemplaza los chips ad-hoc | ✅ en `base/` | Reutilizar |
| **RadioGroup** (familia) | `type` de referencia (comercial / bancaria), opción única inline | ✅ en `base/` | Reutilizar |
| **Input Group** (`InputGroup`, `InputGroupInput`, `InputGroupAddon`) | canales digitales con **ícono al frente** (hoy es un `<div>` absoluto) | ✅ en `base/` | Reutilizar |
| **Button** | agregar/eliminar fila · guardar · enviar · editar (asociado) · aprobar · rechazar (admin) | ✅ en `base/` | Reutilizar |
| **Alert** (`Alert`, `AlertTitle`, `AlertDescription`, `AlertAction`) | banner de estado, mensajes y errores de envío | ✅ en `base/` | Reutilizar |
| **Badge** | contador de contactos / referencias (lectura admin) | ✅ en `base/` | Reutilizar |
| **Progress** | indicador de avance del formulario del asociado | ✅ en `base/` | Reutilizar |

- **Reutilizar:** `Card*`, `Field*`, `Input`, `Checkbox*`, `RadioGroup*`, `Input Group`, `Button`,
  `Alert`, `Badge`, `Progress`. Iconos por `lucide-react`.
- **Crear en `base/`:** **nada**. Es la primera sección de la ficha que se migra **sin** componente
  nuevo (todo el vocabulario ya existe).
- **Composición local (no es `base/`):** se reutiliza `FormField` (0007) para envolver `Field` +
  control + error; y se escriben dos *parts* repetidores (`Directory`, `SupportReferences`) que
  componen `Card` + `Field` + `Input` + `Button` con estado de lista (`add`/`remove`/`update`), como
  hoy pero con `base/` + tokens. Vive junto a los *parts*.
- **Decisión de diseño:**
  - **CIIU = texto libre.** No existe un catálogo CIIU obtenible; se mantiene `Input` de texto con
    **label claro + ayuda** ("Código de actividad económica DIAN/DANE, ej. 0610"). Sin combobox ni
    catálogo (evita prometer un dato que no podemos poblar).
  - **`company_type` = grupo de `Checkbox`**, no chips: es multi-selección, y el checkbox tiene la
    semántica correcta y accesible para "marca todas las que apliquen".
  - **`type` de referencia = `RadioGroup`** inline (2 opciones fijas), consistente con el resto de la
    ficha.
- **Reemplazar / retirar (solo en esta sección):**
  - `Components/FieldWrapper` → `base/Field` (sin auditoría campo a campo; el bloqueo es por sección).
  - `Components/SectionReviewBanner` → banner de estado con `base/Alert`; **sin modal de cambio**. El
    botón **Editar** reemplaza a "Solicitar cambio".
  - `ui/Input`, `ui/Button` → `base/Input`, `base/Button`.
  - Chips ad-hoc de `company_type` y grupos `<button>` → `base/Checkbox`.
  - `<div>` absoluto con ícono en canales digitales → `base/Input Group`.
  - Props muertas `auditLog={{}}`, `setChangeRequestField(){}`, `isLocked/fieldStatus` por campo →
    eliminadas; lo editable se deriva del estado **de la sección**.

> Convivencia: `FieldWrapper` y `SectionReviewBanner` **siguen existiendo** para las secciones aún no
> migradas (Documentación, Servicios, Galería); aquí solo se dejan de usar en Contactos.

## 2. Documentación *(segundo punto, obligatorio)*

- [x] Este plan (`0009-ficha-contactos.md`).
- [x] **Sub-ADR [0005-c](../adr/0005-c-contactos.md)** — reglas propias: campos y obligatorios,
      **contactos con todos los campos obligatorios**, **referencia verificable (teléfono o email, al
      menos uno) al servidor**, limpieza de filas vacías, reapertura con Editar, admin no edita.
- [x] `README.md` de actualizaciones — fila 0009.
- [x] `docs/adr/README.md` — fila 0005-c.
- [x] `docs/ejemplos/empresa-ficticia.md` — empresa ficticia (PSL) **extendida** con Contactos
      (directorio de 2 contactos, comercial/facturación, referencias comercial + bancaria, canales
      digitales).
- [x] **`design.md` §6 — Patrones de composición de formularios de sección** reglamentados
      (cascarón, tarjetas, campos, **listas repetibles**, acciones), a partir de la convención real de
      0007/0008. Fuente de verdad para toda sección futura; evita improvisar diseño.
- [ ] Hereda las reglas generales de [ADR-0005](../adr/0005-fichas-de-asociado-por-seccion.md); no se
      repiten aquí.

## 3. Flujo actual *(obligatorio, antes de proponer cambios)*

- **Entrada asociado:** `GET /company/contacts` → `AssociateController@editContacts` →
  `Associate/Company/Contacts/Index.tsx` (con `initialAssociate`).
- **Datos (4 bloques):**
  - **Directorio de contactos** (`associate_contacts`, repetidor, mín. 1): `area`, `name`, `position`,
    `email`, `phone`.
  - **Comercial y facturación** (columnas en `associates`): `main_ciiu`, `secondary_ciiu`,
    `billing_email`, `company_type` (JSON, multi).
  - **Referencias de respaldo** (`associate_references`, repetidor, mín. 1): `type`
    (`commercial`/`bank`), `name`, `contact_person`, `position`, `email`, `phone`.
  - **Canales digitales** (columnas en `associates`): `social_instagram`, `social_facebook`,
    `social_linkedin`, `social_other`.
- **Acciones asociado:** Guardar borrador (`POST .../contacts/draft`, validación laxa) · Enviar a
  revisión (`POST .../contacts`, valida obligatorios) · **hoy** "Solicitar cambio" vía
  `SectionReviewBanner`.
- **Reglas de negocio hoy:**
  - Envío estricto: `contacts` `required|min:1` con **todos** los campos obligatorios (`email`
    validado como `email`); `main_ciiu`, `billing_email` (email), `company_type` (array) obligatorios;
    `references` `required|min:1` con `type`+`name` obligatorios y `email` `nullable|email`.
  - **No** hay regla de contactabilidad: una referencia puede guardarse **sin teléfono ni email**.
  - Las filas sin `name` se descartan al persistir (`if (! empty($contact['name']))`).
- **Estados hoy:** `draft/pending/approved/rejected/change_pending` (este último se elimina para esta
  sección, ADR-0005). Bloqueo **por sección** (todo o nada).
- **Lado admin hoy:** `Admin/Associates/Show` → `TabContacts` con **lectura + modo edición**
  (`PUT admin.associates.update`, catch-all que **sí** escribe estos campos, incl. contactos) +
  `SectionAuditPanel` (aprobar/rechazar/solicitud de cambio con `change_pending`).
- **Dependencias:** correos de aprobación/rechazo de sección (compartidos con las demás).
- **No hay migración:** las columnas y tablas (`associate_contacts`, `associate_references`) ya existen.

## 4. Revisión de accesibilidad

- **Checkbox de `company_type`:** grupo con leyenda (`FieldLabel`), cada casilla con su etiqueta
  asociada, foco visible con `ring` (tokens), navegación por tabulador; "marca todas las que apliquen"
  comunicado en la ayuda.
- **RadioGroup de `type`:** `role="radiogroup"`, flechas, `aria-checked`, foco visible.
- **Repetidores:** cada fila es un grupo con encabezado ("Contacto 1", "Referencia 1"); el botón de
  eliminar lleva `aria-label` explícito ("Eliminar contacto 1"), no solo un ícono; agregar/eliminar
  mueve el foco de forma predecible.
- **Errores:** `FieldError` por campo (incl. errores por índice `contacts.{i}.email`,
  `references.{i}.phone`) con `role="alert"` + `Alert` de resumen al fallar el envío; el foco salta al
  primer campo con error. Bloqueo (`pending`/`approved`) con `disabled` de contraste legible.
- **Canales digitales:** el ícono del `Input Group` es decorativo (`aria-hidden`); la etiqueta real la
  da el `FieldLabel`.

## 5. Revisión de seguridad

- Regla dura de [ADR-0005](../adr/0005-fichas-de-asociado-por-seccion.md): **el admin no edita**. Se
  retira la escritura de campos/contactos/referencias de Contactos del `PUT update()` y su UI.
- **Validaciones al servidor** (ADR-0005-c): obligatorios de contactos y comercial, y la
  **regla de contactabilidad** (cada referencia con teléfono **o** email). El cliente avisa en vivo; el
  servidor **es la autoridad** y rechaza lo que no cumpla, venga de donde venga.
- El servidor valida el **estado de la sección** antes de aceptar draft/envío/reapertura (no confía en
  el front): `saveContactsDraft` con guard `canEditSection`.
- **Independencia:** las acciones de esta sección tocan **solo** sus campos, `associate_contacts`,
  `associate_references` y `section_reviews.contacts`.

## 6. Revisión funcional

- **Debe seguir igual:** los 4 bloques y sus campos; repetidores con mín. 1 fila; borrador laxo / envío
  estricto; correos de aprobación y rechazo; bloqueo por sección; descarte de filas vacías.
- **Cambia:**
  - Sección aprobada → botón **Editar** → vuelve a `draft`. Se retira "Solicitar cambio", el modal y
    `change_pending` **para esta sección**.
  - Admin: `TabContacts` pasa a **solo lectura + aprobar/rechazar**; se quita el modo edición.
  - **Nueva regla de contactabilidad de referencias** (teléfono o email) validada en **cliente y
    servidor**.
  - UI reconstruida con `base/` + tokens; `company_type` con `Checkbox`, `type` con `RadioGroup`,
    canales con `Input Group`; CIIU con ayuda de texto libre.
- **Alertas / mensajes / validaciones (contrato explícito):**
  | Situación | Mensaje | Componente |
  |---|---|---|
  | Borrador guardado | "Borrador guardado · {hora}" (hora Colombia) | `Alert success` (toast) |
  | Enviado a revisión | "Contactos y referencias enviados a revisión." | `Alert success` |
  | Faltan obligatorios | "Revisa los campos marcados antes de enviar." + error por campo | `Alert destructive` + `FieldError` |
  | Contacto sin email válido | "Escribe un correo válido." | `FieldError` en `contacts.{i}.email` |
  | Referencia sin contacto | "Agrega teléfono o email para poder verificar la referencia." | `FieldError` en `references.{i}.phone` y `.email` |
  | Sin al menos un contacto / referencia | "Agrega al menos un contacto." / "Agrega al menos una referencia." | `Alert destructive` + `FieldError` |
  | En revisión (`pending`) | "CAMEP está validando esta sección." | `Alert default`, campos bloqueados |
  | Aprobada | "Sección aprobada." + botón **Editar** | `Alert success` |
  | Rechazada | "Sección rechazada — {motivo}." | `Alert destructive`, campos editables |
- **Casos límite con pruebas:** borrador incompleto persiste; envío sin obligatorios no pasa; **envío
  sin ningún contacto/ninguna referencia no pasa**; **referencia sin teléfono ni email no pasa
  (servidor)**; email de contacto inválido no pasa; filas vacías se descartan; aprobada→Editar vuelve a
  `draft`; **el admin no puede editar**; guardar Contactos **no altera** el estado de Información Básica
  ni Caracterización.

## 7. Plan de actualización (cortes)

- **9-A · Backend Contactos + contrato** ✅ — Sub-ADR [0005-c](../adr/0005-c-contactos.md) (reglas
  propias) + índices (adr/actualizaciones); acción `reopenContacts` (`approved → draft`, guard
  `canReopenSection`) + ruta `reopen.contacts` + allowlist del middleware de onboarding
  (`reopen.contacts` en pending/verified); guardas de servidor en draft/envío (`canEditSection` en
  `saveContactsDraft`); **nueva validación**: contactabilidad de referencias (teléfono **o** email) vía
  `Validator::after`; helper `normalizeContacts` (recorte + descarte de filas vacías); contacts retirada
  del flujo `change_pending` / `requestSectionChange` / `auditChangeRequest`; **campos de Contactos
  fuera del `PUT update()`** del admin (limpieza atómica). `timestamp` de borrador en hora Colombia
  (`localTimestamp()`). **Pest** (`ContactsSectionTest.php`, **14 tests**): ciclo completo, guardas,
  sin contacto/sin referencia, referencia sin medio de contacto, email inválido, filas vacías, rechazo,
  admin no edita, hora local, independencia. Gates: Pest 14/14, suite 73/73, Pint, Larastan `[OK]`.
- **9-B · UI asociado** ✅ — `Contacts/types.ts` + `Index.tsx` + 4 *parts* reconstruidos con `base/`
  (Card, Field, Input, Checkbox, RadioGroup, Input Group, Alert, Progress, Button): banner de estado por
  `Alert`, botón **Editar** (→ `reopen.contacts`), repetidores `Directory` / `SupportReferences`,
  `company_type` con Checkbox, `type` de referencia con RadioGroup, canales con Input Group, CIIU texto
  libre con ayuda, validación de cliente (obligatorios + contactabilidad) y mensajes de §6. Reusa
  `FormField` (0007). Fuera `FieldWrapper`/`SectionReviewBanner`/`ui/*` y props muertas en esta pantalla.
  **Consistencia:** las tarjetas, encabezados, espaciados y listas repetibles siguen **exactamente**
  `design.md` §6 (no se inventan `border-b`/`CardDescription`/`CardAction`); esa convención quedó
  reglamentada en este corte. `empresa-ficticia.md` extendida. Gates: Vitest 67/67 (3 nuevos de la
  página), tsc, ESLint, Prettier verdes.
  > **Fix (ficha existente):** las filas de la BD llegan con campos `null` (columnas nullable); al
  > hidratar el form rompían los inputs controlados y los `.trim()` de la validación. Se extrajo el
  > saneo a helpers **puros y testeables** `hydrateContacts`/`hydrateReferences` en `types.ts` (strings
  > a `''`, tipo normalizado, llaves extra descartadas) + **5 tests unitarios**. El test de página no lo
  > cubría porque mockea `useForm` (salta el inicializador) — de ahí el helper aparte. Vitest 72/72.
- **9-C · UI admin (solo Contactos)** ✅ — `TabContacts` reconstruido a **solo lectura +
  aprobar/rechazar** con `base/` (fichas de lectura de directorio, comercial, referencias y canales +
  `AuditPanel` propio en `base/`, sin `change_pending`); edición del admin retirada del Tab (sin modo
  edición) y `onAuditChangeRequest` quitado del cableado de `TabContacts` en `Show.tsx`
  (`handleAuditChangeRequest` sigue vivo para Servicios/Documentación). Sigue `design.md` §6. *(La
  escritura de Contactos en el `PUT update()` ya se retiró en 9-A, junto con su Pest.)* `Associates/Index`
  y pestaña Resumen quedan para la pasada final. Gates: tsc, ESLint, Prettier verdes.
  > Nota: `Show.tsx` conserva su deuda **preexistente** (prettier + `any`); mi cambio fue quitar 1 línea
  > (la prop). Formatearlo/tiparlo en cascada → fuera de alcance de este corte.

> `change_pending`, `requestSectionChange`, `auditChangeRequest`, el `PUT update()` completo y sus
> correos se **eliminan del todo** cuando la última sección migre (limpieza registrada en ADR-0005);
> mientras tanto siguen vivos para las secciones aún no intervenidas.

**Gates a ejecutar** (proporcionales): **PHP** — Pint · Larastan · Pest (9-A/9-C) · **Frontend** —
types:check · ESLint · Prettier · Vitest (9-B/9-C).

## 8. Aprobación

- [x] Plan revisado
- [x] `#go` recibido → implementado corte a corte: 9-A ✅ → 9-B ✅ → 9-C ✅

## Decisiones cerradas

1. **CIIU = texto libre.** No hay catálogo CIIU obtenible; se mantiene `Input` de texto con ayuda
   clara. Sin combobox ni catálogo.
2. **Referencia verificable.** Cada referencia debe traer **teléfono o email** (al menos uno) — regla
   cruzada validada en **cliente y servidor**. Una referencia sin forma de contacto no se acepta.
3. **Contactos con todos los campos obligatorios.** Área, nombre, cargo, email y teléfono obligatorios
   en cada contacto (como hoy).
4. **`company_type` con `Checkbox`** (multi-select accesible), **`type` de referencia con
   `RadioGroup`**, **canales digitales con `Input Group`**.
5. **Sin componente nuevo.** Todo el vocabulario ya existe en `base/`; los repetidores se componen
   localmente. Primera sección de la ficha migrada sin crear primitivos.
6. **Sin migración.** Las columnas y tablas ya existen; el trabajo es de flujo, validación y UI.
