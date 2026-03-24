<?php

namespace App\Http\Controllers\Associate;

use App\Http\Controllers\Controller;
use App\Models\Associate;
use App\Models\Invoice;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $associate = $user->associate_id ? Associate::find($user->associate_id) : null;

        if (!$associate) {
            return Inertia::render('Associate/Invoices/Index', [
                'invoices' => [],
            ]);
        }

        $invoices = Invoice::where('associate_id', $associate->id)
            ->orderByRaw("FIELD(status, 'pendiente', 'pagada')")
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($inv) => [
                'id'            => $inv->id,
                'type'          => $inv->type,
                'period'        => $inv->period,
                'amount'        => $inv->amount,
                'status'        => $inv->status,
                'external_link' => $inv->external_link,
                'notes'         => $inv->notes,
                'document_url'  => $inv->document_path
                    ? Storage::disk('public')->url($inv->document_path)
                    : null,
                'created_at'    => $inv->created_at->format('d/m/Y'),
                'is_unread'     => $inv->isUnread(),
            ]);

        // Mark all as read
        Invoice::where('associate_id', $associate->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return Inertia::render('Associate/Invoices/Index', [
            'invoices' => $invoices,
        ]);
    }
}
