# ADR-0005-d · Servicios (sub-ADR de ADR-0005)

- **Estado:** Aceptada (decisión) — implementación en curso (plan 0011)
- **Fecha:** 2026-09-14
- **Hereda de:** [ADR-0005](0005-fichas-de-asociado-por-seccion.md). Aquí solo van las reglas
  **propias** de esta sección; las generales (máquina de 4 estados, asociado único autor, admin
  solo aprueba/rechaza, independencia, borrador laxo/envío estricto) no se repiten.

---

## Campos de la sección

- **`associates.description`** (texto): propuesta de valor. **Es la descripción pública** de la empresa
  en el directorio; se preserva ese contrato.
- **`service_ids`** → pivot `associate_service`: servicios elegidos del **catálogo admin** (plan 0010).
  Solo se pueden elegir servicios **activos** (`is_active`) y existentes.

**Obligatorios al enviar:** `description` (no vacío) y **al menos un servicio**. En **borrador** todo es
opcional. **No hay migración de BD** (columnas, pivot y `order` del catálogo ya existen).

## Reglas propias

1. **Límite de servicios por plan.** El número de servicios que puede publicar el asociado lo fija su
   plan (`plan->limitFor('servicios')`, ADR-0002; `null` = ilimitado). Es una **regla dura al
   servidor**: `updateServices` rechaza el envío si se supera (con mensaje del plan y el tope). El
   cliente asiste mostrando el conteo; la **autoridad es el servidor**. (Nota: no se empuja el límite
   como prop dedicada para no ampliar la deuda de análisis estático de la relación `plan`, aún sin
   tipar; el front usa el plan si está disponible.)
2. **`description` = descripción pública.** El mismo campo alimenta el directorio; el asociado lo edita
   aquí y se preserva su uso público.
3. **Solo catálogo activo.** El selector ofrece únicamente servicios `is_active`; el servidor valida
   `exists:services,id`. El catálogo se gobierna en el admin (plan 0010 / no aquí).
3b. **Selector escalable (catálogo grande).** El catálogo puede tener cientos de servicios, así que el
   `ServicePicker` **no los lista todos**: la selección actual siempre se ve como chips, y el catálogo
   se muestra **solo al buscar por nombre o elegir una categoría**, dentro de un contenedor con **alto
   máximo y scroll interno** (la página nunca crece con el catálogo). Si algún día crece a miles, se
   evoluciona a un buscador type-ahead (Command).
4. **Reapertura con "Editar" (no solicitud de cambio).** Una sección `approved` se reabre con
   `reopenServices` (`approved → draft`). Servicios queda **fuera** del flujo `change_pending` /
   `requestSectionChange` / `auditChangeRequest`.
5. **Guardas en el servidor.** `saveServicesDraft` y `updateServices` rechazan la escritura si la
   sección no está en `draft`/`rejected`; `reopenServices` exige `approved`.
6. **El admin no edita** (regla de ADR-0005): se retiran `description` y `service_ids` del
   `PUT admin.associates.update` y el modo edición de `TabServices`. El endpoint queda como **no-op**
   (no escribe nada; verificado por las pruebas "el admin no edita" de varias secciones), así que la
   ruta se conserva por ahora en ese estado inofensivo; su retiro formal es limpieza futura opcional.
   Corrección = rechazo con motivo.

## Consecuencias

- Ya no puede enviarse Servicios sin propuesta de valor, sin al menos un servicio, o superando el
  límite del plan: el servidor lo impide.
- La sección es **independiente**: sus acciones tocan solo `description`, el pivot `associate_service` y
  `section_reviews.services`.
- Con Servicios migrada, el `PUT update()` del admin queda **sin uso** (última sección que lo usaba); se
  retira en 11-C. Documentación es la única sección de la ficha que aún conserva el flujo antiguo.
- Segunda sección de la ficha (tras Contactos) migrada **sin crear componentes `base/` nuevos**: el
  selector de servicios se compone localmente.
