<?php

use App\Models\Associate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;

uses(RefreshDatabase::class);

// Helpers locales (nombres propios para no chocar con los de BasicInfoSectionTest).
function charOwner(): User
{
    return User::factory()->create();
}

function charAdmin(): User
{
    return User::factory()->create(['is_superadmin' => true]);
}

// Payload válido y completo para "Enviar a revisión" (obligatorios + condicionales coherentes).
function validCharacterization(array $overrides = []): array
{
    return array_merge([
        'employees_tech' => 5,
        'employees_prof' => 3,
        'employees_admin' => 2,
        'employees_exec' => 1,
        'employees_other' => 0,
        'employees_other_desc' => '',
        'hydrocarbons_participation' => false,
        'hydrocarbons_level' => '',
        'pep_declaration' => false,
        'pep_name' => '',
        'pep_doc_type' => '',
        'pep_entity' => '',
        'capacitation_plan' => false,
        'capacitation_level' => '',
        'capacitation_no_reason' => 'Falta de recursos',
        'company_classification' => 'Pequeña',
        'public_income_pct' => 60,
        'private_income_pct' => 40,
        'other_guilds' => '',
    ], $overrides);
}

// Crea la empresa (vía borrador de Información Básica, todo opcional) y devuelve el associate.
function bootstrapAssociate($test): Associate
{
    $user = charOwner();
    $test->actingAs($user)->post(route('associate.company.save.draft'), [
        'company_name' => 'Perforaciones del Llano SAS',
    ]);

    return $user->fresh()->associate;
}

// ─── Modelo: máquina de estados ────────────────────────────────────────────────

it('el modelo deriva editable/reabrible/enviable para characterization', function () {
    $a = new Associate;

    foreach (['draft', 'rejected'] as $editable) {
        $a->setSectionStatus('characterization', $editable);
        expect($a->canEditSection('characterization'))->toBeTrue();
        expect($a->canSubmitSection('characterization'))->toBeTrue();
        expect($a->canReopenSection('characterization'))->toBeFalse();
    }

    $a->setSectionStatus('characterization', 'approved');
    expect($a->canEditSection('characterization'))->toBeFalse();
    expect($a->canReopenSection('characterization'))->toBeTrue();
});

// ─── Flujo completo: draft → pending → approved → Editar → pending → approved ───

it('recorre el ciclo completo de caracterización con una sola aprobación por vuelta', function () {
    $associate = bootstrapAssociate($this);
    $user = $associate->users->first();

    $this->actingAs($user)->post(route('associate.company.update.characterization'), validCharacterization());
    expect($associate->fresh()->getSectionStatus('characterization'))->toBe('pending');

    $this->actingAs(charAdmin())->post(
        route('admin.associates.audit-section', $associate),
        ['section' => 'characterization', 'action' => 'approve'],
    );
    expect($associate->fresh()->getSectionStatus('characterization'))->toBe('approved');

    $this->actingAs($user)->post(route('associate.company.reopen.characterization'));
    expect($associate->fresh()->getSectionStatus('characterization'))->toBe('draft');

    $this->actingAs($user)->post(
        route('associate.company.update.characterization'),
        validCharacterization(['company_classification' => 'Mediana']),
    );
    expect($associate->fresh()->getSectionStatus('characterization'))->toBe('pending');
    expect($associate->fresh()->company_classification)->toBe('Mediana');
});

// ─── Guardas del servidor ───────────────────────────────────────────────────────

it('no permite reabrir caracterización si no está aprobada', function () {
    $associate = bootstrapAssociate($this);
    $user = $associate->users->first();
    $this->actingAs($user)->post(route('associate.company.update.characterization'), validCharacterization());

    $this->actingAs($user)->post(route('associate.company.reopen.characterization'))
        ->assertSessionHas('error');

    expect($associate->fresh()->getSectionStatus('characterization'))->toBe('pending');
});

it('no permite guardar borrador de caracterización cuando está en revisión', function () {
    $associate = bootstrapAssociate($this);
    $user = $associate->users->first();
    $this->actingAs($user)->post(route('associate.company.update.characterization'), validCharacterization());

    $this->actingAs($user)->post(
        route('associate.company.save.characterization.draft'),
        validCharacterization(['company_classification' => 'Grande']),
    )->assertSessionHas('error');

    expect($associate->fresh()->company_classification)->toBe('Pequeña');
});

it('el rechazo deja caracterización editable y reenviable', function () {
    $associate = bootstrapAssociate($this);
    $user = $associate->users->first();
    $this->actingAs($user)->post(route('associate.company.update.characterization'), validCharacterization());

    $this->actingAs(charAdmin())->post(
        route('admin.associates.audit-section', $associate),
        ['section' => 'characterization', 'action' => 'reject', 'reason' => 'Revisa los ingresos.'],
    );
    expect($associate->fresh()->getSectionStatus('characterization'))->toBe('rejected');

    $this->actingAs($user)->post(route('associate.company.update.characterization'), validCharacterization());
    expect($associate->fresh()->getSectionStatus('characterization'))->toBe('pending');
});

