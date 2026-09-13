<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetController extends Controller
{
    public function __construct(private OtpService $otp) {}

    /**
     * Pantalla de recuperación (pedir código + nueva contraseña).
     */
    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword');
    }

    /**
     * Envía el código OTP. Responde SIEMPRE genérico (anti-enumeración): no revela si el
     * correo existe.
     */
    public function sendOtp(Request $request): JsonResponse
    {
        $request->validate(['email' => ['required', 'email']]);
        $email = mb_strtolower(trim((string) $request->input('email')));

        if (User::where('email', $email)->exists()) {
            $this->otp->request($email, 'password_reset');
        }

        return response()->json([
            'message' => 'Si el correo está registrado, te enviamos un código.',
        ]);
    }

    /**
     * Verifica el código y actualiza la contraseña.
     */
    public function reset(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'code' => ['required', 'string'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);
        $email = mb_strtolower(trim((string) $request->input('email')));

        if (! $this->otp->verify($email, 'password_reset', (string) $request->input('code'))) {
            return back()->withErrors(['code' => 'El código es inválido o venció.']);
        }

        $user = User::where('email', $email)->first();

        if (! $user) {
            return back()->withErrors(['email' => 'No encontramos una cuenta con ese correo.']);
        }

        $user->forceFill([
            'password' => Hash::make((string) $request->input('password')),
            'remember_token' => Str::random(60),
        ])->save();

        $this->otp->consumeVerified($email, 'password_reset');

        event(new PasswordReset($user));

        return redirect()->route('login')->with('status', 'Tu contraseña se actualizó. Inicia sesión.');
    }
}
