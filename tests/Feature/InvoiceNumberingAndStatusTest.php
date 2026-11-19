<?php

use App\Mail\PaymentRejected;
use App\Models\Associate;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Plan;
use App\Models\User;
use App\Services\PaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

function binvPlan(): Plan
{
    return Plan::create([
        'name' => 'Plan Fact',
        'slug' => 'plan-fact-'.uniqid(),
        'price_monthly' => 100000,
        'price_semiannual' => 540000,
        'price_annual' => 1000000,
        'signup_fee' => 0,
        'grace_days' => 5,
        'currency' => 'COP',
    ]);
}

function binvAssociate(Plan $plan): Associate
{
    return Associate::create([
        'company_name' => 'Facturas SAS',
        'status' => 'approved',
        'plan_id' => $plan->id,
        'plan_expires_at' => Carbon::now()->addMonth(),
        'billing_cycle' => 'monthly',
    ]);
}

function binvInvoice(Associate $a, string $type, array $over = []): Invoice
{
    return Invoice::create(array_merge([
        'associate_id' => $a->id,
        'type' => $type,
        'period' => 'Mensualidad - Test',
        'amount' => 100000,
        'status' => 'pendiente',
    ], $over));
}

// ─── Corte A: consecutivo ─────────────────────────────────────────────────

it('asigna un consecutivo por tipo y año al crear facturas', function () {
    $a = binvAssociate(binvPlan());
    $year = now()->year;

    $f1 = binvInvoice($a, 'factura');
    $f2 = binvInvoice($a, 'factura');
    $cc = binvInvoice($a, 'cuenta_cobro');

    expect($f1->invoice_number)->toBe("FC-{$year}-0001");
    expect($f2->invoice_number)->toBe("FC-{$year}-0002");
    expect($cc->invoice_number)->toBe("CC-{$year}-0001");
});

// ─── Corte C: aviso de comprobante rechazado ──────────────────────────────

it('al rechazar un comprobante le avisa al asociado por correo', function () {
    $this->withoutDefer();
    Mail::fake();

    $a = binvAssociate(binvPlan());
    $user = User::factory()->create(['associate_id' => $a->id]);
    $invoice = binvInvoice($a, 'cuenta_cobro');
    $payment = Payment::create([
        'invoice_id' => $invoice->id,
        'associate_id' => $a->id,
        'method' => Payment::METHOD_TRANSFER,
        'status' => Payment::STATUS_PENDING,
        'amount' => 100000,
    ]);

    app(PaymentService::class)->reject($payment, 'Comprobante ilegible');

    Mail::assertSent(PaymentRejected::class, fn (PaymentRejected $m) => $m->hasTo($user->email)
        // El asunto tutea (no "su comprobante"); ver corte posterior al 0028.
        && str_contains($m->envelope()->subject, 'tu comprobante'));
});

it('un fallo de pasarela no dispara el correo de comprobante rechazado', function () {
    $this->withoutDefer();
    Mail::fake();

    $a = binvAssociate(binvPlan());
    User::factory()->create(['associate_id' => $a->id]);
    $invoice = binvInvoice($a, 'cuenta_cobro');
    $payment = Payment::create([
        'invoice_id' => $invoice->id,
        'associate_id' => $a->id,
        'method' => Payment::METHOD_BOLD,
        'status' => Payment::STATUS_PENDING,
        'amount' => 100000,
    ]);

    app(PaymentService::class)->reject($payment, 'Timeout', null, ['payload' => ['x' => 1]]);

    Mail::assertNotSent(PaymentRejected::class);
});

// ─── Corte D: estado derivado en Mis Facturas ─────────────────────────────

it('marca una factura como vencida cuando pasó su vencimiento', function () {
    $a = binvAssociate(binvPlan());
    $user = User::factory()->create(['associate_id' => $a->id]);
    binvInvoice($a, 'cuenta_cobro', ['due_date' => now()->subDay()]);

    $this->actingAs($user)->get(route('associate.company.invoices.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('Associate/Invoices/Index')
            ->where('invoices.0.display_status', 'vencida')
            ->where('invoices.0.is_overdue', true)
            ->whereNot('invoices.0.invoice_number', null)
        );
});

it('marca una factura como en revisión cuando hay un comprobante pendiente', function () {
    $a = binvAssociate(binvPlan());
    $user = User::factory()->create(['associate_id' => $a->id]);
    $invoice = binvInvoice($a, 'cuenta_cobro');
    Payment::create([
        'invoice_id' => $invoice->id,
        'associate_id' => $a->id,
        'method' => Payment::METHOD_TRANSFER,
        'status' => Payment::STATUS_PENDING,
        'amount' => 100000,
    ]);

    $this->actingAs($user)
        ->get(route('associate.company.invoices.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('invoices.0.display_status', 'en_revision')
        );
});

it('marca una factura como rechazada cuando el último intento fue rechazado', function () {
    $a = binvAssociate(binvPlan());
    $user = User::factory()->create(['associate_id' => $a->id]);
    $invoice = binvInvoice($a, 'cuenta_cobro');
    Payment::create([
        'invoice_id' => $invoice->id,
        'associate_id' => $a->id,
        'method' => Payment::METHOD_TRANSFER,
        'status' => Payment::STATUS_REJECTED,
        'amount' => 100000,
        'admin_notes' => 'No coincide el valor',
    ]);

    $this->actingAs($user)
        ->get(route('associate.company.invoices.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('invoices.0.display_status', 'rechazada')
        );
});
