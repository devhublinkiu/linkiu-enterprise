<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Bandeja de pagos: donde el equipo valida comprobantes y ve todo lo que ha
 * entrado, sin importar el riel.
 *
 * Ver docs/adr/0001-motor-de-cobro-unificado.md
 */
class PaymentController extends Controller
{
    public function __construct(private PaymentService $payments)
    {
    }

    public function index(Request $request)
    {
        $filter = $request->query('estado', 'pendiente');

        $query = Payment::with(['associate', 'invoice', 'submitter', 'reviewer', 'registrar'])
            ->orderByRaw("FIELD(status, 'pendiente', 'aprobado', 'rechazado', 'fallido', 'cancelado')")
            ->orderBy('created_at', 'desc');

        if (in_array($filter, [
            Payment::STATUS_PENDING,
            Payment::STATUS_APPROVED,
            Payment::STATUS_REJECTED,
        ], true)) {
            $query->where('status', $filter);
        }

        return Inertia::render('Admin/Payments/Index', [
            'filter'   => $filter,
            'counts'   => [
                'pendiente' => Payment::where('status', Payment::STATUS_PENDING)->count(),
                'aprobado'  => Payment::where('status', Payment::STATUS_APPROVED)->count(),
                'rechazado' => Payment::where('status', Payment::STATUS_REJECTED)->count(),
            ],
            'payments' => $query->limit(200)->get()->map(fn (Payment $p) => [
                'id'             => $p->id,
                'associate_name' => $p->associate?->company_name ?? '—',
                'invoice_period' => $p->invoice?->period ?? '—',
                'invoice_id'     => $p->invoice_id,
                'method'         => $p->method,
                'method_label'   => $p->methodLabel(),
                'status'         => $p->status,
                'amount'         => $p->amount,
                'reference'      => $p->reference,
                'proof_url'      => $p->proof_path ? route('billing.payment-proof', $p->id) : null,
                'notes'          => $p->notes,
                'admin_notes'    => $p->admin_notes,
                'paid_at'        => $p->paid_at?->format('d/m/Y'),
                'created_at'     => $p->created_at->format('d/m/Y H:i'),
                'reviewed_at'    => $p->reviewed_at?->format('d/m/Y H:i'),
                'reviewer_name'  => $p->reviewer?->name ?? $p->registrar?->name,
                'applied'        => $p->isApplied(),
                'can_review'     => $p->isPending() && $p->method !== Payment::METHOD_BOLD,
            ]),
        ]);
    }

    public function approve(Request $request, Payment $payment)
    {
        if (!$payment->isPending()) {
            return back()->with('error', 'Este pago ya fue procesado.');
        }

        $payment = $this->payments->approve($payment, $request->user());

        $message = 'Pago aprobado.';
        if ($payment->isApplied() && $payment->associate?->plan_expires_at) {
            $message .= ' Vigencia hasta el ' . $payment->associate->plan_expires_at->format('d/m/Y') . '.';
        }

        return back()->with('success', $message);
    }

    public function reject(Request $request, Payment $payment)
    {
        if (!$payment->isPending()) {
            return back()->with('error', 'Este pago ya fue procesado.');
        }

        $data = $request->validate([
            'admin_notes' => 'required|string|max:1000',
        ]);

        $this->payments->reject($payment, $data['admin_notes'], $request->user());

        return back()->with('success', 'Pago rechazado. El asociado puede volver a intentarlo.');
    }
}
