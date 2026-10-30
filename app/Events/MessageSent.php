<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Mensaje nuevo en un hilo (plan 0026, corte 5). Se emite por el canal privado
 * del hilo; el cliente (Echo) lo agrega en vivo. Se encola (ShouldBroadcast):
 * sync en local, Redis/Horizon en prod (ADR-0011). BROADCAST_CONNECTION=null en
 * tests, así que no toca Ably.
 */
class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Message $message) {}

    /**
     * @return array<int, PrivateChannel>
     */
    public function broadcastOn(): array
    {
        return [new PrivateChannel('conversation.'.$this->message->conversation_id)];
    }

    public function broadcastAs(): string
    {
        return 'MessageSent';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        $this->message->loadMissing('sender:id,name', 'attachments');

        return [
            'id' => $this->message->id,
            'conversation_id' => $this->message->conversation_id,
            'body' => $this->message->body,
            'sender_id' => $this->message->sender_id,
            'sender' => $this->message->sender?->name,
            'at' => $this->message->created_at?->toIso8601String(),
            'has_attachments' => $this->message->attachments->isNotEmpty(),
        ];
    }
}
