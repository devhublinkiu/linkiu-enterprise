# Plan de actualización — Panel en afiliación: CTAs que no llevan a ningún lado

- **Estado:** Implementado (gates verdes) — sin commit.
- **Fecha:** 2026-11-22
- **Alcance:** menores del Dashboard (01) en afiliación: (1) Facturas no ofrece ir a facturación cuando
  no es alcanzable; (3) las secciones cerradas del perfil no enlazan para el admitido sin pagar.

> Ejecutado tras `*go`. Se reusan las reglas ya existentes (canChoosePlan / isAfiliacionLocked).

---

## Cortes

### 1 — InvoicesCard respeta la alcanzabilidad de facturación
- [x] `InvoicesCard` recibe `canChoosePlan`; si está bloqueada (sin plan activo) pero facturación no es
  alcanzable (pending), muestra solo el texto, sin el botón muerto "Ir a Gestión del Plan".
  `Dashboard.tsx` le pasa `canChoosePlan` (mismo valor que la membresía, corte 0038).

### 3 — ProfileCard bloquea las secciones cerradas (verified)
- [x] `ProfileCard` recibe `afiliacionLocked` (= `status==='verified'`): Caracterización, Contactos,
  Documentación y Servicios se muestran bloqueadas (sin enlace, candado "Activa tu plan"); Información
  Básica sigue abierta. Igual que el menú lateral (`isAfiliacionLocked`). El servidor es la autoridad
  (`HandleAssociateOnboarding`).

## Pruebas

- `Dashboard.test.tsx`: pending no muestra "Ir a Gestión del Plan" en Facturas; verified deja
  Información Básica como enlace y Caracterización bloqueada.

## Aprobación

- [x] Plan revisado · `*go` recibido → implementado
