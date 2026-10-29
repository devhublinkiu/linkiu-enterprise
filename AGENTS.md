# AGENTS.md — CAMEPG

> Reglas de obligado cumplimiento para agentes de IA (Claude Code, Cursor, Codex…) y personas que
> trabajan en CAMEPG: órdenes por prefijo, reglas de seguridad, documentación viva y gates antes de
> subir. **Las reglas de este archivo, de [`CLAUDE.md`](CLAUDE.md) (puntero) y de
> [`design.md`](design.md) (sistema visual) se respetan al 100%.**
>
> **Cómo se conecta:** `CLAUDE.md` contiene una sola línea (`@AGENTS.md`). Claude Code lee
> `CLAUDE.md`; Cursor, Codex y Copilot leen `AGENTS.md` directo. Una sola fuente, sin duplicar.
>
> Este archivo es un **puntero**: la verdad detallada vive en [`/docs`](docs/). Lo que se repite se
> escribe como regla en `/docs`, no se queda en la cabeza de nadie.

---

## Pre-flight (OBLIGATORIO antes de cualquier tarea)

Antes de actuar, el agente DEBE:

1. Leer este archivo, [`docs/arquitectura.md`](docs/arquitectura.md) y
   [`docs/convenciones.md`](docs/convenciones.md); además [`design.md`](design.md) si toca
   pantallas, [`docs/seguridad.md`](docs/seguridad.md) si toca datos, cuentas o pagos, y los
   [`docs/adr/`](docs/adr/) relacionados.
2. Verificar que la tarea NO contradice ningún ADR vigente. Si lo hace, proponer un ADR nuevo
   (`*adr`) y esperar aprobación.
3. Respetar el protocolo de prefijos (abajo).
4. Al responder a un `*go`, abrir con:
   `✓ Cumplimiento: AGENTS.md · arquitectura · convenciones[· diseño][· seguridad] · ADR(s) N — sin contradicciones. Ejecuto el plan aprobado.`
5. Si algo no está cubierto por la documentación, decirlo y preguntar, en vez de asumir.

---

## Forma de trabajo: por módulos o secciones

El trabajo se realiza **por módulos o secciones**. Antes de intervenir una sección hay que entender
su funcionamiento actual, revisar su flujo y validar que coincida con el comportamiento esperado,
partiendo siempre de la documentación base (este archivo, `CLAUDE.md`, `design.md`, `docs/`).

Cada sección se trabaja en este orden:

1. Componentes y consistencia visual.
2. Documentación requerida.
3. Flujo actual del módulo.
4. Revisión de accesibilidad.
5. Revisión de seguridad.
6. Revisión funcional.
7. Plan de actualización (`*plan`).
8. Implementación **solo después de `*go`**.

Cada módulo o sección tiene su propio plan en [`docs/modulos/`](docs/modulos/) (plantilla y reglas
ahí). Todo plan incluye, como mínimo y en este orden: **Componentes → Documentación → Flujo actual**.

---

## Protocolo de trabajo: prefijos de mensaje

Cada mensaje lleva un prefijo que dice qué puede hacer el agente. **Sin prefijo = pregunta o debate:
se responde sin tocar código ni git.** Un prefijo mal escrito (`#go`, `go` suelto) no es una orden:
el agente lo dice y no ejecuta. En la documentación los prefijos van entre backticks (`` `*go` ``).

| Prefijo | Qué hace | ¿Código? | ¿Git? |
|---|---|:-:|:-:|
| `*debate` | Debatir enfoques y trade-offs. Un tema a la vez. | No | No |
| `*question` | Pregunta puntual, respuesta directa. | No | No |
| `*investigacion` | Investiga (seguridad, rendimiento, mercado…) y recomienda. | No | No |
| `*plan` | Plan detallado. Obligatorio antes de un `*go` que no sea trivial. | No | No |
| `*go` | Ejecuta **únicamente** el plan aprobado. | Sí | No |
| `*review` | Audita código existente y reporta hallazgos. No modifica. | No | No |
| `*error` | Bug con descripción y ruta. Diagnostica y propone; no toca código sin `*go`. | No | No |
| `*commit` | Gates del cambio + commit **LOCAL** (Conventional Commits). Prohibido push. | Sí | Local |
| `*push` | Gates completos + sube los commits locales pendientes al remoto **`origin`**. | Sí, si aplica | Sí (`origin`) |
| `*rollback` | Revierte el último cambio con `git revert`. Indica pasos y confirma antes. | No | Sí |
| `*adr` | Crea o enmienda un ADR en `docs/adr/`. | Solo docs | No |

