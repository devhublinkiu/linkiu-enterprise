<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AssociateAuditRejected extends Mailable
{
    use Queueable, SerializesModels;

    public $associate;
    public $fieldName;
    public $reason;

    /**
     * Create a new message instance.
     */
    public function __construct($associate, $fieldName, $reason)
    {
        $this->associate = $associate;
        $this->fieldName = $fieldName;
        $this->reason = $reason;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Acción requerida: Revisión de perfil CAMEP - ' . $this->fieldName,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.associate.audit_rejected',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
