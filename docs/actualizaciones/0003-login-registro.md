# Plan de actualización — 0003 · Login y Registro (lado asociado)

- **Estado:** ✅ COMPLETADO (todos los cortes 1–3G) — 2026-09-13
- **Fecha:** 2026-09-12 (ampliado y planificado 2026-09-13; completado 2026-09-13)
- **Alcance:** Rehacer inicio de sesión y registro con componentes de `@/Components/base/` (tokens)
**y** montar el auth avanzado: verificación por **OTP al correo** en el registro (flujo multipaso),
**recuperación de contraseña por OTP**, notificación al **admin** por nuevo registro, y validación
de correo antes de crear la cuenta. **No entra:** el wizard de afiliación (plan propio).

> Se trabaja por **cortes** (3A, 3B, …); cada corte se implementa con su propio `#go`. Los
> componentes de `base/` se crean **desde cero, tal cual la spec** (solo cambian color→tokens y
> tipografía).

---

## 1. Componentes

Login/Registro/Recuperación usan este conjunto. Se **crean en `base/`** (no se migran) y se agregan a
la galería `/dev/componentes`; chulo en `orden-componentes.md`.


| Componente                                                             | Uso                                               | Estado                                      |
| ---------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------- |
| Label, Input, Spinner, Button, Checkbox, Field, Card, Alert, Separator | base del formulario                               | ✅ hechos (Corte 1)                          |
| **Input OTP**                                                          | **código de 6 dígitos (registro + recuperación)** | ✅ hecho (Corte 3A, paquete `input-otp`)    |


- Los equivalentes viejos (`ui/*`) **no se borran** en este plan: los usan otros módulos.

## 2. Documentación

- **ADR-0003 · Sistema OTP por correo** (decisión de arquitectura: un solo mecanismo OTP reutilizable
para registro y recuperación). Se escribe en el Corte 3B y se indexa.
- `lang/es/auth.php` ya creado (Corte 2). Se ampliará con textos de OTP/recuperación.
- Chulo en `orden-componentes.md` al crear Input OTP.

## 3. Configuración de correo (estado real)

- Proveedor **Resend** (`MAIL_MAILER=resend`). Remitente `**no-reply@camepg.com`** (dominio
**camepg.com**, que es el verificado).
- Envío sin worker: los correos usan `defer()` y llegan igual (no hace falta `queue:work`).
- **Destinatario admin:** `config('mail.admin_recipient')` ← `ADMIN_EMAIL` = `**afiliate@camepg.org`**.
La notificación de nuevo registro llega ahí (ese buzón está en el servicio de correo).
- Antes: no existía OTP ni recuperación de contraseña (la tabla `password_reset_tokens` está pero
sin flujo). Los tests Breeze de esas rutas fallan por eso (ver deuda al final).

## 4. Accesibilidad (a corregir en el UI)

- Errores con `role="alert"`/`aria-live` y `aria-invalid`/`aria-describedby` → vía **Field**.
- `alt` del logo descriptivo (no genérico). Foco visible con token (`ring-ring`).

## 5. Requisitos nuevos (de #debate 2026-09-13)

### Registro (flujo A · multipaso)

1. **Paso 1 — correo:** validación **async** de disponibilidad antes de continuar. Si ya existe →
  "Ya tienes una cuenta con este correo. **Inicia sesión.**" (revelar aquí es intencional, punto 6).
   Endpoint con **rate-limit**. Si está libre → se envía OTP.
2. **Paso 2 — OTP:** código de **6 dígitos**, vigencia **10 min**. Reenvío **máx 5 veces**; tras el 5º,
  **cooldown 30 min**. Máx **5 intentos** de verificación (anti-fuerza-bruta) → luego invalida.
3. **Paso 3 — datos:** nombre + contraseña → crea el `User` **ya verificado** → `Auth::login` →
  `associate.company.billing`.
