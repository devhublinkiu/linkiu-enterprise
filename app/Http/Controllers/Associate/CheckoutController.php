<?php

namespace App\Http\Controllers\Associate;

use App\Events\PaymentRequestSubmitted;
use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use App\Models\PaymentRequest;
use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CheckoutController extends Controller
{
    public function show(Plan $plan)
    {
        $user = auth()->user();

        // Check if there's already a pending request for this plan
        $existingRequest = PaymentRequest::where('user_id', $user->id)
            ->where('plan_id', $plan->id)
            ->where('status', 'pending')
            ->first();

        $bankAccounts = BankAccount::where('is_active', true)->orderBy('order')->get();

        return Inertia::render('Associate/Billing/Checkout', [
            'plan'            => $plan,
            'bankAccounts'    => $bankAccounts,
            'existingRequest' => $existingRequest,
            'associateStatus' => $user->associate?->status,
        ]);
    }

    public function store(Request $request, Plan $plan)
    {
        $request->validate([
            'billing_cycle' => 'required|in:monthly,semiannual,annual',
            'proof'         => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        $user = auth()->user();

        // Store proof file
        $path = $request->file('proof')->store('payment-proofs', 'public');

        // Determine amount based on billing cycle
        $amount = match ($request->billing_cycle) {
            'semiannual' => $plan->price_semiannual,
            'annual'     => $plan->price_annual,
            default      => $plan->price_monthly,
        };

        // Add signup fee if the associate is newly admitted (verified status)
        $associate = $user->associate;
        if ($associate && $associate->status === 'verified' && $plan->signup_fee > 0) {
            $amount += $plan->signup_fee;
        }

        // Cancel any previous pending request from this user
        PaymentRequest::where('user_id', $user->id)
            ->where('status', 'pending')
            ->update(['status' => 'cancelled']);

        $paymentRequest = PaymentRequest::create([
            'user_id'       => $user->id,
            'plan_id'       => $plan->id,
            'billing_cycle' => $request->billing_cycle,
            'amount'        => $amount,
            'proof_path'    => $path,
            'status'        => 'pending',
        ]);

        // Notify admin via email
        try {
            \Illuminate\Support\Facades\Mail::to(config('mail.admin_recipient', env('ADMIN_EMAIL')))
                ->send(new \App\Mail\PaymentProofSubmitted($paymentRequest));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error enviando alerta de comprobante a admin: ' . $e->getMessage());
        }

        // Notify admin in real-time
        event(new PaymentRequestSubmitted($paymentRequest));

        return redirect()->route('associate.company.billing')
            ->with('success', '¡Comprobante enviado! Tu solicitud está siendo revisada por CAMEP.');
    }
}
