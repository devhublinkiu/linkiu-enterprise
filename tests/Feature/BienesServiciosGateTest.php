<?php

use App\Models\BienesServiciosEmpresa;
use App\Models\Feature;
use App\Models\Licitacion;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

function bgPlan(bool $withFeature): Plan
{
    $plan = Plan::create([
        'name' => 'Plan '.Str::random(5),
        'slug' => 'plan-'.Str::lower(Str::random(8)),
        'grace_days' => 0,
    ]);

    $feature = Feature::firstOrCreate(
        ['key' => 'bienes_servicios'],
        ['name' => 'Bienes y servicios', 'type' => 'boolean', 'group' => 'contenido', 'is_enabled' => true, 'sort' => 40],
    );

    $plan->features()->attach($feature->id, ['enabled' => $withFeature]);

    return $plan;
}

// Asociado admitido (status approved) y al día, con/sin el módulo en su plan.
function bgAssociateUser(bool $withFeature): User
{
    $plan = bgPlan($withFeature);
    $user = User::factory()->create();

    test()->actingAs($user)->post(route('associate.company.save.draft'), [
        'company_name' => 'Asociada '.Str::random(5),
    ]);

    $user->fresh()->associate->update([
        'plan_id' => $plan->id,
        'plan_expires_at' => now()->addDays(10),
        'status' => 'approved',
    ]);

    return $user->fresh();
}

// ─── Compuerta de plan (ADR-0002) ─────────────────────────────────────────

it('un plan sin Bienes y Servicios no entra al módulo (redirige a facturación)', function () {
    test()->actingAs(bgAssociateUser(withFeature: false))
        ->get(route('associate.company.bienes-servicios.index'))
        ->assertRedirect(route('associate.company.billing'));
});

it('un plan con Bienes y Servicios entra al módulo', function () {
    test()->actingAs(bgAssociateUser(withFeature: true))
        ->get(route('associate.company.bienes-servicios.index'))
        ->assertOk();
});

// ─── Detalle/lista mandan público objetivo y cierre ───────────────────────

it('el detalle y la lista de licitaciones mandan público objetivo y cierre', function () {
    $user = bgAssociateUser(withFeature: true);

    $empresa = BienesServiciosEmpresa::create([
        'nombre' => 'Proveedora '.Str::random(5),
        'estado' => 'activo',
    ]);
    $tender = Licitacion::create([
        'empresa_id' => $empresa->id,
        'titulo' => 'Licitación '.Str::random(5),
        'contenido' => '<p>x</p>',
        'publico_objetivo' => 'exclusivo_asociados',
        'estado' => 'publicado',
        'fecha_publicacion' => now(),
        'fecha_cierre' => now()->addDays(15),
    ]);
    $tender->load('empresa');

    test()->actingAs($user)
        ->get(route('associate.company.bienes-servicios.tender', ['company' => $empresa->slug, 'tender' => $tender->slug]))
        ->assertInertia(fn (Assert $page) => $page
            ->component('Associate/BusinessServices/TenderDetail')
            ->where('tender.publico_objetivo', 'exclusivo_asociados')
            ->whereNot('tender.fecha_cierre', null)
        );

    test()->actingAs($user)
        ->get(route('associate.company.bienes-servicios.company', $empresa->slug))
        ->assertInertia(fn (Assert $page) => $page
            ->component('Associate/BusinessServices/CompanyTenders')
            ->whereNot('tenders.0.fecha_cierre', null)
        );
});
