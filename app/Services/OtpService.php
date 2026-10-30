<?php

namespace App\Services;

use App\Mail\OtpCode;
use App\Models\EmailOtp;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

/**
 * Códigos OTP por correo, reutilizable para registro y recuperación de contraseña.
 * Un solo mecanismo, hasheado y con límites. Parámetros en config/otp.php. Ver ADR-0003.
 *
 * El correo se envía de forma síncrona (no `defer()`): un OTP debe llegar de inmediato y así
 * el flujo es verificable en pruebas. Con Resend el envío es rápido y va dentro del POST.
 */
class OtpService
{
    /**
     * Genera y envía un código para (email, purpose). Devuelve false si hay cooldown activo
     * o si se agotaron los envíos de la ventana (en ese caso deja el cooldown fijado).
     */
    public function request(string $email, string $purpose): bool
    {
        $email = mb_strtolower(trim($email));
        $otp = EmailOtp::where('email', $email)->where('purpose', $purpose)->first();
        $now = Carbon::now();

        // Cooldown activo: bloqueado.
        if ($otp && $otp->locked_until && $otp->locked_until->isFuture()) {
            return false;
        }

        // El cooldown ya pasó: arranca ventana nueva.
        if ($otp && $otp->locked_until && $otp->locked_until->isPast()) {
            $otp->resends = 0;
            $otp->locked_until = null;
        }

        $sends = $otp ? $otp->resends : 0;

        // Se agotaron los envíos de la ventana: fija cooldown y bloquea.
        if ($sends >= (int) config('otp.max_resends')) {
            EmailOtp::updateOrCreate(
                ['email' => $email, 'purpose' => $purpose],
                ['locked_until' => $now->copy()->addMinutes((int) config('otp.resend_cooldown_minutes'))],
            );

            return false;
        }

        $code = $this->generateCode();

        EmailOtp::updateOrCreate(
            ['email' => $email, 'purpose' => $purpose],
            [
                'code_hash' => Hash::make($code),
                'expires_at' => $now->copy()->addMinutes((int) config('otp.ttl_minutes')),
                'attempts' => 0,
                'resends' => $sends + 1,
                'locked_until' => null,
                'verified_at' => null,
            ],
        );

        Mail::to($email)->send(new OtpCode($code, $purpose));

        return true;
    }

    /**
     * Verifica el código. Marca verified_at si acierta; cuenta intentos y falla si expiró,
     * está bloqueado o se pasó de intentos.
     */
    public function verify(string $email, string $purpose, string $code): bool
    {
        $email = mb_strtolower(trim($email));
        $otp = EmailOtp::where('email', $email)->where('purpose', $purpose)->first();

        if (! $otp) {
            return false;
        }

        if ($otp->locked_until && $otp->locked_until->isFuture()) {
            return false;
        }

        if ($otp->expires_at->isPast()) {
            return false;
        }

        if ($otp->attempts >= (int) config('otp.max_verify_attempts')) {
            return false;
        }

        if (! Hash::check($code, $otp->code_hash)) {
            $otp->increment('attempts');

            return false;
        }

        $otp->forceFill(['verified_at' => Carbon::now()])->save();

        return true;
    }

    /**
     * Confirma que hay un código verificado dentro de la ventana post-verificación
     * y lo consume (uso único).
     *
     * La vigencia aquí se mide desde `verified_at` (no desde `expires_at`): el
     * código puede caducar mientras el usuario escribe nombre y contraseña, pero
     * la verificación sigue valiendo durante `otp.verified_ttl_minutes`. Antes se
     * exigía `expires_at` vigente y el registro se caía con "Debes verificar tu
     * correo" aunque el usuario SÍ había verificado.
     */
    public function consumeVerified(string $email, string $purpose): bool
    {
        $email = mb_strtolower(trim($email));
        $otp = EmailOtp::where('email', $email)->where('purpose', $purpose)->first();

        if (! $otp || ! $otp->verified_at) {
            return false;
        }

        $graceMinutes = (int) config('otp.verified_ttl_minutes', 30);
        if ($otp->verified_at->copy()->addMinutes($graceMinutes)->isPast()) {
            return false;
        }

        $otp->delete();

        return true;
    }

    /**
     * Segundos que faltan para poder reenviar (0 si no hay cooldown).
     */
    public function cooldownSecondsRemaining(string $email, string $purpose): int
    {
        $email = mb_strtolower(trim($email));
        $otp = EmailOtp::where('email', $email)->where('purpose', $purpose)->first();

        if (! $otp || ! $otp->locked_until || $otp->locked_until->isPast()) {
            return 0;
        }

        return (int) ceil(Carbon::now()->diffInSeconds($otp->locked_until, absolute: true));
    }

    private function generateCode(): string
    {
        $length = (int) config('otp.length');
        $max = (10 ** $length) - 1;

        return str_pad((string) random_int(0, $max), $length, '0', STR_PAD_LEFT);
    }
}
