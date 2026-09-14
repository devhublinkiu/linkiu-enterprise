<?php

use App\Models\Associate;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;

uses(RefreshDatabase::class);

function lifecycleAdmin(): User
{
    return User::factory()->create(['is_superadmin' => true]);
}

function lifecyclePlan(int $graceDays = 5): Plan
{
    return Plan::create([
        'name' => 'Plan Básico',
        'slug' => 'plan-basico-'.uniqid(),
        'grace_days' => $graceDays,
    ]);
}

// Empresa con las 5 secciones en el estado dado (por defecto, todas aprobadas).
function associateWithSections(string $sectionStatus = 'approved', array $overrides = []): Associate
{
    $reviews = [];
    foreach (Associate::REVIEWABLE_SECTIONS as $s) {
        $reviews[$s] = ['status' => $sectionStatus];
    }

    return Associate::create(array_merge([
        'company_name' => 'Empresa Ciclo SAS',
        'section_reviews' => $reviews,
    ], $overrides));
}

// ─── Gate de admisión ─────────────────────────────────────────────────────────

it('no admite si faltan secciones por aprobar', function () {
    $associate = associateWithSections('pending', ['status' => 'pending']);

    $this->actingAs(lifecycleAdmin())
        ->post(route('admin.associates.approve', $associate))
        ->assertSessionHas('error');

    expect($associate->fresh()->status)->toBe('pending');
});

it('admite cuando las 5 secciones están aprobadas', function () {
    $associate = associateWithSections('approved', ['status' => 'pending']);

    $this->actingAs(lifecycleAdmin())->post(route('admin.associates.approve', $associate));

    expect($associate->fresh()->status)->toBe('verified');
});

// ─── Estado derivado ────────────────────────────────────────────────────────────

it('deriva el estado admin de status + suscripción + desactivación', function () {
    $plan = lifecyclePlan(5);

    $pendiente = associateWithSections('pending', ['status' => 'pending']);
    expect($pendiente->adminState())->toBe('pendiente');

    $admitida = associateWithSections('approved', ['status' => 'verified']);
    expect($admitida->adminState())->toBe('admitida_sin_pago');

    $activa = associateWithSections('approved', [
        'status' => 'approved',
        'plan_id' => $plan->id,
        'plan_expires_at' => Carbon::now()->addDays(10),
    ]);
    expect($activa->adminState())->toBe('activa');

    $gracia = associateWithSections('approved', [
        'status' => 'approved',
        'plan_id' => $plan->id,
        'plan_expires_at' => Carbon::now()->subDay(),
    ]);
    expect($gracia->adminState())->toBe('en_gracia');

    $vencida = associateWithSections('approved', [
        'status' => 'approved',
        'plan_id' => $plan->id,
        'plan_expires_at' => Carbon::now()->subDays(30),
    ]);
    expect($vencida->adminState())->toBe('vencida');

    $desactivada = associateWithSections('approved', [
        'status' => 'approved',
        'plan_id' => $plan->id,
        'plan_expires_at' => Carbon::now()->addDays(10),
        'deactivated_at' => Carbon::now(),
    ]);
    expect($desactivada->adminState())->toBe('desactivada');
});

// ─── Desactivar / reactivar ─────────────────────────────────────────────────────

it('desactiva manualmente: sella la marca y saca del directorio', function () {
    $plan = lifecyclePlan(5);
    $associate = associateWithSections('approved', [
        'status' => 'approved',
        'is_public' => true,
        'plan_id' => $plan->id,
        'plan_expires_at' => Carbon::now()->addDays(10),
    ]);

    $this->actingAs(lifecycleAdmin())->post(route('admin.associates.deactivate', $associate));

    $fresh = $associate->fresh();
    expect($fresh->deactivated_at)->not->toBeNull();
    expect($fresh->is_public)->toBeFalse();
    expect($fresh->adminState())->toBe('desactivada');
});

it('reactiva y republica si la suscripción está al día', function () {
    $plan = lifecyclePlan(5);
    $associate = associateWithSections('approved', [
        'status' => 'approved',
        'is_public' => false,
        'deactivated_at' => Carbon::now(),
        'plan_id' => $plan->id,
        'plan_expires_at' => Carbon::now()->addDays(10),
    ]);

    $this->actingAs(lifecycleAdmin())->post(route('admin.associates.reactivate', $associate));

    $fresh = $associate->fresh();
    expect($fresh->deactivated_at)->toBeNull();
    expect($fresh->is_public)->toBeTrue();
    expect($fresh->adminState())->toBe('activa');
});

it('reactiva pero no republica si la suscripción está vencida', function () {
    $plan = lifecyclePlan(0);
    $associate = associateWithSections('approved', [
        'status' => 'approved',
        'is_public' => false,
        'deactivated_at' => Carbon::now(),
        'plan_id' => $plan->id,
        'plan_expires_at' => Carbon::now()->subDays(30),
    ]);

    $this->actingAs(lifecycleAdmin())->post(route('admin.associates.reactivate', $associate));

    $fresh = $associate->fresh();
    expect($fresh->deactivated_at)->toBeNull();
    expect($fresh->is_public)->toBeFalse();
    expect($fresh->adminState())->toBe('vencida');
});

// ─── Lista ───────────────────────────────────────────────────────────────────────

it('la lista responde y filtra por estado (una sola tabla)', function () {
    associateWithSections('pending', ['status' => 'pending']);
    associateWithSections('approved', ['status' => 'verified']);

    $admin = lifecycleAdmin();

    $this->actingAs($admin)->get(route('admin.associates.index'))->assertOk();
    $this->actingAs($admin)->get(route('admin.associates.index', ['estado' => 'admitida']))->assertOk();
});

it('un asociado no puede entrar a la lista admin', function () {
    $associate = Associate::create(['company_name' => 'X']);
    $user = User::factory()->create([
        'is_superadmin' => false,
        'role' => 'user',
        'associate_id' => $associate->id,
    ]);

    $this->actingAs($user)->get(route('admin.associates.index'))->assertForbidden();
});
