<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Credenciales de Bold configuradas desde admin (fila única). Plan 0019.
 *
 * Guarda las llaves de ambos entornos (pruebas y producción); `environment`
 * marca cuál está en uso. Los secretos van cifrados en reposo (cast `encrypted`).
 * El resto de la app no lee esta tabla: pasa por App\Services\Bold\BoldGateway.
 */
class BoldSetting extends Model
{
    protected $fillable = [
        'test_api_key',
        'test_secret_key',
        'production_api_key',
        'production_secret_key',
        'webhook_secret',
        'environment',
        'is_active',
    ];

    protected $casts = [
        'test_api_key' => 'encrypted',
        'test_secret_key' => 'encrypted',
        'production_api_key' => 'encrypted',
        'production_secret_key' => 'encrypted',
        'webhook_secret' => 'encrypted',
        'is_active' => 'boolean',
    ];

    /**
     * La fila única de configuración (sin crearla si no existe).
     */
    public static function current(): ?self
    {
        return static::query()->first();
    }
}
