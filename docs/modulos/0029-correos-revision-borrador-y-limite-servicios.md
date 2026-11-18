# Plan de actualización — Correos de revisión, borrador que conserva el rechazo y límite de servicios

- **Estado:** Implementado (gates verdes) — sin commit.
- **Fecha:** 2026-11-18
- **Alcance:** (A) correos de sección rechazada/aprobada: nombre visible de la sección, botón a la
  sección correcta, tuteo; (B) guardar borrador de una sección rechazada conserva el estado y el
  motivo; (C) el límite de servicios del plan llega a la pantalla y se respeta en el borrador.
  **NO entra:** motor de section reviews, textos de pantalla (solo se alimenta el aviso que ya
  existe), ni unificar `limit_services` ↔ `limitFor` en la BD.

> Ejecutado tras `*go`, con las 3 decisiones por defecto: (1) "Continúa completando las demás
> secciones…" solo en onboarding (`! $isChangeRequest`); (2) el arreglo del borrador aplica a las 5
> secciones; (3) el mapa de secciones se centraliza.

---

## 1. Componentes

- **Reutilizar:** componentes de correo React (`EmailLayout`, `EmailInfoBox`, `EmailButton`, `Blade`),
  y el aviso de límite y el banner "Sección rechazada · Motivo" **que ya existen** en las pantallas.
  Sin componentes nuevos.

## 2. Documentación

- [x] Este plan. Sin ADR (no cambia una decisión vigente).

## 3. Flujo actual (antes del cambio)

- `AssociateAuditRejected` usaba `$fieldName` crudo (`basicinfo`) en asunto y cuerpo, y su botón iba
  siempre a Información Básica. `SectionAuditApproved` traducía el nombre pero su botón también iba
  siempre a Básica y mostraba "Continúe completando las demás secciones…" aun en cambios ya admitidos.
  Los dos hablaban de "usted". El mapa de secciones estaba triplicado en 3 mailables.
- Los `save*Draft` bajaban la sección de `rejected` a `draft`, ocultando el motivo mientras el
  asociado corregía por partes.
- `editServices` cargaba el asociado sin `plan`, así que `Services/Index.tsx` leía
  `plan.limit_services` (columna vieja) y recibía `undefined`: no salía "N / 8" ni el aviso de tope,
  y el borrador no validaba el límite.

## 4. Revisión de accesibilidad

Sin regresión: se reusa el markup aprobado de los correos y de las pantallas.

## 5. Revisión de seguridad

Sin cambios de autorización. El límite de servicios se valida en servidor (envío **y** borrador).

## 6. Revisión funcional

- Correo de rechazo de `characterization` → asunto/cuerpo "Caracterización", botón a esa sección.
- Correo de aprobación → botón a la sección aprobada; la frase de "completar las demás" solo en
  onboarding.
- Guardar borrador de una sección rechazada → sigue "Sección rechazada · Motivo…".
- Servicios → "N / 8" y aviso al llegar al máximo; borrador y envío rechazan pasarse.

## 7. Cortes

### Corte A — Correos de revisión
1. [x] `Associate`: `SECTION_LABELS` + `SECTION_ROUTES` + `sectionLabel()` / `sectionUrl()` (fuente
   única). Los 3 mailables (`AssociateAuditRejected`, `SectionAuditApproved`,
   `AssociateFieldChangeRequested`) la usan.
2. [x] `AssociateAuditRejected`: traduce la sección (asunto + cuerpo) y expone `sectionUrl`.
3. [x] `SectionAuditApproved`: expone `sectionUrl`.
4. [x] `AuditRejected.tsx` / `AuditApproved.tsx`: tuteo, botón a `$sectionUrl`, y "completar las
   demás" condicionada a `! $isChangeRequest`. Blades recompilados.

### Corte B — El borrador no borra "rechazada"
5. [x] En los `save*Draft` de las 5 secciones (Básica, Caracterización, Contactos, Documentación,
   Servicios): si la sección está `rejected`, no bajarla a `draft`.

### Corte C — Límite de servicios en pantalla
6. [x] `editServices`: carga `plan` y pasa `serviceLimit = $plan?->limitFor('servicios')`.
7. [x] `Services/Index.tsx`: lee `serviceLimit` (null/0 = ilimitado) en vez de `plan.limit_services`.
8. [x] `saveServicesDraft`: aplica el mismo tope que `updateServices`.

## 8. Pruebas

- `tests/Feature/SectionReviewAndServicesTest.php`: etiqueta+ruta del correo de rechazo y de
  aprobación; el borrador de una sección rechazada conserva estado+motivo; `editServices` entrega el
  límite; el borrador rechaza pasarse del tope.

## 9. Aprobación

- [x] Plan revisado
- [x] `*go` recibido → implementado
