<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BillingDocumentController;
use App\Http\Controllers\Controller;
use App\Models\Associate;
use App\Models\Invoice;
use App\Models\Payment;
use App\Services\PaymentService;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    public function __construct(private PaymentService $payments)
    {
    }

    public function index()
    {
        $invoices = Invoice::with(['associate', 'creator', 'payer'])
            ->orderByRaw("FIELD(status, 'pendiente', 'pagada')")
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($inv) => [
                'id'             => $inv->id,
                'associate_name' => $inv->associate?->company_name ?? '—',
                'type'           => $inv->type,
                'period'         => $inv->period,
                'cycle'          => $inv->cycle,
                'amount'         => $inv->amount,
                'due_date'       => $inv->due_date?->format('d/m/Y'),
                'status'         => $inv->status,
                'has_document'   => !empty($inv->document_path),
                'external_link'  => $inv->external_link,
                // Las cuentas de cobro del cron no tienen autor humano.
                'creator_name'   => $inv->creator?->name ?? 'Sistema',
                'payment_method' => $inv->payment_method,
                'payment_reference' => $inv->payment_reference,
                'paid_at'        => $inv->paid_at?->format('d/m/Y'),
                'payer_name'     => $inv->payer?->name,
                'created_at'     => $inv->created_at->format('d/m/Y'),
                'read_at'        => $inv->read_at?->format('d/m/Y H:i'),
            ]);

        // Cualquier empresa ya admitida puede recibir un cobro. Filtrar solo por
        // 'approved' dejaba fuera a las 'verified' (admitidas, aún sin plan) y a
        // las 'active', que también existen en el ENUM.
        $associates = Associate::whereIn('status', ['verified', 'approved', 'active'])
            ->orderBy('company_name')
            ->get(['id', 'company_name']);

        return Inertia::render('Admin/Invoices/Index', [
            'invoices'   => $invoices,
            'associates' => $associates,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'associate_id'  => 'required|exists:associates,id',
            'type'          => 'required|in:factura,cuenta_cobro',
            'period'        => 'required|string|max:50',
            'cycle'         => 'nullable|in:monthly,semiannual,annual',
            'amount'        => 'nullable|numeric|min:0',
            'due_date'      => 'nullable|date',
            'document'      => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'external_link' => 'nullable|url|max:500',
            'notes'         => 'nullable|string|max:1000',
        ]);

        $path = null;
        if ($request->hasFile('document')) {
            $path = $request->file('document')->store('invoices', BillingDocumentController::DISK);
        }

        $invoice = Invoice::create([
            'associate_id'  => $request->associate_id,
            'created_by'    => auth()->id(),
            'type'          => $request->type,
            'period'        => $request->period,
            'cycle'         => $request->cycle ?? SubscriptionService::DEFAULT_CYCLE,
            'amount'        => $request->amount,
            'due_date'      => $request->due_date,
            'document_path' => $path,
            'external_link' => $request->external_link,
            'notes'         => $request->notes,
            'status'        => 'pendiente',
        ]);

        try {
            $recipientEmail = $invoice->associate->users->first()?->email ?? $invoice->associate->billing_email;
            if ($recipientEmail) {
                \Illuminate\Support\Facades\Mail::to($recipientEmail)->send(new \App\Mail\NewInvoiceGenerated($invoice));
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error enviando correo de nueva factura: ' . $e->getMessage());
        }

        return redirect()->route('admin.invoices.index')
            ->with('success', 'Factura subida correctamente.');
    }

    /**
     * Atajo sin detalle. Deja igualmente rastro en `payments`, con el medio
     * marcado como "otro", para que ninguna factura pagada quede sin
     * transacción asociada.
     */
    public function markPaid(Request $request, Invoice $invoice)
    {
        if ($invoice->status === 'pagada') {
            return back()->with('error', 'Esta factura ya figura como pagada.');
        }

        $this->payments->registerManual($invoice, [
            'method'  => Payment::METHOD_OTHER,
            'paid_at' => now()->toDateString(),
            'notes'   => 'Marcada como pagada sin detalle de medio de pago.',
        ], $request->user());

        return back()->with('success', 'Factura marcada como pagada.');
    }

    /**
     * Riel 3 del motor de cobro: el asociado pagó por un canal que la
     * plataforma no ve (efectivo, ventanilla, consignación) y un administrador
     * lo asienta en su nombre.
     *
     * Ver docs/adr/0001-motor-de-cobro-unificado.md
     */
    public function registerPayment(Request $request, Invoice $invoice)
    {
        if ($invoice->status === 'pagada') {
            return back()->with('error', 'Esta factura ya figura como pagada.');
        }

        $data = $request->validate([
            'payment_method'    => 'required|in:' . implode(',', array_keys(Payment::MANUAL_METHODS)),
            'paid_at'           => 'required|date|before_or_equal:today',
            'payment_reference' => 'nullable|string|max:100',
            'payment_notes'     => 'nullable|string|max:1000',
        ]);

        $payment = $this->payments->registerManual($invoice, [
            'method'    => $data['payment_method'],
            'paid_at'   => $data['paid_at'],
            'reference' => $data['payment_reference'] ?? null,
            'notes'     => $data['payment_notes'] ?? null,
        ], $request->user());

        $message = 'Pago registrado.';
        if ($payment->isApplied() && $invoice->fresh()->associate?->plan_expires_at) {
            $message .= ' Vigencia extendida hasta el '
                . $invoice->fresh()->associate->plan_expires_at->format('d/m/Y') . '.';
        }

        return back()->with('success', $message);
    }

    public function destroy(Invoice $invoice)
    {
        if ($invoice->document_path) {
            // El archivo puede estar en el disco privado (nuevo) o en el
            // público (anterior a este cambio). Se limpian ambos.
            Storage::disk(BillingDocumentController::DISK)->delete($invoice->document_path);
            Storage::disk('public')->delete($invoice->document_path);
        }
        $invoice->delete();

        return back()->with('success', 'Factura eliminada.');
    }
}
