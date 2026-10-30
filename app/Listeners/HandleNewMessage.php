<?php

namespace App\Listeners;

use App\Events\InboxUpdated;
use App\Events\MessageSent;
use App\Mail\NewMessageMail;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Mail;

/**
 * Efectos de un mensaje nuevo (plan 0026, corte 6):
 *  - avisa a la bandeja (badge en vivo) de cada destinatario por inbox.{userId};
 *  - envía correo al asociado SOLO cuando el remitente es admin (en cada mensaje).
 * Corre en cola (sync en local, Redis/Horizon en prod).
 */
class HandleNewMessage implements ShouldQueue
{
    public function handle(MessageSent $event): void
    {
        $message = $event->message->loadMissing('conversation', 'sender');
        $conversation = $message->conversation;

        if (! $conversation) {
            return;
        }

        $senderId = (int) $message->sender_id;
        $senderIsAdmin = $message->sender?->isAdmin() ?? false;

        $associateUsers = User::where('associate_id', $conversation->associate_id)->get();
        $adminUserIds = User::where('is_superadmin', true)
            ->orWhere('role', 'admin')
            ->pluck('id');

        // Badge en vivo para cada participante, menos el remitente.
        $recipientIds = $associateUsers->pluck('id')
            ->merge($adminUserIds)
            ->unique()
            ->reject(fn ($id) => (int) $id === $senderId);

        foreach ($recipientIds as $userId) {
            InboxUpdated::dispatch((int) $userId);
        }

        // Correo SOLO admin -> asociado, por cada mensaje.
        if ($senderIsAdmin) {
            foreach ($associateUsers as $user) {
                if ($user->email) {
                    Mail::to($user->email)->send(new NewMessageMail($message));
                }
            }
        }
    }
}
