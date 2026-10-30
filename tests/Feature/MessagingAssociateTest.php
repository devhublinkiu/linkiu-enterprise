<?php

use App\Models\Associate;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

// Las páginas React llegan en el corte 7; aquí probamos solo el backend.
beforeEach(fn () => config()->set('inertia.testing.ensure_pages_exist', false));

function associateUser(string $company = 'Empresa X SAS', string $nit = '900111222-3'): array
{
    $associate = Associate::create(['company_name' => $company, 'nit' => $nit]);
    $user = User::factory()->create(['associate_id' => $associate->id, 'role' => 'associate']);

    return [$associate, $user];
}

it('un asociado crea una conversacion con adjunto', function () {
    Storage::fake('local');
    [$associate, $user] = associateUser();

    $this->actingAs($user)->post(route('associate.messages.store'), [
        'subject' => 'Consulta sobre mi plan',
        'body' => 'Hola CAMEP, tengo una duda.',
        'attachments' => [UploadedFile::fake()->create('doc.pdf', 50, 'application/pdf')],
    ])->assertRedirect();

    $conversation = Conversation::first();
    expect($conversation)->not->toBeNull();
    expect($conversation->associate_id)->toBe($associate->id);
    expect($conversation->messages()->count())->toBe(1);

    $attachment = $conversation->messages->first()->attachments->first();
    expect($attachment)->not->toBeNull();
    Storage::disk('local')->assertExists($attachment->path);
});

it('la bandeja solo muestra las conversaciones del propio asociado', function () {
    [$assocA, $userA] = associateUser('A SAS', '900000001-1');
    [$assocB] = associateUser('B SAS', '900000002-2');
    $admin = User::factory()->create(['is_superadmin' => true]);

    Conversation::create(['associate_id' => $assocA->id, 'created_by' => $admin->id, 'last_message_at' => now()]);
    Conversation::create(['associate_id' => $assocB->id, 'created_by' => $admin->id, 'last_message_at' => now()]);

    $this->actingAs($userA)->get(route('associate.messages.index'))
        ->assertInertia(fn ($page) => $page->component('Associate/Mensajes/Index')->has('conversations', 1));
});

it('ver un hilo lo marca como leido', function () {
    [$associate, $user] = associateUser('C SAS', '900000003-3');
    $admin = User::factory()->create(['is_superadmin' => true]);
    $conversation = Conversation::create(['associate_id' => $associate->id, 'created_by' => $admin->id]);
    $conversation->messages()->create(['sender_id' => $admin->id, 'body' => 'Hola']);

    expect($conversation->unreadCountFor($user))->toBe(1);
    $this->actingAs($user)->get(route('associate.messages.show', $conversation))->assertOk();
    expect($conversation->fresh()->unreadCountFor($user))->toBe(0);
});

it('responder agrega mensaje y actualiza last_message_at', function () {
    [$associate, $user] = associateUser('D SAS', '900000004-4');
    $conversation = Conversation::create(['associate_id' => $associate->id, 'created_by' => $user->id]);

    $this->actingAs($user)->post(route('associate.messages.reply', $conversation), ['body' => 'Gracias'])
        ->assertRedirect();

    expect($conversation->fresh()->messages()->count())->toBe(1);
    expect($conversation->fresh()->last_message_at)->not->toBeNull();
});

it('archivar y restaurar alterna el estado del asociado', function () {
    [$associate, $user] = associateUser('E SAS', '900000005-5');
    $conversation = Conversation::create(['associate_id' => $associate->id, 'created_by' => $user->id]);

    $this->actingAs($user)->post(route('associate.messages.archive', $conversation))->assertRedirect();
    expect($conversation->fresh()->isArchivedFor($user))->toBeTrue();

    $this->actingAs($user)->post(route('associate.messages.archive', $conversation))->assertRedirect();
    expect($conversation->fresh()->isArchivedFor($user))->toBeFalse();
});

it('no puede ver un hilo de otro asociado', function () {
    [$assocA, $userA] = associateUser('F SAS', '900000006-6');
    [$assocB, $userB] = associateUser('G SAS', '900000007-7');
    $conversation = Conversation::create(['associate_id' => $assocB->id, 'created_by' => $userB->id]);

    $this->actingAs($userA)->get(route('associate.messages.show', $conversation))->assertForbidden();
});
