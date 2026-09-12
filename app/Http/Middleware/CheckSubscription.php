<?php

namespace App\Http\Middleware;

use App\Models\Associate;
use App\Services\SubscriptionService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Bloqueo escalonado de la suscripción.
 *
 * Ver docs/adr/0001-motor-de-cobro-unificado.md
 *
 *   al día    → todo
 *   en gracia → todo, con aviso. El perfil sigue público.
 *   vencida   → solo facturación, pago, su propia ficha y cerrar sesión.
 *
 * Antes esto redirigía sin distinguir gracia de vencimiento, y de todas formas
 * solo estaba aplicado a un grupo de rutas. El periodo de gracia que cada plan
 * define no servía de nada.
 */
class CheckSubscription
{
    /**
     * Rutas que siguen abiertas aunque la suscripción esté vencida. Sin esto el
     * asociado no tendría por dónde ponerse al día.
     */
    private const ALWAYS_ALLOWED = [
        'logout',
        'dashboard',
        'profile.edit',
        'profile.update',
        'profile.destroy',

        // Facturación y pago: la puerta nunca se cierra.
        'associate.company.billing',
        'associate.company.invoices.index',
        'associate.checkout.show',
        'associate.checkout.store',
        'associate.invoice.pay',
        'associate.invoice.proof',
        'associate.invoice.online',

        // Documentos propios y de facturación.
        'associate.documents.show',
        'billing.proof',
        'billing.payment-proof',
        'billing.invoice.document',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Los administradores no pasan por aquí.
        if (!$user || !$user->associate_id || $user->isAdmin()) {
            return $next($request);
        }

        $associate = Associate::with('plan')->find($user->associate_id);

        if (!$associate) {
            return $next($request);
        }

        $status = SubscriptionService::statusOf($associate);

        // Al día o en gracia conservan el acceso completo. El aviso de la
        // gracia lo pinta la interfaz con lo que comparte HandleInertiaRequests.
        if ($status !== 'expired') {
            return $next($request);
        }

        if ($this->isAllowed($request)) {
            return $next($request);
        }

        return redirect()
            ->route('associate.company.billing')
            ->with('error', 'Tu suscripción venció. Ponte al día para volver a usar esta sección.');
    }

    private function isAllowed(Request $request): bool
    {
        $name = $request->route()?->getName();

        if (!$name) {
            return false;
        }

        return in_array($name, self::ALWAYS_ALLOWED, true);
    }
}
