<?php

namespace App\Mail;

use App\Models\Associate;
use Illuminate\Bus\Queueable;
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

    public $sectionUrl;

    /**
     * Create a new message instance.
     */
    public function __construct($associate, $fieldName, $reason)
    {
        $this->associate = $associate;
        $this->sectionUrl = Associate::sectionUrl($fieldName);
        $this->fieldName = Associate::sectionLabel($fieldName);
        $this->reason = $reason;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Acción requerida: revisión de perfil CAMEP - '.$this->fieldName,
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
