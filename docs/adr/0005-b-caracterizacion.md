# ADR-0005-b · Caracterización (sub-ADR de ADR-0005)

- **Estado:** Aceptada (decisión) — implementación en curso (plan 0008)
- **Fecha:** 2026-09-13
- **Hereda de:** [ADR-0005](0005-fichas-de-asociado-por-seccion.md). Aquí solo van las reglas
  **propias** de esta sección; las generales (máquina de 4 estados, asociado único autor, admin
  solo aprueba/rechaza, independencia, borrador laxo/envío estricto) no se repiten.

---

## Campos de la sección

Cuatro bloques, todos sobre la tabla `associates` (ya existen; **no hay migración**):

- **Talento humano:** `employees_tech`, `employees_prof`, `employees_admin`, `employees_exec`,
  `employees_other` (enteros ≥ 0), `employees_other_desc` (texto), `employees_direct_count`
  (**derivado**, ver regla 2).
- **Sector e hidrocarburos:** `hydrocarbons_participation` (bool), `hydrocarbons_level`
  (**condicional**).
- **PEP:** `pep_declaration` (bool), `pep_name`, `pep_doc_type`, `pep_entity` (**condicionales**).
- **Clasificación e ingresos:** `company_classification` (Micro · Pequeña · Mediana · Grande),
  `public_income_pct`, `private_income_pct` (enteros 0–100, ver regla 1).
- **Formación y gremios:** `capacitation_plan` (bool), `capacitation_level` /
  `capacitation_no_reason` (**condicionales**), `other_guilds` (texto, opcional).

**Obligatorios base al enviar:** `employees_tech/prof/admin/exec/other`, `company_classification`,
`public_income_pct`, `private_income_pct`, `hydrocarbons_participation`, `pep_declaration`,
`capacitation_plan`. Los **condicionales** se suman según reglas 3. En **borrador** todo es opcional.

## Reglas propias

1. **Los ingresos suman exactamente 100%.** `public_income_pct + private_income_pct = 100`.
   Hoy solo se valida en el navegador; **pasa al servidor** (el cliente sigue avisando en vivo, pero
   la autoridad es el servidor: rechaza el envío si no da 100). Regla dura.
2. **`employees_direct_count` es derivado.** Es la suma de las cinco categorías
   (`tech+prof+admin+exec+other`). El cliente lo muestra en solo lectura (campo "Total"); el
   **servidor lo recalcula** al guardar y **valida** que cuadre (blindaje ante manipulación). No es
   un campo que el asociado teclee.
3. **Condicionales obligatorios.** Cuando el disparador es afirmativo, su detalle deja de ser
   opcional y se exige **en cliente y servidor**:
   - `hydrocarbons_participation = true` → `hydrocarbons_level` obligatorio.
   - `pep_declaration = true` → `pep_name`, `pep_doc_type`, `pep_entity` obligatorios.
   - `capacitation_plan = true` → `capacitation_level` obligatorio.
   - `capacitation_plan = false` → `capacitation_no_reason` obligatorio.
   Al cambiar el disparador a negativo, los campos ligados se limpian (no arrastran datos huérfanos).
4. **Reapertura con "Editar" (no solicitud de cambio).** Igual que Información Básica: una sección
   `approved` se reabre con `reopenCharacterization` (`approved → draft`). Caracterización **queda
   fuera** del flujo `change_pending` / `requestSectionChange`. Las demás secciones lo conservan
   hasta migrarse.
5. **Guardas en el servidor.** `saveCharacterizationDraft` y `updateCharacterization` rechazan la
   escritura si la sección no está en `draft`/`rejected`; `reopenCharacterization` exige `approved`.
   El front oculta los botones, pero la autoridad es el servidor.
6. **El admin no edita** (regla de ADR-0005): se retiran los campos de Caracterización del
   `PUT admin.associates.update` y el modo edición de `TabCharacterization`. Correcciones = rechazo
   con motivo.

## Consecuencias

- Ya no puede guardarse una caracterización con ingresos que no sumen 100, con un total de empleados
  incoherente, o con un condicional afirmativo sin su detalle: el servidor lo impide.
- La sección sigue siendo **independiente**: sus acciones tocan solo sus campos y
  `section_reviews.characterization`; guardar Caracterización no afecta a Información Básica ni al revés.
- El control de opción única (sí/no, niveles, tamaño, motivo) se unifica en un solo componente
  `base/RadioGroup`, retirando el `ui/YesNoToggle` y los grupos de botones ad-hoc en esta sección.
