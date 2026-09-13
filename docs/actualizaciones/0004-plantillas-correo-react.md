# Plan de actualización — 0004 · Plantillas de correo en React (react-email)

- **Estado:** Borrador (a la espera de `#go`)
- **Fecha:** 2026-09-13
- **Alcance:** Migrar las plantillas de correo de **Blade a React** con la librería **`react-email`**
  (la de Resend, nuestro proveedor). Se crean **Header, Footer y Layout** como componentes React de
  correo (en `resources/js/emails/`, **NO** en `base/`), se monta el pipeline de compilación, y se
  migran los cuerpos por área en cortes sucesivos. **No entra:** la parte de **infra de
  entregabilidad** (mover el envío a `camepg.org`, endurecer DMARC, calentar dominio) — eso es una
  sección aparte de configuración DNS/Resend (ver §10). Sí entra el arreglo de entregabilidad **de
  código** (texto plano, `List-Unsubscribe`, `Reply-To`) porque toca los Mailables.

> Se trabaja por **cortes** (4A, 4B, …); cada corte se implementa con su propio `#go`. Los
> componentes React de correo se crean **desde cero**. Las plantillas Blade viejas **no se borran**
> hasta que su equivalente React esté migrado y verificado (§7, cierre).

---

## 1. Componentes

Estos son componentes **React de correo**, distintos de los de UI. **Viven en
`resources/js/emails/`**, no en `@/Components/base/` (petición explícita: el universo de correo es
su propio dominio y usa `@react-email/components`, no Tailwind ni tokens CSS).

| Componente                    | Ubicación                                       | Uso                                                        |
| ----------------------------- | ----------------------------------------------- | ---------------------------------------------------------- |
| **EmailLayout**               | `resources/js/emails/components/EmailLayout.tsx`| `<Html><Head><Preview><Body><Container>` + Header + `children` + Footer |
| **EmailHeader**               | `resources/js/emails/components/EmailHeader.tsx`| Logo (URL absoluta) + título por prop                      |
| **EmailFooter**               | `resources/js/emails/components/EmailFooter.tsx`| Enlaces, dirección, aviso legal íntegro, copyright         |
| **(helpers)** `blade()`/`Raw` | `resources/js/emails/lib/blade.tsx`             | Emitir `{{ $var }}`, `@if`, `@foreach`, `asset()` desde JSX|

- **Por qué no `base/`:** `base/` es el sistema visual de la app (Tailwind + design-tokens, DOM del
  navegador). El correo se renderiza a HTML con estilos **inline y hex literal** porque los clientes
  de correo no soportan CSS variables ni clases de utilidad de forma fiable. Son dos universos.
- Los estilos de correo **portan el hex** de las plantillas actuales, con los ajustes de marca de §5.

## 2. Documentación

- [ ] **ADR-0004 · Plantillas de correo en React (react-email) compiladas a Blade.** Decisión de
  arquitectura: por qué React para correo, por qué se **compila a Blade en build** (y no render en
  runtime), y la convención de placeholders. Se escribe en el Corte 4A y se indexa en `docs/adr/`.
- [ ] `docs/actualizaciones/orden-componentes.md`: no aplica (esos son de `base/`). En su lugar, este
  documento lleva el índice de plantillas migradas (§7, tabla de progreso).
- [ ] `README.md` / `CLAUDE.md`: añadir la nota de flujo de correo (`npm run emails:build`,
  `npm run emails:dev` para previsualizar) al terminar el Corte 4A.

## 3. Flujo actual

- **Autoría:** 24 vistas **Blade** en `resources/views/emails/<área>/` (admin, associate, auth,
  billing, contact, forum, tenders). 23 Mailables en `app/Mail/`.
- **Chrome duplicado:** solo **4** plantillas extienden `emails/_layout.blade.php`
  (`auth/otp_code`, `admin/new_registration`, `admin/payment_proof_uploaded`, `billing/payment_settled`).
  Las **~19 restantes copian *verbatim*** `<!DOCTYPE>`, los `<style>`, el header con logo y todo el
  footer. Cambiar un buzón del footer hoy = editar 19 archivos.
