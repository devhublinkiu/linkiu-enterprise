# ADR-0005-c · Contactos y Referencias (sub-ADR de ADR-0005)

- **Estado:** Aceptada (decisión) — implementación en curso (plan 0009)
- **Fecha:** 2026-09-13
- **Hereda de:** [ADR-0005](0005-fichas-de-asociado-por-seccion.md). Aquí solo van las reglas
  **propias** de esta sección; las generales (máquina de 4 estados, asociado único autor, admin
  solo aprueba/rechaza, independencia, borrador laxo/envío estricto) no se repiten.

---

## Campos de la sección

Cuatro bloques. Los escalares viven en `associates`; contactos y referencias en sus tablas
(`associate_contacts`, `associate_references`). Todo **ya existe; no hay migración**.

- **Directorio de contactos** (`associate_contacts`, repetidor, mín. 1): `area`, `name`,
  `position`, `email`, `phone`.
- **Comercial y facturación** (`associates`): `main_ciiu`, `secondary_ciiu`, `billing_email`,
  `company_type` (JSON, multi-selección).
- **Referencias de respaldo** (`associate_references`, repetidor, mín. 1): `type`
  (`commercial` / `bank`), `name`, `contact_person`, `position`, `email`, `phone`.
- **Canales digitales** (`associates`, opcionales): `social_instagram`, `social_facebook`,
  `social_linkedin`, `social_other`.

**Obligatorios base al enviar:** al menos **un contacto** con `area`, `name`, `position`, `email`
(email válido) y `phone`; `main_ciiu`; `billing_email` (email válido); `company_type` (≥ 1); al menos
**una referencia** con `type` y `name`. En **borrador** todo es opcional.

## Reglas propias

1. **CIIU es texto libre.** No existe un catálogo CIIU que podamos poblar de forma fiable, así que
   `main_ciiu` / `secondary_ciiu` se capturan como texto con una ayuda clara ("Código de actividad
   económica DIAN/DANE, ej. 0610"). Sin combobox ni catálogo: no se promete un dato que no podemos
   respaldar. Si algún día hay catálogo oficial, se revisita con un ADR nuevo.
2. **Contactos con todos los campos obligatorios.** Cada contacto del directorio exige
   `area`, `name`, `position`, `email` (formato email) y `phone`. Un contacto a medias no aporta.
3. **Referencia verificable (teléfono o email).** Una referencia externa sin forma de contacto es
   inverificable. Cada referencia debe traer **al menos uno** de `phone` / `email` (no ambos). Se
   valida en **cliente y servidor** (regla cruzada `Validator::after`). El `email`, si viene, debe
   tener formato válido.
4. **Filas vacías se descartan.** Al persistir, se recortan los textos y se eliminan los contactos
   y referencias sin `name` (no se guardan registros huérfanos). Vale para borrador y envío.
5. **Reapertura con "Editar" (no solicitud de cambio).** Igual que Información Básica y
   Caracterización: una sección `approved` se reabre con `reopenContacts` (`approved → draft`).
   Contactos **queda fuera** del flujo `change_pending` / `requestSectionChange` / `auditChangeRequest`.
   Las demás secciones lo conservan hasta migrarse.
6. **Guardas en el servidor.** `saveContactsDraft` y `updateContacts` rechazan la escritura si la
   sección no está en `draft`/`rejected`; `reopenContacts` exige `approved`. El front oculta los
   botones, pero la autoridad es el servidor.
7. **El admin no edita** (regla de ADR-0005): se retiran los campos de Contactos (escalares,
   contactos y referencias) del `PUT admin.associates.update` y el modo edición de `TabContacts`.
   Correcciones = rechazo con motivo.

## Consecuencias

- Ya no puede enviarse Contactos sin al menos un contacto completo, sin una referencia, o con una
  referencia sin teléfono ni email: el servidor lo impide.
- La sección sigue siendo **independiente**: sus acciones tocan solo sus campos,
  `associate_contacts`, `associate_references` y `section_reviews.contacts`; guardar Contactos no
  afecta a Información Básica ni a Caracterización.
- Es la primera sección de la ficha que se migra **sin crear ningún componente `base/` nuevo**: todo
  el vocabulario (Card, Field, Input, Checkbox, RadioGroup, Input Group, Alert, Badge, Progress,
  Button) ya existe; los repetidores se componen localmente.
