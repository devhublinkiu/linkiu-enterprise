<?php

namespace App\Events;

use App\Models\PaymentRequest;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Fired when an associate submits a payment proof.
 * Broadcast to the admin channel so they see a real-time notification.
 */
class PaymentRequestSubmitted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public PaymentRequest $paymentRequest)
    {
        $this->paymentRequest->load(['user', 'plan']);
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('admin.notifications'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'PaymentRequestSubmitted';
    }

    public function broadcastWith(): array
    {
        return [
            'id'         => $this->paymentRequest->id,
            'user_name'  => $this->paymentRequest->user->name,
            'plan_name'  => $this->paymentRequest->plan->name,
            'plan_color' => $this->paymentRequest->plan->color_hex,
            'amount'     => $this->paymentRequest->amount,
            'created_at' => $this->paymentRequest->created_at->format('H:i'),
        ];
    }
}