**Este proyecto usa:** una sola rama (`production`) · CI: no · despliegue: manual (ver
[`docs/despliegue.md`](docs/despliegue.md)).

> Por ser una sola rama sin CI, **no existen** `*promote`, `*checks` ni `*not-checks`.

**Flujo típico:** `*debate` → `*plan` → `*go` → `*commit` (uno o varios) → `*push`.

**Reglas del protocolo:**
- Una consulta no es una aprobación. Si el agente pausa un `*go` para preguntar, un "ok" sin prefijo
  es opinión: no sigue hasta un `*go` nuevo.
- Problema no previsto o decisión que el plan no fija → el agente **para y pregunta**. Nunca decide
  solo y avisa después.
- Lo confirmado va literal. Una mejora propia del agente se pregunta, no se mete. Cuando exista una
  decisión técnica razonable que no cambie el comportamiento esperado, se puede recomendar la mejor
  alternativa explicando el criterio.

---

## Reglas de oro de seguridad (no negociables)

- **Sin `*go` no se toca código. Sin `*commit` o `*push` no se opera git.**
- **Una sola rama (`production`):** `*push` sube directo a `origin/production`, así que los gates
  completos en verde son la única barrera: sin gates en verde no hay push, sin excepción. Nunca
  `--force`, ni reescribir la historia ya subida.
- **Nunca se borra ni se resetea la base de datos, en ningún entorno (incluido local).** Prohibido
  `migrate:fresh`, `db:wipe`, `DROP`/`TRUNCATE` masivo y equivalentes. Un cambio de esquema es
  siempre una migración **aditiva** nueva. Si un reset fuera inevitable, el agente pausa y lo corre
  el usuario.
- **Borrar un dato puntual** (un registro, un archivo del usuario) → preguntar antes, siempre.
- **Archivos que sobran → `temporal/`** (en `.gitignore`), con su ruta original. El agente comprueba
  que nada los usa, los mueve, corre pruebas sin ellos y avisa. **El usuario los borra.**
- **Un script nunca escribe a ciegas:** toca solo lo de la tarea, comprueba que encontró lo que iba
  a cambiar y que el resultado no quedó vacío, aborta sin escribir si algo falla, y revisa
  `git diff --stat` después. Por defecto se edita con reemplazo exacto (Edit); un script solo para
  muchos cambios, escrito como archivo (no heredoc).
- **Nunca se leen ni se suben secretos** (`.env`, llaves). En commits jamás van `.env*`, carpetas de
  herramientas ni archivos generados.
- **Nada en producción:** el agente no propone comandos, SQL ni pruebas sobre producción. Todo se
  prueba en local. El webhook de Bold se autentica por firma y está fuera de CSRF.

---

## Git y entregas

- **Rama única:** `production` (atípico; cuidado con commits directos). `*push` sube ahí, a `origin`,
  después de los gates completos. No hay staging ni `*promote`. El despliegue **no** es automático al
  subir: es un checklist manual ([`docs/despliegue.md`](docs/despliegue.md)).
