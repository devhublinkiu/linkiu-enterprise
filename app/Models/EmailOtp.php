<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * Código OTP por correo (registro / recuperación de contraseña). Ver ADR-0003.
 *
 * @property string $email
 * @property string $purpose
 * @property string $code_hash
 * @property Carbon $expires_at
 * @property int $attempts
 * @property int $resends
 * @property Carbon|null $locked_until
 * @property Carbon|null $verified_at
 */
class EmailOtp extends Model
{
    protected $fillable = [
        'email',
        'purpose',
        'code_hash',
        'expires_at',
        'attempts',
        'resends',
        'locked_until',
        'verified_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'locked_until' => 'datetime',
            'verified_at' => 'datetime',
            'attempts' => 'integer',
            'resends' => 'integer',
        ];
    }
}
