# agents.md — Reglas del proyecto y forma de trabajo

Reglas de obligado cumplimiento para agentes y personas que trabajan en CAMEPG.
Complementa a [`CLAUDE.md`](CLAUDE.md) (contexto y arquitectura) y a [`design.md`](design.md)
(sistema visual). **Las reglas de estos tres archivos se respetan al 100%.**

---

## 1. Forma de trabajo

El trabajo se realiza **por módulos o secciones**. Antes de intervenir cualquier sección hay
que entender su funcionamiento actual, revisar su flujo y validar que coincida con el
comportamiento esperado. Antes de tocar cualquier módulo se parte de la **documentación base
del proyecto** (este archivo, `CLAUDE.md`, `design.md`, `docs/`).

Cada sección se trabaja en este orden:

1. Componentes y consistencia visual.
2. Documentación requerida.
3. Flujo actual del módulo.
4. Revisión de accesibilidad.
5. Revisión de seguridad.
6. Revisión funcional.
7. Plan de actualización.
8. Implementación **solo después de aprobación mediante `#go`**.

## 2. Planes de actualización

Cada módulo o sección tiene su propio plan documentado en
[`docs/actualizaciones/`](docs/actualizaciones/). Ver la plantilla y las reglas ahí.
Todo plan incluye, como mínimo y en este orden:

- **Componentes** (primer punto siempre) — qué componentes se necesitan y cuáles integrar,
  reemplazar o **reutilizar**. Los componentes provienen de **shadcn** (`@/Components/ui`). Una
  vez entregado un componente, se respeta su estructura: se permiten sus variantes existentes,
  pero **no** crear versiones innecesarias ni alterar su comportamiento. Ajustes visuales
  permitidos de forma general: **tipografía, colores y tokens/variables** definidos en
  `design.md`. Nada más.
  **Migración a tokens = incremental y sin duplicar:** los componentes existentes se migran al
  sistema de tokens a medida que se trabaja cada módulo; cuando se rehace un componente, se **borra
  el viejo y queda solo el nuevo** (no conviven dos versiones del mismo componente).
- **Documentación** (segundo punto siempre) — qué documentación debe existir o actualizarse
  (ADR, funcional, técnica, flujos, arquitectura, seguridad, accesibilidad, estados, casos
  límite, dependencias). **No se crea documentación innecesaria**: solo lo que aporte valor real
  al mantenimiento, la arquitectura o la comprensión del sistema.
- **Flujo actual** — descripción del comportamiento existente antes de proponer cambios, para
  validar que sea el esperado. Incluye: punto de entrada, acciones principales, estados,
  validaciones, errores, redirecciones, dependencias relevantes y resultado esperado.

## 3. Comandos de trabajo

| Comando | Descripción | Modifica código | Push | Requisito |
|---|---|---|---|---|
| `#debate` | Debate enfoques, decisiones y trade-offs. | No | No | — |
| `#question` | Responde una pregunta puntual de forma directa. | No | No | — |
| `#investigacion` | Investiga (seguridad, performance, accesibilidad, arquitectura…) y entrega recomendaciones. | No | No | — |
| `#plan` | Genera un plan de trabajo detallado. Obligatorio antes de `#go`. | No | No | — |
| `#go` | Autoriza intervenir el código y ejecutar **únicamente** el plan aprobado. | Sí | No | Plan previo |
| `#review` | Audita código existente y reporta hallazgos. | No | No | — |
| `#error` | Reporta un bug de alta prioridad (descripción, ruta/fragmento, diagnóstico, propuesta). | No | No | — |
| `#commit` | Revisa alcance, ejecuta gates proporcionales y crea un commit **LOCAL** (Conventional Commits). Autoriza `git add`/`git commit`. **Prohibido `git push`**. | Sí | No | Cambios aprobados |
| `#push` | Ejecuta gates completos del alcance. Si hay cambios aprobados sin commit, commitea (Conventional Commits) y sube los commits locales pendientes al remoto **`origin`**. | Sí, si aplica | Sí (`origin`) | — |

## 4. Restricciones de ejecución

- **No se modifica código** durante `#debate`, `#question`, `#investigacion`, `#plan`,
  `#review` ni `#error`.
- La modificación de código **solo** está autorizada por `#go`, y limitada al plan aprobado.
- `#commit` autoriza únicamente preparar y crear el commit local. **Nunca** `git push` en
  `#commit`.
- `#push` sube **solo** al remoto `origin`.
- Si una ambigüedad relevante afecta arquitectura, comportamiento, seguridad, diseño o alcance,
  **se pregunta antes de asumir**. No se inventan decisiones de producto. Cuando exista una
  decisión técnica razonable que no cambie el comportamiento esperado, se puede recomendar la
  mejor alternativa explicando el criterio.

## 5. Gates de calidad (proporcionales al cambio)

**PHP** (cuando aplique): Pint · Larastan · Pest.
**Frontend** (cuando aplique): `types:check` · ESLint · Prettier · Vitest.

Para `#push` se ejecutan **todos** los gates que exija el alcance y deben quedar **en verde**
antes de subir.