4. Al crear la cuenta: **correo al admin** (`afiliate@camepg.org`) + `WelcomeUser` al usuario.
5. "¿Ya tienes cuenta? **Inicia sesión.**" visible en la pantalla.

### Login

1. Rate-limit **5 intentos** (ya existe en `LoginRequest`, en español). Solo confirmar.
2. Enlace a **recuperar contraseña**.

### Recuperación de contraseña (OTP)

- Flujo propio (no enlace-token): pedir correo → OTP → nueva contraseña.
- **Mensaje genérico** anti-enumeración: "Si el correo existe, te enviamos un código."
- Reusa la misma infra OTP (`purpose = password_reset`).

## 6. Funcional (a corregir en el UI)

- Enlaces "Términos"/"Política" muertos → quitar (§7.1).
- Capitalización español ("Iniciar sesión", "Correo electrónico"); unificar "contraseña".
- Quitar el fallback del logo que manipula el DOM (usar estado React / icono lucide).

---

## Cortes (orden lógico por dependencias)

### Corte 1 · Componentes base — ✅ HECHO

9 componentes en `base/` + galería + cero deuda de conexión.

### Corte 2 · Backend y seguridad del auth — ✅ HECHO

Debug PII eliminado, `login_debug.txt` borrado, `lang/es/auth.php`, `RegisterRequest`, migraciones
driver-aware, tests auth 8/8. (Detalle en el historial de este archivo / commits.)

### Corte 3A · Componente Input OTP — ✅ HECHO

**Objetivo:** el único componente que falta para todo el flujo.

> Hecho: `input-otp` instalado; `base/InputOTP.tsx` (InputOTP/Group/Slot/Separator) tal cual spec
> (adaptado v4→v3, `dark:` fuera, `cn-input-otp` retirada); animación `caret-blink` en `app.css`;
> galería + test; chulo. Gates verdes (11 archivos / 25 tests, build verificado).

- Instalar `**input-otp**` (`npm i input-otp`).
- Crear `resources/js/Components/base/InputOTP.tsx` **tal cual la spec** de shadcn (exports típicos:
`InputOTP`, `InputOTPGroup`, `InputOTPSlot`, `InputOTPSeparator`) — solo se cambia color→tokens y
tipografía; adaptar v4→v3 si aparecen las mismas construcciones que en los otros componentes.
El separador **reutiliza `base/Separator`** (ya existe) si la spec lo usa.
- Galería `/dev/componentes`: grupo de 6 slots (patrón registro/recuperación). Chulo en `orden-componentes.md`.
- **Gate:** types:check · ESLint · Prettier · Vitest (humo) · build (clases resuelven).
- **Entrada requerida:** la **spec del componente** (me la pasas con el `#go`).

### Corte 3B · Infraestructura OTP (backend) + ADR-0003 — ✅ HECHO

> Hecho: migración `email_otps` (Blueprint, único `email+purpose`), `config/otp.php` (6·10·5·30·5),
> modelo `EmailOtp`, `App\Services\OtpService` (`request`/`verify`/`consumeVerified`/
> `cooldownSecondsRemaining`, código hasheado, envío síncrono), Mailable `OtpCode` + vista
> `emails/auth/otp_code.blade.php` (usa `emails._layout`), **ADR-0003** + índice. Gates: Pint ✅ ·
> Larastan ✅ · Pest **5/5** (genera, verifica, intentos/lockout, expiración, cooldown). Vista renderiza OK.

**Objetivo:** un solo mecanismo OTP para registro y recuperación.

- **Migración `create_email_otps_table`** (compatible sqlite/MySQL, sin DDL crudo):

  | Columna        | Tipo                       | Nota                               |
  | -------------- | -------------------------- | ---------------------------------- |
  | `id`           | bigIncrements              |                                    |
  | `email`        | string(255)                |                                    |
  | `purpose`      | string(32)                 | `registration` | `password_reset`  |
  | `code_hash`    | string                     | `Hash::make(code)` (bcrypt)        |
  | `expires_at`   | timestamp                  | ahora + 10 min                     |
  | `attempts`     | unsignedTinyInteger, def 0 | intentos de verificación           |
  | `resends`      | unsignedTinyInteger, def 0 | reenvíos en la ventana             |
  | `locked_until` | timestamp nullable         | cooldown tras 5 reenvíos           |
  | `verified_at`  | timestamp nullable         | prueba para el paso 3 del registro |
  | timestamps     |                            |                                    |

  - Índice único **(`email`, `purpose`)** → una fila activa por propósito (upsert).
