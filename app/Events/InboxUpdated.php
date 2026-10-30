<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Ping a la bandeja de un usuario (plan 0026, corte 6): al recibirlo, el cliente
 * recarga el contador de no leídos. Canal privado inbox.{userId}.
 */
class InboxUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public int $userId) {}

    /**
     * @return array<int, PrivateChannel>
     */
    public function broadcastOn(): array
    {
        return [new PrivateChannel('inbox.'.$this->userId)];
    }

    public function broadcastAs(): string
    {
        return 'InboxUpdated';
    }
}
