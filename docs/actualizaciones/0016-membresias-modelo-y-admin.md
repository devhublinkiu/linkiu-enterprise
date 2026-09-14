# Plan de actualización — Membresías: modelo unificado + admin de Planes + alta

- **Estado:** Borrador
- **Fecha:** 2026-09-14
- **Alcance:** Definir **qué es una membresía** de cara al negocio y **cómo se compra por primera vez**.
  Entra: (1) reconciliar el **catálogo de módulos** a los que existen de verdad, marcando los
  *próximamente*, y retirar del display las banderas muertas; (2) **unificar el modelo de alta** a una
  sola regla — **cuota inicial que exonera el mes 1**, solo la primera vez; (3) modernizar a `base/` las
  pantallas **admin de Membresías** (`Plans/Index` + `Plans/Form`) y el **alta del asociado**
  (`Billing/Checkout`).
  **NO entra** (van en planes siguientes): `Billing/Index` (Gestión del Plan) y `Invoices/*` del asociado
  → **0017**; admin **Finanzas** (Pagos, Facturación, Datos bancarios) + reorganización del menú → **0018**;
  **Integraciones/Bold** y el **borrado** de `payment_requests` (histórico) → **0019**. Tampoco se toca la
  aritmética de vigencia (`SubscriptionService`, día 19), que ya es correcta.

> Este plan no se ejecuta hasta `#go`. Solo se implementa lo aquí descrito, corte a corte.

---

## 1. Componentes *(primer punto, obligatorio)*

Las tres pantallas están en idioma **legacy** (`@/Components/ui/*`, colores `slate-*` hardcodeados,
`uppercase font-black`, `confirm()`). Todo sale de `base/`; **cero componentes nuevos**.

| Componente | Rol | Estado | Acción |
| --- | --- | --- | --- |
| **Card** (familia) | tarjeta de cada membresía (Index) y bloques del formulario/checkout | ✅ base/ | Reutilizar |
| **Table** (familia) | alternativa de lista compacta de membresías si la tarjeta no cabe | ✅ base/ | Evaluar en 16-B |
| **Badge** | estado del plan (activo/inactivo, popular) y **módulos** (incluido *Próximamente*) | ✅ base/ | Reutilizar |
| **Switch** | activar/desactivar plan, marcar popular, y **cada módulo** del plan en el Form | ✅ base/ | Reutilizar |
| **Field / Input / Textarea / Select** | campos del Form (precios, cuota inicial, prórroga, color) y del checkout | ✅ base/ | Reutilizar |
| **Dialog** | confirmación de borrado de plan (reemplaza `confirm()`) | ✅ base/ | Reutilizar |
| **Alert** | flash y avisos (p. ej. "no se puede borrar: tiene asociados") | ✅ base/ | Reutilizar |
| **Button** | acciones (crear, editar, borrar, pagar cuota inicial) | ✅ base/ | Reutilizar |
| **RadioGroup / Card seleccionable** | elección de **ciclo de renovación** en el alta (si se conserva) | ✅ base/ | Reutilizar |

- **Reutilizar:** `Card*`, `Badge`, `Switch`, `Field`/`Input`/`Textarea`/`Select`, `Dialog*`, `Alert`,
  `Button`. Iconos `lucide-react`.
- **Reemplazar / retirar:** en las tres pantallas, `ui/*` + colores crudos + `confirm()` → `base/` +
  tokens de `design.md` + `Dialog`. En el **display de módulos** del plan, retirar las 4 banderas muertas
  (bolsa de empleo, red, reseñas, soporte VIP) como "beneficios cumplidos" y mostrar el **catálogo real**.
- **Nuevo:** ninguno.

## 2. Documentación *(segundo punto, obligatorio)*

