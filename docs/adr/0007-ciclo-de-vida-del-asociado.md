# ADR-0007 · Ciclo de vida del asociado: estado derivado

- **Estado:** Aceptada — implementación en curso (plan 0014).
- **Fecha:** 2026-09-14
- **Afecta a:** `Associate`, `AssociateController` (lista/admisión/activación), las vistas admin
  `Associates/Index` y `Associates/Show`. Lee la suscripción vía `SubscriptionService` (ADR-0001); no
  cambia el motor de cobro.

---

## Contexto

El estado del asociado estaba disperso y contradictorio: un ENUM `status`
(`draft,pending,approved,rejected,verified,active`) con valores **muertos** (`active` nunca se escribe;
`inactive` ni siquiera está en el ENUM pero la lista lo filtraba y el layout lo contaba → siempre vacío),
más dos toggles (`is_verified`, `is_public`) y un estado de **suscripción derivado** aparte
(`SubscriptionService::statusOf` → none/active/grace/expired). La lista admin tenía 4 pestañas
(Activas/Admitidas/Pendientes/Inactivas) donde "Activas" y "Admitidas" se confundían y el admin no veía
que lo que faltaba era el **pago**. Además el conteo de "secciones aprobadas" era inconsistente (`/4` en
Resumen vs `/5` en el sidebar) y `REVIEWABLE_SECTIONS` (4) no se usaba.

## Decisión

1. **El estado admin se deriva, no se guarda.** `Associate::adminState()` funde ciclo de vida + suscripción
   + desactivación manual en un solo valor que "habla":
   - `pendiente` — `status ∈ {draft, pending, rejected}` (completando / en revisión / con correcciones).
   - `admitida_sin_pago` — `status = verified` (admitida por el admin, **falta pagar**).
   - `activa` — `status = approved` y suscripción `active`.
   - `en_gracia` — `status = approved` y suscripción `grace`.
   - `vencida` — `status = approved` y suscripción `expired`/`none`.
   - `desactivada` — `deactivated_at` no nulo (precede a todo lo demás).
   Los valores muertos del ENUM (`active`, `inactive`) quedan **sin uso**; no se escriben ni se leen. La
   lista es **una sola tabla** ordenada por fecha, con buscador y un filtro *opcional* por estado (coarse,
   en `Select`), no pestañas.

2. **Admisión = perfil 100%.** `approve()` (Admitir Socio) exige `allSectionsApproved()` — las **5**
   secciones aprobadas. `REVIEWABLE_SECTIONS` pasa a incluir `services` y es la **única fuente** para el
   gate de admisión y la barra de progreso. Es regla dura al servidor; el front solo asiste.

3. **Desactivación manual explícita.** Nueva columna `associates.deactivated_at` (nullable). `deactivate()`
   la sella y pone `is_public = false`; `reactivate()` la limpia y recomputa la visibilidad con
   `SubscriptionService::republishIfDue()` (solo vuelve pública si la suscripción está al día). Así se
   distingue **"desactivada por el admin"** de **"vencida por fecha"**.

4. **`is_verified` se conserva.** Es una marca que se escalará a futuro; no se retira. `is_public` sigue
   siendo la visibilidad efectiva (gobernada por el corte de suscripción + la desactivación manual).

## Consecuencias

- La distinción **admitida (verified) → activa (approved)** se mantiene porque **la separa el pago**: no se
  publica una empresa que no ha pagado. "Admitida" ya no confunde: el estado carga el dato de pago.
- El estado se calcula en el servidor (autoridad) y se pinta como badge; cambia solo (activa⇄vencida) al
  vencer la fecha, sin cron ni escrituras en `status`.
- No hay migración del ENUM (los valores muertos no estorban al ser el estado derivado); solo se añade
  `deactivated_at`.
- Nota de análisis estático: el tipo inferido de `status` quedaba con la unión estrecha de la **primera**
  migración (los `DB::statement` que ampliaron el ENUM no se leen); se declara `@property string $status`
  en el modelo para reflejar los valores vigentes, lo que además retiró falsos "always false" del baseline.
