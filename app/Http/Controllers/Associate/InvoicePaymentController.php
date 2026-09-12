<?php

namespace App\Http\Controllers\Associate;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use App\Models\Invoice;
use App\Models\Payment;
use App\Services\Bold\BoldGateway;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Pantalla de pago de una cuenta de cobro.
 *
 * Es la puerta que faltaba: siempre accesible, incluso con la suscripción
 * vencida y en bloqueo duro. Ver docs/adr/0001-motor-de-cobro-unificado.md
 */
class InvoicePaymentController extends Controller
{
    public function __construct(
        private PaymentService $payments,
        private BoldGateway $bold,
    ) {
    }

    /**
     * El asociado solo puede tocar sus propias facturas.
     */
    private function authorizeInvoice(Request $request, Invoice $invoice): void
    {
        $user = $request->user();

        if (!$user->associate_id || $user->associate_id !== $invoice->associate_id) {
            abort(403);
        }
    }

    public function show(Request $request, Invoice $invoice)
    {
        $this->authorizeInvoice($request, $invoice);

        $invoice->load('associate.plan');

        $pendingReview = $this->payments->pendingReviewFor($invoice);

        return Inertia::render('Associate/Invoices/Pay', [
            'invoice' => [
                'id'         => $invoice->id,
                'period'     => $invoice->period,
                'type'       => $invoice->type,
                'cycle'      => $invoice->cycle,
                'amount'     => $invoice->amount,
                'currency'   => $invoice->associate?->plan?->currency ?? 'COP',
                'due_date'   => $invoice->due_date?->format('d/m/Y'),
                'is_overdue' => $invoice->due_date ? $invoice->due_date->isPast() : false,
                'status'     => $invoice->status,
                'notes'      => $invoice->notes,
                'document_url' => $invoice->document_path
                    ? route('billing.invoice.document', $invoice->id)
                    : null,
            ],
            'bankAccounts'  => BankAccount::where('is_active', true)->orderBy('order')->get(),
            'onlineEnabled' => $this->bold->isEnabled(),
            'pendingReview' => $pendingReview ? [
                'id'         => $pendingReview->id,
                'created_at' => $pendingReview->created_at->format('d/m/Y H:i'),
            ] : null,
            'lastRejected'  => $this->lastRejected($invoice),
        ]);
    }

    private function lastRejected(Invoice $invoice): ?array
    {
        $rejected = Payment::where('invoice_id', $invoice->id)
            ->whereIn('status', [Payment::STATUS_REJECTED, Payment::STATUS_FAILED])
            ->latest('reviewed_at')
            ->first();

        if (!$rejected) {
            return null;
        }

        return [
            'method'      => $rejected->methodLabel(),
            'admin_notes' => $rejected->admin_notes,
            'reviewed_at' => $rejected->reviewed_at?->format('d/m/Y H:i'),
        ];
    }

    /**
     * Riel 2: sube el comprobante de la transferencia.
     */
    public function submitProof(Request $request, Invoice $invoice)
    {
        $this->authorizeInvoice($request, $invoice);

        if ($invoice->status === 'pagada') {
            return back()->with('error', 'Esta cuenta de cobro ya está pagada.');
        }

        $data = $request->validate([
            'proof' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'notes' => 'nullable|string|max:500',
        ]);

        $this->payments->submitTransfer(
            $invoice,
            $request->file('proof'),
            $request->user(),
            $data['notes'] ?? null
        );

        return redirect()
            ->route('associate.company.billing')
            ->with('success', '¡Comprobante enviado! CAMEP lo está revisando.');
    }

    /**
     * Riel 1: abre el checkout de la pasarela.
     */
    public function online(Request $request, Invoice $invoice)
    {
        $this->authorizeInvoice($request, $invoice);

        if (!$this->bold->isEnabled()) {
            return back()->with('error', 'El pago en línea no está disponible en este momento.');
        }

        if ($invoice->status === 'pagada') {
            return back()->with('error', 'Esta cuenta de cobro ya está pagada.');
        }

        if (!$invoice->amount || (float) $invoice->amount <= 0) {
            return back()->with('error', 'Esta cuenta de cobro no tiene un monto que cobrar en línea.');
        }

        $payment = $this->payments->startOnlinePayment($invoice, $request->user());

        return Inertia::render('Associate/Invoices/PayOnline', [
            'invoice' => [
                'id'     => $invoice->id,
                'period' => $invoice->period,
                'amount' => $invoice->amount,
            ],
            'scriptUrl' => $this->bold->scriptUrl(),
            'checkout'  => $this->bold->checkoutAttributes(
                $payment,
                route('associate.company.billing')
            ),
        ]);
    }
}
