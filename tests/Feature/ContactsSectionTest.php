<?php

use App\Models\Associate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;

uses(RefreshDatabase::class);

// Helpers locales (nombres propios para no chocar con los de otras suites de sección).
function contactsOwner(): User
{
    return User::factory()->create();
}

function contactsAdmin(): User
{
    return User::factory()->create(['is_superadmin' => true]);
}

// Payload válido y completo para "Enviar a revisión".
function validContacts(array $overrides = []): array
{
    return array_merge([
        'contacts' => [
            [
                'area' => 'Gerencia',
                'name' => 'Juan Pérez',
                'position' => 'Gerente General',
                'email' => 'juan@empresa.com',
                'phone' => '3001234567',
            ],
        ],
        'main_ciiu' => '0610',
        'secondary_ciiu' => '',
        'billing_email' => 'facturacion@empresa.com',
        'company_type' => ['Proveedor'],
        'references' => [
            [
                'type' => 'commercial',
                'name' => 'Cliente ACME SAS',
                'contact_person' => 'Ana Ruiz',
                'position' => 'Compras',
                'phone' => '3009876543',
                'email' => '',
            ],
        ],
        'social_instagram' => '',
        'social_facebook' => '',
        'social_linkedin' => '',
        'social_other' => '',
    ], $overrides);
}

// Crea la empresa (vía borrador de Información Básica, todo opcional) y devuelve el associate.
function bootstrapContactsAssociate($test): Associate
{
    $user = contactsOwner();
    $test->actingAs($user)->post(route('associate.company.save.draft'), [
        'company_name' => 'Perforaciones del Llano SAS',
    ]);

    return $user->fresh()->associate;
}

// ─── Modelo: máquina de estados ────────────────────────────────────────────────

it('el modelo deriva editable/reabrible/enviable para contacts', function () {
    $a = new Associate;

    foreach (['draft', 'rejected'] as $editable) {
        $a->setSectionStatus('contacts', $editable);
        expect($a->canEditSection('contacts'))->toBeTrue();
        expect($a->canSubmitSection('contacts'))->toBeTrue();
        expect($a->canReopenSection('contacts'))->toBeFalse();
    }

    $a->setSectionStatus('contacts', 'approved');
    expect($a->canEditSection('contacts'))->toBeFalse();
    expect($a->canReopenSection('contacts'))->toBeTrue();
});

// ─── Flujo completo: draft → pending → approved → Editar → pending ──────────────

it('recorre el ciclo completo de contactos con una sola aprobación por vuelta', function () {
    $associate = bootstrapContactsAssociate($this);
    $user = $associate->users->first();

    $this->actingAs($user)->post(route('associate.company.update.contacts'), validContacts());
    expect($associate->fresh()->getSectionStatus('contacts'))->toBe('pending');
    expect($associate->fresh()->contacts)->toHaveCount(1);
    expect($associate->fresh()->references)->toHaveCount(1);

    $this->actingAs(contactsAdmin())->post(
        route('admin.associates.audit-section', $associate),
        ['section' => 'contacts', 'action' => 'approve'],
    );
    expect($associate->fresh()->getSectionStatus('contacts'))->toBe('approved');

    $this->actingAs($user)->post(route('associate.company.reopen.contacts'));
    expect($associate->fresh()->getSectionStatus('contacts'))->toBe('draft');

    $this->actingAs($user)->post(
        route('associate.company.update.contacts'),
        validContacts(['main_ciiu' => '0910']),
    );
    expect($associate->fresh()->getSectionStatus('contacts'))->toBe('pending');
    expect($associate->fresh()->main_ciiu)->toBe('0910');
});

// ─── Guardas del servidor ───────────────────────────────────────────────────────

it('no permite reabrir contactos si no está aprobada', function () {
    $associate = bootstrapContactsAssociate($this);
    $user = $associate->users->first();
    $this->actingAs($user)->post(route('associate.company.update.contacts'), validContacts());

    $this->actingAs($user)->post(route('associate.company.reopen.contacts'))
        ->assertSessionHas('error');

    expect($associate->fresh()->getSectionStatus('contacts'))->toBe('pending');
});

it('no permite guardar borrador de contactos cuando está en revisión', function () {
    $associate = bootstrapContactsAssociate($this);
    $user = $associate->users->first();
    $this->actingAs($user)->post(route('associate.company.update.contacts'), validContacts());

    $this->actingAs($user)->post(
        route('associate.company.save.contacts.draft'),
        validContacts(['main_ciiu' => '9999']),
    )->assertSessionHas('error');

    expect($associate->fresh()->main_ciiu)->toBe('0610');
});

it('el rechazo deja contactos editable y reenviable', function () {
    $associate = bootstrapContactsAssociate($this);
    $user = $associate->users->first();
    $this->actingAs($user)->post(route('associate.company.update.contacts'), validContacts());

    $this->actingAs(contactsAdmin())->post(
        route('admin.associates.audit-section', $associate),
        ['section' => 'contacts', 'action' => 'reject', 'reason' => 'Faltan referencias.'],
    );
    expect($associate->fresh()->getSectionStatus('contacts'))->toBe('rejected');

    $this->actingAs($user)->post(route('associate.company.update.contacts'), validContacts());
    expect($associate->fresh()->getSectionStatus('contacts'))->toBe('pending');
});

