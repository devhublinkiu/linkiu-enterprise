<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OtpCode extends Mailable
{
    use Queueable, SerializesModels;

    public int $ttlMinutes;

    /**
     * @param  string  $code  Código en claro (solo vive en este mensaje, no se persiste).
     * @param  string  $purpose  registration | password_reset
     */
    public function __construct(
        public string $code,
        public string $purpose,
    ) {
        $this->ttlMinutes = (int) config('otp.ttl_minutes');
    }

    public function envelope(): Envelope
    {
        $subject = $this->purpose === 'password_reset'
            ? 'Código para recuperar tu contraseña'
            : 'Tu código de verificación';

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.auth.otp_code',
            with: [
                'code' => $this->code,
                'purpose' => $this->purpose,
                'ttlMinutes' => $this->ttlMinutes,
            ],
        );
    }

    /**
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
