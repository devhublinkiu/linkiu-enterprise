<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SuperAdminMiddleware
{
    /**
     * Handle an incoming request. Solo superadmin (más estricto que 'admin').
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Si no está autenticado, dejamos que el middleware 'auth' maneje la redirección.
        if (! auth()->check()) {
            return $next($request);
        }

        if (auth()->user()->isSuperAdmin()) {
            return $next($request);
        }

        abort(403, 'No tienes acceso a esta área.');
    }
}