// ─── Reglas propias (ADR-0005-c) ────────────────────────────────────────────────

it('rechaza el envío si no hay ningún contacto', function () {
    $associate = bootstrapContactsAssociate($this);
    $user = $associate->users->first();

    $this->actingAs($user)->post(
        route('associate.company.update.contacts'),
        validContacts(['contacts' => []]),
    )->assertSessionHasErrors('contacts');

    expect($associate->fresh()->getSectionStatus('contacts'))->toBe('draft');
});

it('rechaza el envío si no hay ninguna referencia', function () {
    $associate = bootstrapContactsAssociate($this);
    $user = $associate->users->first();

    $this->actingAs($user)->post(
        route('associate.company.update.contacts'),
        validContacts(['references' => []]),
    )->assertSessionHasErrors('references');
});

it('exige teléfono o email en cada referencia (contactabilidad)', function () {
    $associate = bootstrapContactsAssociate($this);
    $user = $associate->users->first();

    $this->actingAs($user)->post(
        route('associate.company.update.contacts'),
        validContacts(['references' => [[
            'type' => 'commercial',
            'name' => 'Cliente sin contacto SAS',
            'phone' => '',
            'email' => '',
        ]]]),
    )->assertSessionHasErrors(['references.0.phone', 'references.0.email']);
});

it('exige un email válido en cada contacto', function () {
    $associate = bootstrapContactsAssociate($this);
    $user = $associate->users->first();

    $this->actingAs($user)->post(
        route('associate.company.update.contacts'),
        validContacts(['contacts' => [[
            'area' => 'Gerencia',
            'name' => 'Juan Pérez',
            'position' => 'Gerente',
            'email' => 'no-es-un-email',
            'phone' => '3001234567',
        ]]]),
    )->assertSessionHasErrors('contacts.0.email');
});

it('descarta filas vacías de contactos y referencias al guardar', function () {
    $associate = bootstrapContactsAssociate($this);
    $user = $associate->users->first();

    $this->actingAs($user)->post(
        route('associate.company.save.contacts.draft'),
        validContacts([
            'contacts' => [
                ['area' => 'Gerencia', 'name' => 'Juan Pérez', 'position' => 'Gerente', 'email' => 'juan@empresa.com', 'phone' => '3001234567'],
                ['area' => '', 'name' => '', 'position' => '', 'email' => '', 'phone' => ''],
            ],
            'references' => [
                ['type' => 'commercial', 'name' => 'Cliente ACME SAS', 'phone' => '3009876543', 'email' => ''],
                ['type' => 'bank', 'name' => '', 'phone' => '', 'email' => ''],
            ],
        ]),
    );

    $fresh = $associate->fresh();
    expect($fresh->contacts)->toHaveCount(1);
    expect($fresh->references)->toHaveCount(1);
});

// ─── contacts ya no usa el flujo de solicitud de cambio ─────────────────────────

it('rechaza una solicitud de cambio sobre contacts (usa Editar)', function () {
    $associate = bootstrapContactsAssociate($this);
    $user = $associate->users->first();

    $this->actingAs($user)->post(
        route('associate.company.request.section.change'),
        ['section' => 'contacts', 'reason' => 'Quiero cambiar algo'],
    )->assertSessionHasErrors('section');
});

// ─── La marca de "borrador guardado" se muestra en hora local ────────────────────

it('la marca de "borrador guardado" de contactos se muestra en hora de Colombia', function () {
    // 02:12:29 UTC = 21:12:29 del día anterior en Colombia (UTC−5).
    Carbon::setTestNow(Carbon::parse('2026-09-14 02:12:29', 'UTC'));

    $associate = bootstrapContactsAssociate($this);
    $user = $associate->users->first();

    $this->actingAs($user)
        ->post(route('associate.company.save.contacts.draft'), validContacts())
        ->assertSessionHas('draft_saved', '13/09/2026 21:12:29');

    Carbon::setTestNow();
});

// ─── El admin no edita la ficha (ADR-0005) ──────────────────────────────────────

it('el admin ya no puede editar los campos de contactos', function () {
    $associate = bootstrapContactsAssociate($this);
    $user = $associate->users->first();
    $this->actingAs($user)->post(route('associate.company.update.contacts'), validContacts());

    $this->actingAs(contactsAdmin())->put(route('admin.associates.update', $associate), [
        'billing_email' => 'hackeado@otro.com',
        'main_ciiu' => '9999',
    ]);

    $fresh = $associate->fresh();
    expect($fresh->billing_email)->toBe('facturacion@empresa.com');
    expect($fresh->main_ciiu)->toBe('0610');
});

// ─── Independencia entre secciones ──────────────────────────────────────────────

it('enviar contactos no toca el estado de información básica', function () {
    $associate = bootstrapContactsAssociate($this);
    $user = $associate->users->first();

    $this->actingAs($user)->post(route('associate.company.update.contacts'), validContacts());

    $fresh = $associate->fresh();
    expect($fresh->getSectionStatus('contacts'))->toBe('pending');
    expect($fresh->getSectionStatus('basicinfo'))->toBe('draft');
});
