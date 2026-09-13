<?php

namespace Tests\Feature\Auth;

use App\Mail\NewRegistrationToAdmin;
use App\Mail\OtpCode;
use App\Mail\WelcomeUser;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Completa los pasos de OTP (enviar + verificar) para dejar el correo verificado en sesión.
     * Requiere Mail::fake() activo antes de llamarlo (para leer el código).
     */
    private function passOtp(string $email): void
    {
        $this->postJson(route('register.otp'), ['email' => $email])->assertOk();

        $code = null;
        Mail::assertSent(OtpCode::class, function (OtpCode $mail) use (&$code, $email) {
            if ($mail->hasTo($email)) {
                $code = $mail->code;

                return true;
            }

            return false;
        });

        $this->postJson(route('register.otp.verify'), [
            'email' => $email,
            'code' => $code,
        ])->assertOk();
    }

    public function test_registration_screen_can_be_rendered(): void
    {
        $this->get('/register')->assertStatus(200);
    }

    public function test_send_otp_rejects_already_registered_email(): void
    {
        Mail::fake();
        $user = User::factory()->create();

        $this->postJson(route('register.otp'), ['email' => $user->email])
            ->assertStatus(422)
            ->assertJson(['available' => false]);

        Mail::assertNothingSent();
    }

    public function test_new_users_can_register_after_verifying_email(): void
    {
        Mail::fake();
        $this->passOtp('test@example.com');

        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('associate.company.billing', absolute: false));
        $this->assertNotNull(User::where('email', 'test@example.com')->first()->email_verified_at);
    }

    public function test_registration_is_blocked_without_verified_email(): void
    {
        $response = $this->post('/register', [
            'name' => 'Sin OTP',
            'email' => 'sinotp@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_registration_notifies_admin(): void
    {
        Mail::fake();
        $this->passOtp('nuevo@example.com');

        $this->post('/register', [
            'name' => 'Nuevo Asociado',
            'email' => 'nuevo@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        Mail::assertSent(WelcomeUser::class);
        Mail::assertSent(NewRegistrationToAdmin::class, function (NewRegistrationToAdmin $mail) {
            return $mail->hasTo('afiliate@camepg.org');
        });
    }

    public function test_registration_requires_confirmed_password(): void
    {
        Mail::fake();
        $this->passOtp('confirm@example.com');

        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'confirm@example.com',
            'password' => 'password',
            'password_confirmation' => 'otra-cosa',
        ]);

        $response->assertSessionHasErrors('password');
        $this->assertGuest();
    }
}
