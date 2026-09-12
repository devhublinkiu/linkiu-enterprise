<?php

namespace App\Mail;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Avisa al equipo de que hay un comprobante de transferencia esperando revisión.
 */
class PaymentProofUploaded extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Payment $payment)
    {
    }

    public function envelope(): Envelope
    {
        $company = $this->payment->associate?->company_name ?? 'un asociado';

        return new Envelope(
            subject: 'Comprobante por revisar — ' . $company,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.admin.payment_proof_uploaded',
            with: [
                'payment' => $this->payment,
                'invoice' => $this->payment->invoice,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
