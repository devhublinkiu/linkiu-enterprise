<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleAssociateOnboarding
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // If user is admin, allow everything
        if ($user && $user->is_superadmin) {
            return $next($request);
        }

        // List of routes that are ALWAYS allowed (Universal)
        $allowedUniversal = [
            'logout',
            'welcome',
            'profile.edit',
            'profile.update',
            'profile.destroy',
        ];

        $routeName = $request->route()->getName();

        if (in_array($routeName, $allowedUniversal)) {
            return $next($request);
        }

        // If user is NOT an associate yet (no company registered)
        if (!$user->associate_id) {
            $onboardingRoutes = [
                'associate.company.basic',
                'associate.company.update.basic',
            ];
            
            if (!in_array($routeName, $onboardingRoutes)) {
                return redirect()->route('associate.company.basic');
            }
            return $next($request);
        }

        // From here on, the user HAS an associate_id
        $associate = $user->associate;
        $status = $associate->status;

        // Dashboard is allowed for any existing associate
        if ($routeName === 'dashboard') {
            return $next($request);
        }

        switch ($status) {
            case 'pending':
                // Only allow viewing/editing company info (basic info, etc)
                $allowedPending = [
                    'associate.company.basic',
                    'associate.company.update.basic',
                    'associate.company.characterization',
                    'associate.company.update.characterization',
                    'associate.company.contacts',
                    'associate.company.update.contacts',
                    'associate.company.services',
                    'associate.company.update.services',
                    'associate.company.documentation',
                    'associate.company.update.documentation',
                    'associate.company.gallery',
                    'associate.company.update.gallery',
                    'associate.company.delete.gallery.image',
                    'associate.company.set.cover.image',
                ];
                if (!in_array($routeName, $allowedPending)) {
                    return redirect()->route('dashboard')->with('info', 'Tu perfil está siendo revisado por CAMEP.');
                }
                break;

            case 'verified':
                // Only allow billing and checkout
                $allowedVerified = [
                    'associate.company.billing',
                    'associate.checkout.show',
                    'associate.checkout.store',
                ];
                if (!in_array($routeName, $allowedVerified)) {
                    return redirect()->route('associate.company.billing')->with('info', '¡Felicidades! Has sido admitido. Por favor, elige un plan para activar tu cuenta.');
                }
                break;

            case 'active':
            case 'approved': // Legacy status
                // Allow everything
                return $next($request);

            case 'rejected':
                return redirect()->route('dashboard')->with('error', 'Tu solicitud de afiliación ha sido rechazada. Contacta con CAMEP para más información.');
        }

        return $next($request);
    }
}
