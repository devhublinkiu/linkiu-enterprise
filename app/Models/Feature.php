<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Un módulo del catálogo.
 *
 * Ver docs/adr/0002-interruptores-de-modulo-por-plan.md
 */
class Feature extends Model
{
    public const TYPE_BOOLEAN = 'boolean';

    public const TYPE_LIMIT = 'limit';

    /**
     * Correspondencia entre cada módulo y la bandera booleana histórica de
     * `plans`, cuando existe. Es la capa de compatibilidad: mientras un plan no
     * tenga fila en el pivote, los accesores caen a esta columna.
     *
     * Los módulos sin columna histórica (foros, anuncios, vitrina, pago en
     * línea) no aparecen aquí; su valor por defecto lo decide el seeder.
     */
    public const LEGACY_COLUMN = [
        // 'bienes_servicios' es el rename de la antigua 'licitaciones' (plan 0016);
        // conserva la columna histórica como capa de compatibilidad.
        'bienes_servicios' => 'can_download_tenders',
        'servicios' => 'limit_services',
        'galeria' => 'limit_gallery',
        'soporte_prioritario' => 'has_priority_support',
        'resenas' => 'has_reviews',
        'bolsa_empleo' => 'has_job_board',
    ];

    protected $fillable = [
        'key',
        'name',
        'description',
        'type',
        'group',
        'is_enabled',
        'sort',
    ];

    protected $casts = [
        'is_enabled' => 'boolean',
        'sort' => 'integer',
    ];

    public function plans(): BelongsToMany
    {
        return $this->belongsToMany(Plan::class, 'plan_feature')
            ->withPivot(['enabled', 'limit_value'])
            ->withTimestamps();
    }

    public function isLimit(): bool
    {
        return $this->type === self::TYPE_LIMIT;
    }

    public static function legacyColumnFor(string $key): ?string
    {
        return self::LEGACY_COLUMN[$key] ?? null;
    }
}
