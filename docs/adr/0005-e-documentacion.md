# ADR-0005-e · Documentación (sub-ADR de ADR-0005)

- **Estado:** Aceptada — implementación en curso (plan 0013). **Última sección** de la ficha; con ella
  se **cierra ADR-0005**.
- **Fecha:** 2026-09-14
- **Hereda de:** [ADR-0005](0005-fichas-de-asociado-por-seccion.md). Aquí solo van las reglas
  **propias** de esta sección; las generales (máquina de 4 estados, asociado único autor, admin solo
  aprueba/rechaza, independencia, borrador laxo/envío estricto) no se repiten.

---

## Campos de la sección

Una sola *section review* (`documentation`) agrupa tres piezas del mismo momento de onboarding:

- **`files`**: documentos por **clave del catálogo admin** (`DocumentRequirement`, ADR-0006 / plan 0012).
  Validación por-clave (MIME según `accepts` + 10 MB); guardado en el disco por defecto reemplazando el
  archivo anterior.
- **`membership_interest[]`** + **`membership_interest_other`**: interés de afiliación.
- **`rep_name`, `rep_doc`, `funds_origin_declaration`**: declaración jurada (representante + juramento).

**Obligatorios al enviar:** todos los documentos `is_required` del catálogo activo, `rep_name`,
`rep_doc`, `funds_origin_declaration` = aceptado, y `membership_interest` (≥1; `_other` si "Otro"). En
**borrador** todo es opcional. **No hay migración de BD** (columnas y pivote ya existen).

## Reglas propias

1. **Catálogo dinámico.** Los documentos exigidos los define el admin (`DocumentRequirement` activos);
   la sección solo los consume. Archivos cuya clave ya no está activa se preservan ("documentos
   históricos") y se muestran al admin.
2. **Declaración jurada estándar.** Tarjeta de sección normal (design.md §6) con **Checkbox** de
   aceptación (semántica legal de "acepto bajo juramento"), no un interruptor ni cromo decorativo.
3. **Reapertura con "Editar" (no solicitud de cambio).** Una sección `approved` se reabre con
   `reopenDocumentation` (`approved → draft`), como el resto de secciones migradas.
4. **Guardas en el servidor.** `saveDocumentationDraft`/`updateDocumentation` rechazan la escritura si la
   sección no está en `draft`/`rejected`; `reopenDocumentation` exige `approved`. `showDocument` sirve el
   archivo solo al dueño o a un admin (URL firmada de corta vida en S3).
5. **El admin no edita** (regla de ADR-0005): corrección = rechazo con motivo.

## Cierre de ADR-0005

Documentación era la **última** sección con el flujo antiguo. Al migrarla se **retira** por completo:

- `requestSectionChange()` + ruta `associate.company.request.section.change` + `AssociateFieldChangeRequested`
  como aviso de solicitud (la clase Mailable se conserva: la usa `SendTestMail`).
- `auditChangeRequest()` + ruta `admin.associates.audit-change-request`.
- `update()` (no-op) + ruta `PUT admin.associates.update`.
- `Associate::SEC_CHANGE_PENDING` y `canRequestSectionChange()`; el manejo de `change_pending` en
  `Show.tsx` y en los guardas de borrador.

Se **actualizaron** los 4 tests de sección (BasicInfo, Characterization, Contacts, Services): se
eliminaron los casos "rechaza solicitud de cambio sobre X" y "el admin no edita" vía
`associates.update`, ya sin endpoint (la garantía se refuerza: no hay vía que abusar).

## Consecuencias

- La ficha completa opera bajo un **único** modelo (4 estados + "Editar"); no queda código muerto del
  flujo de solicitud de cambio ni del `update()` del admin.
- La sección es **independiente**: sus acciones tocan solo `files`, los campos de declaración/interés y
  `section_reviews.documentation`.
- Sección migrada **sin crear componentes `base/` nuevos**: la grilla de documentos es composición local.
