# Plan de actualización — Ficha del asociado · Caracterización

- **Estado:** Borrador
- **Fecha:** 2026-09-13
- **Alcance:** La **sección Caracterización** de la ficha del asociado, **completa: lado asociado y
  lado admin**. Se reconstruye sobre el sistema de diseño y se alinea con
  [ADR-0005](../adr/0005-fichas-de-asociado-por-seccion.md) (4 estados, asociado único autor, admin
  solo aprueba/rechaza, independencia) y las reglas propias de
  [ADR-0005-b](../adr/0005-b-caracterizacion.md). **No entra:** ninguna otra sección (Información
  Básica ya migrada; Contactos, Documentación, Servicios pendientes), ni el `status` global /
  `is_public`, ni la **vista general del admin** (`Associates/Index` y pestaña **Resumen**), que se
  trabaja al final. Del lado admin, este plan toca **solo** la pestaña de Caracterización.

> Este plan no se ejecuta hasta `#go`. Solo se implementa lo aquí descrito, corte a corte.

---

## 1. Componentes *(primer punto, obligatorio)*

El formulario actual usa componentes **legacy** (`ui/Input`, `ui/Button`, `ui/YesNoToggle`,
`SectionReviewBanner`), un `FieldWrapper` con auditoría campo a campo ya retirada
(`auditLog`, `onRequestChange`, `setChangeRequestField`), colores hardcodeados (`slate-*`) y varios
**grupos de botones ad-hoc** (niveles, tamaño, motivo) escritos a mano en cada *part*. Se reconstruye
con `base/` + tokens.

El único **componente nuevo** es **`RadioGroup`**: unifica todo el "elige una opción" de la
sección — el sí/no (hoy `YesNoToggle`), los niveles (hidrocarburos, capacitación), el tamaño de
empresa y el motivo — en un solo primitivo accesible, con variante segmentada / tarjeta. Un
componente, muchos usos (retira `YesNoToggle` y los grupos ad-hoc en esta sección).

Tabla auditada contra el código real:

| Componente | Rol en Caracterización | Estado | Acción |
| --- | --- | --- | --- |
| **Card** (familia) | contenedores de bloque (asociado) y ficha de lectura del admin | ✅ en `base/` | Reutilizar |
| **Field** (`Field`, `FieldLabel`, `FieldError`, `FieldDescription`) | etiqueta + ayuda + error por campo (vía `FormField`) | ✅ en `base/` | Reutilizar |
| **Input** | conteos de empleados (`type=number`), nombre/entidad PEP | ✅ en `base/` | Reutilizar |
| **Select** (familia) | `pep_doc_type` (reusa `DOC_TYPES` de Información Básica, por consistencia) | ✅ en `base/` | Reutilizar |
| **Input Group** (`InputGroup`, `InputGroupInput`, `InputGroupAddon`, `InputGroupText`) | sufijo **"%"** en los campos de ingresos (hoy es un `<div>` absoluto) | ✅ en `base/` | Reutilizar |
| **Textarea** | `other_guilds` (afiliación a gremios, multilínea) | ✅ en `base/` | Reutilizar |
| **Button** | guardar · enviar · editar (asociado) · aprobar · rechazar (admin) | ✅ en `base/` | Reutilizar |
| **Alert** (`Alert`, `AlertTitle`, `AlertDescription`, `AlertAction`) | banner de estado, mensajes y **aviso de suma ≠ 100** | ✅ en `base/` | Reutilizar |
| **Badge** | píldora "Suma actual: X%" del bloque de ingresos | ✅ en `base/` | Reutilizar |
| **Progress** | indicador de avance del formulario del asociado | ✅ en `base/` | Reutilizar |
| **RadioGroup** (familia: `RadioGroup`, `RadioGroupItem`) | sí/no, niveles (hidrocarburos, capacitación), tamaño de empresa, motivo | ⬜ por crear | **Crear (8-A)** — retira `ui/YesNoToggle` y los grupos ad-hoc |

- **Reutilizar:** `Card*`, `Field*`, `Input`, `Select`, `Input Group`, `Textarea`, `Button`, `Alert`,
  `Badge`, `Progress`. Iconos por `lucide-react`.
- **Crear en `base/` desde spec:** `RadioGroup` (8-A) — **único componente nuevo**. No se crea hasta
  que el usuario pase su spec (regla de `agents.md`).
- **Auditoría cerrada:** se recorrió cada control de los 4 *parts*. Todos los adornos y controles
  quedan cubiertos por componentes ya existentes salvo el "elige una opción", que unifica
  `RadioGroup`. El sufijo "%" pasa de `<div>` absoluto a `Input Group`; el `pep_doc_type` pasa de
  `Input` libre a `Select` (consistencia con Información Básica).
