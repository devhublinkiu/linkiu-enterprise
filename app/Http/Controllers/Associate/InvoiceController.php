<?php

namespace App\Http\Controllers\Associate;

use App\Http\Controllers\Controller;
use App\Models\Associate;
use App\Models\Invoice;
use App\Models\Payment;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $associate = $user->associate_id ? Associate::find($user->associate_id) : null;

        if (! $associate) {
            return Inertia::render('Associate/Invoices/Index', [
                'invoices' => [],
            ]);
        }

        $invoices = Invoice::where('associate_id', $associate->id)
            ->with('payments')
            // Pendientes antes que pagadas. CASE (portable) en vez de FIELD (solo MySQL).
            ->orderByRaw("CASE status WHEN 'pendiente' THEN 0 WHEN 'pagada' THEN 1 ELSE 2 END")
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($inv) => [
                'id' => $inv->id,
                'type' => $inv->type,
                'invoice_number' => $inv->invoice_number,
                'period' => $inv->period,
                'amount' => $inv->amount,
                'status' => $inv->status,
                'display_status' => $this->displayStatus($inv),
                'external_link' => $inv->external_link,
                'notes' => $inv->notes,
                'document_url' => $inv->document_path
                    ? route('billing.invoice.document', $inv->id)
                    : null,
                'due_date' => $inv->due_date?->format('d/m/Y'),
                'is_overdue' => $inv->due_date ? $inv->due_date->isPast() : false,
                'created_at' => $inv->created_at->format('d/m/Y'),
                'is_unread' => $inv->isUnread(),
            ]);

        // Mark all as read
        Invoice::where('associate_id', $associate->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return Inertia::render('Associate/Invoices/Index', [
            'invoices' => $invoices,
        ]);
    }

    /**
     * Estado para mostrar al asociado, derivado (no guardado). Misma definición
     * que la pantalla Pagar: en revisión = transferencia pendiente; rechazada =
     * último intento rechazado/fallido; vencida = fecha de vencimiento pasada.
     */
    private function displayStatus(Invoice $inv): string
    {
        if ($inv->status === 'pagada') {
            return 'pagada';
        }

        $payments = $inv->payments;

        $hasPendingReview = $payments
            ->where('status', Payment::STATUS_PENDING)
            ->where('method', Payment::METHOD_TRANSFER)
            ->isNotEmpty();
        if ($hasPendingReview) {
            return 'en_revision';
        }

        $hasRejected = $payments
            ->whereIn('status', [Payment::STATUS_REJECTED, Payment::STATUS_FAILED])
            ->isNotEmpty();
        if ($hasRejected) {
            return 'rechazada';
        }

        if ($inv->due_date && $inv->due_date->isPast()) {
            return 'vencida';
        }

        return 'pendiente';
    }
}
