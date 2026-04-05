<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AssociateFieldChangeRequested extends Mailable
{
    use Queueable, SerializesModels;

    public $associate;
    public $fieldName;
    public $reason;

    public function __construct($associate, $fieldName, $reason)
    {
        $this->associate  = $associate;
        $this->fieldName  = $fieldName;
        $this->reason     = $reason;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Solicitud de cambio de campo: ' . $this->associate->company_name . ' - ' . $this->fieldName,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.associate.field_change_requested',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
