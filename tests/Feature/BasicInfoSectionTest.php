<?php

use App\Models\Associate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// Payload válido y completo para "Enviar a revisión" (los 12 obligatorios + opcionales).
function validBasicInfo(array $overrides = []): array
{
    return array_merge([
        'company_name' => 'Minera Los Andes SAS',
        'nit' => '900123456-7',
        'legal_status' => 'SAS',
        'department' => 'Antioquia',
        'department_id' => 1,
        'city' => 'Medellín',
        'city_id' => 1,
        'address' => 'Calle 1 # 2-3',
        'phone' => '3001234567',
        'rep_name' => 'Ana Pérez',
        'rep_position' => 'Gerente',
        'rep_doc_type' => 'CC',
        'rep_doc' => '123456',
        'country_origin' => 'Colombia',
    ], $overrides);
}

function associateOwner(): User
{
    return User::factory()->create();
}

function admin(): User
{
    return User::factory()->create(['is_superadmin' => true]);
}

// ─── Modelo: máquina de estados ────────────────────────────────────────────────

it('el modelo deriva bien editable/reabrible/enviable por estado', function () {
    $a = new Associate;

    foreach (['draft', 'rejected'] as $editable) {
        $a->setSectionStatus('basicinfo', $editable);
        expect($a->canEditSection('basicinfo'))->toBeTrue();
        expect($a->canSubmitSection('basicinfo'))->toBeTrue();
        expect($a->canReopenSection('basicinfo'))->toBeFalse();
    }

    foreach (['pending', 'approved'] as $locked) {
        $a->setSectionStatus('basicinfo', $locked);
        expect($a->canEditSection('basicinfo'))->toBeFalse();
        expect($a->canSubmitSection('basicinfo'))->toBeFalse();
    }

    $a->setSectionStatus('basicinfo', 'approved');
    expect($a->canReopenSection('basicinfo'))->toBeTrue();
});

// ─── Flujo completo: draft → pending → approved → Editar → pending → approved ───

it('recorre el ciclo completo con una sola aprobación por vuelta', function () {
    $user = associateOwner();

    // Borrador (crea la empresa) y envío a revisión.
    $this->actingAs($user)->post(route('associate.company.save.draft'), validBasicInfo());
    $this->actingAs($user)->post(route('associate.company.update.basic'), validBasicInfo());

    $associate = $user->fresh()->associate;
    expect($associate->getSectionStatus('basicinfo'))->toBe('pending');

    // El admin aprueba la sección.
    $this->actingAs(admin())->post(
        route('admin.associates.audit-section', $associate),
        ['section' => 'basicinfo', 'action' => 'approve'],
    );
    expect($associate->fresh()->getSectionStatus('basicinfo'))->toBe('approved');

    // El asociado reabre con "Editar" → vuelve a draft.
    $this->actingAs($user)->post(route('associate.company.reopen.basic'));
    expect($associate->fresh()->getSectionStatus('basicinfo'))->toBe('draft');

    // Reenvía y se vuelve a aprobar.
    $this->actingAs($user)->post(
        route('associate.company.update.basic'),
        validBasicInfo(['company_name' => 'Minera Los Andes S.A.S.']),
    );
    expect($associate->fresh()->getSectionStatus('basicinfo'))->toBe('pending');
    expect($associate->fresh()->company_name)->toBe('Minera Los Andes S.A.S.');
});

// ─── Guardas del servidor ───────────────────────────────────────────────────────

it('no permite reabrir una sección que no está aprobada', function () {
    $user = associateOwner();
    $this->actingAs($user)->post(route('associate.company.update.basic'), validBasicInfo());
    $associate = $user->fresh()->associate; // pending

    $this->actingAs($user)->post(route('associate.company.reopen.basic'))
        ->assertSessionHas('error');

    expect($associate->fresh()->getSectionStatus('basicinfo'))->toBe('pending');
});

it('no permite enviar una sección aprobada sin reabrirla', function () {
    $user = associateOwner();
    $this->actingAs($user)->post(route('associate.company.update.basic'), validBasicInfo());
    $associate = $user->fresh()->associate;
    $this->actingAs(admin())->post(
        route('admin.associates.audit-section', $associate),
        ['section' => 'basicinfo', 'action' => 'approve'],
    );

    $this->actingAs($user)->post(route('associate.company.update.basic'), validBasicInfo())
        ->assertSessionHas('error');

    expect($associate->fresh()->getSectionStatus('basicinfo'))->toBe('approved');
});

it('no permite guardar borrador cuando la sección está en revisión', function () {
    $user = associateOwner();
    $this->actingAs($user)->post(route('associate.company.update.basic'), validBasicInfo());
    $associate = $user->fresh()->associate; // pending

    $this->actingAs($user)->post(
        route('associate.company.save.draft'),
        validBasicInfo(['company_name' => 'OTRO NOMBRE']),
    )->assertSessionHas('error');

    expect($associate->fresh()->company_name)->toBe('Minera Los Andes SAS');
    expect($associate->fresh()->getSectionStatus('basicinfo'))->toBe('pending');
});

it('el rechazo deja la sección editable y reenviable', function () {
    $user = associateOwner();
    $this->actingAs($user)->post(route('associate.company.update.basic'), validBasicInfo());
    $associate = $user->fresh()->associate;

    $this->actingAs(admin())->post(
        route('admin.associates.audit-section', $associate),
        ['section' => 'basicinfo', 'action' => 'reject', 'reason' => 'Corrige el NIT.'],
    );
    expect($associate->fresh()->getSectionStatus('basicinfo'))->toBe('rejected');

    $this->actingAs($user)->post(route('associate.company.update.basic'), validBasicInfo());
    expect($associate->fresh()->getSectionStatus('basicinfo'))->toBe('pending');
});

// ─── basicinfo ya no usa el flujo de solicitud de cambio ────────────────────────

it('rechaza una solicitud de cambio sobre basicinfo (usa Editar)', function () {
    $user = associateOwner();
    $this->actingAs($user)->post(route('associate.company.update.basic'), validBasicInfo());

    $this->actingAs($user)->post(
        route('associate.company.request.section.change'),
        ['section' => 'basicinfo', 'reason' => 'Quiero cambiar el nombre'],
    )->assertSessionHasErrors('section');
});

// ─── Independencia entre secciones ──────────────────────────────────────────────

it('enviar información básica no toca el estado de caracterización', function () {
    $user = associateOwner();
    $this->actingAs($user)->post(route('associate.company.update.basic'), validBasicInfo());

    $associate = $user->fresh()->associate;
    expect($associate->getSectionStatus('basicinfo'))->toBe('pending');
    expect($associate->getSectionStatus('characterization'))->toBe('draft');
});

// ─── El admin no edita la ficha (ADR-0005) ──────────────────────────────────────

it('el admin ya no puede editar los campos de información básica', function () {
    $user = associateOwner();
    $this->actingAs($user)->post(route('associate.company.update.basic'), validBasicInfo());
    $associate = $user->fresh()->associate;

    $this->actingAs(admin())->put(route('admin.associates.update', $associate), [
        'company_name' => 'NOMBRE CAMBIADO POR ADMIN',
        'nit' => '999999999-9',
    ]);

    expect($associate->fresh()->company_name)->toBe('Minera Los Andes SAS');
    expect($associate->fresh()->nit)->toBe('900123456-7');
});
