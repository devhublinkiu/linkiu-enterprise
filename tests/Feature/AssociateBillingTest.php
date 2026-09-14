<?php

use App\Models\Associate;
use App\Models\Invoice;
use App\Models\Plan;
use App\Models\User;
use Database\Seeders\FeatureSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

function billingPlan(): Plan
{
    return Plan::create([
        'name' => 'Plan Oro',
        'slug' => 'plan-oro-'.uniqid(),
        'price_monthly' => 100000,
        'price_semiannual' => 540000,
        'price_annual' => 1000000,
        'signup_fee' => 250000,
        'grace_days' => 5,
        'is_active' => true,
    ]);
}

function billingUser(Associate $associate): User
{
    return User::factory()->create(['associate_id' => $associate->id]);
}

it('el panel del plan expone módulos reales y ya no incluye payment_requests', function () {
    $plan = billingPlan();
    $this->seed(FeatureSeeder::class);

    $associate = Associate::create([
        'company_name' => 'Activa SAS',
        'status' => 'approved',
        'plan_id' => $plan->id,
        'billing_cycle' => 'monthly',
        'plan_expires_at' => now()->addMonth(),
    ]);

    $this->actingAs(billingUser($associate))
        ->get(route('associate.company.billing'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Associate/Billing/Index')
            ->missing('paymentRequest')
            ->has('currentPlan.modules')
            ->has('currentPlan.limits')
            ->has('availablePlans.0.modules')
        );
});

it('un vencido sin pendientes recibe su cuenta de reactivación', function () {
    $plan = billingPlan();
    $this->seed(FeatureSeeder::class);

    $associate = Associate::create([
        'company_name' => 'Vencida SAS',
        'status' => 'approved',
        'plan_id' => $plan->id,
        'billing_cycle' => 'monthly',
        'plan_expires_at' => now()->subMonths(2),
    ]);

    expect(Invoice::where('associate_id', $associate->id)->count())->toBe(0);

    $this->actingAs(billingUser($associate))
        ->get(route('associate.company.billing'))
        ->assertOk();

    $invoice = Invoice::where('associate_id', $associate->id)->first();
    expect($invoice)->not->toBeNull();
    expect($invoice->period)->toStartWith('Reactivación');
});