- `**config/otp.php`:** `length=6`, `ttl_minutes=10`, `max_resends=5`, `resend_cooldown_minutes=30`,
`max_verify_attempts=5`. (Valores por `env()` con default.)
- `**app/Services/OtpService.php`:**
  - `request(string $email, string $purpose): OtpRequestResult` — si hay cooldown activo, lo respeta;
  si no, genera código, `code_hash`, `expires_at`, incrementa `resends` (o reinicia ventana),
  resetea `attempts`/`verified_at`, y envía el correo con `defer()`. Al llegar a `max_resends`
  fija `locked_until = now()+30min`.
  - `verify(string $email, string $purpose, string $code): bool` — falla si expiró, si `locked_until`,
  o si `attempts >= max_verify_attempts`; en fallo incrementa `attempts`; en acierto fija `verified_at`.
  - `consumeVerified(string $email, string $purpose): bool` — confirma que hay `verified_at` dentro de
  TTL y borra la fila (uso único). Helpers `cooldownRemaining()`, `canResend()`.
  - Rate-limit adicional por IP con `RateLimiter` en los endpoints (defensa aparte de la lógica de fila).
- **Mailable `app/Mail/OtpCode.php`** (al usuario): asunto "Tu código de verificación", cuerpo con el
código y la vigencia (10 min). Texto en español.
- **ADR-0003 · Sistema OTP por correo** en `docs/adr/` (+ índice): decisión (un OTP reutilizable,
hasheado, tabla propia vs. caché), parámetros y alternativas descartadas (enlace-token, caché).
- **Gate:** Pint · Larastan · Pest: genera y verifica; código errado incrementa `attempts`; bloqueo a
los 5 intentos; expiración; cooldown tras 5 reenvíos.

### Corte 3C · Correo al admin por nuevo registro — ✅ HECHO

> Hecho: Mailable `NewRegistrationToAdmin` + vista `emails/admin/new_registration.blade.php`
> (layout compartido); conectado en `RegisteredUserController@store` (sync en try/catch, junto a
> `WelcomeUser`, destinatario `config('mail.admin_recipient') ?: 'afiliate@camepg.org'`). Test
> `registration_notifies_admin` (→ `afiliate@camepg.org`). Gates: Pint ✅ · Larastan ✅ · Pest 4/4 ✅.

- **Mailable `app/Mail/NewRegistrationToAdmin.php`** (patrón de `ContactReceivedToAdmin`): a
`config('mail.admin_recipient')` = `afiliate@camepg.org`, con `defer()`. Contiene nombre, correo y
fecha del nuevo asociado. Se dispara desde el `store` final del registro (3D).
- **Gate:** Pint · Larastan · Pest (`Mail::fake()` → se envía a `afiliate@camepg.org` al registrarse).

### Corte 3D · Registro multipaso (backend + UI) — ✅ HECHO

> Hecho. Backend: rutas `register/check-email`, `register/otp`, `register/otp/verify` (JSON,
> `throttle` por IP) + `store` con verificación por sesión (`RegisterRequest::withValidator` exige
> el correo verificado; el controlador consume el OTP de uso único y fija `email_verified_at`).
> UI: `Auth/Register.tsx` como máquina de 3 pasos (`register/EmailStep`, `OtpStep`, `DetailsStep`)
> con `base/` + InputOTP + Alert; reenvío con cooldown; logo con fallback en estado React
> (`Components/AuthLogo`); "¿Ya tienes cuenta? Inicia sesión". Sin imports de `ui/`. Gates:
> Pint ✅ · Larastan ✅ · Pest **6/6** · types/eslint/prettier ✅ · Vitest 25/25 · build ✅.
> Nota: sin test de Vitest para la página (flujo axios+Inertia); queda cubierto por el Pest de flujo.
> `routes/web.php` no se reformatea entero (estilo legacy preexistente); el bloque añadido sigue el estilo.

