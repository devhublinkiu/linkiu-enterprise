<?php

namespace Tests\Feature\Auth;

use App\Mail\OtpCode;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_forgot_password_screen_can_be_rendered(): void
    {
        $this->get('/forgot-password')->assertStatus(200);
    }

    public function test_reset_code_is_sent_to_existing_user(): void
    {
        Mail::fake();
        $user = User::factory()->create();

        $this->postJson(route('password.email'), ['email' => $user->email])->assertOk();

        Mail::assertSent(OtpCode::class, function (OtpCode $mail) use ($user) {
            return $mail->hasTo($user->email) && $mail->purpose === 'password_reset';
        });
    }

    public function test_unknown_email_gets_generic_response_without_sending(): void
    {
        Mail::fake();

        $this->postJson(route('password.email'), ['email' => 'desconocido@example.com'])
            ->assertOk()
            ->assertJsonStructure(['message']);

        Mail::assertNothingSent();
    }

    public function test_password_can_be_reset_with_valid_code(): void
    {
        Mail::fake();
        $user = User::factory()->create();

        $this->postJson(route('password.email'), ['email' => $user->email]);

        $code = null;
        Mail::assertSent(OtpCode::class, function (OtpCode $mail) use (&$code, $user) {
            if ($mail->hasTo($user->email)) {
                $code = $mail->code;

                return true;
            }

            return false;
        });

        $response = $this->post(route('password.update'), [
            'email' => $user->email,
            'code' => $code,
            'password' => 'nueva-clave-123',
            'password_confirmation' => 'nueva-clave-123',
        ]);

        $response->assertSessionHasNoErrors()->assertRedirect(route('login'));
        $this->assertTrue(Hash::check('nueva-clave-123', $user->fresh()->password));
    }

    public function test_reset_fails_with_invalid_code(): void
    {
        $user = User::factory()->create();

        $response = $this->post(route('password.update'), [
            'email' => $user->email,
            'code' => '000000',
            'password' => 'nueva-clave-123',
            'password_confirmation' => 'nueva-clave-123',
        ]);

        $response->assertSessionHasErrors('code');
    }
}
