<?php

namespace App\Services;

use App\Mail\NewInvoiceGenerated;
use App\Models\Associate;
use App\Models\Invoice;
use App\Models\Plan;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Emisión de cuentas de cobro.
 *
 * Ver docs/adr/0001-motor-de-cobro-unificado.md y el calendario de cortes en
 * docs/adr/0002-interruptores-de-modulo-por-plan.md
 */
class BillingService
{
    /** Días que tiene una factura de reactivación para pagarse. */
    public const REACTIVATION_DUE_DAYS = 5;

    /**
     * Etiqueta del periodo. Es la clave que evita duplicados: solo puede haber
     * una cuenta de cobro por asociado y periodo.
     */
    public static function periodLabel(Carbon $date, string $prefix = 'Mensualidad'): string
    {
        return $prefix . ' - ' . ucfirst($date->copy()->locale('es')->isoFormat('MMMM YYYY'));
    }

    /**
     * ¿Ya existe una cuenta de cobro de este asociado para este periodo?
     */
    public function periodAlreadyBilled(Associate $associate, string $periodLabel): bool
    {
        return Invoice::where('associate_id', $associate->id)
            ->where('period', $periodLabel)
            ->exists();
    }

    /**
     * Cuentas de cobro que el asociado tiene sin pagar.
     */
    public function pendingInvoices(Associate $associate)
    {
        return Invoice::where('associate_id', $associate->id)
            ->where('status', 'pendiente')
            ->orderBy('created_at')
            ->get();
    }

    /**
     * Emite la cuenta de cobro del periodo. Devuelve null si ya existía.
     */
    public function issuePeriodInvoice(
        Associate $associate,
        Carbon $period,
        ?int $createdBy = null,
        ?string $notes = null
    ): ?Invoice {
        $plan = $associate->plan;
        if (!$plan) {
            return null;
        }

        $cycle       = $associate->billing_cycle ?: SubscriptionService::DEFAULT_CYCLE;
        $periodLabel = self::periodLabel($period, self::prefixFor($cycle));

        if ($this->periodAlreadyBilled($associate, $periodLabel)) {
            return null;
        }

        return Invoice::create([
            'associate_id' => $associate->id,
            'created_by'   => $createdBy,
            'plan_id'      => $plan->id,
            'type'         => 'cuenta_cobro',
            'period'       => $periodLabel,
            'cycle'        => $cycle,
            'amount'       => self::amountFor($plan, $cycle),
            'due_date'     => $period->copy()->day(Associate::BILLING_DAY),
            'notes'        => $notes ?? 'Cuenta de cobro generada automáticamente. Fecha de pago: día ' . Associate::BILLING_DAY . '.',
            'status'       => 'pendiente',
        ]);
    }

    /**
     * Emite una cuenta de cobro de reactivación para un asociado que venció y
     * no tiene nada pendiente que pagar.
     *
     * Este es el caso que hoy dejaba al asociado sin salida: el cron mensual
     * deja de emitirle porque su vencimiento ya no cae en el mes en curso, y
     * sin factura pendiente no tiene por dónde ponerse al día.
     */
    public function issueReactivationInvoice(Associate $associate): ?Invoice
    {
        $plan = $associate->plan;
        if (!$plan) {
            return null;
        }

        $cycle       = $associate->billing_cycle ?: SubscriptionService::DEFAULT_CYCLE;
        $periodLabel = self::periodLabel(Carbon::now(), 'Reactivación');

        if ($this->periodAlreadyBilled($associate, $periodLabel)) {
            return null;
        }

        return Invoice::create([
            'associate_id' => $associate->id,
            'created_by'   => null,
            'plan_id'      => $plan->id,
            'type'         => 'cuenta_cobro',
            'period'       => $periodLabel,
            'cycle'        => $cycle,
            'amount'       => self::amountFor($plan, $cycle),
            'due_date'     => Carbon::now()->addDays(self::REACTIVATION_DUE_DAYS),
            'notes'        => 'Cuenta de cobro para reactivar la suscripción vencida.',
            'status'       => 'pendiente',
        ]);
    }

    /**
     * Avisa al asociado de una cuenta de cobro nueva. Un fallo de correo nunca
     * debe tumbar la emisión.
     */
    public function notify(Invoice $invoice): bool
    {
        $recipient = $invoice->associate?->users->first()?->email
            ?? $invoice->associate?->billing_email;

        if (!$recipient) {
            return false;
        }

        try {
            Mail::to($recipient)->send(new NewInvoiceGenerated($invoice));
            return true;
        } catch (\Exception $e) {
            Log::error("Error enviando cuenta de cobro (factura {$invoice->id}): " . $e->getMessage());
            return false;
        }
    }

    /**
     * Emite la factura del alta o del cambio de plan: lo que el asociado eligió
     * en el checkout.
     *
     * Sustituye a `payment_requests` como documento de cobro del alta.
     * Ver docs/adr/0001-motor-de-cobro-unificado.md
     */
    public function issueSignupInvoice(
        Associate $associate,
        Plan $plan,
        string $cycle,
        float $amount,
        bool $signupOnly = false
    ): Invoice {
        $concept = $signupOnly
            ? 'Inscripción'
            : 'Afiliación · ' . self::cycleLabel($cycle);

        return Invoice::create([
            'associate_id' => $associate->id,
            'created_by'   => null,
            'plan_id'      => $plan->id,
            // Es cuenta de cobro para que al pagarse renueve el ciclo.
            'type'         => 'cuenta_cobro',
            'period'       => $concept . ' - ' . $plan->name,
            'cycle'        => $signupOnly ? 'signup' : $cycle,
            'amount'       => $amount,
            'due_date'     => Carbon::now()->addDays(self::REACTIVATION_DUE_DAYS),
            'notes'        => $signupOnly
                ? 'Inscripción al plan ' . $plan->name . '. Otorga un mes de vigencia.'
                : 'Afiliación al plan ' . $plan->name . '.',
            'status'       => 'pendiente',
        ]);
    }

    public static function cycleLabel(?string $cycle): string
    {
        return match ($cycle) {
            'semiannual' => 'Semestral',
            'annual'     => 'Anual',
            'signup'     => 'Inscripción',
            default      => 'Mensual',
        };
    }

    public static function amountFor($plan, ?string $cycle): float
    {
        return (float) match ($cycle) {
            'semiannual' => $plan->price_semiannual,
            'annual'     => $plan->price_annual,
            default      => $plan->price_monthly,
        };
    }

    private static function prefixFor(?string $cycle): string
    {
        return match ($cycle) {
            'semiannual' => 'Semestralidad',
            'annual'     => 'Anualidad',
            default      => 'Mensualidad',
        };
    }
}
