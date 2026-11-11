<?php

use App\Models\BankAccount;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(fn () => config()->set('inertia.testing.ensure_pages_exist', false));

function bankAdmin(): User
{
    return User::factory()->create(['is_superadmin' => true]);
}

it('el admin crea una cuenta bancaria', function () {
    $this->actingAs(bankAdmin())->post(route('admin.bank-accounts.store'), [
        'type' => 'cuenta',
        'bank_name' => 'Bancolombia',
        'account_type' => 'ahorros',
        'account_number' => '123-456789-00',
        'holder_name' => 'CAMEP SAS',
        'holder_document' => '900123456-7',
        'holder_document_type' => 'NIT',
        'is_active' => true,
    ])->assertRedirect(route('admin.bank-accounts.index'));

    $a = BankAccount::first();
    expect($a->type)->toBe('cuenta');
    expect($a->account_number)->toBe('123-456789-00');
    expect($a->payment_key)->toBeNull();
    expect($a->qr_path)->toBeNull();
});

it('el admin crea una llave Bre-B', function () {
    $this->actingAs(bankAdmin())->post(route('admin.bank-accounts.store'), [
        'type' => 'bre_b',
        'payment_key' => '@camep',
        'holder_name' => 'CAMEP SAS',
        'is_active' => true,
    ])->assertRedirect();

    $a = BankAccount::first();
    expect($a->type)->toBe('bre_b');
    expect($a->payment_key)->toBe('@camep');
    expect($a->account_number)->toBeNull();
});

it('Bre-B exige la llave', function () {
    $this->actingAs(bankAdmin())->post(route('admin.bank-accounts.store'), [
        'type' => 'bre_b',
        'holder_name' => 'CAMEP SAS',
        'is_active' => true,
    ])->assertSessionHasErrors('payment_key');
});

it('el admin crea un QR con imagen en disco público', function () {
    Storage::fake('public');

    $this->actingAs(bankAdmin())->post(route('admin.bank-accounts.store'), [
        'type' => 'qr',
        'bank_name' => 'Nequi',
        'is_active' => true,
        'qr' => UploadedFile::fake()->image('qr.png', 300, 300),
    ])->assertRedirect();

    $a = BankAccount::first();
    expect($a->type)->toBe('qr');
    expect($a->qr_path)->not->toBeNull();
    Storage::disk('public')->assertExists($a->qr_path);
    expect($a->qr_url)->toContain('/storage/');
});

it('QR exige la imagen al crear', function () {
    Storage::fake('public');

    $this->actingAs(bankAdmin())->post(route('admin.bank-accounts.store'), [
        'type' => 'qr',
        'is_active' => true,
    ])->assertSessionHasErrors('qr');
});

it('un asociado no puede gestionar métodos de pago', function () {
    $assoc = User::factory()->create(['role' => 'associate']);

    $this->actingAs($assoc)->post(route('admin.bank-accounts.store'), [
        'type' => 'bre_b', 'payment_key' => '@x', 'holder_name' => 'x', 'is_active' => true,
    ])->assertForbidden();

    expect(BankAccount::count())->toBe(0);
});
