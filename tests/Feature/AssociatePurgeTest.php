<?php

use App\Models\Associate;
use App\Models\Conversation;
use App\Models\Invoice;
use App\Models\MessageAttachment;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

function purgeAdmin(): User
{
    return User::factory()->create(['is_superadmin' => true]);
}

/** Crea una empresa con usuario, factura, pago, hilo+adjunto y archivos en disco. */
function seedCompanyWithEverything(): array
{
    $default = config('filesystems.default');
    Storage::fake($default);
    Storage::fake('local');

    $associate = Associate::create([
        'company_name' => 'Borrar SA',
        'nit' => '900999000',
        'status' => 'approved',
        'logo_path' => 'logos/logo.png',
    ]);
    Storage::disk($default)->put('logos/logo.png', 'img');

    $user = User::factory()->create(['associate_id' => $associate->id, 'role' => 'associate']);

    $invoice = Invoice::create([
        'associate_id' => $associate->id,
        'type' => 'cuenta_cobro',
        'period' => 'Mensualidad - Test',
        'status' => 'pendiente',
        'document_path' => 'invoices/doc.pdf',
    ]);
    Storage::disk('local')->put('invoices/doc.pdf', 'pdf');

    Payment::create([
        'invoice_id' => $invoice->id,
        'associate_id' => $associate->id,
        'method' => Payment::METHOD_TRANSFER,
        'status' => Payment::STATUS_PENDING,
        'amount' => 100000,
        'proof_path' => 'payment-proofs/proof.png',
    ]);
    Storage::disk('local')->put('payment-proofs/proof.png', 'img');

    $conversation = Conversation::create([
        'associate_id' => $associate->id,
        'created_by' => $user->id,
        'last_message_at' => now(),
    ]);
    $message = $conversation->messages()->create(['sender_id' => $user->id, 'body' => 'hola']);
    MessageAttachment::create([
        'message_id' => $message->id,
        'disk' => 'local',
        'path' => 'msg/att.png',
        'name' => 'att.png',
        'mime' => 'image/png',
        'size' => 10,
    ]);
    Storage::disk('local')->put('msg/att.png', 'img');

    return [$associate, $user, $default];
}

it('elimina la empresa y TODO lo suyo, con el NIT correcto', function () {
    [$associate, $user, $default] = seedCompanyWithEverything();

    $this->actingAs(purgeAdmin())
        ->delete(route('admin.associates.destroy', $associate), [
            'nit_confirmation' => '900999000',
        ])
        ->assertRedirect(route('admin.associates.index'));

    expect(Associate::find($associate->id))->toBeNull();
    expect(User::find($user->id))->toBeNull();
    expect(Invoice::count())->toBe(0);
    expect(Payment::count())->toBe(0);
    expect(Conversation::count())->toBe(0);
    expect(MessageAttachment::count())->toBe(0);

    Storage::disk($default)->assertMissing('logos/logo.png');
    Storage::disk('local')->assertMissing('invoices/doc.pdf');
    Storage::disk('local')->assertMissing('payment-proofs/proof.png');
    Storage::disk('local')->assertMissing('msg/att.png');
});

it('no borra nada si el NIT no coincide', function () {
    [$associate] = seedCompanyWithEverything();

    $this->actingAs(purgeAdmin())
        ->delete(route('admin.associates.destroy', $associate), [
            'nit_confirmation' => '000',
        ])
        ->assertSessionHasErrors('nit_confirmation');

    expect(Associate::find($associate->id))->not->toBeNull();
});

it('un asociado no puede eliminar una empresa', function () {
    [$associate] = seedCompanyWithEverything();
    $assoc = User::factory()->create(['role' => 'associate', 'associate_id' => $associate->id]);

    $this->actingAs($assoc)
        ->delete(route('admin.associates.destroy', $associate), [
            'nit_confirmation' => '900999000',
        ])
        ->assertForbidden();

    expect(Associate::find($associate->id))->not->toBeNull();
});
