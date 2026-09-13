# ADR-0004 · Plantillas de correo en React (react-email) compiladas a Blade

- **Estado:** Aceptada
- **Fecha:** 2026-09-13
- **Afecta a:** todas las plantillas de correo (`resources/views/emails/**`), los Mailables de
  `app/Mail/`, el nuevo dominio `resources/js/emails/`, `scripts/build-emails.ts`, tooling de build.

---

## Contexto

Las plantillas de correo eran **Blade** con HTML+CSS inline. Solo 4 de ~23 extendían un layout
compartido; las demás **copiaban** header, estilos y footer *verbatim*. Cambiar un dato del pie
obligaba a editar ~19 archivos. Se quiere autorar los correos en **React** (mejor composición,
componentes reutilizables de header/footer, previsualización), usando **`react-email`** — la
librería de **Resend**, que ya es nuestro proveedor de envío.

El problema de fondo: **PHP no renderiza React en tiempo de envío.** `react-email` corre en Node.
Hay que decidir *cuándo* y *cómo* se obtiene el HTML final que Resend envía, sin romper el runtime
actual (envío con `defer()`, sin worker de cola).

---

## Decisión

### 1. React para autoría, Blade para runtime (compilación en build)

Las plantillas se escriben en `resources/js/emails/**/*.tsx` y un script
(`npm run emails:build` → `scripts/build-emails.ts`, vía `tsx`) las **compila a vistas Blade** en
`resources/views/emails/**`. El runtime sigue **100 % PHP**: los Mailables no cambian, siguen
apuntando a la misma vista Blade con `Content(view: 'emails.<área>.<x>')`.

```
AUTORÍA   resources/js/emails/**.tsx     (React + @react-email/components)
            │  npm run emails:build
            ▼
GENERADO  resources/views/emails/**.blade.php   (HTML final + {{ $var }} / @foreach)
            ▼
RUNTIME   Mailable → Blade → Resend       (sin Node en el envío)
```

Las vistas generadas **se versionan** (llevan una cabecera `{{-- Generado… NO editar a mano --}}`) y
`emails:build` debe correr antes de commitear si se tocó una plantilla.

### 2. Convención de placeholders (helpers en `resources/js/emails/lib/blade.tsx`)

En JSX no se puede escribir `{{ $var }}` literal, y si se mete como texto React **escapa** los
caracteres especiales (`$user->name` → `$user-&gt;name`, que rompe Blade). Solución: cada helper
devuelve un **token alfanumérico** (que React no escapa) y registra su traducción; tras `render()`,
el build sustituye los tokens por el Blade real, **después** del escapado.

```tsx
{blade("$user->name")}                    → {{ $user->name }}
{blade("asset('images/logo.png')")}       → {{ asset('images/logo.png') }}   (URL absoluta en runtime)
{bladeRaw("$html")}                        → {!! $html !!}
{raw("@csrf")}                             → @csrf
<Blade foreach="$items as $item"> … </Blade>  → @foreach ($items as $item) … @endforeach
<Blade if="$x"> … </Blade>                 → @if ($x) … @endif
```

El build también limpia los artefactos de React (`<!--$-->`, `<!-- -->`).

### 3. Estilos inline con hex literal (no design-tokens)

El correo **no** usa Tailwind ni las CSS variables de `design.md`: los clientes de correo no las
soportan de forma fiable. Se usan estilos inline con **hex literal**, portando los valores de marca
(neutro `#151515`, etc.). Este es el único lugar del proyecto donde el color va hardcodeado a
propósito; el linter de reglas §7 no aplica a `resources/js/emails/`.

### 4. La ruta de la vista se declara con `export const view`

Cada página exporta `export const view = 'emails/auth/otp_code'` (el helper de placeholder ya ocupa
el nombre `blade`). El build mapea eso a `resources/views/emails/auth/otp_code.blade.php`.

---

## Opciones consideradas

**A. Render en runtime (Node por envío).** PHP invoca Node en cada envío pasando props JSON; React
puro, sin Blade. Se descarta: proceso Node vivo en cada correo, más latencia, frágil en Herd/Windows,
y complica la simplicidad de `defer()` sin worker.

**B. Seguir en Blade a mano.** Lo que había: duplicación del chrome en ~19 archivos, sin componentes.
Es el problema que se quiere resolver.

**C. Compilar a Blade en build (elegida).** React como capa de autoría, Blade como artefacto de
runtime. Mantiene el runtime PHP intacto y da los componentes/preview de react-email.

---

## Consecuencias

**A favor**
- Header/Footer/Layout como componentes React reutilizables; fin de la duplicación del chrome.
- Runtime sin cambios: Mailables y `defer()` igual; sin Node en el envío.
- Previsualización en navegador (`npm run emails:dev`) sin enviar correos.

**En contra**
- Hay un **paso de build**: las vistas Blade son generadas; editar el `.tsx`, no el `.blade.php`.
  Riesgo de olvidar `emails:build` (se mitiga con el gate del preflight y la cabecera del archivo).
- Las directivas Blade en cuerpos con listas/condiciones se expresan con `<Blade>`/`raw()`, algo
  menos natural que Blade puro.
- `react-email` arrastra dependencias dev con avisos de *deprecated* y de auditoría (solo dev, no
  llega a producción).
