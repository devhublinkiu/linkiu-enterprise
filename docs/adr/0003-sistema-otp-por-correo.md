# ADR-0003 · Sistema OTP por correo (registro y recuperación)

- **Estado:** Aceptada
- **Fecha:** 2026-09-13
- **Afecta a:** registro de asociados, recuperación de contraseña, `App\Services\OtpService`,
  tabla `email_otps`, `config/otp.php`

---

## Contexto

El registro pasa a ser **multipaso con verificación de correo por código** (OTP) y hay que crear la
**recuperación de contraseña**. Ambos flujos necesitan lo mismo: emitir un código al correo,
verificarlo con límites, y evitar abuso (reenvíos, fuerza bruta). Laravel de fábrica trae
recuperación por **enlace con token**, no por código; y no trae verificación por OTP en el registro.

Si cada flujo resuelve esto por su cuenta, terminamos con dos implementaciones distintas de lo
mismo (generación, expiración, intentos, cooldown) — justo el patrón que el proyecto quiere evitar.

---

## Decisión

### 1. Un solo mecanismo OTP reutilizable

Un servicio (`App\Services\OtpService`) y una tabla (`email_otps`) sirven a **ambos** propósitos,
distinguidos por la columna `purpose` (`registration` | `password_reset`). Los dos flujos consumen
la misma lógica de emisión, verificación, reenvío y cooldown.

### 2. Código hasheado, nunca en claro

El código se guarda **hasheado** (`Hash::make`, bcrypt) en `code_hash`. En claro solo vive en el
correo saliente. La verificación usa `Hash::check`.

### 3. Tabla propia, no caché

`email_otps` con una fila activa por `(email, purpose)` (índice único, `updateOrCreate`):

```
email        purpose        code_hash
expires_at   attempts       resends
locked_until verified_at    timestamps
```

- `attempts` — intentos de verificación (anti fuerza bruta).
- `resends` — envíos en la ventana actual.
- `locked_until` — cooldown tras agotar los envíos.
- `verified_at` — prueba de que el código se verificó, para el paso final del registro
  (`consumeVerified` la valida y borra la fila: uso único).

### 4. Parámetros (config/otp.php, por `env`)

| Parámetro | Valor | Significado |
|---|---|---|
| `length` | 6 | dígitos |
| `ttl_minutes` | 10 | vigencia del código |
| `max_resends` | 5 | envíos por ventana antes del cooldown |
| `resend_cooldown_minutes` | 30 | duración del cooldown |
| `max_verify_attempts` | 5 | intentos de verificación antes de invalidar |

### 5. API del servicio

```php
$otp->request($email, $purpose);              // genera+envía; false si hay cooldown
$otp->verify($email, $purpose, $code);        // true si acierta (marca verified_at)
$otp->consumeVerified($email, $purpose);      // confirma verificado vigente y borra (uso único)
$otp->cooldownSecondsRemaining($email, $purpose);
```

### 6. Envío síncrono

El correo (`App\Mail\OtpCode`) se envía **síncrono** dentro de la petición (no `defer()`): un OTP
debe llegar de inmediato y así el flujo es verificable en pruebas. Con Resend el envío es rápido.
Los endpoints que llaman a `request()` llevan además **rate-limit por IP** (defensa aparte de la
lógica de fila).

---

## Opciones consideradas

**A. Recuperación con enlace-token (estándar Laravel).** Menos código, pero incoherente con el
registro (que sí necesita código OTP), y son dos experiencias distintas. Se descarta por
consistencia: un solo mecanismo para ambos.

**B. Guardar el OTP en caché (TTL nativo).** Simple para expiración, pero la caché del proyecto es
`array`/efímera en varios entornos y cuesta más llevar contadores de intentos/reenvíos y auditar.
La tabla da persistencia clara y consultable.

**C. Código en claro en la tabla.** Descartado: filtración de la BD = OTPs usables. Se hashea.

---

## Consecuencias

**A favor**
- Un solo lugar para la lógica sensible (expiración, intentos, cooldown); registro y recuperación
  la comparten.
- Código hasheado y de uso único; límites contra fuerza bruta y spam de reenvíos.

**En contra**
- El envío síncrono añade la latencia de Resend a la petición (aceptable para un correo corto).
- Una tabla más y un job de limpieza deseable a futuro (borrar filas expiradas) — hoy `updateOrCreate`
  reaprovecha la fila por `(email, purpose)`, así que no crece sin control.