- **Commits:** Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`…).
  Rutas explícitas, nunca `git add .` si hay archivos ajenos.
- **Al terminar un `*commit`:** el agente informa hash, mensaje, archivos incluidos y
  `git status --short`.
- **Push lo decide el usuario:** el agente informa qué hay en cola, no sugiere cuándo subir.

---

## Gates de calidad (proporcionales al cambio)

**PHP** (cuando aplique): Pint · Larastan · Pest.
**Frontend** (cuando aplique): `types:check` · ESLint · Prettier · Vitest.

Un solo comando los orquesta, proporcional al cambio (ver
[`docs/modulos/0002-preflight.md`](docs/modulos/0002-preflight.md)):

- `npm run preflight` — carriles con cambios vs HEAD (lo que corre el agente en `*commit`).
- `npm run preflight:push` — incluye commits sin subir; carril completo (lo que corre en `*push`).
- `npm run preflight:all` — todo.

> ⚠️ **Correr el preflight (y cualquier `php`/`composer`) desde PowerShell.** PHP lo sirve Laravel
> Herd y solo está en el PATH de PowerShell; desde Git Bash los gates PHP fallan por
> *command not found* y dan "rojo" falso.

Los gates de PRUEBA/ANÁLISIS corren **completos**; los de FORMATO/LINT solo sobre archivos cambiados.
Larastan trae `phpstan-baseline.neon` con hallazgos legacy congelados: el gate exige **cero
hallazgos nuevos**. Para `*push` todos los gates del alcance deben quedar **en verde** antes de subir.
Hook `pre-push` opcional en `.githooks/` (no instalado; `git config core.hooksPath .githooks`).

---

## Cómo se planea

Todo `*plan` abre con un resumen en lenguaje llano:
- **¿Cómo está?** Qué pasa hoy, en palabras del usuario.
- **¿Qué se va a hacer?** En una o dos frases.
- **¿Qué se espera?** Cómo se nota que salió bien.

Después, **cortes** pequeños y numerados, cada uno con su lista (`- [ ]`) y sus pruebas. Al cerrar
todos los cortes, el agente avisa que toca `*commit`.

- **Boceto antes de construir:** todo lo que tenga pantalla lleva primero un boceto navegable
  (celular y computador), junto con las preguntas numeradas, en el mismo mensaje. Las vueltas de una
  misma propuesta van sobre el mismo boceto.
- **Debate de a un tema:** nada de formularios con cinco decisiones juntas.
- **Antes de planear una verificación,** preguntar si ya se probó (la doc puede estar atrasada).
- **En vueltas de pantalla,** no correr todas las pruebas hasta que el usuario revise; los gates van
  en el `*commit`.

---

## Reglas de criterio (obligatorias para todo agente)

- **Veredicto primero, sin complacencia:** "no veo correcto X, lo mejor es Y porque Z". Nunca validar
  por validar. Decir de frente cuando algo choca con seguridad, un ADR o la accesibilidad.
- **Reportar con la verdad:** si una prueba falla, se dice con su salida; si algo se saltó, se dice;
  si algo se verificó, se afirma sin rodeos.
- **Documentar lo repetible:** si un patrón aplica a más de un caso, se escribe como regla en
  `/docs` en el mismo corte. **No se crea documentación innecesaria**: solo lo que aporte valor real.
- **Un paso a la vez** cuando el usuario tiene que ejecutar algo: un paso por mensaje y esperar.
- **Idioma:** español en todo lo que ve el usuario, también los avisos cortos.

---

## Qué es CAMEPG (30 segundos)

Plataforma B2B (Laravel 12 + Inertia/React/TS) para las empresas asociadas de CAMEP (minería e
hidrocarburos, Colombia). El asociado llena su perfil por secciones, un admin lo revisa, y si se
aprueba la empresa sale en el directorio público. Encima van membresía/cobro, foros (Red CAMEP),
bienes y servicios, convocatorias/licitaciones y blog. Detalle en
[`docs/arquitectura.md`](docs/arquitectura.md).

## Stack y decisiones base (ver [`docs/adr/`](docs/adr/))

- **0001 Motor de cobro unificado:** factura = documento, pago = transacción; una sola aritmética de
  vigencia en `SubscriptionService` (base `max(hoy, plan_expires_at)`, anclaje al día 19).
- **0002 Interruptores de módulo por plan:** todo módulo se entrega con compuerta de plan en
  servidor; un módulo nuevo es una fila en `features`, no una migración sobre `plans`.
- **0003 OTP por correo** (registro y recuperación).
- **0004 Plantillas de correo en React** (react-email) compiladas a Blade.
- **0005 (+ a–e) Ficha del asociado por secciones** (`section_reviews`, máquina de estados).
- **0006 Autorización del panel admin.**
- **0007 Ciclo de vida del asociado** (estado derivado, no guardado).
- **0008 Modelo de alta unificado** (cuota inicial que exonera el mes 1).
- **0009 Micrositio del asociado** (modelo de datos y ruteo por slug).
- **0010 Documentos de licitación privados** (disco privado, descarga gateada).

> Cada ADR nuevo deja aquí su línea. Una enmienda cambia la línea; nunca se contradice un ADR sin
> enmendarlo.

## Entornos

- **Local:** Windows + Laravel Herd (`php` en el PATH de PowerShell). Sitio `https://camepg.test/`.
  MySQL `camepg` en `127.0.0.1:3306`. Media en Minio/S3.
- **Staging:** no hay.
- **Producción:** despliegue manual por checklist ([`docs/despliegue.md`](docs/despliegue.md)); el
  webhook de Bold apunta a `https://camepg.org/webhooks/bold`.

---

## Reglas de pantallas y textos (detalle en [`design.md`](design.md))

