<?php

use App\Models\Associate;
use App\Models\BillingSetting;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Plan;
use App\Models\User;
use App\Services\PaymentService;
use App\Services\SubscriptionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;

uses(RefreshDatabase::class);

// La caché de ajustes de cobro es estática por proceso; se limpia entre tests.
beforeEach(fn () => BillingSetting::forget());

function engPlan(): Plan
{
    return Plan::create([
        'name' => 'Plan Test',
        'slug' => 'plan-test-'.uniqid(),
        'price_monthly' => 100000,
        'price_semiannual' => 540000,
        'price_annual' => 1000000,
        'signup_fee' => 0,
        'grace_days' => 5,
        'currency' => 'COP',
    ]);
}

function engInvoice(Associate $associate, Plan $plan): Invoice
{
    return Invoice::create([
        'associate_id' => $associate->id,
        'plan_id' => $plan->id,
        'type' => 'cuenta_cobro',
        'period' => 'Mensualidad - Test',
        'period_key' => now()->format('Y-m'),
        'cycle' => 'monthly',
        'amount' => 100000,
        'status' => 'pendiente',
    ]);
}

it('la vigencia cubre todo el día de corte (fin de día, no 00:00)', function () {
    $exp = SubscriptionService::nextExpiration(null, 'monthly', Carbon::parse('2026-03-10 10:00:00'));

    expect($exp->day)->toBe(BillingSetting::cutoffDay()); // día 19 por defecto
    expect($exp->hour)->toBe(23);
    expect($exp->minute)->toBe(59);
});

it('dos pagos sobre la misma factura NO extienden la vigencia dos veces', function () {
    $plan = engPlan();
    $associate = Associate::create([
        'company_name' => 'Doble SAS',
        'status' => 'approved',
        'plan_id' => $plan->id,
        'plan_expires_at' => Carbon::parse('2026-03-19 23:59:59'),
        'billing_cycle' => 'monthly',
    ]);
    $invoice = engInvoice($associate, $plan);
    $payments = app(PaymentService::class);

    $p1 = Payment::create([
        'invoice_id' => $invoice->id, 'associate_id' => $associate->id,
        'method' => Payment::METHOD_TRANSFER, 'status' => Payment::STATUS_PENDING, 'amount' => 100000,
    ]);
    $payments->approve($p1);
    $firstExpiration = $associate->fresh()->plan_expires_at;

    // Un segundo pago sobre la MISMA factura (ya pagada) no debe mover la fecha.
    $p2 = Payment::create([
        'invoice_id' => $invoice->id, 'associate_id' => $associate->id,
        'method' => Payment::METHOD_TRANSFER, 'status' => Payment::STATUS_PENDING, 'amount' => 100000,
    ]);
    $payments->approve($p2);

    expect($associate->fresh()->plan_expires_at->toDateTimeString())
        ->toBe($firstExpiration->toDateTimeString());
});

it('el admin no puede aprobar a mano un pago en línea (Bold)', function () {
    $plan = engPlan();
    $associate = Associate::create(['company_name' => 'Bold SAS', 'status' => 'approved', 'plan_id' => $plan->id]);
    $invoice = engInvoice($associate, $plan);
    $admin = User::factory()->create(['is_superadmin' => true]);

    $bold = Payment::create([
        'invoice_id' => $invoice->id, 'associate_id' => $associate->id,
        'method' => Payment::METHOD_BOLD, 'status' => Payment::STATUS_PENDING, 'amount' => 100000,
    ]);

    $this->actingAs($admin)
        ->patch(route('admin.payments.approve', $bold))
        ->assertSessionHas('error');

    expect($bold->fresh()->isApplied())->toBeFalse();
    expect($bold->fresh()->status)->toBe(Payment::STATUS_PENDING);
});

it('el admin registra la mensualidad en efectivo y genera la factura al vuelo', function () {
    $plan = engPlan();
    $associate = Associate::create([
        'company_name' => 'Efectivo SAS', 'status' => 'approved', 'plan_id' => $plan->id,
        'plan_expires_at' => Carbon::parse('2026-01-19 23:59:59'), 'billing_cycle' => 'monthly',
    ]);
    $admin = User::factory()->create(['is_superadmin' => true]);

    expect(Invoice::where('associate_id', $associate->id)->count())->toBe(0);

    $this->actingAs($admin)->post(route('admin.invoices.register-period-payment'), [
        'associate_id' => $associate->id,
        'payment_method' => 'efectivo',
        'paid_at' => now()->toDateString(),
    ])->assertRedirect();

    $invoice = Invoice::where('associate_id', $associate->id)->first();
    expect($invoice)->not->toBeNull();
    expect($invoice->type)->toBe('cuenta_cobro');
    expect($invoice->status)->toBe('pagada');
    expect($associate->fresh()->plan_expires_at->greaterThan(Carbon::parse('2026-01-19 23:59:59')))->toBeTrue();
});

it('el comando mensual solo emite el día de corte (salvo --force)', function () {
    $plan = engPlan();
    $associate = Associate::create([
        'company_name' => 'Cron SAS', 'status' => 'approved', 'plan_id' => $plan->id,
        'plan_expires_at' => now()->subMonth(), 'billing_cycle' => 'monthly',
    ]);

    // Día de corte distinto de hoy → sin --force no emite nada.
    $otherDay = now()->day === 19 ? 20 : 19;
    BillingSetting::query()->update(['cutoff_day' => $otherDay]);
    BillingSetting::forget();

    $this->artisan('invoices:generate-monthly')->assertSuccessful();
    expect(Invoice::where('associate_id', $associate->id)->count())->toBe(0);

    // Con --force sí emite.
    $this->artisan('invoices:generate-monthly --force')->assertSuccessful();
    expect(Invoice::where('associate_id', $associate->id)->count())->toBe(1);
});
