# ADR-0008 · Modelo de alta unificado (cuota inicial que exonera el mes 1)

- **Estado:** Aceptada
- **Fecha:** 2026-09-14
- **Afecta a:** alta y cambio de plan (`Associate\CheckoutController`, `BillingService`), catálogo de
  módulos (`features`), directorio público.
- **Relacionada:** [ADR-0001](0001-motor-de-cobro-unificado.md) (cierra su riesgo abierto sobre cómo se
  cobra el alta) y [ADR-0002](0002-interruptores-de-modulo-por-plan.md) (reconcilia el catálogo).

---

## Contexto

El alta convivía con **dos modelos de cobro** según la bandera de plan `signup_only_first_period`:

1. **Solo inscripción el primer mes:** se cobraba únicamente la cuota inicial, que otorgaba un mes de
   vigencia; la mensualidad arrancaba el mes 2.
2. **Inscripción + primera mensualidad juntas:** se cobraban ambas cosas en el alta.

Además, el checkout ofrecía **elegir ciclo** (mensual/semestral/anual) en el alta, y el catálogo de
módulos (`features`, ADR-0002) seguía mostrando **banderas muertas** (bolsa de empleo, red, reseñas,
soporte) como si fueran beneficios entregados, más una **prioridad de directorio** por plan pensada para
diferenciar planes gratis — que ya no existen: todos los planes son pagos.

## Decisión

### 1. Una sola regla de alta

Toda membresía tiene una **cuota inicial** que **exonera el primer mes**:

| Momento | Qué se cobra | Vigencia | Cuota inicial |
|---|---|---|---|
| Primera vez (`status = verified`), cuota inicial > 0 | **cuota inicial** | 1 mes → día 19 | sí |
| Primera vez, cuota inicial = 0 | primera mensualidad | +1 mes → día 19 | no |
| Renovación / cambio de plan (`approved`) | precio del ciclo | +1 ciclo → día 19 | no |
| Reactivación (vencido que vuelve) | precio del ciclo | +1 ciclo → día 19 | **no** |

La cuota inicial se cobra **solo la primera vez**. El reingreso tras un vencimiento **no** la re-cobra.
La aritmética de vigencia no cambia: sigue en `SubscriptionService` (`max(hoy, vencimiento)`, día 19).

### 2. El ciclo recurrente arranca siempre mensual

El alta **no** ofrece elegir ciclo: paga la cuota inicial y el `billing_cycle` queda en `monthly`. El
asociado cambia a semestral/anual después, desde Gestión del Plan. La mensualidad del mes 2 la emite el
cron existente (`invoices:generate-monthly`).

### 3. Catálogo de módulos reconciliado

El catálogo `features` pasa a reflejar los módulos **reales**; los que aún no existen quedan
**Próximamente** (`is_enabled = false`):

- **Activos:** Galería de fotos, Servicios propios, Anuncios, Bienes y servicios, Red CAMEP.
- **Próximamente:** EmpleaMEP (`bolsa_empleo`), Reseñas, Soporte técnico, **Ranking** (nuevo).
- `licitaciones` → **`bienes_servicios`** (rename de clave; preserva el pivote). Representa el acceso al
  módulo Bienes y Servicios; **no** se añade gating nuevo en este cambio (se preserva el acceso actual).
- Se **retira `directorio_prioritario`** y el directorio público deja de ordenar por prioridad. La
  prioridad volverá como el módulo **`ranking`**, que la **gana** el asociado según cuatro factores:
  hábito de pago, reseñas, actividad en la cuenta y vistas (implementación futura).
- `pago_en_linea` deja de tratarse como módulo de plan (es método de pago; irá a Integraciones).

Las columnas booleanas históricas de `plans` se conservan como capa de compatibilidad (ADR-0002) pero
**dejan de mostrarse** como beneficios: el display lee del catálogo.

## Opciones consideradas

- **Mantener el modelo doble:** flexible, pero deja dos aritméticas de alta y una UI que obliga a decidir
  por plan algo que el negocio ya unificó. Se descarta.
- **Cobrar siempre inscripción + mensualidad:** contradice la intención de negocio (la cuota inicial
  exonera el primer mes). Se descarta.

## Consecuencias

**A favor**
- Un solo camino de alta, fácil de explicar y de probar.
- La membresía muestra lo que realmente entrega; lo que no existe se anuncia como *Próximamente*.
- La prioridad del directorio pasa de comprada a **ganada** (futuro `ranking`).

**En contra**
- Durante la transición, la bandera `signup_only_first_period` y las columnas legacy siguen en el
  esquema aunque ya no gobiernen (se retiran en un ADR de limpieza posterior).
- El rename de clave `licitaciones`→`bienes_servicios` exige una migración de datos (hecha, preserva el
  pivote).

## Estado de la implementación — plan 0016, corte 16-A

- Migración `2026_09_14_120000_reconcile_membership_feature_catalog` (rename, retiro de
  `directorio_prioritario`, alta de `ranking`, *Próximamente*). `FeatureSeeder` y `Feature::LEGACY_COLUMN`
  actualizados.
- `CheckoutController@store` unificado; `BillingService` con etiqueta "Cuota inicial".
- Directorio público (`web.php`, `PublicCompanyController`) en orden neutro.
- `PlanController@index` expone los módulos del catálogo por plan.
- Pruebas: `MembershipSignupTest`, `PlanCatalogTest`.

### Pendiente (planes siguientes)

- 16-B/16-C: UI admin de Membresías y alta del asociado a `base/`.
- Retirar la bandera `signup_only_first_period` y las columnas legacy cuando ninguna pantalla dependa de
  ellas.
- Implementar el módulo `ranking` y el nuevo orden del directorio (plan 0020).
