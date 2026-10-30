<?php

namespace Tests\Feature;

use App\Mail\OtpCode;
use App\Models\EmailOtp;
use App\Services\OtpService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class OtpServiceTest extends TestCase
{
    use RefreshDatabase;

    private function service(): OtpService
    {
        return app(OtpService::class);
    }

    public function test_request_creates_row_and_sends_mail(): void
    {
        Mail::fake();

        $sent = $this->service()->request('User@Example.com', 'registration');

        $this->assertTrue($sent);
        $this->assertDatabaseHas('email_otps', [
            'email' => 'user@example.com', // se normaliza a minúsculas
            'purpose' => 'registration',
            'resends' => 1,
        ]);
        Mail::assertSent(OtpCode::class);
    }

    public function test_verify_succeeds_then_consume_deletes(): void
    {
        Mail::fake();
        $service = $this->service();
        $service->request('a@example.com', 'registration');

        // Se obtiene el código en claro del correo enviado.
        $code = null;
        Mail::assertSent(OtpCode::class, function (OtpCode $mail) use (&$code) {
            $code = $mail->code;

            return true;
        });

        $this->assertTrue($service->verify('a@example.com', 'registration', $code));
        $this->assertNotNull(EmailOtp::first()->verified_at);

        $this->assertTrue($service->consumeVerified('a@example.com', 'registration'));
        $this->assertDatabaseCount('email_otps', 0);
    }

    public function test_wrong_code_increments_attempts_and_locks_out(): void
    {
        Mail::fake();
        $service = $this->service();
        $service->request('b@example.com', 'registration');

        for ($i = 0; $i < 5; $i++) {
            $this->assertFalse($service->verify('b@example.com', 'registration', '000000'));
        }

        $this->assertSame(5, EmailOtp::first()->attempts);

        // Aun con el código correcto, ya no verifica (se agotaron los intentos).
        $code = null;
        Mail::assertSent(OtpCode::class, function (OtpCode $mail) use (&$code) {
            $code = $mail->code;

            return true;
        });
        $this->assertFalse($service->verify('b@example.com', 'registration', $code));
    }

    public function test_expired_code_fails(): void
    {
        Mail::fake();
        $service = $this->service();
        $service->request('c@example.com', 'registration');

        $code = null;
        Mail::assertSent(OtpCode::class, function (OtpCode $mail) use (&$code) {
            $code = $mail->code;

            return true;
        });

        $this->travel(11)->minutes();

        $this->assertFalse($service->verify('c@example.com', 'registration', $code));
    }

    public function test_consume_verified_works_after_code_ttl_within_grace(): void
    {
        // Regresión 2.A: el registro no debe caerse porque el código caducó
        // mientras el usuario escribía nombre y contraseña.
        Mail::fake();
        $service = $this->service();
        $service->request('grace@example.com', 'registration');

        $code = null;
        Mail::assertSent(OtpCode::class, function (OtpCode $mail) use (&$code) {
            $code = $mail->code;

            return true;
        });

        $this->assertTrue($service->verify('grace@example.com', 'registration', $code));

        // El código en sí caduca (11 min), pero la verificación sigue valiendo
        // dentro de la ventana post-verificación (30 min).
        $this->travel(11)->minutes();
        $this->assertTrue($service->consumeVerified('grace@example.com', 'registration'));
    }

    public function test_consume_verified_fails_after_grace_window(): void
    {
        Mail::fake();
        $service = $this->service();
        $service->request('late@example.com', 'registration');

        $code = null;
        Mail::assertSent(OtpCode::class, function (OtpCode $mail) use (&$code) {
            $code = $mail->code;

            return true;
        });

        $service->verify('late@example.com', 'registration', $code);

        $this->travel(31)->minutes();
        $this->assertFalse($service->consumeVerified('late@example.com', 'registration'));
    }

    public function test_cooldown_after_max_resends(): void
    {
        Mail::fake();
        $service = $this->service();

        for ($i = 0; $i < 5; $i++) {
            $this->assertTrue($service->request('d@example.com', 'registration'));
        }

        // El 6º envío queda bloqueado por cooldown.
        $this->assertFalse($service->request('d@example.com', 'registration'));
        $this->assertGreaterThan(0, $service->cooldownSecondsRemaining('d@example.com', 'registration'));
    }
}
