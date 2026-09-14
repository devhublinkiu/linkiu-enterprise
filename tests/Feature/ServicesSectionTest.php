<?php

use App\Models\Associate;
use App\Models\Plan;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;

uses(RefreshDatabase::class);

function svcOwner(): User
{
    return User::factory()->create();
}

function svcSectionAdmin(): User
{
    return User::factory()->create(['is_superadmin' => true]);
}

// Catálogo mínimo de servicios activos; devuelve sus ids.
function svcIds(int $n = 2): array
{
    $cat = ServiceCategory::firstOrCreate(['name' => 'Operaciones']);

    return collect(range(1, $n))
        ->map(fn ($i) => Service::create([
            'name' => 'Servicio '.$i.' '.uniqid(),
            'category_id' => $cat->id,
            'is_active' => true,
        ])->id)
        ->all();
}

function svcPayload(array $ids, array $overrides = []): array
{
    return array_merge([
        'description' => 'Somos expertos en perforación y consultoría ambiental para el sector.',
        'service_ids' => $ids,
    ], $overrides);
}

function bootstrapServicesAssociate($test): Associate
{
    $user = svcOwner();
    $test->actingAs($user)->post(route('associate.company.save.draft'), [
        'company_name' => 'Perforaciones del Llano SAS',
    ]);

    return $user->fresh()->associate;
}

// ─── Modelo: máquina de estados ────────────────────────────────────────────────

it('el modelo deriva editable/reabrible/enviable para services', function () {
    $a = new Associate;

    foreach (['draft', 'rejected'] as $editable) {
        $a->setSectionStatus('services', $editable);
        expect($a->canEditSection('services'))->toBeTrue();
        expect($a->canSubmitSection('services'))->toBeTrue();
        expect($a->canReopenSection('services'))->toBeFalse();
    }

    $a->setSectionStatus('services', 'approved');
    expect($a->canEditSection('services'))->toBeFalse();
    expect($a->canReopenSection('services'))->toBeTrue();
});

// ─── Flujo completo ─────────────────────────────────────────────────────────────

it('recorre el ciclo completo de servicios con una sola aprobación por vuelta', function () {
    $associate = bootstrapServicesAssociate($this);
    $user = $associate->users->first();
    $ids = svcIds();

    $this->actingAs($user)->post(route('associate.company.update.services'), svcPayload($ids));
    expect($associate->fresh()->getSectionStatus('services'))->toBe('pending');
    expect($associate->fresh()->services)->toHaveCount(2);

    $this->actingAs(svcSectionAdmin())->post(
        route('admin.associates.audit-section', $associate),
        ['section' => 'services', 'action' => 'approve'],
    );
    expect($associate->fresh()->getSectionStatus('services'))->toBe('approved');

    $this->actingAs($user)->post(route('associate.company.reopen.services'));
    expect($associate->fresh()->getSectionStatus('services'))->toBe('draft');
});

// ─── Guardas ─────────────────────────────────────────────────────────────────────

it('no permite reabrir servicios si no está aprobada', function () {
    $associate = bootstrapServicesAssociate($this);
    $user = $associate->users->first();
    $this->actingAs($user)->post(route('associate.company.update.services'), svcPayload(svcIds()));

    $this->actingAs($user)->post(route('associate.company.reopen.services'))
        ->assertSessionHas('error');

    expect($associate->fresh()->getSectionStatus('services'))->toBe('pending');
});

it('no permite guardar borrador de servicios cuando está en revisión', function () {
    $associate = bootstrapServicesAssociate($this);
    $user = $associate->users->first();
    $this->actingAs($user)->post(route('associate.company.update.services'), svcPayload(svcIds()));

    $this->actingAs($user)->post(
        route('associate.company.save.services.draft'),
        svcPayload(svcIds(), ['description' => 'Otro texto']),
    )->assertSessionHas('error');
});

it('el rechazo deja servicios editable y reenviable', function () {
    $associate = bootstrapServicesAssociate($this);
    $user = $associate->users->first();
    $ids = svcIds();
    $this->actingAs($user)->post(route('associate.company.update.services'), svcPayload($ids));

    $this->actingAs(svcSectionAdmin())->post(
        route('admin.associates.audit-section', $associate),
        ['section' => 'services', 'action' => 'reject', 'reason' => 'Amplía la propuesta.'],
    );
    expect($associate->fresh()->getSectionStatus('services'))->toBe('rejected');

    $this->actingAs($user)->post(route('associate.company.update.services'), svcPayload($ids));
    expect($associate->fresh()->getSectionStatus('services'))->toBe('pending');
});

// ─── Reglas propias (ADR-0005-d) ─────────────────────────────────────────────────

it('rechaza el envío sin propuesta de valor', function () {
    $associate = bootstrapServicesAssociate($this);
    $user = $associate->users->first();

    $this->actingAs($user)->post(
        route('associate.company.update.services'),
        svcPayload(svcIds(), ['description' => '']),
    )->assertSessionHasErrors('description');

    expect($associate->fresh()->getSectionStatus('services'))->toBe('draft');
});

it('rechaza el envío sin servicios', function () {
    $associate = bootstrapServicesAssociate($this);
    $user = $associate->users->first();

    $this->actingAs($user)->post(
        route('associate.company.update.services'),
        svcPayload([], ['service_ids' => []]),
    )->assertSessionHasErrors('service_ids');
});

it('rechaza servicios inexistentes', function () {
    $associate = bootstrapServicesAssociate($this);
    $user = $associate->users->first();

    $this->actingAs($user)->post(
        route('associate.company.update.services'),
        svcPayload([999999]),
    )->assertSessionHasErrors('service_ids.0');
});

it('rechaza superar el límite de servicios del plan', function () {
    $associate = bootstrapServicesAssociate($this);
    $user = $associate->users->first();

    $plan = Plan::create(['name' => 'Básico', 'slug' => 'basico', 'limit_services' => 1]);
    $associate->plan_id = $plan->id;
    $associate->save();

    $this->actingAs($user)->post(
        route('associate.company.update.services'),
        svcPayload(svcIds(2)), // 2 servicios, límite 1
    )->assertSessionHas('error');

    expect($associate->fresh()->getSectionStatus('services'))->toBe('draft');
});

// ─── Hora local ──────────────────────────────────────────────────────────────────

it('la marca de "borrador guardado" de servicios se muestra en hora de Colombia', function () {
    Carbon::setTestNow(Carbon::parse('2026-09-14 02:12:29', 'UTC'));

    $associate = bootstrapServicesAssociate($this);
    $user = $associate->users->first();

    $this->actingAs($user)
        ->post(route('associate.company.save.services.draft'), svcPayload(svcIds()))
        ->assertSessionHas('draft_saved', '13/09/2026 21:12:29');

    Carbon::setTestNow();
});

// ─── Independencia ───────────────────────────────────────────────────────────────

it('enviar servicios no toca el estado de información básica', function () {
    $associate = bootstrapServicesAssociate($this);
    $user = $associate->users->first();

    $this->actingAs($user)->post(route('associate.company.update.services'), svcPayload(svcIds()));

    $fresh = $associate->fresh();
    expect($fresh->getSectionStatus('services'))->toBe('pending');
    expect($fresh->getSectionStatus('basicinfo'))->toBe('draft');
});