> Estado de herramientas: **todas operativas** (plan 0001). Larastan trae `phpstan-baseline.neon`
> con 222 hallazgos legacy congelados: el gate exige **cero hallazgos nuevos**.
>
> **Preflight (plan 0002):** un solo comando orquesta los gates de forma proporcional al cambio.
> - `npm run preflight` — carriles con cambios vs HEAD (lo que corre el agente en `#commit`).
> - `npm run preflight:push` — incluye commits sin subir; carril completo (lo que corre el agente en `#push`).
> - `npm run preflight:all` — todo.
>
> **El agente ejecuta el preflight automáticamente** dentro de `#commit` (`preflight`) y `#push`
> (`preflight:push`); solo procede si queda en verde. No hace falta teclearlo. El comando manual
> es la red de seguridad para revisar sin pasar por el agente. Hook `pre-push` opcional en
> `.githooks/` (no instalado; se activa con `git config core.hooksPath .githooks`). Los gates
> corren **completos**; los chequeos de reglas §7 (hardcode, 250 líneas) son **avisos** no bloqueantes.

## 6. Arquitectura y convenciones

- Reglas de arquitectura del dominio (aritmética única de vigencia, punto único de pagos,
  interruptores de plan en servidor, estados derivados, section reviews): ver
  [`CLAUDE.md`](CLAUDE.md) y los ADR en [`docs/adr/`](docs/adr/). No se duplican aquí.
- **Toda decisión de arquitectura** se escribe como ADR nuevo en `docs/adr/` y se actualiza su índice.
- **Commits:** Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`…).
- **Rama de trabajo:** `production` (atípico; cuidado con commits directos). Push solo a `origin`
  vía `#push`.
- **Testing:** todo cambio en el motor de cobro, interruptores de plan o section reviews debe
  llevar o actualizar pruebas.
- **Seguridad:** el webhook de Bold se autentica por firma y está fuera de CSRF; los documentos de
  cobro no son públicos. No exponer secretos ni datos sensibles en el repo.

## 7. Reglas de producto, contenido y código

### 7.1 Idioma y contenido

- Todo el **texto visible** (plataforma, sitio web, correos, errores, botones, placeholders,
  etiquetas) va en **español**. Nunca inglés de cara al usuario. El **código** (identificadores,
  nombres de función, rutas, claves de BD, mensajes de commit) sigue en inglés/convención Laravel.
- El proyecto es **100% colombiano y español-only**: se escribe el español **directo en el código**
  (sin sistema de traducción `lang/`).
- **Registro:** cercano y claro (**tuteo**), sin tecnicismos ni palabras extrañas. Referencia:
  *"Revisa que los datos estén bien antes de continuar."* Ni acartonado ni coloquial de más.
- **Formatos Colombia:** fechas `DD/MM/AAAA`, moneda **COP** sin decimales y con separador de miles.
- **Ejemplos y placeholders:** genéricos, realistas y neutros (p. ej. NIT `900.123.456-7`,
  `nombre@empresa.com`). Nada de datos reales, internos ni ejemplos que confundan.

### 7.2 Errores

- **Errores de validación:** mensaje en español, específico y accionable (qué campo y qué corregir).
- **Errores de sistema / bug:** al usuario, mensaje amable en español **+ un código de referencia**
  ("Ocurrió un error inesperado. Código: A7F3."). El **detalle técnico va al log**, nunca a la
  pantalla en producción (evita fuga de información). En entorno **local** sí se muestra crudo.

### 7.3 Validación

- **El servidor manda:** toda entrada se valida en servidor (FormRequest de Laravel = fuente de
  verdad). El cliente valida para UX, pero no sustituye al servidor. Mensajes en español (7.1).

### 7.4 Estructura de carpetas y aislamiento

- **Seguridad por diseño:** la separación por carpetas (`Admin/`, `Associate/`, `Public/`) es solo
  claridad; la que **impide la fuga** entre superadmin, asociados y otros es la **autorización en
  servidor**: middleware **+ Policies/Gates** + **queries siempre acotadas al dueño**. Un asociado
  nunca puede consultar datos de otro. Toda ruta con datos sensibles pasa por su Policy.
- **Nada de archivos gigantes:** una pantalla/módulo no vive en un solo archivo. Patrón:
  `Index.tsx` + `parts/` (`seccion-1.tsx`, `seccion-2.tsx`…). **Umbral: se parte cuando un archivo
  pasa de ~250 líneas o tiene 2+ secciones claras** (lo que ocurra primero). Así se corrigen bugs
  por sección sin tocar todo el módulo.

### 7.5 Componentes

- Se **respetan al 100%** los componentes de `@/Components/ui` (ver [`design.md`](design.md)).
  **Crear un componente nuevo requiere autorización explícita** y solo si es netamente necesario;
  primero se busca reutilizar o usar una variante existente.

## 8. Principio general

Antes de agregar algo nuevo, revisar si ya existe un componente, patrón, regla o solución
reutilizable. Prioridad:

1. **Reutilizar.**
2. **Estandarizar.**
3. **Documentar.**
4. **Mejorar.**
5. **Crear algo nuevo solo cuando sea necesario.**