- **Envío:** `MAIL_MAILER=resend`, remitente `no-reply@camepg.com`. Los correos usan `defer()`
  (sin worker). Mailables con `Content(view: 'emails.<área>.<x>')`, **solo HTML** (sin parte texto).
- **Estilos:** inline en `<style>`, hex crudo. Colores fuera del sistema de marca: enlaces del footer
  en morado `#504ac5`, botón `.btn` en degradado rojo→naranja.
- **Resultado esperado:** el HTML resultante debe ser **idéntico visualmente** (salvo los ajustes de
  marca acordados) tras la migración, y el envío por Resend seguir funcionando igual.

## 4. Pipeline (decisión técnica)

**PHP no renderiza React en el envío.** `react-email` corre en Node. Se elige **compilar en build a
Blade** (recomendado para este stack: sin worker, `defer()`, Herd/Windows):

```
AUTORÍA     resources/js/emails/**.tsx           (React + @react-email/components)
              │  npm run emails:build  (tsx + @react-email/render)
              ▼
GENERADO    resources/views/emails/**.blade.php  (HTML final + {{ $var }} / @foreach)
              ▼
RUNTIME     Mailable → Blade → Resend            (100 % PHP; Mailables NO cambian)
```

- **Ventaja clave:** los `Content(view: ...)` de los Mailables **no cambian** (misma ruta Blade). El
  runtime sigue en PHP puro; nada de Node en el envío.
- **Placeholders (convención):** en JSX no se puede escribir `{{ $x }}` directo. Se usa el helper:
  - `{blade("$user->name")}` → emite `{{ $user->name }}`
  - `{blade("asset('images/...')")}` → emite `{{ asset('images/...') }}` (resuelve URL absoluta en
    runtime; **resuelve el punto 5** del ajuste — el logo no lleva URL hardcodeada).
  - `<Raw>@foreach($items as $i) … @endforeach</Raw>` para directivas Blade en los cuerpos con listas.
- **Descartado — render en runtime (Node por envío):** más frágil en Herd/Windows, latencia, rompe la
  simplicidad de `defer()`. Se documenta el descarte en el ADR-0004.
- **Preview:** `npm run emails:dev` levanta el servidor de `react-email` para ver las plantillas en el
  navegador sin enviar nada.

## 5. Ajustes de marca acordados (#debate 2026-09-13)

1. **Enlaces del footer → `.org`.** Se mantienen los `mailto:@camepg.org` y `https://camepg.org` tal
   cual (decisión del usuario). *(Nota de entregabilidad: el desalineamiento envío `camepg.com` vs
   enlaces `camepg.org` se resuelve en la sección de infra §10, no aquí.)*
2. **Color de enlaces → marca.** El morado `#504ac5` se reemplaza por el neutro de marca `#151515`
   (con subrayado en hover donde aplique). Nada de amarillo en texto de enlace (contraste).
3. **Botón `.btn` → marca.** Se retira el degradado rojo→naranja; botón sólido **neutro `#151515`**,
   texto blanco, radio de píldora conservado. (Se aplica al migrar los cuerpos que tengan CTA.)
4. **Aviso legal → íntegro.** Se conserva el texto legal **completo** actual (el borrador que mostré
   lo había acortado; la versión final lleva el párrafo entero).
5. **Logo → URL absoluta.** Vía `blade("asset('images/camep/logo_camep_horizontal_correos_header.png')")`
   (Blade genera la URL absoluta según `APP_URL`). Sin hardcodear dominio.

## 6. Entregabilidad — arreglos de **código** (spam)

Diagnóstico DNS (2026-09-13): SPF (en `send.camepg.com`), DKIM (`resend._domainkey`, `d=camepg.com`)
y DMARC (`p=none`) **presentes** → el spam no es por autenticación. Palancas de código:

- [ ] **Parte de texto plano** en los Mailables (hoy solo HTML): `Content(view, text: 'emails...text')`
  o auto-derivada. Es señal de spam fuerte enviar HTML sin `text/plain`.