// ─── Reglas propias (ADR-0005-b) ────────────────────────────────────────────────

it('rechaza el envío si los ingresos no suman 100%', function () {
    $associate = bootstrapAssociate($this);
    $user = $associate->users->first();

    $this->actingAs($user)->post(
        route('associate.company.update.characterization'),
        validCharacterization(['public_income_pct' => 60, 'private_income_pct' => 30]),
    )->assertSessionHasErrors(['public_income_pct', 'private_income_pct']);

    expect($associate->fresh()->getSectionStatus('characterization'))->toBe('draft');
});

it('exige el nivel de hidrocarburos cuando participa', function () {
    $associate = bootstrapAssociate($this);
    $user = $associate->users->first();

    $this->actingAs($user)->post(
        route('associate.company.update.characterization'),
        validCharacterization(['hydrocarbons_participation' => true, 'hydrocarbons_level' => '']),
    )->assertSessionHasErrors('hydrocarbons_level');
});

it('exige nombre/doc/entidad del PEP cuando se declara', function () {
    $associate = bootstrapAssociate($this);
    $user = $associate->users->first();

    $this->actingAs($user)->post(
        route('associate.company.update.characterization'),
        validCharacterization([
            'pep_declaration' => true,
            'pep_name' => '',
            'pep_doc_type' => '',
            'pep_entity' => '',
        ]),
    )->assertSessionHasErrors(['pep_name', 'pep_doc_type', 'pep_entity']);
});

it('recalcula el total de empleados como la suma de categorías (ignora el valor del cliente)', function () {
    $associate = bootstrapAssociate($this);
    $user = $associate->users->first();

    $this->actingAs($user)->post(
        route('associate.company.update.characterization'),
        validCharacterization([
            'employees_tech' => 5,
            'employees_prof' => 3,
            'employees_admin' => 2,
            'employees_exec' => 1,
            'employees_other' => 0,
            'employees_direct_count' => 999, // manipulado
        ]),
    );

    expect($associate->fresh()->employees_direct_count)->toBe(11);
});

it('limpia los condicionales cuando su disparador es negativo', function () {
    $associate = bootstrapAssociate($this);
    $user = $associate->users->first();

    // Guarda un borrador con datos condicionales y disparadores en falso.
    $this->actingAs($user)->post(
        route('associate.company.save.characterization.draft'),
        validCharacterization([
            'hydrocarbons_participation' => false,
            'hydrocarbons_level' => 'Nacional',
            'pep_declaration' => false,
            'pep_name' => 'Juan',
        ]),
    );

    $fresh = $associate->fresh();
    expect($fresh->hydrocarbons_level)->toBeNull();
    expect($fresh->pep_name)->toBeNull();
});

// ─── characterization ya no usa el flujo de solicitud de cambio ─────────────────

it('rechaza una solicitud de cambio sobre characterization (usa Editar)', function () {
    $associate = bootstrapAssociate($this);
    $user = $associate->users->first();

    $this->actingAs($user)->post(
        route('associate.company.request.section.change'),
        ['section' => 'characterization', 'reason' => 'Quiero cambiar algo'],
    )->assertSessionHasErrors('section');
});

// ─── La marca de "borrador guardado" se muestra en hora local ────────────────────

it('la marca de "borrador guardado" se muestra en hora de Colombia', function () {
    // 02:12:29 UTC = 21:12:29 del día anterior en Colombia (UTC−5).
    Carbon::setTestNow(Carbon::parse('2026-09-14 02:12:29', 'UTC'));

    $associate = bootstrapAssociate($this);
    $user = $associate->users->first();

    $this->actingAs($user)
        ->post(
            route('associate.company.save.characterization.draft'),
            validCharacterization(),
        )
        ->assertSessionHas('draft_saved', '13/09/2026 21:12:29');

    Carbon::setTestNow();
});

// ─── El admin no edita la ficha (ADR-0005) ──────────────────────────────────────

it('el admin ya no puede editar los campos de caracterización', function () {
    $associate = bootstrapAssociate($this);
    $user = $associate->users->first();
    $this->actingAs($user)->post(
        route('associate.company.update.characterization'),
        validCharacterization(),
    );

    $this->actingAs(charAdmin())->put(route('admin.associates.update', $associate), [
        'company_classification' => 'Grande',
        'public_income_pct' => 10,
    ]);

    $fresh = $associate->fresh();
    expect($fresh->company_classification)->toBe('Pequeña');
    expect($fresh->public_income_pct)->toBe(60);
});

// ─── Independencia entre secciones ──────────────────────────────────────────────

it('enviar caracterización no toca el estado de información básica', function () {
    $associate = bootstrapAssociate($this);
    $user = $associate->users->first();

    $this->actingAs($user)->post(route('associate.company.update.characterization'), validCharacterization());

    $fresh = $associate->fresh();
    expect($fresh->getSectionStatus('characterization'))->toBe('pending');
    expect($fresh->getSectionStatus('basicinfo'))->toBe('draft');
});
