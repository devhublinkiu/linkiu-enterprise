<?php

namespace App\Services;

use App\Models\Associate;
use Illuminate\Support\Carbon;

/**
 * Único punto donde se calcula y se escribe la vigencia de una suscripción.
 *
 * Ver docs/adr/0001-motor-de-cobro-unificado.md
 *
 * La regla es siempre la misma, venga el pago por donde venga:
 *
 *     base  = max(hoy, plan_expires_at)
 *     nuevo = base + meses del ciclo → día 19
 *
 * Partir de `max(hoy, vencimiento)` es lo que evita que quien renueva
 * adelantado pierda los días que aún le quedaban.
 */
class SubscriptionService
{
    /** Meses que otorga cada ciclo de facturación. */
    public const CYCLE_MONTHS = [
        'monthly'    => 1,
        'semiannual' => 6,
        'annual'     => 12,
        'signup'     => 1,   // inscripción: da un mes de vigencia
    ];

    public const DEFAULT_CYCLE = 'monthly';

    /**
     * Meses que corresponden a un ciclo. Un ciclo desconocido vale un mes.
     */
    public static function monthsFor(?string $cycle): int
    {
        return self::CYCLE_MONTHS[$cycle ?? self::DEFAULT_CYCLE]
            ?? self::CYCLE_MONTHS[self::DEFAULT_CYCLE];
    }

    /**
     * Calcula el nuevo vencimiento sin tocar nada. Función pura: sirve para
     * previsualizar en pantalla antes de confirmar un pago.
     */
    public static function nextExpiration(
        ?Carbon $currentExpiration,
        ?string $cycle = null,
        ?Carbon $now = null
    ): Carbon {
        $now = ($now ?? Carbon::now())->copy();

        // Nunca partimos del pasado: si ya venció, la base es hoy.
        $base = ($currentExpiration && $currentExpiration->greaterThan($now))
            ? $currentExpiration->copy()
            : $now;

        return $base
            ->addMonthsNoOverflow(self::monthsFor($cycle))
            ->day(Associate::BILLING_DAY)
            ->startOfDay();
    }

    /**
     * Aplica un pago aprobado: extiende la vigencia y, si el perfil estaba
     * oculto por vencimiento, lo vuelve a publicar.
     *
     * Devuelve el nuevo vencimiento.
     */
    public function extend(Associate $associate, ?string $cycle = null, ?Carbon $now = null): Carbon
    {
        $newExpiration = self::nextExpiration($associate->plan_expires_at, $cycle, $now);

        $associate->plan_expires_at = $newExpiration;
        $associate->save();

        $this->republishIfDue($associate);

        return $newExpiration;
    }

    /**
     * Fija una vigencia concreta (alta y cambios de plan, donde el ciclo se
     * cuenta desde el momento del pago porque no hay vigencia previa que
     * respetar en ese plan).
     */
    public function activate(Associate $associate, int $planId, ?string $cycle = null, ?Carbon $now = null): Carbon
    {
        $samePlan = (int) $associate->plan_id === (int) $planId;

        // Si renueva su mismo plan, respetamos los días que le quedaban.
        // Si cambia de plan, el ciclo arranca desde el pago.
        $base = $samePlan ? $associate->plan_expires_at : null;

        $newExpiration = self::nextExpiration($base, $cycle, $now);

        $associate->plan_id         = $planId;
        $associate->plan_expires_at = $newExpiration;
        $associate->save();

        $this->republishIfDue($associate);

        return $newExpiration;
    }

    /**
     * Vuelve a publicar el perfil si la suscripción quedó al día y el perfil
     * estaba oculto por el corte automático.
     */
    public function republishIfDue(Associate $associate): void
    {
        if ($associate->is_public) {
            return;
        }

        $associate->load('plan');

        if ($associate->isSubscriptionActive()) {
            $associate->update(['is_public' => true]);
        }
    }

    /**
     * Estado de la suscripción derivado de la fecha, no almacenado.
     *
     * none | active | grace | expired
     */
    public static function statusOf(Associate $associate): string
    {
        if (!$associate->plan_id || !$associate->plan_expires_at) {
            return 'none';
        }

        $now = Carbon::now();

        if ($now->lessThanOrEqualTo($associate->plan_expires_at)) {
            return 'active';
        }

        $graceDays = $associate->plan->grace_days ?? 0;

        return $now->lessThanOrEqualTo($associate->plan_expires_at->copy()->addDays($graceDays))
            ? 'grace'
            : 'expired';
    }
}
