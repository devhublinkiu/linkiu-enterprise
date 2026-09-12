<?php

namespace App\Mail;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Carbon;

/**
 * Se envía cuando un pago —de cualquier riel— extendió la suscripción.
 */
class PaymentSettled extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Payment $payment,
        public Carbon $newExpiration,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Pago recibido — tu suscripción CAMEP está al día',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.billing.payment_settled',
            with: [
                'payment'       => $this->payment,
                'invoice'       => $this->payment->invoice,
                'newExpiration' => $this->newExpiration,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
