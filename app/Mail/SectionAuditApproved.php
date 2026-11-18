<?php

namespace App\Mail;

use App\Models\Associate;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SectionAuditApproved extends Mailable
{
    use Queueable, SerializesModels;

    public $associate;

    public $sectionName;

    public $isChangeRequest;

    public $sectionUrl;

    public function __construct($associate, $sectionName, bool $isChangeRequest = false)
    {
        $this->associate = $associate;
        $this->sectionUrl = Associate::sectionUrl($sectionName);
        $this->sectionName = Associate::sectionLabel($sectionName);
        $this->isChangeRequest = $isChangeRequest;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Sección aprobada en tu perfil CAMEP',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.associate.audit_approved',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
