<?php

namespace App\Services;

use App\Models\Associate;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

/**
 * Entrada única de todos los rieles de pago.
 *
 * Ver docs/adr/0001-motor-de-cobro-unificado.md
 *
 *   Riel 1 · Bold          → start()    → el webhook llama a approve()
 *   Riel 2 · Transferencia → submitTransfer() → un admin llama a approve()
 *   Riel 3 · Efectivo      → registerManual()  (nace ya aprobado)
 *
 * Los tres terminan en apply(), que es lo único que mueve la vigencia.
 */
class PaymentService
{
    public function __construct(
        private SubscriptionService $subscriptions,
    ) {
    }

    // ─── Riel 1 · Bold ────────────────────────────────────────────────────────

    /**
     * Abre un intento de pago en línea. Si ya hay uno pendiente para esta
     * factura lo reutiliza, para no sembrar referencias huérfanas cada vez que
     * el asociado recarga la pantalla.
     */
    public function startOnlinePayment(Invoice $invoice, ?User $user = null): Payment
    {
        $existing = Payment::where('invoice_id', $invoice->id)
            ->where('method', Payment::METHOD_BOLD)
            ->where('status', Payment::STATUS_PENDING)
            ->latest()
            ->first();

        if ($existing) {
            return $existing;
        }

        return Payment::create([
            'invoice_id'   => $invoice->id,
            'associate_id' => $invoice->associate_id,
            'method'       => Payment::METHOD_BOLD,
            'status'       => Payment::STATUS_PENDING,
            'amount'       => $invoice->amount ?? 0,
            'currency'     => $invoice->associate?->plan?->currency ?? 'COP',
            'reference'    => $this->newReference($invoice),
            'submitted_by' => $user?->id,
        ]);
    }

    /**
     * Referencia única con la que Bold nos devuelve el pago. Lleva el id de la
     * factura para poder rastrearla a ojo en el panel de la pasarela.
     */
    private function newReference(Invoice $invoice): string
    {
        return 'CAMEP-' . $invoice->id . '-' . strtoupper(Str::random(8));
    }

    // ─── Riel 2 · Transferencia ───────────────────────────────────────────────

    /**
     * El asociado sube el comprobante de una transferencia. Queda esperando
     * revisión.
     */
    public function submitTransfer(Invoice $invoice, UploadedFile $proof, User $user, ?string $notes = null): Payment
    {
        // Un comprobante bancario no puede quedar accesible por URL directa.
        $path = $proof->store('payment-proofs', \App\Http\Controllers\BillingDocumentController::DISK);

        // Solo puede haber un comprobante en revisión por factura: el nuevo
        // reemplaza al anterior.
        Payment::where('invoice_id', $invoice->id)
            ->where('method', Payment::METHOD_TRANSFER)
            ->where('status', Payment::STATUS_PENDING)
            ->update(['status' => Payment::STATUS_CANCELLED]);

        $payment = Payment::create([
            'invoice_id'   => $invoice->id,
            'associate_id' => $invoice->associate_id,
            'method'       => Payment::METHOD_TRANSFER,
            'status'       => Payment::STATUS_PENDING,
            'amount'       => $invoice->amount ?? 0,
            'currency'     => $invoice->associate?->plan?->currency ?? 'COP',
            'proof_path'   => $path,
            'submitted_by' => $user->id,
            'notes'        => $notes,
        ]);

        $this->notifyAdminOfProof($payment);

        return $payment;
    }

    // ─── Riel 3 · Efectivo u otro canal ───────────────────────────────────────

    /**
     * Un administrador asienta un pago que la plataforma no vio. Nace aprobado
     * y aplica de inmediato.
     *
     * @param array{method:string,paid_at:string,reference?:?string,notes?:?string,amount?:?float} $data
     */
    public function registerManual(Invoice $invoice, array $data, User $admin): Payment
    {
        $payment = Payment::create([
            'invoice_id'    => $invoice->id,
            'associate_id'  => $invoice->associate_id,
            'method'        => $data['method'],
            'status'        => Payment::STATUS_APPROVED,
            'amount'        => $data['amount'] ?? $invoice->amount ?? 0,
            'currency'      => $invoice->associate?->plan?->currency ?? 'COP',
            // La referencia es opcional aquí; si viene vacía no ocupamos el
            // índice único con una cadena vacía.
            'reference'     => !empty($data['reference']) ? $data['reference'] : null,
            'paid_at'       => Carbon::parse($data['paid_at']),
            'registered_by' => $admin->id,
            'reviewed_by'   => $admin->id,
            'reviewed_at'   => now(),
            'notes'         => $data['notes'] ?? null,
        ]);

        $this->apply($payment);

        return $payment->fresh();
    }

    // ─── Aprobación y aplicación ──────────────────────────────────────────────

    /**
     * Aprueba un pago pendiente y lo aplica. Usado por el admin al validar un
     * comprobante y por el webhook de Bold.
     */
    public function approve(Payment $payment, ?User $reviewer = null, array $gateway = []): Payment
    {
        if ($payment->isApplied()) {
            return $payment;   // ya se aplicó; nada que hacer
        }

        $payment->fill([
            'status'      => Payment::STATUS_APPROVED,
            'reviewed_by' => $reviewer?->id,
            'reviewed_at' => now(),
            'paid_at'     => $payment->paid_at ?? now(),
        ]);

        if (!empty($gateway['payment_id'])) {
            $payment->gateway_payment_id = $gateway['payment_id'];
        }
        if (!empty($gateway['payload'])) {
            $payment->gateway_payload = $gateway['payload'];
        }

        $payment->save();

        $this->apply($payment);

        return $payment->fresh();
    }

