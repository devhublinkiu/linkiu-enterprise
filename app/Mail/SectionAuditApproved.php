<?php

namespace App\Mail;

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

    private const SECTION_LABELS = [
        'basicinfo'        => 'Información Básica',
        'characterization' => 'Caracterización',
        'contacts'         => 'Contactos',
        'documentation'    => 'Documentación',
        'services'         => 'Servicios',
    ];

    public function __construct($associate, $sectionName, bool $isChangeRequest = false)
    {
        $this->associate       = $associate;
        $this->sectionName     = self::SECTION_LABELS[$sectionName] ?? $sectionName;
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
