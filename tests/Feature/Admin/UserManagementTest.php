<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('local');
});

function umAdmin(): User
{
    return User::factory()->create(['is_superadmin' => true]);
}

// Usuario "suelto": rol user, sin verificar, sin empresa. Nombre de gibberish (sin espacio).
function umPlainUser(array $overrides = []): User
{
    return User::factory()->create(array_merge([
        'name' => 'aXbYcZdEfGhIj',
        'role' => 'user',
        'email_verified_at' => null,
        'associate_id' => null,
    ], $overrides));
}

// Convierte a un usuario en asociado creando su empresa (borrador de Información Básica).
function umWithCompany(User $user): User
{
    test()->actingAs($user)->post(route('associate.company.save.draft'), [
        'company_name' => 'Empresa '.uniqid(),
    ]);

    return $user->fresh();
}

// ─── Eliminación individual ──────────────────────────────────────────────────

it('el admin elimina un usuario suelto', function () {
    $target = umPlainUser();

    test()->actingAs(umAdmin())
        ->delete(route('admin.users.destroy', $target->id))
        ->assertSessionHas('success');

    expect(User::find($target->id))->toBeNull();
});

it('no permite eliminarse a uno mismo', function () {
    $admin = umAdmin();

    test()->actingAs($admin)
        ->delete(route('admin.users.destroy', $admin->id))
        ->assertSessionHas('error');

    expect(User::find($admin->id))->not->toBeNull();
});

it('no permite eliminar a otro administrador', function () {
    $otroAdmin = User::factory()->create(['role' => 'admin']);

    test()->actingAs(umAdmin())
        ->delete(route('admin.users.destroy', $otroAdmin->id))
        ->assertSessionHas('error');

    expect(User::find($otroAdmin->id))->not->toBeNull();
});

it('no permite eliminar a un usuario con empresa asociada', function () {
    $conEmpresa = umWithCompany(umPlainUser());
    expect($conEmpresa->associate_id)->not->toBeNull();

    test()->actingAs(umAdmin())
        ->delete(route('admin.users.destroy', $conEmpresa->id))
        ->assertSessionHas('error');

    expect(User::find($conEmpresa->id))->not->toBeNull();
});

// ─── Limpieza en lote del spam legado ────────────────────────────────────────

it('purga el spam legado y respeta verificados, con empresa y nombres reales', function () {
    $spam1 = umPlainUser(['email' => 'a.b.c.1@gmail.com']);
    $spam2 = umPlainUser(['name' => 'zZyYxXwWvV', 'email' => 'a.b.c.2@gmail.com']);

    $verificado = umPlainUser(['name' => 'qWeRtYuIoP', 'email_verified_at' => now()]);
    $nombreReal = umPlainUser(['name' => 'Juan Pérez Real']); // tiene espacio → no es gibberish
    $conEmpresa = umWithCompany(umPlainUser(['name' => 'mMnNbBvVcC']));

    test()->actingAs(umAdmin())
        ->post(route('admin.users.purge-spam'))
        ->assertSessionHas('success');

    // Borrados: los dos gibberish sueltos.
    expect(User::find($spam1->id))->toBeNull();
    expect(User::find($spam2->id))->toBeNull();

    // Respetados: verificado, nombre real y con empresa.
    expect(User::find($verificado->id))->not->toBeNull();
    expect(User::find($nombreReal->id))->not->toBeNull();
    expect(User::find($conEmpresa->id))->not->toBeNull();
});