- Solo **tokens** de diseño (colores, espacios, tipografía); nada de valores sueltos ni color crudo
  (`bg-slate-900`, `text-red-500`…).
- Componentes de `@/Components/base` (y shadcn en `@/Components/ui`, legacy en migración) **tal
  cual**; otra apariencia = variante existente, nunca estilo por instancia. **Crear un componente
  nuevo requiere autorización explícita.**
- **Archivos cortos:** una responsabilidad por archivo; si pasa de ~250 líneas o tiene 2+ secciones
  claras, se parte en `parts/` (`Index.tsx` + `parts/seccion-1.tsx`…).
- **Mobile-first** y accesible: botones reales, etiquetas, contraste y blancos táctiles.
- **Feedback:** toast (sonner) para confirmar, alerta en línea para errores/estados, diálogo para
  decisiones.
- **Textos:** español, lenguaje del usuario (tuteo), cortos y concretos; nada interno en pantalla
  (ADR, nombres de código, "corte"). Formatos Colombia: fechas `DD/MM/AAAA`, moneda **COP** sin
  decimales con separador de miles.
- **Errores:** validación → mensaje específico y accionable; sistema/bug → mensaje amable + código
  de referencia, el detalle técnico al log (crudo solo en local).
- **Reusar el patrón aprobado:** si algo ya se aprobó en otra pantalla, se copia tal cual.

## Reglas de seguridad (detalle en [`docs/seguridad.md`](docs/seguridad.md))

- **El servidor manda:** toda entrada se valida en servidor (FormRequest = fuente de verdad); el
  cliente valida solo para UX. Nunca confiar en IDs ni datos del cliente.
- **Autorización por cada acción** (middleware + Policies/Gates + queries acotadas al dueño), no solo
  ocultar botones. Un asociado nunca consulta datos de otro. La separación por carpetas
  (`Admin/`, `Associate/`, `Public/`) es claridad, no seguridad.
- Consultas parametrizadas (Eloquent); documentos de cobro y de licitación no son públicos.
- Secretos fuera de git; no registrar datos personales ni secretos en logs.

## Reglas de código

- Decisión de arquitectura nueva o que cambie una previa → ADR en `docs/adr/` (`*adr`) + su índice.
- No agregar dependencias sin justificarlas.
- Todo cambio con sus pruebas en el mismo corte. **El motor de cobro, los interruptores de plan y las
  section reviews llevan o actualizan test siempre.**
- **Módulo o pantalla nueva = completo en su mismo corte:** permisos, menú, interruptor de plan,
  ayuda/documentación de usuario, y su prueba de acceso denegado.

---

## Documentación ([`/docs`](docs/))

| Archivo | Para qué |
|---|---|
| [`arquitectura.md`](docs/arquitectura.md) | Cómo está armado el sistema y por qué. |
| [`convenciones.md`](docs/convenciones.md) | Reglas de código, git, nombres, pruebas, scripts, producto/idioma. |
| [`design.md`](design.md) | Sistema visual: tokens, tipografía, componentes, patrones de sección. |
| [`seguridad.md`](docs/seguridad.md) | Modelo de amenazas y reglas (auth, validación, secretos, pagos). |
| [`adr/NNNN-titulo.md`](docs/adr/) | Una decisión por archivo: contexto, decisión, consecuencias. |
| [`pendientes.md`](docs/pendientes.md) | **Único** lugar de pendientes, priorizados (P0 → P3), con `- [ ]`. |
| [`modulos/NNNN-modulo.md`](docs/modulos/) | Plan por cortes de cada módulo/sección, con casillas. |
| [`propuestas/`](docs/propuestas/) | Propuestas para debatir antes del ADR. |

Documentos de referencia extra: [`bold-integracion.md`](docs/bold-integracion.md),
[`despliegue.md`](docs/despliegue.md), [`ejemplos/`](docs/ejemplos/).

## Memoria del agente (si la herramienta la tiene)

Guardar solo lo que **no** se deduce del código ni de git:
- **Usuario:** quién es, cómo prefiere que le hablen y trabajen.
- **Correcciones:** "no hagas X porque Y", y también lo que sí funcionó.
- **Proyecto:** decisiones, fechas y restricciones vigentes (fechas absolutas).
- **Referencias:** dónde vive algo externo (tableros, enlaces).

Nunca guardar lo que ya está en el repo ni secretos. Una memoria vieja se verifica antes de usarla.