**Backend — rutas nuevas (grupo `guest`), con rate-limit por IP:**

- `POST register/check-email` → `{ available: bool }` (revela existencia: intencional, punto 6).
- `POST register/otp` → `OtpService::request($email,'registration')` (chequea disponibilidad antes).
- `POST register/otp/verify` → `OtpService::verify(...)`; al pasar, marca sesión
`registration.email_verified` (guest).
- `POST register` (existente) → `RegisterRequest` **ampliado**: exige que el email coincida con el
verificado en sesión y siga con `verified_at` vigente (`consumeVerified`). Crea `User` con
`email_verified_at = now()`; dispara **3C** + `WelcomeUser`; `Auth::login`; → `associate.company.billing`.
- Estado entre pasos: **sesión de invitado** (`registration.email` + verificado). Sin exponer nada al cliente.
- **UI — rehacer `resources/js/Pages/Auth/Register.tsx`** con `base/` (Card, Field, Input, **InputOTP**,
Button, Spinner, Alert): 3 pasos, botón "Reenviar código" con **contador de cooldown**, manejo de
errores por Field, "¿Ya tienes cuenta? **Inicia sesión**". Sin imports de `ui/`.
- **Gate:** frontend completo + Pest del flujo (correo ocupado, OTP correcto/incorrecto, creación).

### Corte 3E · Recuperación de contraseña con OTP (backend + UI) — ✅ HECHO

> Hecho. Backend: `PasswordResetController` (`create`/`sendOtp`/`reset`), rutas `password.request`
> (GET), `password.email` (POST JSON, genérico anti-enumeración), `password.update` (POST, verifica
> OTP `password_reset` y cambia la contraseña). UI: `Auth/ForgotPassword.tsx` (2 pasos: correo →
> código + nueva contraseña) con `base/` + Input OTP. `PasswordResetTest` reescrito al flujo OTP
> (5/5). Gates: Pint ✅ · Larastan ✅ · Pest ✅ · types/eslint/prettier/vitest/build ✅.
> La deuda pre-existente de Pest bajó de 13 → 9 (quedan Email/PasswordConfirmation/PasswordUpdate/Example).

**Backend — rutas (grupo `guest`):**

- `GET forgot-password` (`password.request`) → vista pedir correo.
- `POST forgot-password` (`password.email`) → `OtpService::request($email,'password_reset')` **solo si
el correo existe**, pero responde **siempre** con mensaje genérico ("Si el correo existe, enviamos un código").
- `GET reset-password` (`password.reset`) → vista OTP + nueva contraseña.
- `POST reset-password` (`password.update`) → verifica OTP (`password_reset`), valida contraseña
(`Password::defaults()`, confirmada), actualiza y `consumeVerified`; invalida sesiones si aplica.
- **UI:** pantallas con `base/` (Card, Field, Input, InputOTP, Button, Alert).
- **Tests Breeze de reset:** adaptarlos al flujo OTP (dejan de probar el token estándar).
- **Gate:** frontend + Pest (mensaje genérico, cambio de contraseña, expiración, intentos).

### Corte 3F · Rehacer Login (UI) — ✅ HECHO

> Hecho. `Auth/Login.tsx` reescrito con `base/` (Card, Field, Input, **Checkbox real**, Button,
> Spinner, Alert para `status`) + `AuthLogo` (sin manipular el DOM). Enlace a recuperación
> (`password.request`) y a registro; capitalización español; enlaces muertos (Términos/Política)
> eliminados. Cero imports de `ui/` en Auth. Throttle de 5 intentos ya existía. Gates:
> types/eslint/prettier/vitest/build ✅; AuthenticationTest 5/5.

