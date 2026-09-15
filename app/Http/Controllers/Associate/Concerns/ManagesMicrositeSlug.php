<?php

namespace App\Http\Controllers\Associate\Concerns;

use App\Models\Associate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/**
 * Micrositio › dirección (slug). Plan 0021, corte 21-A.
 *
 * El slug es la dirección pública personalizada (dominio/mi-empresa). Se normaliza
 * siempre en el servidor (fuente de verdad), es único, no puede pisar rutas del
 * sistema (reservadas) y SE DEFINE UNA SOLA VEZ (luego lo bloquea; solo un admin
 * podría cambiarlo).
 */
trait ManagesMicrositeSlug
{
    /**
     * Disponibilidad del slug en vivo (input del panel). Devuelve el valor ya
     * normalizado y si está libre. No expone datos: solo disponible/ocupado.
     */
    public function checkSlug(Request $request): JsonResponse
    {
        $associate = Associate::findOrFail($request->user()->associate_id);
        $slug = Associate::normalizeSlug($request->input('value'));
        [$available, $reason] = $this->evaluate($slug, $associate->id);

        return response()->json([
            'slug' => $slug,
            'available' => $available,
            'reason' => $reason,
        ]);
    }

    /**
     * Guarda el slug (una sola vez). Si ya está definido, se rechaza.
     */
    public function updateSlug(Request $request)
    {
        $associate = Associate::findOrFail($request->user()->associate_id);

        if ($associate->slug) {
            throw ValidationException::withMessages([
                'slug' => 'La dirección ya fue definida y no se puede cambiar.',
            ]);
        }

        $slug = Associate::normalizeSlug($request->input('slug'));
        [$available, $reason] = $this->evaluate($slug, $associate->id);

        if (! $available) {
            throw ValidationException::withMessages(['slug' => $reason]);
        }

        $associate->update(['slug' => $slug]);

        return back()->with('success', 'Dirección del micrositio guardada.');
    }

    /**
     * Reglas de disponibilidad. Devuelve [disponible, motivo|null].
     */
    private function evaluate(string $slug, int $associateId): array
    {
        $min = (int) config('microsite.slug_min', 3);
        $max = (int) config('microsite.slug_max', 60);

        if ($slug === '') {
            return [false, 'Escribe una dirección.'];
        }
        if (strlen($slug) < $min) {
            return [false, "La dirección debe tener al menos {$min} caracteres."];
        }
        if (strlen($slug) > $max) {
            return [false, "La dirección no puede superar {$max} caracteres."];
        }
        if (Associate::isReservedSlug($slug)) {
            return [false, 'Esa dirección está reservada, elige otra.'];
        }
        $taken = Associate::where('slug', $slug)
            ->where('id', '!=', $associateId)
            ->exists();
        if ($taken) {
            return [false, 'Esa dirección ya está en uso.'];
        }

        return [true, null];
    }
}
