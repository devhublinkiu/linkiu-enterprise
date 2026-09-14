<?php

use App\Models\Associate;
use App\Models\Invoice;
use App\Models\Plan;
use App\Models\User;
use App\Services\BillingService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

/**
 * Modelo de alta unificado (plan 0016, ADR-0008):
 *   - Primera vez con cuota inicial (>0): se cobra SOLO la cuota inicial (exonera
 *     el mes 1). El ciclo recurrente arranca mensual.
 *   - Primera vez sin cuota inicial: se cobra la primera mensualidad.
 *   - Renovación / cambio de plan / reactivación: se cobra el ciclo, sin cuota inicial.
 */
function signupPlan(array $overrides = []): Plan
{
    return Plan::create(array_merge([
        'name' => 'Plan Oro',
        'slug' => 'plan-oro-'.uniqid(),
        'price_monthly' => 100000,
        'price_semiannual' => 540000,
        'price_annual' => 1000000,
        'signup_fee' => 250000,
        'grace_days' => 5,
        'currency' => 'COP',
    ], $overrides));
}

function signupUser(Associate $associate): User
{
    return User::factory()->create(['associate_id' => $associate->id]);
}

it('la primera vez cobra SOLO la cuota inicial (exonera el mes 1)', function () {
    $plan = signupPlan(['signup_fee' => 250000]);
    $associate = Associate::create(['company_name' => 'Nueva SAS', 'status' => 'verified']);
    $user = signupUser($associate);

    $this->actingAs($user)
        ->post(route('associate.checkout.store', $plan->id))
        ->assertRedirect();

    $invoices = Invoice::where('associate_id', $associate->id)->get();

    expect($invoices)->toHaveCount(1);
    expect((float) $invoices->first()->amount)->toBe(250000.0);
    expect($invoices->first()->cycle)->toBe('signup');
    expect($invoices->first()->type)->toBe('cuenta_cobro');
    expect($invoices->first()->period)->toStartWith('Cuota inicial');
    // El ciclo recurrente arranca mensual.
    expect($associate->fresh()->billing_cycle)->toBe('monthly');
});

it('la primera vez sin cuota inicial cobra la primera mensualidad', function () {
    $plan = signupPlan(['signup_fee' => 0]);
    $associate = Associate::create(['company_name' => 'SinCuota SAS', 'status' => 'verified']);
    $user = signupUser($associate);

    $this->actingAs($user)->post(route('associate.checkout.store', $plan->id));

    $invoice = Invoice::where('associate_id', $associate->id)->firstOrFail();

    expect((float) $invoice->amount)->toBe(100000.0);
    expect($invoice->cycle)->toBe('monthly');
});

it('una renovación cobra el ciclo sin cuota inicial', function () {
    $plan = signupPlan(['signup_fee' => 250000]);
    $associate = Associate::create([
        'company_name' => 'Renueva SAS',
        'status' => 'approved',
        'plan_id' => $plan->id,
        'billing_cycle' => 'monthly',
    ]);
    $user = signupUser($associate);

    $this->actingAs($user)->post(route('associate.checkout.store', $plan->id));

    $invoice = Invoice::where('associate_id', $associate->id)->latest('id')->firstOrFail();

    // Solo el ciclo mensual; la cuota inicial NO se vuelve a cobrar.
    expect((float) $invoice->amount)->toBe(100000.0);
    expect($invoice->cycle)->not->toBe('signup');
});

it('la reactivación de un vencido cobra el ciclo, sin cuota inicial', function () {
    $plan = signupPlan(['signup_fee' => 250000]);
    $associate = Associate::create([
        'company_name' => 'Vencida SAS',
        'status' => 'approved',
        'plan_id' => $plan->id,
        'billing_cycle' => 'monthly',
        'plan_expires_at' => now()->subMonths(2),
    ]);

    $invoice = app(BillingService::class)->issueReactivationInvoice($associate->fresh());

    expect($invoice)->not->toBeNull();
    expect((float) $invoice->amount)->toBe(100000.0);   // mensualidad, sin cuota inicial
});
