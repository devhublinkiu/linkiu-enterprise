# Plan de actualización — Guardrail UX de aprobación + "Todas" en Empresas · Corte 0024-B

- **Estado:** Implementado en local (gates verdes) — sin commit.
- **Fecha:** 2026-10-13
- **Decisión del usuario:** `#go` sobre el guardrail (aprobación admin + comprobante asociado) y, de
  paso, agregar la opción **"Todas"** en el sidebar de Empresas.
- **Contexto:** secuela del incidente de swoole (ver [[prod-runtime-swoole]] / plan 0024). Cuando el
  approve crasheaba, el pago se aplicaba pero la respuesta no volvía → el admin reintentaba a ciegas →
  pagos duplicados. El guardrail evita que un fallo de red invite a reintentos.

## 1. Guardrail — aprobación admin (`Admin/Payments/Index.tsx`)

El botón "Aprobar" usaba `router.patch` crudo, **sin estado de carga** (a diferencia de Rechazar, que
ya usa `useForm` + `disabled={processing}`). Cambios:

- Nuevo `const approval = useForm({})`.
- `confirmApprove` usa `approval.patch(...)`; cierra el diálogo **solo en `onSuccess`** (en error queda
  abierto para reintentar a conciencia).
- Botón "Aprobar y aplicar": `disabled={approval.processing}` + label "Aprobando…".
- Botón "Cancelar" y `onOpenChange` también respetan `approval.processing` (no se cierra a mitad del
  envío).

## 2. Comprobante del asociado (`Associate/Invoices/Pay.tsx`)

**Ya estaba protegido**: `useForm` con `disabled={processing || !data.proof}` y label "Enviando…"
(líneas 457-466). No requirió cambios. Se verificó el handler `submitProof`.

## 3. Opción "Todas" en el sidebar de Empresas

El backend ya soportaba "ver todo" (sin filtro). Cambios:

- **`HandleInertiaRequests`**: `associate_counts` ahora incluye `'total' => Associate::count()`.
- **`AppSidebar/index.tsx`** y **`nav-items.ts`**: tipos de `counts` extendidos con `total`; nuevo ítem
  **"Todas"** (primero en la lista) → `route('admin.associates.index', { estado: 'todas' })` con
  `count: counts.total`.
- Se usa `estado=todas` (no estado vacío) para que el resaltado del menú sea **exclusivo** (match
  exacto de query); el controlador lo resuelve en `filterByEstado` vía `default => $query` (= todas).
- **`Admin/Associates/Index.tsx`**: el `<Select>` de estado tolera `'todas'` → muestra "Todos los
  estados" al llegar por el sidebar.
- **`AppLayout.tsx`**: ajustado el `counts` dummy de las migas para incluir `total: 0`.

## 4. Gates

- **Pint** (PHP): pass.
- **tsc --noEmit**: 0 errores en todo el proyecto.
- **ESLint**: 0 problemas en los archivos tocados.

## 5. Fuera de alcance

El `total` del badge cuenta **todos** los asociados (`Associate::count()`), que puede no coincidir con
la suma de Activas+Pendientes+Inactivas (hay estados intermedios como `verified`/`draft`). Es el
comportamiento correcto para "Todas"; no se tocaron las otras cuentas.
