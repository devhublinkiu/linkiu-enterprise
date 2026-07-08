<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Associate;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    public function index()
    {
        $invoices = Invoice::with(['associate', 'creator'])
            ->orderByRaw("FIELD(status, 'pendiente', 'pagada')")
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($inv) => [
                'id'             => $inv->id,
                'associate_name' => $inv->associate->company_name,
                'type'           => $inv->type,
                'period'         => $inv->period,
                'amount'         => $inv->amount,
                'status'         => $inv->status,
                'has_document'   => !empty($inv->document_path),
                'external_link'  => $inv->external_link,
                'creator_name'   => $inv->creator->name,
                'created_at'     => $inv->created_at->format('d/m/Y'),
                'read_at'        => $inv->read_at?->format('d/m/Y H:i'),
            ]);

        $associates = Associate::where('status', 'approved')
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
            'amount'        => 'nullable|numeric|min:0',
            'document'      => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'external_link' => 'nullable|url|max:500',
            'notes'         => 'nullable|string|max:1000',
        ]);

        $path = null;
        if ($request->hasFile('document')) {
            $path = $request->file('document')->store('invoices', 'public');
        }

        $invoice = Invoice::create([
            'associate_id'  => $request->associate_id,
            'created_by'    => auth()->id(),
            'type'          => $request->type,
            'period'        => $request->period,
            'amount'        => $request->amount,
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

    public function markPaid(Invoice $invoice)
    {
        $wasPaid = $invoice->status === 'pagada';
        $invoice->update(['status' => 'pagada']);

        // Renovar el ciclo: al pagar una cuenta de cobro mensual, avanzar el
        // vencimiento un mes (al siguiente día 19). Solo la primera vez que se
        // marca pagada, para no acumular meses si se vuelve a guardar.
        if (!$wasPaid && $invoice->type === 'cuenta_cobro') {
            $associate = $invoice->associate;

            if ($associate) {
                $base = $associate->plan_expires_at ?? now();
                $next = $base->copy()->addMonthNoOverflow()->day(Associate::BILLING_DAY);
                $associate->update(['plan_expires_at' => $next]);

                // Si estaba oculto por vencimiento y el pago lo pone al día, reactivar el perfil.
                $associate->load('plan');
                if (!$associate->is_public && $associate->isSubscriptionActive()) {
                    $associate->update(['is_public' => true]);
                }
            }
        }

        return back()->with('success', 'Factura marcada como pagada.');
    }

    public function destroy(Invoice $invoice)
    {
        if ($invoice->document_path) {
            Storage::disk('public')->delete($invoice->document_path);
        }
        $invoice->delete();

        return back()->with('success', 'Factura eliminada.');
    }
}
