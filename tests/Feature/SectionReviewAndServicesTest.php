<?php

use App\Mail\AssociateAuditRejected;
use App\Mail\SectionAuditApproved;
use App\Models\Associate;
use App\Models\Plan;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

function srvPlan(int $limitServices): Plan
{
    return Plan::create([
        'name' => 'Plan Srv',
        'slug' => 'plan-srv-'.uniqid(),
        'price_monthly' => 1,
        'price_semiannual' => 1,
        'price_annual' => 1,
        'signup_fee' => 0,
        'grace_days' => 5,
        'currency' => 'COP',
        'limit_services' => $limitServices,
    ]);
}

// ─── Corte A: correos de revisión ─────────────────────────────────────────

it('el correo de rechazo usa el nombre visible de la sección y su ruta', function () {
    $associate = Associate::create(['company_name' => 'Rechazo SAS', 'status' => 'pending']);

    $mail = new AssociateAuditRejected($associate, 'characterization', 'Faltan datos');

    expect($mail->fieldName)->toBe('Caracterización');
    expect($mail->sectionUrl)->toBe(route('associate.company.characterization'));
    expect($mail->envelope()->subject)->toContain('Caracterización');
    expect($mail->envelope()->subject)->not->toContain('characterization');
});

it('el correo de aprobación apunta a la sección aprobada', function () {
    $associate = Associate::create(['company_name' => 'Aprob SAS', 'status' => 'approved']);

    $mail = new SectionAuditApproved($associate, 'services');

    expect($mail->sectionName)->toBe('Servicios');
    expect($mail->sectionUrl)->toBe(route('associate.company.services'));
});

// ─── Corte B: el borrador no borra "rechazada" ────────────────────────────

it('guardar borrador de una sección rechazada conserva el estado y el motivo', function () {
    $associate = Associate::create(['company_name' => 'Borrador SAS', 'status' => 'approved']);
    $associate->setSectionStatus('services', Associate::SEC_REJECTED, ['rejected_reason' => 'Corrige X']);
    $associate->save();
    $user = User::factory()->create(['associate_id' => $associate->id]);

    $this->actingAs($user)
        ->post(route('associate.company.save.services.draft'), [
            'description' => 'Algo',
            'service_ids' => [],
        ])
        ->assertSessionHasNoErrors();

    $fresh = $associate->fresh();
    expect($fresh->getSectionStatus('services'))->toBe(Associate::SEC_REJECTED);
    expect($fresh->section_reviews['services']['rejected_reason'] ?? null)->toBe('Corrige X');
});

// ─── Corte C: límite de servicios ─────────────────────────────────────────

it('editServices entrega el límite del plan a la pantalla', function () {
    $plan = srvPlan(2);
    $associate = Associate::create(['company_name' => 'Lim SAS', 'status' => 'approved', 'plan_id' => $plan->id]);
    $user = User::factory()->create(['associate_id' => $associate->id]);

    $this->actingAs($user)
        ->get(route('associate.company.services'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('Associate/Company/Services/Index')
            ->where('serviceLimit', 2)
        );
});

it('el borrador rechaza pasarse del límite de servicios del plan', function () {
    $plan = srvPlan(1);
    $associate = Associate::create(['company_name' => 'Lim2 SAS', 'status' => 'approved', 'plan_id' => $plan->id]);
    $user = User::factory()->create(['associate_id' => $associate->id]);

    $cat = ServiceCategory::create(['name' => 'Cat', 'slug' => 'cat-'.Str::random(5)]);
    $s1 = Service::create(['category_id' => $cat->id, 'name' => 'S1', 'slug' => 's1-'.Str::random(5), 'is_active' => true]);
    $s2 = Service::create(['category_id' => $cat->id, 'name' => 'S2', 'slug' => 's2-'.Str::random(5), 'is_active' => true]);

    $this->actingAs($user)
        ->post(route('associate.company.save.services.draft'), [
            'service_ids' => [$s1->id, $s2->id],
        ])
        ->assertSessionHas('error');
});

// ─── Corte 0030 A: correo de re-aprobación ────────────────────────────────

it('re-aprobar una sección de una empresa admitida no ofrece "completar las demás"', function () {
    Mail::fake();
    $associate = Associate::create(['company_name' => 'Admitida SAS', 'status' => 'approved']);
    User::factory()->create(['associate_id' => $associate->id]);
    $admin = User::factory()->create(['is_superadmin' => true]);

    $this->actingAs($admin)
        ->post(route('admin.associates.audit-section', $associate), [
            'section' => 'basicinfo',
            'action' => 'approve',
        ])
        ->assertRedirect();

    Mail::assertSent(SectionAuditApproved::class, fn (SectionAuditApproved $m) => $m->showNextSteps === false);
});

it('aprobar una sección en afiliación sí ofrece "completar las demás"', function () {
    Mail::fake();
    $associate = Associate::create(['company_name' => 'Pending SAS', 'status' => 'pending']);
    User::factory()->create(['associate_id' => $associate->id]);
    $admin = User::factory()->create(['is_superadmin' => true]);

    $this->actingAs($admin)
        ->post(route('admin.associates.audit-section', $associate), [
            'section' => 'basicinfo',
            'action' => 'approve',
        ])
        ->assertRedirect();

    Mail::assertSent(SectionAuditApproved::class, fn (SectionAuditApproved $m) => $m->showNextSteps === true);
});

// ─── Corte 0030 B: documentación editable en afiliación ───────────────────

it('en afiliación (pending) se puede reabrir la sección de Documentación', function () {
    $associate = Associate::create(['company_name' => 'Docs SAS', 'status' => 'pending']);
    $associate->setSectionStatus('documentation', Associate::SEC_APPROVED);
    $associate->save();
    $user = User::factory()->create(['associate_id' => $associate->id]);

    $this->actingAs($user)
        ->post(route('associate.company.reopen.documentation'))
        ->assertSessionHas('success');
});
