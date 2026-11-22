# Plan de actualización — CTA de planes en afiliación, etiqueta de Perfil y menores del foro

- **Estado:** Implementado (gates verdes) — sin commit.
- **Fecha:** 2026-11-22
- **Alcance:** (A) etiqueta "Contraseña" en Eliminar Cuenta; (B) no ofrecer "Ver planes" en afiliación
  (pending); (C) menores del foro: pluralización del contador y fechas en `es-CO`.

> Ejecutado tras `*go`. El menor "menú verified" ya se resolvió en el 0030-0034 (pendiente de push).

---

## Cortes

### A — Etiqueta de Perfil
- [x] `DeleteUserForm.tsx`: la etiqueta (sr-only) del campo decía `Password`; ahora "Contraseña"
  (en el 0034 se tradujo el placeholder pero no esta etiqueta).

### B — "Ver planes" en afiliación
- [x] `AppSidebar/index.tsx`: el CTA "Ver planes" (`hasNoPlan`) ahora exige `!isBillingLocked`. En
  pending, facturación está bloqueada por el middleware, así que el CTA (enlace siempre navegable que
  volvía al Dashboard sin aviso) ya no aparece. El admitido-sin-plan (verified) sí lo ve. El menú ya
  mostraba "Gestión del Plan" con candado en esa etapa.

### C — Menores del foro
- [x] `TopicShow.tsx`: el contador pluraliza ("1 Respuesta" / "N Respuestas").
- [x] Fechas del foro (`TopicShow`, `CategoryShow`) con `toLocaleDateString('es-CO')`.

## Fuera de alcance (menores de 11, no frenan)

Toast "valorado" al quitar el voto (necesita señal del backend); flash del foro no visible;
paginación de `CategoryShow`; `is_pinned` sin uso; reporte con `window.prompt`; nombre persona vs
empresa en el correo de respuesta; resumen que termina en "..."; migas; foro abierto sin plan (a
propósito).

## Aprobación

- [x] Plan revisado · `*go` recibido → implementado
