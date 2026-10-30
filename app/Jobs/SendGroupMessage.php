<?php

namespace App\Jobs;

use App\Models\Conversation;
use App\Models\MessageGroup;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

/**
 * Fan-out de un mensaje a un grupo (plan 0026 / ADR-0012): crea un hilo PRIVADO por
 * asociado del grupo. Nunca un hilo compartido. Corre en cola (Redis/Horizon en prod;
 * sync en local/tests).
 */
class SendGroupMessage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public int $groupId,
        public int $adminId,
        public ?string $subject,
        public string $body,
    ) {}

    public function handle(): void
    {
        $group = MessageGroup::with('associates:id')->find($this->groupId);

        if (! $group) {
            return;
        }

        foreach ($group->associates as $associate) {
            $conversation = Conversation::create([
                'associate_id' => $associate->id,
                'subject' => $this->subject,
                'created_by' => $this->adminId,
                'last_message_at' => now(),
            ]);

            $conversation->messages()->create([
                'sender_id' => $this->adminId,
                'body' => $this->body,
            ]);
        }
    }
}