- [ ] Este plan (`0016-membresias-modelo-y-admin.md`).
- [ ] **ADR-0008 — Modelo de alta unificado (cuota inicial exonera el mes 1)**: una sola regla de alta;
      cuota inicial solo la primera vez; reactivación y renovación sin cuota inicial; mensualidad desde el
      mes 2. Reemplaza el modelo doble ("solo inscripción primer mes" vs "inscripción + primera mensualidad
      juntas"). Cierra el riesgo abierto de ADR-0001 sobre cómo se cobra el alta. Índice en `docs/adr/README.md`.
- [ ] **ADR-0002 (actualización)**: el catálogo de módulos pasa a reflejar los módulos reales; se anota que
      *EmpleaMEP*, *Reseñas* y *Soporte técnico* quedan **próximamente** (`is_enabled = false`), que *Anuncios*
      absorbe la antigua *descarga de pliegos* y que *Pago en línea (Bold)* **deja de ser módulo de plan**
      (es método de pago, va a Integraciones — 0019).
- [ ] `README.md` de actualizaciones — fila 0016.
- [ ] `orden-componentes.md` — **sin cambios** (no se crea ningún componente).

## 3. Flujo actual *(obligatorio, antes de proponer cambios)*

- **Admin Membresías** (`GET admin/plans`, `PlanController@index`): manda `Plan::latest()->get()` **crudo**
  (sin cargar `features`) → `Plans/Index.tsx` pinta tarjetas con las **columnas booleanas históricas**
  (`has_priority_directory`, `can_download_tenders`, `has_job_board`, `has_network`, `has_reviews`,
  `has_priority_support`) + límites. Es decir, la UI muestra 4 módulos que **no existen** (ADR-0002 los
  declara banderas muertas). `Plans/Form.tsx` sí edita el **catálogo real** (`planFeatures` + `features`)
  **y además** sincroniza las columnas legacy (`PlanController@syncFeatures`).
- **Alta del asociado** (`GET/POST admin? no →` `associate.checkout.*`, `CheckoutController`): dos modelos
  conviven según la bandera del plan `signup_only_first_period`:
  - **signupOnly** (`isFirstPayment && signup_only_first_period && signup_fee>0`): factura única = `signup_fee`,
    ciclo `signup` (1 mes de vigencia); `billing_cycle` **no** se guarda.
  - **primer pago normal**: `amount = precio del ciclo + signup_fee`; se cobra inscripción **y** primera
    mensualidad juntas.
  - **renovación / cambio de plan** (`isFirstPayment=false`): `amount = precio del ciclo`, sin `signup_fee`.
  Emite `Invoice type=cuenta_cobro` y redirige a `associate.invoice.pay`.
- **Reactivación** (`AssociateController@billing` → `BillingService@issueReactivationInvoice`): al entrar
  vencido sin nada pendiente, emite cuenta = `amountFor(plan, billing_cycle)` **sin** cuota inicial. ✔ ya
  coincide con lo deseado.
- **Estados:** plan `is_active`/`is_popular`; suscripción derivada (`SubscriptionService::statusOf`).
- **Validaciones:** `PlanController@store/update` exige las 6 banderas booleanas + límites + `signup_fee` +
  `signup_only_first_period` + color hex.
- **Dependencias relevantes:** `Plan`, `Feature`, `plan_feature`, `Invoice`, `BillingService`,
  `SubscriptionService`, `Associate.billing_cycle`, `Associate.status ('verified'→'approved')`.
- **Resultado esperado:** la membresía muestra módulos **reales**; el alta cobra **solo la cuota inicial**
  la primera vez y arranca la mensualidad en el mes 2.

## 4. Revisión de accesibilidad

- **Tarjetas/tabla de membresías:** estado por **texto + color** (Badge), no solo color; el color del plan
  (`color_hex`) es decorativo, nunca el único portador de significado.
- **Módulos "Próximamente":** etiqueta textual explícita (Badge "Próximamente"), no solo un tono apagado.
- **Form:** cada `Switch` de módulo con etiqueta asociada; campos con `Field`/label; errores con
  `InputError` accesible.
- **Borrado de plan:** `Dialog` con foco atrapado, `Esc` y título asociado (reemplaza `confirm()`); si el
  plan tiene asociados, se **oculta** el botón Eliminar y se explica por qué (patrón de 0015).
- **Checkout:** el importe a pagar (cuota inicial) y qué incluye se enuncian en texto; el CTA dice
  exactamente qué se cobra.

## 5. Revisión de seguridad

- Todo el admin bajo middleware `admin` (ADR-0006). Sin cambios de autorización.
- **La regla de cobro vive en el servidor** (`CheckoutController` + `BillingService`); el checkout del
  front solo muestra el importe que el servidor decide. El monto de la factura **nunca** se toma del cliente.
- **Borrado de plan** sigue bloqueado si tiene asociados (`PlanController@destroy`, ya existe); se refuerza
  ocultando el botón en la UI (defensa en profundidad, no sustituto).
- `is_enabled=false` (Próximamente) mantiene la **compuerta global**: el módulo no es accesible aunque un
  plan lo tenga marcado (regla de las tres compuertas, ADR-0002).
- Sin exposición de datos nuevos: el catálogo de módulos ya es información de plan.

## 6. Revisión funcional

### 6.1 Catálogo de módulos (lo que muestra una membresía)

Se reconcilia el catálogo `features` a los módulos reales (**confirmado con negocio**):

| Módulo (display) | `key` | Tipo | Estado | Nota |
|---|---|---|---|---|
| Galería de fotos | `galeria` | límite | activo | máx. imágenes |
| Servicios propios | `servicios` | límite | activo | máx. servicios que la empresa publica en su perfil |
| Anuncios | `anuncios` | sí/no | activo | convocatorias generales de CAMEP |
| Bienes y servicios | `bienes_servicios` *(rename de `licitaciones`)* | sí/no | activo | acceso al mercado de licitaciones que monta el admin (caso Ecopetrol: ve la licitación y decide si licita) |
| Red CAMEP | `foros` | sí/no | activo | foro |
| EmpleaMEP (hojas de vida) | `bolsa_empleo` | sí/no | **próximamente** | `is_enabled=false` |
| Reseñas | `resenas` | sí/no | **próximamente** | `is_enabled=false` |
| Soporte técnico | `soporte_prioritario` | sí/no | **próximamente** | `is_enabled=false` |
| Ranking de mi perfil | `ranking` | sí/no | **próximamente** | `is_enabled=false`; posición ganada por hábito de pago + reseñas + actividad + vistas |

- **Se descarta `directorio_prioritario`**: era para diferenciar planes gratis, pero **todos los planes son
  pagos**. Se retira del catálogo y del display, y el **directorio público deja de ordenar por prioridad**
  (`PublicCompanyController` / `web.php`: se quita el `orderByRaw('plans.has_priority_directory DESC, …')`
  y queda un orden neutro, p. ej. `created_at DESC`). La columna `has_priority_directory` se conserva en
  esquema (compatibilidad) pero ya no gobierna nada.
- **La prioridad se reemplaza por un futuro módulo `ranking`** (queda registrado como *Próximamente* aquí,
  sin lógica): la posición en el directorio se **gana** según **hábito de pago · reseñas · actividad en la
  cuenta · vistas**. Depende de Reseñas y de métricas de actividad que aún no existen, así que su
  implementación (y el nuevo orden del directorio por ranking) se aborda **al final del módulo**, no en 0016.
- **`licitaciones` → `bienes_servicios`**: es un **rename de clave** que preserva las filas del pivote
  (`plan_feature`) y la config por plan. La compuerta pasa a gobernar el **acceso al módulo Bienes y
  Servicios** completo (ver + licitar + descargar pliegos), no solo la descarga. Hay que actualizar el/los
  `feature:licitaciones` en rutas/controladores a `feature:bienes_servicios` y el mapa `LEGACY_COLUMN` de
  `Feature`.
- **Fuera del display de módulos:** `pago_en_linea` (es método de pago, va a Integraciones — 0019) y
  `vitrina` (queda oculta/off).
- El catálogo se ajusta en `FeatureSeeder` (idempotente, no pisa lo que un admin ya configuró) + una
  migración de datos para el rename de clave. Las **columnas legacy** de `plans` se conservan como capa de
  compatibilidad (ADR-0002) pero **dejan de mostrarse** como beneficios: el display lee del catálogo.
- `PlanController@index` pasa a **cargar `features`** y enviar los módulos resueltos por plan (igual que ya
  hace `@edit`), para que `Index` muestre lo real.

### 6.2 Modelo de alta unificado (cuota inicial)

Una sola regla, para **todos** los planes:

| Momento | Qué se cobra | Vigencia | Cuota inicial |
|---|---|---|---|
| **Primera vez** (`status = verified`) | **cuota inicial** (`signup_fee`) | 1 mes → día 19 | sí |
| **Mes 2 en adelante** | mensualidad del ciclo | +1 ciclo → día 19 | no |
| **Renovación / cambio de plan** (ya `approved`) | precio del ciclo | +1 ciclo → día 19 | no |
| **Reactivación** (vencido que vuelve) | precio del ciclo | +1 ciclo → día 19 | **no** (reingreso no re-cobra) |

- Se **retira el modelo doble**: desaparece el camino "inscripción + primera mensualidad juntas". El primer
  pago es **siempre** solo la cuota inicial (si `signup_fee > 0`). La bandera `signup_only_first_period` deja
  de gobernar el flujo (queda forzada a "siempre" y se retira del formulario; la columna se conserva para no
  romper esquema hasta un ADR de limpieza).
- **Ciclo de renovación en el alta:** el alta cobra solo la cuota inicial; el `billing_cycle` recurrente
  arranca **siempre en mensual** (decidido) y se puede cambiar luego desde Gestión del Plan (0017). El alta
  **no** ofrece elegir ciclo — es un único botón "Pagar cuota inicial".
- El mes 2 lo emite el cron mensual existente (`invoices:generate-monthly`, día 15) sin cambios: tras el
  alta, `plan_expires_at` cae en el día 19 y el cron lo recoge.
- **Sin cuota inicial (`signup_fee = 0`):** el primer pago es directamente la primera mensualidad del ciclo
  elegido (caso borde defensivo).

### 6.3 Qué debe seguir igual

- La aritmética de vigencia (`SubscriptionService`, `max(hoy, vencimiento)`, día 19) **no se toca**.
- Los tres rieles de pago (Bold/transferencia/efectivo) y `PaymentService` **no se tocan** aquí.
- El bloqueo escalonado (`CheckSubscription`) y "el vencido siempre puede pagar" **no cambian**.

### 6.4 Casos límite con pruebas

- Primera vez con `signup_fee>0` → **una** factura = cuota inicial, ciclo `signup`, 1 mes de vigencia; el
  segundo pago (cron) es mensualidad.
- Primera vez con `signup_fee=0` → factura = primera mensualidad del ciclo.
- Renovación estando `approved` → factura = ciclo, **sin** cuota inicial.
- Reactivación de un vencido → factura = ciclo, **sin** cuota inicial.
- `PlanController@index` entrega módulos del **catálogo** (no columnas legacy); un módulo `is_enabled=false`
  aparece como *Próximamente* y **no** es accesible (compuerta global).
- Borrado de plan con asociados → bloqueado (server) + botón oculto (UI).
- **Rename `licitaciones`→`bienes_servicios`**: un plan que hoy incluye "descarga de pliegos" conserva el
  acceso a Bienes y Servicios tras la migración (pivote preservado); `feature:bienes_servicios` responde
  200/302/404 según las tres compuertas.
- **`directorio_prioritario` retirado**: el directorio público responde y ordena por el criterio neutro
  (sin `has_priority_directory`); ningún asociado pierde visibilidad, solo cambia el orden.
- **Alta siempre mensual**: tras pagar la cuota inicial, `billing_cycle = 'monthly'` y el cron del mes 2
  emite mensualidad.

## 7. Plan de actualización (cortes)

- **16-A · Backend (catálogo + modelo de alta). ✅** Migración `2026_09_14_120000_reconcile_membership_feature_catalog` (rename `licitaciones`→`bienes_servicios` preservando pivote, retiro de `directorio_prioritario`, alta de `ranking`, *Próximamente* para EmpleaMEP/Reseñas/Soporte). `FeatureSeeder` reconciliado (con `enabled_default` para los *Próximamente*) y `Feature::LEGACY_COLUMN` actualizado. Alta unificada en `CheckoutController@store` (cuota inicial la primera vez, `billing_cycle='monthly'`, sin selector de ciclo) + `BillingService` ("Cuota inicial"). Directorio en orden neutro (`web.php` + `PublicCompanyController` ×2). `PlanController@index` expone `modules` por plan. **Pest** `MembershipSignupTest` (4) + `PlanCatalogTest` (2). Gates: Pint ✅ · Larastan `[OK]` ✅ · Pest **131/131** ✅. (La UI vieja de Planes sigue mostrando banderas muertas hasta 16-B.)
- **16-A (detalle original).** Ajustar `FeatureSeeder` al catálogo real (§6.1) y marcar
  *próximamente* (`is_enabled=false`) EmpleaMEP/Reseñas/Soporte; **rename `licitaciones`→`bienes_servicios`**
  (migración de datos que preserva el pivote; actualizar `feature:*` en rutas/controladores y `LEGACY_COLUMN`
  de `Feature`); **retirar `directorio_prioritario`** del catálogo y quitar el orden por prioridad en
  `PublicCompanyController`/`web.php`. Unificar el alta en `CheckoutController@store` + `BillingService`
  (`issueSignupInvoice` siempre cuota-inicial la primera vez, `billing_cycle='monthly'`; retirar la suma
  inscripción+mensualidad y el gobierno por `signup_only_first_period`). `PlanController@index` carga
  `features` y resuelve módulos por plan. **Pest**: nuevo `MembershipSignupTest` (los 4 casos de §6.4) +
  `PlanCatalogTest` (index expone catálogo, no columnas muertas; `bienes_servicios` accesible;
  directorio sin prioridad). Gates: Pint · Larastan · Pest.
- **16-B · Admin Membresías (`Plans/Index` + `Plans/Form`) a `base/`. ✅** `Index` reconstruido a `base/` (Card/Badge/Dialog): tarjetas con **módulos reales** del catálogo (límites y *Pronto* para los `coming_soon`), **cuota inicial** + precios, prórroga y nº de asociadas; borrado con `Dialog` y botón **oculto si la membresía tiene asociados** (`associates_count`, `withCount`). `Form` reconstruido a `base/` (FormField/Input/Switch/Textarea/MoneyField): edita precios, cuota inicial y **módulos por catálogo** (con badge *Próximamente* para `is_enabled=false`); se **retiró** el toggle "solo inscripción primer mes" y los campos legacy; `pago_en_linea` y `vitrina` quedan fuera del editor de módulos. `PlanController` valida solo datos base (helper `validatePlan`); las columnas legacy y los límites los escribe `syncFeatures` desde el catálogo. **Vitest** `AdminPlans.test.tsx` (3). Gates: preflight **7/7 en verde**. (Aviso: `npm run lint` hace `--write` sobre todo el árbol; usar `npx eslint`/`prettier --check` escopado.)
- **16-B (detalle original).** `Admin/Plans/Index.tsx` reconstruido con `Card`/
  `Badge`/`Dialog` mostrando **módulos reales** (con *Próximamente*), precios y **cuota inicial**; borrado
  con `Dialog` y botón oculto si hay asociados. `Form` a `base/` (`Field`/`Input`/`Switch`/`Select`),
  edición de módulos del catálogo + cuota inicial; se retira el toggle "solo inscripción primer mes".
  **Vitest**: `AdminPlans.test.tsx`. Gates: types:check · ESLint · Prettier · Vitest.
- **16-C · Alta del asociado (`Billing/Checkout`) a `base/`. ✅** Reconstruido a `base/` (Card/Alert/Badge/Button): resumen del plan, bloque de **total a pagar hoy** ("Cuota inicial" la primera vez / "Mensualidad" en renovación), explicador de que la cuota inicial **exonera el mes 1**, cuentas bancarias y CTA "Continuar al pago". **Sin selector de ciclo** (el servidor decide el monto; el ciclo recurrente es mensual). **Vitest** `Checkout.test.tsx` (2). Gates: preflight **7/7 en verde**.
- **16-C (detalle original).** Refleja el flujo de **cuota inicial** (una
  sola factura la primera vez), CTA único "Pagar cuota inicial" que dice qué se cobra; **sin selector de
  ciclo** (recurrente siempre mensual). **Vitest**: `Checkout.test.tsx`. Gates: types:check · ESLint ·
  Prettier · Vitest.

**Gates a ejecutar** (proporcionales): **PHP** — Pint · Larastan · Pest (16-A) · **Frontend** — types:check ·
ESLint · Prettier · Vitest (16-B/16-C). Preflight completo antes de `#commit`.

## 8. Aprobación

- [x] Decisión: **cuota inicial estándar** que exonera el mes 1, para **todos** los planes.
- [x] Decisión: cuota inicial **solo la primera vez**; reactivación/reingreso **sin** cuota inicial.
- [x] Decisión: retirar del display los módulos muertos; mostrar el **catálogo real** con *Próximamente*.
- [x] Decisión: **Servicios propios** = módulo de **límite** (como galería).
- [x] Decisión: **Bienes y servicios** = módulo de **acceso sí/no** (rename `licitaciones`→`bienes_servicios`).
- [x] Decisión: **Anuncios** = módulo de acceso propio (convocatorias generales).
- [x] Decisión: **descartar `directorio_prioritario`** (todos los planes son pagos); el directorio deja de
      ordenar por prioridad. La prioridad se reemplaza por un futuro módulo **`ranking`** (hábito de pago ·
      reseñas · actividad · vistas), registrado como *Próximamente* y abordado al final del módulo.
- [x] Decisión: **alta siempre mensual** (sin selector de ciclo; se cambia luego en Gestión del Plan).
- [x] Plan revisado.
- [x] `#go` recibido → **16-A ✅ → 16-B ✅ → 16-C ✅**. Plan 0016 implementado (preflight 7/7 verde). Pendiente `#commit`.

## Roadmap del módulo (planes siguientes, no se ejecutan aquí)

- **0017 — Asociado · Gestión del Plan + Mis Facturas + Pago** (`Billing/Index`, `Invoices/Index`,
  `Invoices/Pay`, `Invoices/PayOnline` a `base/`; retirar banners de `payment_requests` del asociado).
- **0018 — Admin · Finanzas** (`Payments/Index`, `Invoices/Index`, `BankAccounts/*` a `base/`) +
  **reorganización del menú** (Membresías / Finanzas / Integraciones; retirar "Solicitudes (histórico)").
- **0019 — Integraciones (Bold) + limpieza legacy** (pantalla admin de Integraciones para configurar Bold;
  **borrado** de `payment_requests` y restos, una vez trasladado/validado el histórico).
- **0020 (final) — Ranking de perfil + orden del directorio** (implementar el módulo `ranking` por los 4
  factores — hábito de pago · reseñas · actividad · vistas — y reordenar el directorio público por él).
  Depende de que Reseñas y las métricas de actividad existan.
