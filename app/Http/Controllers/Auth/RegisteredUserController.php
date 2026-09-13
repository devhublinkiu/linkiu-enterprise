<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Mail\NewRegistrationToAdmin;
use App\Mail\WelcomeUser;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function __construct(private OtpService $otp) {}

    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Paso 1a — ¿el correo está disponible? (revela existencia a propósito, para ofrecer login).
     */
    public function checkEmail(Request $request): JsonResponse
    {
        $request->validate(['email' => ['required', 'email']]);
        $email = mb_strtolower(trim((string) $request->input('email')));

        return response()->json(['available' => ! User::where('email', $email)->exists()]);
    }

    /**
     * Paso 1b — enviar el código OTP al correo (si está disponible).
     */
    public function sendOtp(Request $request): JsonResponse
    {
        $request->validate(['email' => ['required', 'email']]);
        $email = mb_strtolower(trim((string) $request->input('email')));

        if (User::where('email', $email)->exists()) {
            return response()->json(['available' => false], 422);
        }

        if (! $this->otp->request($email, 'registration')) {
            return response()->json([
                'sent' => false,
                'cooldown' => $this->otp->cooldownSecondsRemaining($email, 'registration'),
            ], 429);
        }

        return response()->json(['sent' => true]);
    }

    /**
     * Paso 2 — verificar el código. Al pasar, marca el correo como verificado en la sesión.
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'code' => ['required', 'string'],
        ]);
        $email = mb_strtolower(trim((string) $request->input('email')));

        if (! $this->otp->verify($email, 'registration', (string) $request->input('code'))) {
            return response()->json(['verified' => false], 422);
        }

        $request->session()->put('registration.verified_email', $email);

        return response()->json(['verified' => true]);
    }

    /**
     * Paso 3 — crear la cuenta (RegisterRequest exige el correo verificado en sesión).
     *
     * @throws ValidationException
     */
    public function store(RegisterRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $email = mb_strtolower(trim($validated['email']));

        // Defensa en profundidad: consume la verificación (uso único).
        if (! $this->otp->consumeVerified($email, 'registration')) {
            return back()->withErrors(['email' => 'Debes verificar tu correo antes de continuar.']);
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $email,
            'password' => Hash::make($validated['password']),
        ]);
        $user->forceFill(['email_verified_at' => now()])->save();

        $request->session()->forget('registration.verified_email');

        event(new Registered($user));

        try {
            Mail::to($user->email)->send(new WelcomeUser($user));

            $adminRecipient = config('mail.admin_recipient') ?: 'afiliate@camepg.org';
            Mail::to($adminRecipient)->send(new NewRegistrationToAdmin($user));
        } catch (\Exception $e) {
            Log::error('Error enviando correos de registro: '.$e->getMessage());
        }

        Auth::login($user);

        return redirect(route('associate.company.billing'));
    }
}
