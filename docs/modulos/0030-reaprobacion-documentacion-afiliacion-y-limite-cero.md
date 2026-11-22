# Plan de actualización — Correo de re-aprobación, Documentación editable en afiliación y límite 0

- **Estado:** Implementado (gates verdes) — sin commit.
- **Fecha:** 2026-11-22
- **Alcance:** (A) el correo de sección aprobada no ofrece "completa las demás secciones" al
  re-aprobar una empresa ya admitida; (B) habilitar reabrir/eliminar Documentación mientras la
  empresa está en afiliación (`pending`); (C) un plan con el módulo de servicios apagado
  (`limitFor = 0`) se trata como "sin cupo", no como ilimitado.
  **NO entra:** compartir el flash `info` (deuda anotada); recortar servicios ya elegidos al bajar de
  plan (07a, comportamiento aceptado).

> Ejecutado tras `*go`. `info` queda fuera (deuda).

---

## 1. Componentes

- **Reutilizar:** correo React (`Blade`), `ServicePicker`, `Alert`. Sin componentes nuevos.

## 2. Documentación

- [x] Este plan. Sin ADR.

## 3. Flujo actual (antes del cambio)

- `AssociateReviewController::auditSection` siempre construía `SectionAuditApproved` sin
  `isChangeRequest`, y la frase "Continúa completando las demás…" estaba atada a `! isChangeRequest`
  (nunca activo) → salía incluso al re-aprobar.
- `HandleAssociateOnboarding` (`case 'pending'`) no incluía `reopen.documentation` ni
  `documentation.delete` en `$allowedPending`: "Editar" y la papelera de Documentación redirigían al
  Dashboard.
- `Services/Index.tsx` tomaba `serviceLimit ?? 0` con "0 = ilimitado", pero `limitFor` devuelve `0`
  cuando el plan **no incluye** servicios → la pantalla dejaba elegir sin tope y el servidor
  rechazaba todo.

## 4. Revisión de accesibilidad

Sin regresión: se reusa el markup aprobado. El aviso de "sin cupo" es texto (no solo color).

## 5. Revisión de seguridad

Sin cambios de autorización: `reopen.documentation`/`documentation.delete` ya validan estado y dueño
en el controlador; el middleware solo deja de redirigir en `pending`.

## 6. Revisión funcional

- Re-aprobar sección de empresa admitida → correo sin "completa las demás".
- En `pending`: "Editar" y papelera de Documentación funcionan.
- Plan con servicios apagado → pantalla muestra "Tu plan no incluye servicios" y bloquea.

## 7. Cortes

### Corte A — Correo de re-aprobación
1. [x] `SectionAuditApproved`: nueva señal `showNextSteps`. `auditSection` la pasa como
   `! admitido` (status no `approved`/`active`).
2. [x] `AuditApproved.tsx`: la frase "Continúa completando…" se condiciona a `$showNextSteps`. Blade
   recompilado.

### Corte B — Documentación editable en afiliación
3. [x] `HandleAssociateOnboarding`: agregar `reopen.documentation` y `documentation.delete` a
   `$allowedPending`.

### Corte C — Límite 0 = sin cupo
4. [x] `Services/Index.tsx` y `ServicePicker`: `null`/`undefined` = ilimitado; un número (incl. `0`)
   es el tope exacto. Con `0` se bloquea y se avisa "Tu plan no incluye servicios".

## 8. Pruebas

- `tests/Feature/SectionReviewAndServicesTest.php`: re-aprobación (admitida) → `showNextSteps=false`;
  aprobación en afiliación → `true`; reabrir Documentación en `pending` responde con éxito.
- `resources/js/tests/components/ServicePicker.test.tsx`: límite 0 avisa y topa; `null` ilimitado;
  número muestra el tope.

## 9. Deuda anotada

- Compartir el flash `info` y mostrarlo en el Dashboard (corte aparte).
- 07a: recortar servicios al bajar de plan (comportamiento aceptado, se narra en el video).

## 10. Aprobación

- [x] Plan revisado
- [x] `*go` recibido → implementado
