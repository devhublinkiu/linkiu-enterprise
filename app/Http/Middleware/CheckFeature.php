<?php

namespace App\Http\Middleware;

use App\Models\Associate;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Compuerta de módulo por plan.
 *
 * Uso: ->middleware('feature:foros')
 *
 * Ver docs/adr/0002-interruptores-de-modulo-por-plan.md
 *
 * Tres respuestas posibles:
 *   - Módulo apagado en la plataforma (features.is_enabled = false) → 404:
 *     no existe para nadie.
 *   - El plan no lo incluye → redirige a facturación con aviso de mejora.
 *   - Incluido → pasa.
 */
class CheckFeature
{
    public function handle(Request $request, Closure $next, string $key): Response
    {
        $user = $request->user();

        // Los administradores no pasan por la compuerta.
        if (!$user || $user->isAdmin()) {
            return $next($request);
        }

        $associate = $user->associate_id
            ? Associate::with('plan.features')->find($user->associate_id)
            : null;

        $plan = $associate?->plan;

        // Kill-switch global: si el módulo está en el catálogo y apagado para
        // todos, se comporta como si no existiera.
        $feature = $plan?->features->firstWhere('key', $key);
        if ($feature && !$feature->is_enabled) {
            abort(404);
        }

        if ($plan && $plan->allows($key)) {
            return $next($request);
        }

        return redirect()
            ->route('associate.company.billing')
            ->with('error', 'Tu plan actual no incluye este módulo. Cámbialo para acceder.');
    }
}
