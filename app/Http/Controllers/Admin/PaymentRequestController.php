<?php

namespace App\Http\Controllers\Admin;

use App\Events\PaymentRequestReviewed;
use App\Http\Controllers\Controller;
use App\Models\Associate;
use App\Models\Invoice;
use App\Models\PaymentRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PaymentRequestController extends Controller
{
    public function index()
    {
        $requests = PaymentRequest::with(['user', 'plan', 'reviewer'])
            ->orderByRaw("FIELD(status, 'pending', 'approved', 'rejected')")
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($req) {
                return [
                    'id'           => $req->id,
                    'user_name'    => $req->user->name,
                    'user_email'   => $req->user->email,
                    'plan_name'    => $req->plan->name,
                    'plan_color'   => $req->plan->color_hex,
                    'billing_cycle'=> $req->billing_cycle,
                    'amount'       => $req->amount,
                    'status'       => $req->status,
                    'created_at'   => $req->created_at->format('d/m/Y H:i'),
                    'reviewed_at'  => $req->reviewed_at?->format('d/m/Y H:i'),
                    'reviewer_name'=> $req->reviewer?->name,
                ];
            });

        return Inertia::render('Admin/PaymentRequests/Index', [
            'requests' => $requests,
        ]);
    }

    public function show(PaymentRequest $paymentRequest)
    {
        $paymentRequest->load(['user', 'plan', 'reviewer']);

        return Inertia::render('Admin/PaymentRequests/Show', [
            'paymentRequest' => [
                'id'           => $paymentRequest->id,
                'user_name'    => $paymentRequest->user->name,
                'user_email'   => $paymentRequest->user->email,
                'plan'         => $paymentRequest->plan,
                'billing_cycle'=> $paymentRequest->billing_cycle,
                'amount'       => $paymentRequest->amount,
                'status'       => $paymentRequest->status,
                'admin_notes'  => $paymentRequest->admin_notes,
                'proof_url'    => Storage::disk('public')->url($paymentRequest->proof_path),
                'created_at'   => $paymentRequest->created_at->format('d/m/Y H:i'),
                'reviewed_at'  => $paymentRequest->reviewed_at?->format('d/m/Y H:i'),
                'reviewer_name'=> $paymentRequest->reviewer?->name,
            ],
        ]);
    }

    public function approve(Request $request, PaymentRequest $paymentRequest)
    {
        if (!$paymentRequest->isPending()) {
            return back()->with('error', 'Esta solicitud ya fue procesada.');
        }

        $request->validate([
            'billing_cycle' => 'sometimes|in:monthly,semiannual,annual',
        ]);

        $user  = $paymentRequest->user;
        $plan  = $paymentRequest->plan;

        // Find or create the associate record
        $associate = $user->associate_id
            ? Associate::find($user->associate_id)
            : null;

        if (!$associate) {
            $associate = Associate::create([
                'company_name' => $user->name,
                'status'       => 'pending',
                'is_public'    => false,
            ]);
            $user->update(['associate_id' => $associate->id]);
        }

        // Expiration date: signup-only pays 30 días, cycle payments use cycle period
        if ($paymentRequest->is_signup) {
            $expiresAt = now()->addMonth();
        } else {
            $cycle = $request->billing_cycle ?? $paymentRequest->billing_cycle;
            $expiresAt = match ($cycle) {
                'semiannual' => now()->addMonths(6),
                'annual'     => now()->addYear(),
                default      => now()->addMonth(),
            };
        }

        // Activate plan and associate status
        $associate->update([
            'plan_id'        => $plan->id,
            'plan_expires_at'=> $expiresAt,
            'status'         => 'approved',
            'is_public'      => true,
        ]);

        // Mark user as having a verified profile (legacy flag if needed)
        $user->update(['has_verified_profile' => true]);

        // Mark request as approved
        $paymentRequest->update([
            'status'      => 'approved',
            'reviewed_at' => now(),
            'reviewed_by' => auth()->id(),
        ]);

        // For signup-only payments, auto-generate the next month's invoice
        if ($paymentRequest->is_signup) {
            $this->generateFirstMonthlyInvoice($associate, $plan);
        }

        // Notify associate via email
        try {
            \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\PaymentApproved($paymentRequest));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error enviando correo de pago aprobado: ' . $e->getMessage());
        }

        // Notify associate in real-time
        event(new PaymentRequestReviewed($paymentRequest->fresh()));

        return redirect()->route('admin.payment-requests.index')
            ->with('success', "Plan {$plan->name} activado para {$user->name}.");
    }

    /**
     * After a signup-only payment is approved, push a "cuenta de cobro" for
     * the first monthly fee, dated to the month immediately following.
     */
    private function generateFirstMonthlyInvoice(Associate $associate, $plan): void
    {
        $nextPeriod = Carbon::now()->locale('es')->addMonth();
        $periodLabel = 'Mensualidad - ' . ucfirst($nextPeriod->isoFormat('MMMM YYYY'));

        $invoice = Invoice::create([
            'associate_id'  => $associate->id,
            'created_by'    => auth()->id(),
            'type'          => 'cuenta_cobro',
            'period'        => $periodLabel,
            'amount'        => $plan->price_monthly,
            'notes'         => 'Primera mensualidad posterior a la inscripción aprobada.',
            'status'        => 'pendiente',
        ]);

        try {
            $recipientEmail = $associate->users->first()?->email ?? $associate->billing_email ?? null;
            if ($recipientEmail) {
                \Illuminate\Support\Facades\Mail::to($recipientEmail)
                    ->send(new \App\Mail\NewInvoiceGenerated($invoice));
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error enviando correo de primera mensualidad: ' . $e->getMessage());
        }
    }

    public function reject(Request $request, PaymentRequest $paymentRequest)
    {
        if (!$paymentRequest->isPending()) {
            return back()->with('error', 'Esta solicitud ya fue procesada.');
        }

        $request->validate([
            'admin_notes' => 'required|string|max:1000',
        ]);

        $paymentRequest->update([
            'status'      => 'rejected',
            'admin_notes' => $request->admin_notes,
            'reviewed_at' => now(),
            'reviewed_by' => auth()->id(),
        ]);

        // Notify associate via email
        try {
            \Illuminate\Support\Facades\Mail::to($paymentRequest->user->email)->send(new \App\Mail\PaymentRejected($paymentRequest));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error enviando correo de pago rechazado: ' . $e->getMessage());
        }

        // Notify associate in real-time
        event(new PaymentRequestReviewed($paymentRequest->fresh()));

        return redirect()->route('admin.payment-requests.index')
            ->with('success', 'Solicitud rechazada. El asociado será notificado.');
    }
}