- `resources/js/Pages/Auth/Login.tsx` con `base/`: **Checkbox** real ("recordar sesión"),
accesibilidad y errores vía **Field**, quitar la manipulación DOM del logo (estado React / icono),
capitalización español, enlace a **recuperación** (3E) y a **registro**. Sin imports de `ui/`.
- Confirmar el throttle de 5 intentos (ya existe) y que `status`/errores usen **Alert**.
- **Gate:** types:check · ESLint · Prettier · Vitest.

### Corte 3G · Cierre — ✅ HECHO

> Hecho. Auth sin imports de `ui/` (verificado). Eliminados los tests Breeze obsoletos
> (`EmailVerificationTest`, `PasswordConfirmationTest`, `PasswordUpdateTest` — rutas inexistentes);
> `ExampleTest` con `RefreshDatabase`. Suite Pest **29/29 verde**. Corregido un bug del preflight
> (incluía archivos borrados → Pint fallaba). **Preflight completo en verde (7/7 gates).**

- Verificar que Login/Register/Recuperación **no importan de `ui/`**; preflight completo en verde.
- **Aseo de tests Breeze obsoletos**: eliminar `EmailVerificationTest`, `PasswordConfirmationTest`,
`PasswordUpdateTest` (rutas inexistentes) y arreglar `ExampleTest`/`service_categories`; los de
reset ya quedaron adaptados en 3E.
- (Los `ui/` compartidos se retiran en un plan global, cuando ningún módulo los use.)

---

## §7 Decisiones — RESUELTAS (#debate 2026-09-13)

1. **Enlaces Términos/Política:** quitar por ahora.
2. **Dominio correo:** verificado **camepg.com** (remitente `no-reply@camepg.com`); la notificación
  de registro va a `**afiliate@camepg.org**` (buzón en el servicio de correo).
3. **Admin de registro:** destinatario `**afiliate@camepg.org`** (el `admin_recipient` actual).
4. **Flujo de registro:** **A** (multipaso con OTP).
5. **Enumeración:** **genérico en recuperación**; en **registro** sí se revela "ya existe → inicia
  sesión" (necesario para el punto 6). *Marcado por si se quiere vetar.*
6. **Parámetros OTP:** 6 dígitos · 10 min · cooldown 30 min tras 5 reenvíos · 5 intentos de verificación.
7. **Recuperación:** **OTP-código** (consistente con el registro).
8. **Orden:** 3A (Input OTP) → 3B (infra OTP+ADR) → 3C (correo admin) → 3D (registro) → 3E
  (recuperación) → 3F (login UI) → 3G (cierre).

**Decisiones menores heredadas de Corte 2 — cerradas para este plan:**
- **`WelcomeUser`:** se deja **síncrono** (en try/catch, junto al correo al admin). Funciona sin
  worker; si algún día se corre `queue:work`, migrar a `ShouldQueue`. No es tarea pendiente.
- **Redirección del superadmin:** hoy va a `admin.associates.index` y funciona. Que tenga un área
  propia es una **decisión de producto fuera del alcance de 0003** (no bloquea); se abordará en su
  propio plan si el negocio lo pide.

## §8 Aprobación

- [x] Decisiones §7 resueltas
- [x] Plan revisado (`#plan`/`#review`)
- [x] `#go` por corte (empezando por **3A · Input OTP**)

---

## Deuda pre-existente — ✅ RESUELTA

Los 13 tests de Breeze que fallaban (rutas no implementadas + `ExampleTest`) quedaron resueltos:
`PasswordResetTest` adaptado al flujo OTP (3E); `EmailVerificationTest`, `PasswordConfirmationTest`
y `PasswordUpdateTest` eliminados (features inexistentes); `ExampleTest` con `RefreshDatabase` (3G).
Suite Pest **29/29** y preflight completo en verde (7/7 gates).