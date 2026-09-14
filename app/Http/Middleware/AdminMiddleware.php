<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Protege el panel de administración (/admin/*). Consistente con el `isAdmin` del front
 * (HandleInertiaRequests / AppLayout): superadmin o rol admin. Ver ADR-0006.
 */
class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && ($user->is_superadmin || $user->role === 'admin')) {
            return $next($request);
        }

        abort(403, 'No tienes acceso a esta área.');
    }
}
