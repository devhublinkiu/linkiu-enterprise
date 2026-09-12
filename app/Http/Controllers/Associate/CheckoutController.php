<?php

namespace App\Http\Controllers\Associate;

use App\Http\Controllers\Controller;
use App\Models\Associate;
use App\Models\BankAccount;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Plan;
use App\Services\BillingService;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Alta y cambio de plan.
 *
 * Desde el Corte 2 este flujo ya no escribe en `payment_requests`: emite una
 * factura de inscripción o afiliación y manda al asociado a la pantalla de
 * pago, la misma que usa para cualquier otra cuenta de cobro.
 *
 * Ver docs/adr/0001-motor-de-cobro-unificado.md
 */
class CheckoutController extends Controller
{
    public function __construct(private BillingService $billing)
    {
    }

    public function show(Plan $plan)
    {
        $user      = auth()->user();
        $associate = $user->associate;

        // "Primer pago" sigue significando lo mismo: empresa admitida que
        // todavía no ha activado ningún plan.
        $isFirstPayment = $associate && $associate->status === 'verified';

        // Factura de este plan que ya esté esperando pago.
        $openInvoice = $associate
            ? Invoice::where('associate_id', $associate->id)
                ->where('plan_id', $plan->id)
                ->where('status', 'pendiente')
                ->latest()
                ->first()
            : null;

        return Inertia::render('Associate/Billing/Checkout', [
            'plan'            => $plan,
            'bankAccounts'    => BankAccount::where('is_active', true)->orderBy('order')->get(),
            'associateStatus' => $associate?->status,
            'isSignupOnly'    => $isFirstPayment && (bool) $plan->signup_only_first_period && $plan->signup_fee > 0,
            'currentCycle'    => $associate?->billing_cycle ?? 'monthly',
            'openInvoice'     => $openInvoice ? [
                'id'      => $openInvoice->id,
                'period'  => $openInvoice->period,
                'amount'  => $openInvoice->amount,
                'pay_url' => route('associate.invoice.pay', $openInvoice->id),
            ] : null,
        ]);
    }

    /**
     * Emite la factura del plan elegido y lleva al asociado a pagarla.
     */
    public function store(Request $request, Plan $plan)
    {
        $user      = auth()->user();
        $associate = $user->associate;

        if (!$associate) {
            return back()->with('error', 'Primero debes registrar los datos de tu empresa.');
        }

        $isFirstPayment = $associate->status === 'verified';
        $signupOnly     = $isFirstPayment && $plan->signup_only_first_period && $plan->signup_fee > 0;

        $rules = [];
        if (!$signupOnly) {
            $rules['billing_cycle'] = 'required|in:monthly,semiannual,annual';
        }
        $request->validate($rules);

        // El importe sigue las mismas tres reglas de siempre:
        //   - inscripción sola: solo la cuota de inscripción
        //   - primer pago normal: ciclo + inscripción
        //   - renovación o cambio de plan: solo el ciclo
        if ($signupOnly) {
            $amount = (float) $plan->signup_fee;
            $cycle  = 'signup';
        } else {
            $cycle  = $request->billing_cycle;
            $amount = BillingService::amountFor($plan, $cycle);

            if ($isFirstPayment && $plan->signup_fee > 0) {
                $amount += (float) $plan->signup_fee;
            }
        }

        // Se cancela cualquier intento de pago en curso sobre facturas de
        // afiliación anteriores: el asociado acaba de elegir otra cosa.
        $this->cancelOpenSignupInvoices($associate, $plan);

        $invoice = $this->billing->issueSignupInvoice($associate, $plan, $cycle, $amount, $signupOnly);

        // Dejamos anotado el ciclo elegido para que la facturación recurrente
        // cobre lo que corresponde.
        if (!$signupOnly) {
            $associate->update(['billing_cycle' => $cycle]);
        }

        return redirect()
            ->route('associate.invoice.pay', $invoice->id)
            ->with('success', 'Listo. Ahora elige cómo quieres pagar.');
    }

    /**
     * Cierra facturas de afiliación pendientes de otros planes o ciclos, para
     * que el asociado no acumule cobros que ya no va a pagar.
     */
    private function cancelOpenSignupInvoices(Associate $associate, Plan $chosen): void
    {
        $stale = Invoice::where('associate_id', $associate->id)
            ->where('status', 'pendiente')
            ->whereNotNull('plan_id')
            ->where(function ($q) {
                $q->where('period', 'like', 'Afiliación%')
                  ->orWhere('period', 'like', 'Inscripción%');
            })
            ->get();

        foreach ($stale as $invoice) {
            // Si ya hay un comprobante esperando revisión no la tocamos: ese
            // pago tiene que resolverlo un humano.
            $hasPending = Payment::where('invoice_id', $invoice->id)
                ->where('status', Payment::STATUS_PENDING)
                ->where('method', Payment::METHOD_TRANSFER)
                ->exists();

            if ($hasPending) {
                continue;
            }

            Payment::where('invoice_id', $invoice->id)
                ->where('status', Payment::STATUS_PENDING)
                ->update(['status' => Payment::STATUS_CANCELLED]);

            $invoice->delete();
        }
    }
}