- **Composición local (no es `base/`):** se reutiliza `FormField` (ya creado en 0007) para envolver
  `Field` + control + error; vive junto a los *parts*.
- **Decisión de diseño:** `company_classification` se resuelve con **`RadioGroup`** (4 opciones
  visibles en tarjetas), **no** con `Select` — mejor visibilidad de un conjunto corto y fijo, y
  semántica de grupo de radios para lectores de pantalla. Consistente con el resto de la sección.
- **Reemplazar / retirar (solo en esta sección):**
  - `Components/FieldWrapper` → `base/Field` (sin auditoría campo a campo; el bloqueo es por sección).
  - `Components/SectionReviewBanner` → banner de estado con `base/Alert`; **sin modal de cambio**.
    El botón **Editar** reemplaza a "Solicitar cambio".
  - `ui/Input`, `ui/Button`, `ui/YesNoToggle` → `base/Input`, `base/Button`, `base/RadioGroup`.
  - `<textarea>` crudo (en `TrainingGuilds`) y los `<button>` de niveles/tamaño/motivo →
    `base/Textarea` y `base/RadioGroup`.
  - Props muertas `auditLog={{}}`, `setChangeRequestField(){}`, `isLocked/fieldStatus` por campo →
    eliminadas; lo editable se deriva del estado **de la sección**.

> Convivencia: `FieldWrapper`, `SectionReviewBanner` y `ui/YesNoToggle` **siguen existiendo** para las
> demás secciones hasta que se migren; aquí solo se dejan de usar en Caracterización. `YesNoToggle`
> se marca para retiro cuando quede sin referencias.

## 2. Documentación *(segundo punto, obligatorio)*

- [x] Este plan (`0008-ficha-caracterizacion.md`).
- [x] **Sub-ADR [0005-b](../adr/0005-b-caracterizacion.md)** — reglas propias: campos y obligatorios,
      **suma 100% al servidor**, `employees_direct_count` derivado, **condicionales obligatorios**,
      reapertura con Editar, admin no edita.
- [x] `orden-componentes.md` — **Radio Group** marcado `[x]` (creado y en `/dev/componentes`).
- [x] `README.md` de actualizaciones — fila 0008.
- [x] `docs/ejemplos/empresa-ficticia.md` — empresa ficticia (PSL) **extendida** con Caracterización
      (total 41 = suma, ingresos 65/35, condicionales completos).
- [ ] Hereda las reglas generales de [ADR-0005](../adr/0005-fichas-de-asociado-por-seccion.md); no se repiten aquí.

## 3. Flujo actual *(obligatorio, antes de proponer cambios)*

- **Entrada asociado:** `GET /company/characterization` → `AssociateController@editCharacterization`
  → `Associate/Company/Characterization/Index.tsx` (con `initialAssociate`).
- **Datos (4 bloques):** Talento Humano (`employees_*` + `_direct_count` + `_other_desc`), Sector/PEP
  (`hydrocarbons_participation`/`_level`, `pep_declaration`/`_name`/`_doc_type`/`_entity`),
  Clasificación e Ingresos (`company_classification`, `public_income_pct`, `private_income_pct`),
  Capacitación y Gremios (`capacitation_plan`/`_level`/`_no_reason`, `other_guilds`).
- **Acciones asociado:** Guardar borrador (`POST .../characterization/draft`, validación laxa) ·
  Enviar a revisión (`POST .../characterization`, valida obligatorios) · **hoy** "Solicitar cambio"
  vía `SectionReviewBanner`.
- **Reglas de negocio hoy:**
  - `employees_direct_count` se **autocalcula** en el cliente (useEffect suma las 5 categorías).
  - `public + private = 100` se valida **solo en el cliente** (`handleSubmit`); el servidor **no**
    lo comprueba (valida cada uno como `integer|min:0|max:100` por separado).
  - Los **condicionales** (`hydrocarbons_level`, `pep_*`, `capacitation_level/no_reason`) son
    `nullable` en el servidor **aunque** el disparador sea afirmativo.
- **Estados hoy:** `draft/pending/approved/rejected/change_pending` (este último se elimina para esta
  sección, ADR-0005). Bloqueo **por sección** (todo o nada).
- **Lado admin hoy:** `Admin/Associates/Show` → `TabCharacterization` con **lectura + modo edición**
  (`PUT admin.associates.update`, catch-all que **sí** escribe estos campos) + `SectionAuditPanel`
  (aprobar/rechazar/solicitud de cambio con `change_pending`).