    public function reject(Payment $payment, string $reason, ?User $reviewer = null, array $gateway = []): Payment
    {
        if ($payment->isApplied()) {
            // Un pago ya aplicado no se revierte por aquí: hay que emitir una
            // nota de ajuste. Se deja constancia y no se toca la vigencia.
            Log::warning("Se intentó rechazar el pago {$payment->id}, que ya había extendido la suscripción.");
            return $payment;
        }

        $payment->fill([
            'status'      => $gateway ? Payment::STATUS_FAILED : Payment::STATUS_REJECTED,
            'admin_notes' => $reason,
            'reviewed_by' => $reviewer?->id,
            'reviewed_at' => now(),
        ]);

        if (!empty($gateway['payload'])) {
            $payment->gateway_payload = $gateway['payload'];
        }

        $payment->save();

        return $payment->fresh();
    }

    /**
     * El cuello de botella: marca la factura pagada y extiende la vigencia.
     *
     * Idempotente por `applied_at` y protegido con un bloqueo de fila, porque
     * el webhook de Bold puede llegar dos veces a la vez.
     */
    public function apply(Payment $payment): ?Carbon
    {
        $outcome = DB::transaction(function () use ($payment) {
            /** @var Payment $locked */
            $locked = Payment::whereKey($payment->id)->lockForUpdate()->first();

            if (!$locked || $locked->applied_at !== null || $locked->status !== Payment::STATUS_APPROVED) {
                return null;
            }

            $invoice = Invoice::whereKey($locked->invoice_id)->lockForUpdate()->first();

            $locked->applied_at = now();
            $locked->save();

            if (!$invoice) {
                return null;
            }

            $invoice->fill([
                'status'            => 'pagada',
                'payment_method'    => $locked->method,
                'payment_reference' => $locked->reference,
                'payment_notes'     => $locked->notes,
                'paid_at'           => $locked->paid_at ?? now(),
                'paid_by'           => $locked->registered_by ?? $locked->reviewed_by,
            ])->save();

            // Solo una cuenta de cobro renueva el ciclo. Una factura suelta
            // (un servicio puntual) no mueve la suscripción.
            if ($invoice->type !== 'cuenta_cobro') {
                return null;
            }

            $associate = Associate::find($invoice->associate_id);
            if (!$associate) {
                return null;
            }

            // El plan que se está pagando manda. El alta y los cambios de plan
            // fijan aquí el plan del asociado; extend() solo mueve fechas. Sin
            // esto, tras el primer pago el asociado se queda sin plan_id y su
            // suscripción figura inactiva aunque acabe de pagar.
            if ($invoice->plan_id) {
                $associate->plan_id = $invoice->plan_id;
            }

            $newExpiration = $this->subscriptions->extend(
                $associate,
                $invoice->cycle ?? $associate->billing_cycle ?? SubscriptionService::DEFAULT_CYCLE
            );

            // Un primer pago admite definitivamente al asociado: pasa de
            // 'verified' (admitido, sin plan) a 'approved' (acceso completo).
            // Sin esto, el asociado paga pero el onboarding lo deja encerrado
            // en la pantalla de facturación.
            if ($associate->status === 'verified') {
                $associate->status = 'approved';
                $associate->save();
            }

            return ['payment' => $locked, 'expiration' => $newExpiration];
        });

        if (!$outcome) {
            return null;
        }

        // El correo va FUERA de la transacción: un fallo de correo no debe
        // revertir la aplicación del pago, ni el envío debe alargar el bloqueo
        // de las filas mientras dura el round-trip al servidor de correo.
        $this->notifyAssociateOfApproval($outcome['payment'], $outcome['expiration']);

        return $outcome['expiration'];
    }

    // ─── Consultas ────────────────────────────────────────────────────────────

    /** Pago que el asociado tiene esperando revisión sobre esta factura. */
    public function pendingReviewFor(Invoice $invoice): ?Payment
    {
        return Payment::where('invoice_id', $invoice->id)
            ->where('status', Payment::STATUS_PENDING)
            ->where('method', Payment::METHOD_TRANSFER)
            ->latest()
            ->first();
    }

    // ─── Correos (un fallo nunca tumba la operación) ──────────────────────────

    private function notifyAdminOfProof(Payment $payment): void
    {
        // defer(): el correo se envía DESPUÉS de responder. Ver ADR / T3 de
        // docs/bold-integracion.md. Así ninguna respuesta espera el round-trip
        // al servidor de correo, sin depender de un worker de cola.
        defer(function () use ($payment) {
            $recipient = config('mail.admin_recipient', env('ADMIN_EMAIL'));
            if (!$recipient) {
                return;
            }

            try {
                Mail::to($recipient)->send(new \App\Mail\PaymentProofUploaded($payment));
            } catch (\Exception $e) {
                Log::error('Error avisando al admin de un comprobante nuevo: ' . $e->getMessage());
            }
        });
    }

    private function notifyAssociateOfApproval(Payment $payment, Carbon $newExpiration): void
    {
        // defer(): crítico para el webhook de Bold, que debe responder en ≤2 s
        // o la pasarela reintenta. El pago ya quedó aplicado en la base; el
        // correo sale tras devolver la respuesta.
        defer(function () use ($payment, $newExpiration) {
            $recipient = $payment->associate?->users->first()?->email
                ?? $payment->associate?->billing_email;

            if (!$recipient) {
                return;
            }

            try {
                Mail::to($recipient)->send(new \App\Mail\PaymentSettled($payment, $newExpiration));
            } catch (\Exception $e) {
                Log::error('Error avisando al asociado del pago aplicado: ' . $e->getMessage());
            }
        });
    }
}
