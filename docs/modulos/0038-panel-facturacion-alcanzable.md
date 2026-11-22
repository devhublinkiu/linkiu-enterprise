# Plan de actualización — Panel: facturación alcanzable de verdad

- **Estado:** Implementado (gates verdes) — sin commit.
- **Fecha:** 2026-11-22
- **Alcance:** menores del Dashboard/sidebar (01): (A) candado de facturación por estado del
  asociado; (B) membresía sin CTA muerto en pending/draft; (C) etiqueta correcta de módulos de plan.

> Ejecutado tras `*go`.

---

## ¿Cómo estaba?

`HandleInertiaRequests` **siempre** entrega `subscription` para un asociado (sin plan → `status:'none'`),
nunca `null`. Por eso el candado del sidebar `isBillingLocked = !isAdmin && !isAssociateVerified && !sub`
no se cumplía jamás: "Gestión del Plan" y "Ver planes" salían abiertos para una empresa en revisión
(`pending`), pero el middleware (`HandleAssociateOnboarding`) rebota facturación al Dashboard, así que
el clic no hacía nada. Además, "Bienes y Servicios" decía "No incluido" aunque el plan sí lo trajera.

## ¿Qué se hizo?

Derivar la alcanzabilidad de facturación del **estado del asociado** (la misma regla del middleware) y
corregir la etiqueta de los módulos de plan.

## ¿Qué se espera?

Una empresa en revisión no ve CTAs de plan que no llevan a ningún lado; al ser admitida (verified) sí.
"No incluido" aparece solo cuando el plan excluye el módulo.

---

## Cortes

### A — Candado de facturación por estado
- [x] `AppSidebar/index.tsx`: `isBillingLocked` = no alcanzable, donde alcanzable es
  `verified` / `active` / `approved` (regla del middleware). `sub` ya no se usa como proxy. Esto
  arregla el candado de "Gestión del Plan" y, por el gate `!isBillingLocked`, oculta "Ver planes" del
  pie en pending.

### B — Membresía sin CTA muerto
- [x] `MembershipCard` recibe `canChoosePlan`; sin plan y no alcanzable → texto informativo sin botón.
  `Dashboard.tsx` lo calcula de `auth.associate.status`.

### C — Etiqueta de módulos de plan
- [x] `QuickAccessCard`: "No incluido" solo si `planFeatures[feature] === false`; si el bloqueo es por
  falta de suscripción activa → "Requiere plan".

## Pruebas

- `Dashboard.test.tsx`: pending no ofrece "Ver planes" y muestra el aviso; Bienes y Servicios dentro
  del plan sin sub activa dice "Requiere plan"; fuera del plan dice "No incluido".

## Aprobación

- [x] Plan revisado · `*go` recibido → implementado
