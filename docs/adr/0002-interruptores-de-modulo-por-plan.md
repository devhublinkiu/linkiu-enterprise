# ADR-0002 · Todo módulo se entrega con interruptor de plan

- **Estado:** Aceptada
- **Fecha:** 2026-08-06
- **Afecta a:** `plans`, todo módulo del área de asociados, presente y futuro

---

## Contexto

La tabla `plans` nació con seis banderas de funcionalidad. Al revisar el código de la rama
`production`, **solo dos se aplican realmente**:

| Bandera | ¿Controla algo? | Dónde |
|---|---|---|
| `has_priority_directory` | Sí | `PublicCompanyController` — orden del directorio |
| `can_download_tenders` | Sí | `Associate\AnnouncementController` — descarga de pliegos |
| `has_job_board` | **No** | solo se edita en el formulario del plan |
| `has_network` | **No** | solo se edita en el formulario del plan |
| `has_reviews` | **No** | solo se edita en el formulario del plan |
| `has_priority_support` | **No** | solo se edita en el formulario del plan |

Los límites `limit_services` y `limit_gallery` se muestran en la interfaz del asociado pero no se
verifican en el servidor.

Y hay módulos completos sin ningún control de plan: **Red CAMEP (foros)** y **Anuncios**. Cualquier
asociado con suscripción activa entra, sin importar qué plan pagó.

El patrón que se repite es claro: **el módulo se construye primero y el interruptor se piensa
después** — y casi siempre no llega. Con dos módulos nuevos en el horizonte (Vitrina Empresarial
y Pago en línea con Bold), conviene invertir el orden antes de que el problema crezca.

---

## Decisión

### 1. Regla

> Ningún módulo del área de asociados se da por terminado sin su interruptor de plan
> registrado en el catálogo y aplicado en el servidor.

«Aplicado en el servidor» significa en el controlador o el middleware. Ocultar un botón en el
frontend no cuenta como interruptor.

### 2. Catálogo en base de datos, no columnas

```
features                          plan_feature
────────────────────────          ─────────────────────
key          foros                plan_id
name         Red CAMEP            feature_id
description                       enabled      bool
type         boolean | limit      limit_value  int, nulo si es booleano
group        comunidad            
is_enabled   interruptor global   
sort         
```

Añadir un módulo nuevo es insertar una fila en `features`, no una migración sobre `plans`.

### 3. Tres compuertas en serie

Una petición pasa por tres preguntas distintas, y cada una falla distinto:

| # | Pregunta | Campo | Si es «no» |
|---|---|---|---|
| 1 | ¿El módulo está encendido en la plataforma? | `features.is_enabled` | 404 — no existe para nadie |
| 2 | ¿El plan del asociado lo incluye? | `plan_feature.enabled` | Pantalla de mejora de plan |
| 3 | ¿Está dentro del límite contratado? | `plan_feature.limit_value` | «Ya usaste 5 de 5» |

La primera compuerta es el **interruptor de plataforma**: permite subir un módulo a producción
apagado y encenderlo cuando esté listo, sin desplegar de nuevo.

### 4. Cómo se usa

```php
$plan->allows('foros');          // bool
$plan->limitFor('servicios');    // int|null  (null = sin límite)
```

```php
Route::middleware('feature:foros')->group(function () { ... });
```

Los interruptores del asociado se comparten a Inertia para que la interfaz oculte lo que está
apagado — pero eso es cortesía visual, no seguridad. La comprobación real vive siempre en el
servidor.

### 5. Catálogo inicial

| Clave | Módulo | Tipo | Estado hoy |
|---|---|---|---|
| `directorio_prioritario` | Posición destacada en el directorio | interruptor | se aplica |
| `licitaciones` | Descarga de pliegos en Bienes y Servicios | interruptor | se aplica |
| `servicios` | Publicar servicios propios | límite | solo en la interfaz |
| `galeria` | Imágenes de la empresa | límite | solo en la interfaz |
| `foros` | Red CAMEP | interruptor | sin control |
| `anuncios` | Convocatorias y anuncios | interruptor | sin control |
| `soporte_prioritario` | Atención prioritaria | interruptor | bandera muerta |
| `resenas` | Reseñas de empresas | interruptor | bandera muerta |
| `bolsa_empleo` | Bolsa de empleo | interruptor | bandera muerta |
| `vitrina` | Vitrina empresarial con subdominio | interruptor | módulo previsto |
| `pago_en_linea` | Pagar con Bold | interruptor | de ADR-0001 |

---

## Opciones consideradas

**A. Columna JSON `features` en `plans`.** Rápido y sin joins, pero no hay catálogo consultable,
no cabe el interruptor global, y responder «qué planes tienen X» exige recorrer filas.

**B. Seguir con columnas booleanas.** Tipado y simple, pero cada módulo futuro exige migración
más cambio en el formulario del admin. Es exactamente el camino que produjo las cuatro banderas
muertas de hoy.

Se elige el catálogo porque el problema real no es guardar un booleano: es que **añadir un módulo
sea barato**. Mientras cueste una migración, se seguirá posponiendo.

---

## Restricción: producción tiene datos

La migración es **aditiva y reversible**.

1. Se crean `features` y `plan_feature`. Nada más cambia.
2. Un seeder llena el catálogo y **copia el valor actual de las seis banderas y los dos límites**
   a cada plan existente. Ningún asociado gana ni pierde acceso el día del despliegue.
