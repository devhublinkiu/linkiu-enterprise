<?php

use App\Models\Associate;
use App\Models\BillingSetting;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    config()->set('inertia.testing.ensure_pages_exist', false);
    BillingSetting::forget(); // prórroga global por defecto = 5 días
});

function filterAdmin(): User
{
    return User::factory()->create(['is_superadmin' => true]);
}

function seedLifecycleStates(): void
{
    $plan = Plan::create([
        'name' => 'Plan Filtro',
        'slug' => 'plan-filtro-'.uniqid(),
        'price_monthly' => 100000,
        'price_semiannual' => 540000,
        'price_annual' => 1000000,
        'signup_fee' => 0,
        'grace_days' => 5,
        'currency' => 'COP',
    ]);
    $pid = $plan->id;

    Associate::create(['company_name' => 'Pendiente SA', 'nit' => '900000001', 'status' => 'pending']);
    Associate::create(['company_name' => 'Admitida SA', 'nit' => '900000002', 'status' => 'verified']);
    Associate::create(['company_name' => 'Activa SA', 'nit' => '900000003', 'status' => 'approved', 'plan_id' => $pid, 'plan_expires_at' => now()->addMonth()]);
    Associate::create(['company_name' => 'Gracia SA', 'nit' => '900000004', 'status' => 'approved', 'plan_id' => $pid, 'plan_expires_at' => now()->subDays(2)]);
    Associate::create(['company_name' => 'Vencida SA', 'nit' => '900000005', 'status' => 'approved', 'plan_id' => $pid, 'plan_expires_at' => now()->subDays(30)]);
    Associate::create(['company_name' => 'Desactivada SA', 'nit' => '900000006', 'status' => 'approved', 'plan_id' => $pid, 'plan_expires_at' => now()->addMonth(), 'deactivated_at' => now()]);
}

it('cada filtro del listado trae exactamente su grupo', function () {
    seedLifecycleStates();
    $admin = filterAdmin();

    $cases = [
        'todas' => 6,
        'pendiente' => 1,
        'admitida' => 1,
        'activa' => 1,
        'en_gracia' => 1,
        'vencida' => 1,
        'desactivada' => 1,
    ];

    foreach ($cases as $estado => $expected) {
        $this->actingAs($admin)
            ->get(route('admin.associates.index', ['estado' => $estado]))
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Associates/Index')
                ->has('associates.data', $expected));
    }
});

it('los contadores del sidebar reflejan los estados derivados', function () {
    seedLifecycleStates();

    $this->actingAs(filterAdmin())
        ->get(route('admin.associates.index'))
        ->assertInertia(fn ($page) => $page
            ->where('associate_counts.total', 6)
            ->where('associate_counts.activa', 1)
            ->where('associate_counts.en_gracia', 1)
            ->where('associate_counts.vencida', 1)
            ->where('associate_counts.desactivada', 1));
});