- [ ] **Cabecera `List-Unsubscribe`** (+ `List-Unsubscribe-Post`) en los correos transaccionales
  masivos, vía `Headers` del Mailable.
- [ ] **`Reply-To` real** (p. ej. `adminfin@camepg.org`) en lugar de solo `no-reply@`.

*(Lo que más mueve la aguja — mover el envío a `camepg.org`, DMARC `p=quarantine`, calentar dominio —
es infra, §10.)*

## 7. Plan por cortes

> Tabla de progreso de plantillas al pie. Cada corte = un `#go`.

- **Corte 4A · Tooling + ADR.** ✅ **HECHO** (2026-09-13). Instaladas `react-email`,
  `@react-email/components` (1.0.12), `@react-email/render` (2.1.0), `tsx` (dev). Creado
  `resources/js/emails/lib/blade.tsx` (helpers `blade`/`bladeRaw`/`raw`/`<Blade>`). Script
  `scripts/build-emails.ts` + npm scripts `emails:build` / `emails:dev`. Convención `export const view`.
  `.gitignore` de `/.react-email`. ADR-0004 escrito e indexado. README/CLAUDE actualizados.
  Pipeline validado end-to-end con plantilla de prueba (tokens → `{{ }}` intactos, `@foreach` OK,
  artefactos de React limpiados). Preflight en verde.
  - *Pendiente para 4B:* gate de preflight que verifique que las vistas Blade generadas están al día
    (se añade cuando existan las primeras páginas reales, para poder probarlo).
- **Corte 4B · Chrome.** ✅ **HECHO** (2026-09-13). Creados `EmailLayout` + `EmailHeader` +
  `EmailFooter` en `resources/js/emails/components/` con los ajustes de marca de §5 (enlaces `#151515`,
  logo por `{{ asset(...) }}`, año por `{{ date('Y') }}`, aviso legal íntegro). Página `_preview.tsx`
  (sin `export const view`, no compila) para `emails:dev`, con el botón de marca neutro (§5.3).
  Compilación validada (logo/año/placeholders correctos tras arreglar un bug: `blade()` debía
  llamarse **dentro** del render, no a nivel de módulo, por el reset de tokens por plantilla).
  Preflight en verde.
  - **Corrección al plan:** el `_layout.blade.php` heredado **NO se regenera aquí**. Se descubrió que
    3 de las 4 plantillas con `@extends` dependen de sus clases `<style>` (`.btn`, `.data-row`,
    `.plan-box`, `.warn-box`); regenerarlo con estilos inline las rompería. Se deja intacto para la
    transición; sus dependientes se migran en su corte (4E/4G) y se retira en 4Z.
- **Corte 4C · Prueba de concepto (end-to-end).** ✅ **HECHO** (2026-09-13). Migrada `auth/otp_code`
  a React (`resources/js/emails/auth/OtpCode.tsx`, autónoma con `EmailLayout`, condicional `purpose`
  con dos `<Blade if>`). El Mailable `OtpCode` no cambió. Verificado: `render()` OK (14 KB, logo
  `asset()`, `{{ $code }}`, footer `#151515`) y **envío real por Resend aceptado**.
  - **Fix del helper `Blade`:** emitía `@endif@if` pegados y Blade dejaba el segundo `@if` sin
    compilar (`unexpected token endif`). Ahora cada directiva se envuelve en saltos de línea en su
    VALOR (no en el render); el build colapsa los sobrantes.
