<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'price_monthly',
        'price_semiannual',
        'price_annual',
        'currency',
        'limit_services',
        'limit_gallery',
        'has_priority_directory',
        'can_download_tenders',
        'has_job_board',
        'has_network',
        'has_reviews',
        'has_priority_support',
        'color_hex',
        'grace_days',
        'is_active',
        'is_popular',
        'signup_fee',
        'signup_only_first_period',
    ];

    protected $casts = [
        'price_monthly' => 'decimal:2',
        'price_semiannual' => 'decimal:2',
        'price_annual' => 'decimal:2',
        'has_priority_directory' => 'boolean',
        'can_download_tenders' => 'boolean',
        'has_job_board' => 'boolean',
        'has_network' => 'boolean',
        'has_reviews' => 'boolean',
        'has_priority_support' => 'boolean',
        'is_active' => 'boolean',
        'is_popular' => 'boolean',
        'limit_services' => 'integer',
        'limit_gallery' => 'integer',
        'grace_days' => 'integer',
        'signup_fee' => 'decimal:2',
        'signup_only_first_period' => 'boolean',
    ];

    public function associates(): HasMany
    {
        return $this->hasMany(Associate::class);
    }

    // ─── Interruptores de módulo ──────────────────────────────────────────────
    // Ver docs/adr/0002-interruptores-de-modulo-por-plan.md

    public function features(): BelongsToMany
    {
        // Tabla pivote explícita: el nombre por defecto de Laravel sería
        // 'feature_plan' (orden alfabético), pero la nuestra es 'plan_feature'.
        return $this->belongsToMany(Feature::class, 'plan_feature')
            ->withPivot(['enabled', 'limit_value'])
            ->withTimestamps();
    }

    /**
     * ¿Este plan incluye el módulo? Tres compuertas en serie:
     *   1. El módulo está encendido en la plataforma (features.is_enabled).
     *   2. El plan lo incluye (plan_feature.enabled).
     *
     * Si el módulo aún no está en el catálogo, cae a la bandera booleana
     * histórica de `plans`; si tampoco existe esa columna, se considera
     * disponible (comportamiento previo: sin control = todos lo tenían).
     */
    public function allows(string $key): bool
    {
        $feature = $this->resolveFeature($key);

        if ($feature) {
            if (!$feature->is_enabled) {
                return false;   // apagado globalmente
            }

            $pivot = $feature->pivot ?? null;
            if ($pivot) {
                return (bool) $pivot->enabled;
            }
            // El módulo existe pero este plan no tiene fila en el pivote: caemos
            // a la columna histórica si la hay.
        }

        return $this->legacyAllows($key);
    }

    /**
     * Límite numérico de un módulo de tipo 'limit'. Devuelve null = ilimitado.
     */
    public function limitFor(string $key): ?int
    {
        $feature = $this->resolveFeature($key);

        if ($feature && $feature->is_enabled) {
            $pivot = $feature->pivot ?? null;
            if ($pivot) {
                if (!$pivot->enabled) {
                    return 0;   // el plan no incluye el módulo: cero permitido
                }
                return $pivot->limit_value === null ? null : (int) $pivot->limit_value;
            }
        }

        // Fallback a la columna histórica (limit_services / limit_gallery).
        $column = Feature::legacyColumnFor($key);
        if ($column && $this->{$column} !== null) {
            $value = (int) $this->{$column};
            return $value === 0 ? null : $value;   // 0 en la columna = ilimitado
        }

        return null;
    }

    private function resolveFeature(string $key): ?Feature
    {
        // Reutiliza la relación ya cargada si está disponible, para no disparar
        // una consulta por cada llamada dentro de una misma petición.
        if ($this->relationLoaded('features')) {
            return $this->features->firstWhere('key', $key);
        }

        return $this->features()->where('key', $key)->first();
    }

    private function legacyAllows(string $key): bool
    {
        $column = Feature::legacyColumnFor($key);

        // Módulo sin columna histórica y sin fila en el pivote: no había control
        // antes (foros, anuncios), así que se mantiene disponible.
        if ($column === null) {
            return true;
        }

        // Los módulos de límite (servicios, galería) nunca se niegan por
        // completo desde la columna: el acceso lo gobierna limitFor(), no allows().
        if (in_array($key, ['servicios', 'galeria'], true)) {
            return true;
        }

        return (bool) $this->{$column};
    }
}
