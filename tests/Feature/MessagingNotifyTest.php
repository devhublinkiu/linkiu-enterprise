<?php

use App\Mail\NewMessageMail;
use App\Models\Associate;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;

uses(RefreshDatabase::class);

beforeEach(fn () => config()->set('inertia.testing.ensure_pages_exist', false));

it('un mensaje de admin a asociado le envia correo al asociado', function () {
    Mail::fake();

    $associate = Associate::create(['company_name' => 'Notif SAS', 'nit' => '900000011-1']);
    User::factory()->create(['associate_id' => $associate->id, 'email' => 'empresa@camepdemo.com', 'role' => 'associate']);
    $admin = User::factory()->create(['is_superadmin' => true]);

    $this->actingAs($admin)->post(route('admin.messages.store'), [
        'associate_id' => $associate->id,
        'subject' => 'Aviso',
        'body' => 'Hola, un mensaje.',
    ])->assertRedirect();

    Mail::assertSent(NewMessageMail::class, fn ($mail) => $mail->hasTo('empresa@camepdemo.com'));
});

it('un mensaje de asociado a admin NO envia correo', function () {
    Mail::fake();

    $associate = Associate::create(['company_name' => 'NoNotif SAS', 'nit' => '900000012-2']);
    $assocUser = User::factory()->create(['associate_id' => $associate->id, 'role' => 'associate']);
    $conversation = Conversation::create(['associate_id' => $associate->id, 'created_by' => $assocUser->id]);

    $this->actingAs($assocUser)->post(route('associate.messages.reply', $conversation), ['body' => 'Hola admin'])
        ->assertRedirect();

    Mail::assertNotSent(NewMessageMail::class);
});

it('el contador de no leidos refleja los mensajes sin leer y se limpia al abrir', function () {
    $associate = Associate::create(['company_name' => 'Unread SAS', 'nit' => '900000013-3']);
    $assocUser = User::factory()->create(['associate_id' => $associate->id, 'role' => 'associate']);
    $admin = User::factory()->create(['is_superadmin' => true]);
    $conversation = Conversation::create(['associate_id' => $associate->id, 'created_by' => $admin->id]);
    $conversation->messages()->create(['sender_id' => $admin->id, 'body' => 'Hola']);

    $this->actingAs($assocUser)->get(route('associate.messages.index'))
        ->assertInertia(fn ($page) => $page->where('unread_messages', 1));

    // Abrir el hilo lo marca leído.
    $this->actingAs($assocUser)->get(route('associate.messages.show', $conversation));

    $this->actingAs($assocUser)->get(route('associate.messages.index'))
        ->assertInertia(fn ($page) => $page->where('unread_messages', 0));
});
