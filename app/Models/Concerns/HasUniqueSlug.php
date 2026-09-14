<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * Genera un slug único al crear (a partir del nombre), evitando colisiones con el índice
 * único de la tabla (dos nombres iguales → sufijo -2, -3…). El slug es ESTABLE: no se
 * regenera al renombrar, para no romper los enlaces públicos (permalinks). Ver plan 0010.
 */
trait HasUniqueSlug
{
    protected static function bootHasUniqueSlug(): void
    {
        static::creating(function (Model $model): void {
            if (empty($model->getAttribute('slug'))) {
                $model->setAttribute(
                    'slug',
                    static::uniqueSlug((string) $model->getAttribute('name')),
                );
            }
        });
    }

    public static function uniqueSlug(string $source, ?int $ignoreId = null): string
    {
        $base = Str::slug($source) ?: 'item';
        $slug = $base;
        $i = 2;

        while (
            static::query()
                ->where('slug', $slug)
                ->when($ignoreId, fn ($q) => $q->whereKeyNot($ignoreId))
                ->exists()
        ) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }
}