- **Dependencias:** correos de aprobación/rechazo de sección (compartidos con las demás).
- **No hay migración:** todas las columnas ya existen en `associates`.

## 4. Revisión de accesibilidad

- **RadioGroup:** `role="radiogroup"`, navegación por flechas, `aria-checked`, foco visible con
  `ring` (tokens), estado de error (`aria-invalid`); cada grupo con su `FieldLabel`/leyenda asociada.
  La variante tarjeta es **visual**: la semántica sigue siendo de radios (los lee un lector de pantalla
  como grupo con N opciones).
- **Suma de ingresos:** el indicador "Suma actual: X%" va con **texto + color** (no solo color) y en
  una región `aria-live="polite"` para que se anuncie al cambiar.
- **Total de empleados derivado:** campo de solo lectura con etiqueta clara ("Total, calculado"); no
  es un `input` editable trampa.
- **Condicionales:** aparecen con transición suave y **no bloquean** hasta que se responde el
  disparador; su obligatoriedad se comunica por `FieldError` (`role="alert"`) al enviar.
- **Errores:** `FieldError` por campo + `Alert` de resumen al fallar el envío; el foco salta al primer
  campo con error. Bloqueo (`pending`/`approved`) con `disabled` de contraste legible, no solo atenuado.

## 5. Revisión de seguridad

- Regla dura de [ADR-0005](../adr/0005-fichas-de-asociado-por-seccion.md): **el admin no edita**.
  Se retira la escritura de campos de Caracterización del `PUT update()` y su UI.
- **Validaciones al servidor** (ADR-0005-b): suma `= 100`, `direct_count = Σ categorías` y
  **condicionales obligatorios**. El cliente avisa en vivo; el servidor **es la autoridad** y rechaza
  lo que no cumpla, venga de donde venga.
- El servidor valida el **estado de la sección** antes de aceptar draft/envío/reapertura (no confía
  en el front).
- **Independencia:** las acciones de esta sección tocan **solo** sus campos y
  `section_reviews.characterization`.

## 6. Revisión funcional

- **Debe seguir igual:** los 4 bloques y sus campos; borrador laxo / envío estricto; correos de
  aprobación y rechazo; bloqueo por sección; autocálculo del total de empleados; limpieza de
  condicionales al cambiar el disparador a negativo.
- **Cambia:**
  - Sección aprobada → botón **Editar** → vuelve a `draft`. Se retira "Solicitar cambio", el modal y
    `change_pending` **para esta sección**.
  - Admin: `TabCharacterization` pasa a **solo lectura + aprobar/rechazar**; se quita el modo edición.
  - **Suma 100%**, **total = Σ** y **condicionales obligatorios** ahora se validan **también en el
    servidor**.
  - UI reconstruida con `base/` + tokens; sí/no, niveles, tamaño y motivo con `RadioGroup`.
- **Alertas / mensajes / validaciones (contrato explícito):**
  | Situación | Mensaje | Componente |
  |---|---|---|
  | Borrador guardado | "Borrador guardado · {hora}" | `Alert success` (toast) |
  | Enviado a revisión | "Caracterización enviada a revisión." | `Alert success` |
  | Faltan obligatorios | "Faltan campos obligatorios" + error por campo | `Alert destructive` + `FieldError` |
  | Ingresos ≠ 100 | "Los ingresos deben sumar exactamente 100% (hoy: {X}%)." | `Alert destructive` + `FieldError` en ambos % |
  | Condicional sin responder | "Completa este dato para continuar." | `FieldError` en el campo condicional |
  | Total de empleados | *derivado*: el servidor lo **recalcula** como la suma (no hay error posible; blindaje por recálculo) | — (solo lectura en UI) |
  | En revisión (`pending`) | "CAMEP está validando esta sección." | `Alert default`, campos bloqueados |
  | Aprobada | "Sección aprobada." + botón **Editar** | `Alert success` |
  | Rechazada | "Sección rechazada — {motivo}." | `Alert destructive`, campos editables |
- **Casos límite con pruebas:** borrador incompleto persiste; envío sin obligatorios no pasa; **suma
  ≠ 100 no pasa (servidor)**; **condicional afirmativo sin detalle no pasa**; **total manipulado ≠ Σ
  se corrige/rechaza**; aprobada→Editar vuelve a `draft`; **el admin no puede editar**; guardar
  Caracterización **no altera** el estado de Información Básica.

## 7. Plan de actualización (cortes)

