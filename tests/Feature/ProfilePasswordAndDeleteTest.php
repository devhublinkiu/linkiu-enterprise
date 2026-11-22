<?php

use App\Models\Associate;
use App\Models\Invoice;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

// ─── Cambio de contraseña autenticado ─────────────────────────────────────

it('cambia la contraseña con la actual correcta', function () {
    $user = User::factory()->create(['password' => Hash::make('ClaveVieja-123')]);

    $this->actingAs($user)
        ->put(route('password.change'), [
            'current_password' => 'ClaveVieja-123',
            'password' => 'ClaveNueva-456',
            'password_confirmation' => 'ClaveNueva-456',
        ])
        ->assertSessionHasNoErrors();

    expect(Hash::check('ClaveNueva-456', $user->fresh()->password))->toBeTrue();
});

it('rechaza el cambio si la contraseña actual es incorrecta', function () {
    $user = User::factory()->create(['password' => Hash::make('ClaveVieja-123')]);

    $this->actingAs($user)
        ->put(route('password.change'), [
            'current_password' => 'incorrecta',
            'password' => 'ClaveNueva-456',
            'password_confirmation' => 'ClaveNueva-456',
        ])
        ->assertSessionHasErrors('current_password');

    expect(Hash::check('ClaveVieja-123', $user->fresh()->password))->toBeTrue();
});

// ─── Eliminar cuenta en cascada ───────────────────────────────────────────

it('elimina la cuenta en cascada: usuarios, empresa y facturas', function () {
    $associate = Associate::create(['company_name' => 'Borrar SAS', 'status' => 'approved']);
    $user = User::factory()->create(['associate_id' => $associate->id, 'password' => Hash::make('Clave-123')]);
    $otherUser = User::factory()->create(['associate_id' => $associate->id]);
    $invoice = Invoice::create([
        'associate_id' => $associate->id,
        'type' => 'cuenta_cobro',
        'period' => 'Mensualidad',
        'amount' => 1000,
        'status' => 'pendiente',
    ]);

    $this->actingAs($user)
        ->delete(route('profile.destroy'), ['password' => 'Clave-123'])
        ->assertRedirect('/');

    expect(User::find($user->id))->toBeNull();
    expect(User::find($otherUser->id))->toBeNull();
    expect(Associate::find($associate->id))->toBeNull();
    expect(Invoice::find($invoice->id))->toBeNull();
});

it('no elimina nada con la contraseña incorrecta', function () {
    $associate = Associate::create(['company_name' => 'Queda SAS', 'status' => 'approved']);
    $user = User::factory()->create(['associate_id' => $associate->id, 'password' => Hash::make('Clave-123')]);

    $this->actingAs($user)
        ->delete(route('profile.destroy'), ['password' => 'mala'])
        ->assertSessionHasErrors('password');

    expect(User::find($user->id))->not->toBeNull();
    expect(Associate::find($associate->id))->not->toBeNull();
});
