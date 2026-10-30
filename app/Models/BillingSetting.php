<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Ajustes globales de cobro (fila única): día de corte y días de prórroga para
 * toda la cámara. Única fuente de verdad; el resto de la app lee por los
 * accesores estáticos, no por la constante vieja ni por plans.grace_days.
 *
 * Valores por defecto si no hay fila: día 19, 5 días de prórroga.
 */
class BillingSetting extends Model
{
    public const DEFAULT_CUTOFF_DAY = 19;

    public const DEFAULT_GRACE_DAYS = 5;

    protected $fillable = [
        'cutoff_day',
        'grace_days',
    ];

    protected $casts = [
        'cutoff_day' => 'integer',
        'grace_days' => 'integer',
    ];

    /** Cache por request para no golpear la tabla en cada cálculo de vigencia. */
    protected static ?self $cached = null;

    public static function current(): self
    {
        return static::$cached ??= static::query()->first()
            ?? new self([
                'cutoff_day' => self::DEFAULT_CUTOFF_DAY,
                'grace_days' => self::DEFAULT_GRACE_DAYS,
            ]);
    }

    /** Olvida la caché (tras guardar cambios en el admin o en tests). */
    public static function forget(): void
    {
        static::$cached = null;
    }

    public static function cutoffDay(): int
    {
        return static::current()->cutoff_day ?: self::DEFAULT_CUTOFF_DAY;
    }

    public static function graceDays(): int
    {
        return (int) static::current()->grace_days;
    }
}