- **Cortes 4D–4J · Migración de cuerpos por área** (uno o dos por corte, para revisión manejable):
  - **4D `auth/welcome`** ✅ **HECHO** (2026-09-13). `resources/js/emails/auth/Welcome.tsx` →
    `emails/auth/welcome.blade.php`. Creado componente reutilizable `EmailButton` (botón de marca
    §5.3, sólido neutro; reemplaza al `.btn` degradado) y adoptado también en `_preview.tsx`.
    Render del Mailable OK (nombre, `route('associate.company.basic')`, título). Preflight verde.
    *(La parte de texto plano NO se añadió aquí; va en el corte 4K de entregabilidad.)*
  - Resto: 4E `billing/` (5) · 4F `associate/` (4) · 4G `admin/` (resto) · 4H `contact/` (2) ·
    4I `forum/` (1) · 4J `tenders/` (2).
  - En cada uno: portar cuerpo a React, aplicar botón/enlaces de marca (§5), regenerar Blade,
    **comparar HTML** contra el original. El texto plano (§6) se centraliza en 4K.
- **Corte 4K · Entregabilidad de código.** `List-Unsubscribe` + `Reply-To` transversal en los
  Mailables (§6). *(La parte de texto plano se va metiendo por plantilla en 4D–4J.)*
- **Corte 4Z · Cierre.** Retirar el `_layout.blade.php` viejo hardcodeado y cualquier `<style>`
  duplicado ya sin uso. Confirmar que ningún Mailable apunta a una vista huérfana. Marcar plan
  COMPLETADO. Registrar en `docs/pendientes-documentacion.md` la sección de infra pendiente (§10).

**Gates por corte:** `types:check` + ESLint + Prettier (sobre los `.tsx` nuevos) + Vitest si aplica;
Pint + Larastan + Pest cuando el corte toque Mailables/PHP. `npm run emails:build` debe correr y no
dejar diffs Blade sin commitear.

### Progreso de plantillas

| Área        | Plantillas                                                              | Estado |
| ----------- | ----------------------------------------------------------------------- | ------ |
| chrome      | EmailLayout, EmailHeader, EmailFooter                                    | ✅ hecho (4B) |
| auth        | otp_code, welcome                                                        | ✅ hecho (4C + 4D) |
| billing     | new_invoice, payment_approved, payment_rejected, payment_settled, subscription_expired, subscription_expiring | 🔴 pendiente (4E) |
| associate   | approved, audit_approved, audit_rejected, field_change_requested         | 🔴 pendiente (4F) |
| admin       | associate_docs_submitted, forum_report_alert, new_forum_topic_alert, new_registration, payment_proof_submitted, payment_proof_uploaded | 🔴 pendiente (4G) |
| contact     | admin, user_confirmation                                                 | 🔴 pendiente (4H) |
| forum       | new_reply                                                                | 🔴 pendiente (4I) |
| tenders     | new_tender, tender_updated                                               | 🔴 pendiente (4J) |

## 8. Accesibilidad / correo

- `alt` descriptivo en el logo. Contraste de texto legal (subir de `#aaa`/`#999` si queda ilegible).
- Estructura semántica de `@react-email/components` (`<Heading>`, `<Text>`, `<Link>`) y `<Preview>`
  (texto de vista previa en la bandeja).

## 9. Seguridad

- Sin datos sensibles nuevos. El OTP en `otp_code` sigue siendo el código en claro efímero (no se
  persiste; ya cubierto por ADR-0003).
- Los helpers `blade()`/`Raw` emiten Blade **en build**, no ejecutan nada en runtime distinto a lo
  que ya hace Blade. Revisar que no se introduzca `{!! !!}` (sin escapar) por accidente.

## 10. Fuera de alcance (infra — sección aparte)

Estos mueven la entregabilidad pero son configuración, no código de este plan:

- Alinear **dominio de envío** a `camepg.org` (o `notificaciones.camepg.org`): verificar dominio en
  Resend, cambiar `MAIL_FROM_ADDRESS`. Resuelve el desalineamiento envío/marca.
- Endurecer **DMARC** a `p=quarantine` tras monitorear; añadir `rua`.
- **Calentar** el dominio (volumen gradual).
- Confirmar que el registro **DKIM** en Resend muestra `v=DKIM1; k=rsa; p=…` completo.

## 11. Aprobación

- [ ] Plan revisado
- [ ] Pipeline confirmado (compilar a Blade en build)
- [ ] `#go` recibido → Corte 4A
