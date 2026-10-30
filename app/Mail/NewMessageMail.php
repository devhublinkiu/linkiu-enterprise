<?php

namespace App\Mail;

use App\Models\Message;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Aviso al asociado de un mensaje nuevo de CAMEP en su bandeja interna
 * (plan 0026, corte 6). Vista Blade simple (hand-written); podría migrarse a
 * react-email como el resto (ADR-0004) en el cierre.
 */
class NewMessageMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Message $message) {}

    public function envelope(): Envelope
    {
        $subject = $this->message->conversation?->subject;

        return new Envelope(
            subject: $subject ? 'CAMEP · '.$subject : 'Nuevo mensaje de CAMEP',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.messaging.new-message',
            with: [
                'subject' => $this->message->conversation?->subject,
                'body' => $this->message->body,
                'url' => route('associate.messages.show', $this->message->conversation_id),
            ],
        );
    }
}
