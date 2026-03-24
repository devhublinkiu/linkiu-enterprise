<?php

namespace App\Events;

use App\Models\PaymentRequest;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Fired when admin approves or rejects a payment request.
 * Broadcast to the specific associate's private channel.
 */
class PaymentRequestReviewed implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public PaymentRequest $paymentRequest)
    {
        $this->paymentRequest->load(['plan']);
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('associate.' . $this->paymentRequest->user_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'PaymentRequestReviewed';
    }

    public function broadcastWith(): array
    {
        return [
            'id'          => $this->paymentRequest->id,
            'status'      => $this->paymentRequest->status,          // 'approved' | 'rejected'
            'plan_name'   => $this->paymentRequest->plan->name,
            'plan_color'  => $this->paymentRequest->plan->color_hex,
            'admin_notes' => $this->paymentRequest->admin_notes,
        ];
    }
}
