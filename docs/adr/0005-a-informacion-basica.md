# ADR-0005-a · Información Básica (sub-ADR de ADR-0005)

- **Estado:** Aceptada (decisión) — implementación en curso (plan 0007)
- **Fecha:** 2026-09-13
- **Hereda de:** [ADR-0005](0005-fichas-de-asociado-por-seccion.md). Aquí solo van las reglas
  **propias** de esta sección; las generales (máquina de 4 estados, asociado único autor, admin
  solo aprueba/rechaza, independencia, borrador laxo/envío estricto) no se repiten.

---

## Campos de la sección

Tres bloques, todos sobre la tabla `associates`:

- **Identidad:** `company_name` (razón social), `initials` (sigla), `nit`, `legal_status`,
  `constitution_date`, `country_origin`.
- **Representante legal:** `rep_name`, `rep_position`, `rep_doc_type`, `rep_doc`.
- **Ubicación:** `department` + `department_id`, `city` + `city_id`, `address`, `phone`, `website`.

**Obligatorios al enviar (12):** `company_name`, `nit`, `legal_status`, `department`,
`department_id`, `city`, `city_id`, `address`, `phone`, `rep_name`, `rep_position`, `rep_doc_type`,
`rep_doc`, `country_origin`. En **borrador** todos son opcionales.

## Reglas propias

1. **Unicidad por NIT.** El `nit` es único en `associates` (validado en el envío del asociado). La
   **razón social no** lleva unicidad: caben homónimos; el identificador real es el NIT.
2. **Reapertura con "Editar" (no solicitud de cambio).** Una sección `approved` se reabre con la
   acción `reopenBasicInfo` (`approved → draft`); el asociado edita y decide cuándo reenviar.
   basicinfo **queda fuera** del flujo `change_pending` / `requestSectionChange` (retirado de la
   validación de esas acciones). Las demás secciones lo conservan hasta migrarse.
3. **Guardas en el servidor.** `saveBasicInfoDraft` y `updateBasicInfo` rechazan la escritura si la
   sección no está en `draft`/`rejected`; `reopenBasicInfo` exige `approved`. El front oculta los
   botones, pero la autoridad es el servidor.
4. **El admin no edita** (regla de ADR-0005): la edición de estos campos desde el panel admin y el
   `PUT admin.associates.update` para basicinfo se retiran en el corte 7-E. Correcciones = rechazo
   con motivo.
5. **Ubicación desde catálogo propio.** Departamento/ciudad se toman del catálogo DANE (DIVIPOLA)
   sembrado en la base (corte 7-B), servido por `locations.departments` / `locations.cities`. Se
   retira la dependencia en runtime de `api-colombia.com` (el reemplazo en el front ocurre en 7-D).

## Consecuencias

- El cambio de un dato aprobado cuesta **una** aprobación del admin (Editar → reenviar → aprobar),
  no dos.
- La ubicación deja de depender de un tercero en runtime.
- Pendiente (fuera de esta sección): logo/galería (imágenes, ver ADR-0005 · Amazon) y el `status`
  global / `is_public`.
