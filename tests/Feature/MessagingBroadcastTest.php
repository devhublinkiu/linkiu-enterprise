<?php

use App\Events\MessageSent;
use App\Models\Associate;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;

uses(RefreshDatabase::class);

it('enviar un mensaje dispara MessageSent en el canal privado del hilo', function () {
    Event::fake([MessageSent::class]);

    $associate = Associate::create(['company_name' => 'Broadcast SAS', 'nit' => '900999000-1']);
    $user = User::factory()->create(['associate_id' => $associate->id, 'role' => 'associate']);
    $conversation = Conversation::create(['associate_id' => $associate->id, 'created_by' => $user->id]);

    $this->actingAs($user)
        ->post(route('associate.messages.reply', $conversation), ['body' => 'Hola en vivo'])
        ->assertRedirect();

    Event::assertDispatched(MessageSent::class, function (MessageSent $e) use ($conversation) {
        $channels = $e->broadcastOn();

        return $e->message->conversation_id === $conversation->id
            && $e->message->body === 'Hola en vivo'
            && $channels[0]->name === 'private-conversation.'.$conversation->id;
    });
});

it('el evento se emite con el nombre .MessageSent y el cuerpo esperado', function () {
    $associate = Associate::create(['company_name' => 'Payload SAS', 'nit' => '900999000-2']);
    $admin = User::factory()->create(['is_superadmin' => true]);
    $conversation = Conversation::create(['associate_id' => $associate->id, 'created_by' => $admin->id]);
    $message = $conversation->messages()->create(['sender_id' => $admin->id, 'body' => 'Contenido']);

    $event = new MessageSent($message);

    expect($event->broadcastAs())->toBe('MessageSent');
    $payload = $event->broadcastWith();
    expect($payload['body'])->toBe('Contenido');
    expect($payload['conversation_id'])->toBe($conversation->id);
    expect($payload['has_attachments'])->toBeFalse();
});
