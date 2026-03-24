<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckSubscription
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth()->user();
        
        // If the user is an associate (not admin/superadmin)
        if ($user && $user->associate_id && !$user->isAdmin()) {
            $associate = \App\Models\Associate::find($user->associate_id);
            
            if ($associate && !$associate->isSubscriptionActive()) {
                // If the subscription is NOT active, redirect to billing
                // Allow billing itself through always
                if (!$request->routeIs('associate.company.billing')) {
                    return redirect()->route('associate.company.billing')
                        ->with('error', 'Tu suscripción ha vencido. Por favor renueva tu plan para continuar.');
                }
            }
        }

        return $next($request);
    }
}
