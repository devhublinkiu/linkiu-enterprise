<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;

class SuperAdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        Log::info('SuperAdminMiddleware check', [
            'url' => $request->fullUrl(),
            'auth' => auth()->check(),
            'user' => auth()->user() ? auth()->user()->email : 'null',
            'is_admin' => auth()->user() ? auth()->user()->is_superadmin : 'n/a'
        ]);

        // Si no está autenticado, dejamos que el middleware 'auth' maneje la redirección
        if (!auth()->check()) {
            return $next($request);
        }

        // Si está autenticado, DEBE ser superadmin.
        if (auth()->user()->isSuperAdmin()) {
            return $next($request);
        }

        return response('No tienes permisos para acceder a esta área de la agencia.', 403);
    }
}
