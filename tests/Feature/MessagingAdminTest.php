<?php

use App\Models\Associate;
use App\Models\Conversation;
use App\Models\MessageGroup;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

// Las páginas React llegan en el corte 7; aquí probamos solo el backend.
beforeEach(fn () => config()->set('inertia.testing.ensure_pages_exist', false));

function adminUser(): User
{
    return User::factory()->create(['is_superadmin' => true]);
}

function company(string $name, string $nit): Associate
{
    return Associate::create(['company_name' => $name, 'nit' => $nit]);
}

it('el admin ve todas las conversaciones', function () {
    $a = company('A SAS', '900000001-1');
    $b = company('B SAS', '900000002-2');
    $admin = adminUser();

    Conversation::create(['associate_id' => $a->id, 'created_by' => $admin->id, 'last_message_at' => now()]);
    Conversation::create(['associate_id' => $b->id, 'created_by' => $admin->id, 'last_message_at' => now()]);

    $this->actingAs($admin)->get(route('admin.messages.index'))
        ->assertInertia(fn ($page) => $page->component('Admin/Mensajes/Index')->has('conversations', 2));
});

it('el admin envia un mensaje a un asociado especifico', function () {
    Storage::fake('local');
    $a = company('C SAS', '900000003-3');
    $admin = adminUser();

    $this->actingAs($admin)->post(route('admin.messages.store'), [
        'associate_id' => $a->id,
        'subject' => 'Aviso importante',
        'body' => 'Hola, un mensaje para ustedes.',
    ])->assertRedirect();

    $conversation = Conversation::first();
    expect($conversation->associate_id)->toBe($a->id);
    expect($conversation->messages()->count())->toBe(1);
});

it('el fan-out crea un hilo privado por asociado del grupo', function () {
    $a = company('D SAS', '900000004-4');
    $b = company('E SAS', '900000005-5');
    $c = company('F SAS', '900000006-6'); // NO está en el grupo
    $admin = adminUser();

    $group = MessageGroup::create(['name' => 'Directivos', 'created_by' => $admin->id]);
    $group->associates()->sync([$a->id, $b->id]);

    $this->actingAs($admin)->post(route('admin.messages.broadcast'), [
        'group_id' => $group->id,
        'subject' => 'Asamblea',
        'body' => 'Les informamos la fecha.',
    ])->assertRedirect();

    // QUEUE_CONNECTION=sync en tests -> el Job corre inline.
    expect(Conversation::count())->toBe(2);                                  // un hilo por asociado del grupo
    expect(Conversation::where('associate_id', $a->id)->count())->toBe(1);
    expect(Conversation::where('associate_id', $b->id)->count())->toBe(1);
    expect(Conversation::where('associate_id', $c->id)->count())->toBe(0);   // fuera del grupo, nada
});

it('el admin crea un grupo seleccionando asociados', function () {
    $a = company('G SAS', '900000007-7');
    $b = company('H SAS', '900000008-8');
    $admin = adminUser();

    $this->actingAs($admin)->post(route('admin.message-groups.store'), [
        'name' => 'Plan Corporativo',
        'associate_ids' => [$a->id, $b->id],
    ])->assertRedirect();

    expect(MessageGroup::count())->toBe(1);
    expect(MessageGroup::first()->associates()->count())->toBe(2);
});
