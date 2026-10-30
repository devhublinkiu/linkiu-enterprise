<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Códigos OTP por correo
    |--------------------------------------------------------------------------
    |
    | Parámetros del sistema de códigos de un solo uso (registro y recuperación
    | de contraseña). Ver ADR-0003 y App\Services\OtpService.
    |
    */

    // Cantidad de dígitos del código.
    'length' => (int) env('OTP_LENGTH', 6),

    // Vigencia del código desde que se envía.
    'ttl_minutes' => (int) env('OTP_TTL_MINUTES', 10),

    // Ventana para COMPLETAR el registro después de verificar el código (p. ej.
    // mientras el usuario escribe nombre y contraseña). Se mide desde que se
    // verificó, no desde que se envió el código: así el registro no se cae porque
    // el código caducó mientras llenaba el formulario.
    'verified_ttl_minutes' => (int) env('OTP_VERIFIED_TTL_MINUTES', 30),

    // Envíos permitidos por ventana antes de entrar en cooldown.
    'max_resends' => (int) env('OTP_MAX_RESENDS', 5),

    // Duración del cooldown una vez agotados los envíos.
    'resend_cooldown_minutes' => (int) env('OTP_RESEND_COOLDOWN_MINUTES', 30),

    // Intentos de verificación permitidos antes de invalidar el código.
    'max_verify_attempts' => (int) env('OTP_MAX_VERIFY_ATTEMPTS', 5),

    // Propósitos válidos.
    'purposes' => ['registration', 'password_reset'],

];