3. Los accesores del modelo `Plan` leen del pivote **con retroceso a la columna** si el módulo aún
   no está en el catálogo. El código que hoy consulta `$plan->has_priority_directory` sigue
   respondiendo igual.
4. Las seis columnas de `plans` **se quedan** como capa de compatibilidad. Se retirarán en un ADR
   posterior, cuando ninguna pantalla las consulte.
5. Los módulos se van conectando de uno en uno. Un módulo sin fila en `features` se comporta como
   siempre.

---

## Calendario de cortes

Este calendario aplica a todos los planes. **El día de corte es constante: 19.** Lo único que
varía por plan es `grace_days`.

### Por tipo de cobro

| Cobro | Se emite | Vence | Gracia | Qué extiende al pagarse |
|---|---|---|---|---|
| Inscripción | al elegir plan | 5 días desde la emisión | — | 1 mes desde el pago, anclado al 19 |
| Mensualidad | día 15 | día 19 | `plan.grace_days` | +1 mes → día 19 |
| Semestral | día 15 del mes de corte | día 19 | `plan.grace_days` | +6 meses → día 19 |
| Anual | día 15 del mes de corte | día 19 | `plan.grace_days` | +12 meses → día 19 |
| Reactivación | al entrar vencido a facturación | 5 días desde la emisión | — | +1 mes desde el pago → día 19 |

La extensión siempre parte de `max(hoy, plan_expires_at)` — ver [ADR-0001](0001-motor-de-cobro-unificado.md).

### Estados de la suscripción

| Estado | Desde | Hasta | Acceso | Perfil público |
|---|---|---|---|---|
| Al día | — | `plan_expires_at` | completo | visible |
| En gracia | día 19 | `+ grace_days` | completo, con aviso | visible |
| Vencida | fin de la gracia | hasta que pague | solo facturación y pago | oculto |

### Trabajos programados

| Comando | Cuándo | Qué hace |
|---|---|---|
| `invoices:generate-monthly` | día 15, 08:00 | Emite el cobro a quien deba (no solo a quien vence este mes) |
| `billing:send-reminders` | diario | Avisos del día 18, día 20, víspera del fin de gracia y corte |
| `subscription:check-expiration` | diario | Oculta el perfil de quien pasó la gracia |
| `payments:reconcile-bold` | cada hora | Revisa pagos Bold pendientes por si el webhook se perdió |

### Avisos automáticos

| Momento | Mensaje | Lleva enlace de pago |
|---|---|---|
| día 15 | Tu cuenta de cobro está lista | sí |
| día 18 | Vence mañana | sí |
| día 20 | Venció ayer — te quedan N días de gracia | sí |
| víspera del fin de gracia | Mañana se oculta tu perfil del directorio | sí |
| fin de gracia | Tu perfil se ocultó — así lo reactivas | sí |

---

## Estado de la implementación — ✅ HECHO (Corte 3, 2026-08-08)

- Tablas `features` + `plan_feature` (migración aditiva; `plans` intacta).
- `Feature` (catálogo con mapa a columnas históricas) y `Plan::allows()` / `Plan::limitFor()`
  con las tres compuertas y fallback a columna. La relación fija la tabla pivote
  explícitamente (`plan_feature`), porque el nombre por defecto de Laravel sería
  `feature_plan`.
- `FeatureSeeder` idempotente que **preserva el acceso actual**: foros y anuncios (sin
  control previo) se siembran encendidos para todos; el resto copia la columna histórica;
  vitrina apagada. Ejecutar con `php artisan db:seed --class=FeatureSeeder`.
- Middleware `feature:<clave>` (alias registrado), aplicado a foros (participar) y anuncios.
  Módulo apagado globalmente → 404; plan que no lo incluye → redirige a facturación.
- Límites de servicios y galería migrados a `limitFor()`.
- Los módulos del plan del asociado se comparten a Inertia (`plan_features`) para la UI.
- El formulario de planes edita el catálogo; al guardar sincroniza las columnas históricas
  para que el fallback y un eventual rollback sigan siendo coherentes.
- Verificado: seeder preserva acceso e idempotencia, kill-switch global, las tres respuestas
  del middleware (200/302/404), el admin no pasa por la compuerta, fallback sin pivote, y el
  guardado del admin (pivote + columnas legacy).

### Pendiente

- Aplicar `feature:*` a más módulos si el negocio lo decide (hoy solo foros y anuncios, para
  no cambiar el acceso de nadie en el despliegue).
- Retirar las columnas booleanas de `plans` cuando ninguna pantalla dependa del fallback.

---

## Consecuencias

**A favor**

- Un módulo nuevo entra con interruptor desde el primer día, sin migración.
- Se puede desplegar apagado y encender sin desplegar de nuevo.
- Comercial puede armar y ajustar planes sin tocar código.
- Las cuatro banderas muertas de hoy pasan a significar algo.

**En contra**

- Una consulta más por petición para resolver los interruptores. Se resuelve cargando el plan
  con sus módulos una vez por petición y compartiéndolo.
- Durante la transición conviven dos fuentes (pivote y columna), y hay que recordar cuál manda.
- Un interruptor mal configurado apaga un módulo en producción. Mitiga: el seeder parte del
  estado actual y la pantalla de administración muestra qué planes se ven afectados antes de
  guardar.