- **8-A · RadioGroup** ✅ — `base/RadioGroup.tsx` creado desde spec (Radix), con el **dialecto del
  Checkbox** (alias del config `data-checked`/`ring-3`/`aria-invalid`, sin conversión a mano) + galería
  (sí/no, niveles, choice cards, disabled, invalid) + test. `[x]` en `orden-componentes.md`. Retira
  `ui/YesNoToggle`.
- **8-B · Backend Caracterización (asociado)** ✅ — acción `reopenCharacterization`
  (`approved → draft`, guard `canReopenSection`) + ruta + allowlist del middleware de onboarding
  (`reopen.characterization` en pending/verified); guardas de servidor en draft/envío;
  **nuevas validaciones**: suma `= 100`, recálculo y validación de `employees_direct_count = Σ`,
  y **condicionales obligatorios** (regla 3 de ADR-0005-b); limpieza de condicionales al negativo;
  characterization retirada del flujo `change_pending` / `requestSectionChange`. **Pest**: ciclo
  completo, guardas, suma ≠ 100, condicional sin detalle, total recalculado, rechazo, independencia
  (**12 Pest**). *(La remoción de la edición del admin —`update()` + UI— se hace completa y atómica en 8-D.)*
- **8-C · UI asociado** ✅ — `Characterization/Index.tsx` + 4 *parts* reconstruidos con `base/`
  (Card, Field, Input, Select, Input Group, Textarea, RadioGroup, Alert, Badge, Progress, Button):
  banner de estado por `Alert`, botón **Editar** (→ `reopen.characterization`), total derivado en
  solo lectura (Badge), indicador de suma en vivo (`aria-live` + Badge), condicionales, validaciones
  y mensajes de §6. Reusa `FormField` (0007); nuevos `types.ts` y `RadioControls` (composición local
  `YesNo`/`OptionGroup`). Fuera `FieldWrapper`/`SectionReviewBanner`/`ui/*` y props muertas en esta
  pantalla; **`ui/YesNoToggle` eliminado** (sin referencias). `empresa-ficticia.md` extendida. Test
  de la página (aprobado/Editar, rechazo, suma). tsc + ESLint + Vitest (64/64) verdes.
- **8-D · UI admin (solo Caracterización)** ✅ — `TabCharacterization` reconstruido a **solo lectura +
  aprobar/rechazar** con `base/` (ficha de lectura + `AuditPanel` `Alert`/`Button`/`Textarea`, sin
  `change_pending`); edición del admin retirada: sin modo edición en el Tab, `onAuditChangeRequest`
  quitado del cableado en `Show.tsx`, y **campos de Caracterización fuera del `PUT update()`**
  (validación + `$fields`). **Pest**: el admin ya no escribe estos campos (13 en total). `Associates/
  Index`, pestaña Resumen y el mock `VerificationDashboard.tsx` quedan para la pasada final.
  > Nota: `Show.tsx` conserva su deuda **preexistente** (prettier + 5 `any`, commit previo); mi cambio
  > fue quitar 1 línea (la prop). Formatearlo/tiparlo en cascada → fuera de alcance de este corte.

> `change_pending`, `requestSectionChange`, `auditChangeRequest`, el `PUT update()` completo y sus
> correos se **eliminan del todo** cuando la última sección migre (limpieza registrada en ADR-0005);
> mientras tanto siguen vivos para las secciones aún no intervenidas.

**Gates a ejecutar** (proporcionales): **PHP** — Pint · Larastan · Pest (8-B/8-D) · **Frontend** —
types:check · ESLint · Prettier · Vitest (8-A/8-C/8-D).

## 8. Aprobación

- [ ] Plan revisado
- [ ] `#go` recibido → implementar (corte a corte: 8-A → 8-B → 8-C → 8-D)

## Decisiones cerradas

1. **Suma de ingresos 100% al servidor.** El cliente avisa en vivo; el servidor rechaza el envío si
   `public + private ≠ 100`. Se deja de confiar solo en el navegador.
2. **`employees_direct_count` derivado.** Lo calcula el cliente (solo lectura) y lo **recalcula y
   valida el servidor** (suma de las 5 categorías). No es campo tecleable.
3. **Condicionales obligatorios.** Si el disparador es afirmativo, su detalle es obligatorio (cliente
   + servidor); si es negativo, se limpia. Ver ADR-0005-b regla 3.
4. **Control de opción única = `RadioGroup`.** Un solo componente nuevo para sí/no, niveles, tamaño y
   motivo. `company_classification` va en `RadioGroup` (tarjetas), no en `Select`.
5. **Sin migración.** Las columnas ya existen; el trabajo es de flujo, validación y UI.
