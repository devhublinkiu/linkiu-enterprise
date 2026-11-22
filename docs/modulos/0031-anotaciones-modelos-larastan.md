# Plan de actualización — Anotar relaciones de modelos para encoger el baseline de Larastan

- **Estado:** Implementado (gates verdes) — sin commit.
- **Fecha:** 2026-11-22
- **Alcance:** Tipar las relaciones Eloquent (tipo de retorno + `@property-read`) de los modelos de
  mayor palanca para que Larastan las resuelva, y **regenerar el baseline** (268 → 210, −58). Solo
  tipos: **no cambia comportamiento en runtime**.
  **NO entra:** bloques `@property` de columnas por modelo (ide-helper), ni tipar el pivot de
  `belongsToMany` (limitación conocida de Larastan) — se dejan como legacy en el baseline.

> Ejecutado tras `*go` (opción 3 de la deuda). Alcance acotado a 3 modelos para evitar la cascada:
> tipar una relación vuelve concreto el tipo del vecino y expone sus columnas sin anotar.

---

## Contexto

El baseline crecía en cada cambio PHP porque las relaciones de los modelos no tenían **tipo de
retorno**, así que Larastan no las reconocía (`Relation 'X' is not found`) y marcaba cada
`$model->relacion`/`$model->propiedad` en los controladores. La causa está en los modelos; los
hallazgos se reportaban en los sitios de uso.

## Qué se hizo

- **`Associate`**: tipo de retorno en las 9 relaciones (`contacts`, `references`, `services`,
  `projects`, `certifications`, `teamMembers`, `clients`, `users`, `plan`) + `@property-read` de cada
  una.
- **`Service`**: tipo de retorno en `category`/`associates` + `@property-read ServiceCategory`.
- **`AssociateProject`**: tipo de retorno en `associate`/`images` + `@property-read` de `images`.
- **`phpstan-baseline.neon`** regenerado: **268 → 210** hallazgos congelados.

## Residual (legacy aceptable, re-congelado)

Todos benignos (no son bugs): pivot de `belongsToMany` (`Service::$pivot`,
`Pivot::$cover_path`), colecciones `Collection<Model>` de consultas con closures (columnas sobre
`Model` genérico), y un par de `?->` ahora innecesarios. Cerrarlos requiere bloques `@property` de
columnas y/o un pivot tipado — fuera de este corte.

## Cómo seguir (si se quiere más reducción)

Anotar más modelos (Payment, Invoice, Plan, Conversation, Message…) con el mismo patrón, y para
cerrar las columnas, generar bloques `@property` (p. ej. `barryvdh/laravel-ide-helper` como
dependencia de dev). Cada modelo extra da rendimientos decrecientes y expone su propia capa de
vecinos.

## Verificación

- `npm run preflight` verde (Pint · Larastan · Pest). Sin cambios de runtime: las 245 pruebas pasan.

## Aprobación

- [x] `*go` recibido → implementado
