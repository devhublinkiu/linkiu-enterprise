<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Validator;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * Los nombres de campo en español salen de lang/es/validation.php ('attributes').
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', 'confirmed', Password::defaults()],
        ];
    }

    /**
     * El correo se guarda y compara en minúsculas en todo el flujo (OTP incluido),
     * así que lo normalizamos ANTES de validar. Evita rechazar correos válidos
     * escritos con mayúsculas (p. ej. "Correo@Gmail.com"), que antes chocaban con
     * la regla `lowercase` y mostraban un error confuso en el paso de contraseña.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('email')) {
            $this->merge([
                'email' => mb_strtolower(trim((string) $this->input('email'))),
            ]);
        }
    }

    /**
     * El correo debe haberse verificado por OTP en esta sesión (Corte 3D). El servidor manda.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $email = mb_strtolower(trim((string) $this->input('email')));

            if ($this->session()->get('registration.verified_email') !== $email) {
                $validator->errors()->add('email', 'Debes verificar tu correo con el código enviado.');
            }
        });
    }
}
