<?php

use App\Models\Associate;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function svcAdmin(): User
{
    return User::factory()->create(['is_superadmin' => true]);
}

function svcAssociateUser(): User
{
    $associate = Associate::create(['company_name' => 'Empresa X']);

    return User::factory()->create([
        'is_superadmin' => false,
        'role' => 'user',
        'associate_id' => $associate->id,
    ]);
}

// ─── Autorización del panel (ADR-0006) ──────────────────────────────────────────

it('un asociado no puede entrar al panel de servicios', function () {
    $this->actingAs(svcAssociateUser())
        ->get(route('admin.services.index'))
        ->assertForbidden();
});

it('un asociado no puede crear servicios', function () {
    $cat = ServiceCategory::create(['name' => 'Logística']);

    $this->actingAs(svcAssociateUser())
        ->post(route('admin.services.store'), ['name' => 'Hack', 'category_id' => $cat->id])
        ->assertForbidden();

    expect(Service::count())->toBe(0);
});

it('un admin sí entra al panel de servicios', function () {
    $this->actingAs(svcAdmin())
        ->get(route('admin.services.index'))
        ->assertOk();
});

// ─── Slug único (a prueba de colisiones) ────────────────────────────────────────

it('genera slugs únicos para servicios con el mismo nombre', function () {
    $cat = ServiceCategory::create(['name' => 'Operaciones']);
    $admin = svcAdmin();

    $this->actingAs($admin)->post(route('admin.services.store'), ['name' => 'Perforación', 'category_id' => $cat->id]);
    $this->actingAs($admin)->post(route('admin.services.store'), ['name' => 'Perforación', 'category_id' => $cat->id]);

    $slugs = Service::pluck('slug');
    expect($slugs)->toHaveCount(2);
    expect($slugs->unique())->toHaveCount(2);
});

// ─── Validación del update ───────────────────────────────────────────────────────

it('rechaza actualizar un servicio sin nombre', function () {
    $cat = ServiceCategory::create(['name' => 'Consultoría']);
    $service = Service::create(['name' => 'Ambiental', 'category_id' => $cat->id]);

    $this->actingAs(svcAdmin())
        ->patch(route('admin.services.update', $service), ['name' => '', 'category_id' => $cat->id])
        ->assertSessionHasErrors('name');
});

it('mantiene el slug estable al renombrar (no rompe enlaces)', function () {
    $cat = ServiceCategory::create(['name' => 'Consultoría']);
    $service = Service::create(['name' => 'Ambiental', 'category_id' => $cat->id]);
    $originalSlug = $service->slug;

    $this->actingAs(svcAdmin())->patch(route('admin.services.update', $service), [
        'name' => 'Consultoría ambiental integral',
        'category_id' => $cat->id,
    ]);

    expect($service->fresh()->slug)->toBe($originalSlug);
});

// ─── Borrado seguro ──────────────────────────────────────────────────────────────

it('no elimina un servicio con empresas asociadas (lo bloquea)', function () {
    $cat = ServiceCategory::create(['name' => 'Logística']);
    $service = Service::create(['name' => 'Transporte', 'category_id' => $cat->id]);
    $associate = Associate::create(['company_name' => 'Transportes SAS']);
    $service->associates()->attach($associate->id);

    $this->actingAs(svcAdmin())
        ->delete(route('admin.services.destroy', $service))
        ->assertSessionHas('error');

    // Sigue existiendo y activo: el admin debe desactivarlo, no se elimina.
    expect(Service::find($service->id))->not->toBeNull();
    expect($service->fresh()->is_active)->toBeTrue();
});

it('elimina un servicio sin empresas asociadas', function () {
    $cat = ServiceCategory::create(['name' => 'Logística']);
    $service = Service::create(['name' => 'Bodegaje', 'category_id' => $cat->id]);

    $this->actingAs(svcAdmin())->delete(route('admin.services.destroy', $service));

    expect(Service::find($service->id))->toBeNull();
});

// ─── Categorías (CRUD) ───────────────────────────────────────────────────────────

it('no permite borrar una categoría con servicios', function () {
    $cat = ServiceCategory::create(['name' => 'Operaciones']);
    Service::create(['name' => 'Perforación', 'category_id' => $cat->id]);

    $this->actingAs(svcAdmin())
        ->delete(route('admin.service-categories.destroy', $cat))
        ->assertSessionHas('error');

    expect(ServiceCategory::find($cat->id))->not->toBeNull();
});

it('borra una categoría vacía', function () {
    $cat = ServiceCategory::create(['name' => 'Vacía']);

    $this->actingAs(svcAdmin())->delete(route('admin.service-categories.destroy', $cat));

    expect(ServiceCategory::find($cat->id))->toBeNull();
});

it('renombra una categoría conservando su slug', function () {
    $cat = ServiceCategory::create(['name' => 'Operaciones']);
    $originalSlug = $cat->slug;

    $this->actingAs(svcAdmin())->patch(route('admin.service-categories.update', $cat), [
        'name' => 'Operaciones de campo',
    ]);

    $fresh = $cat->fresh();
    expect($fresh->name)->toBe('Operaciones de campo');
    expect($fresh->slug)->toBe($originalSlug);
});

it('reordena las categorías', function () {
    $a = ServiceCategory::create(['name' => 'A']);
    $b = ServiceCategory::create(['name' => 'B']);

    $this->actingAs(svcAdmin())->post(route('admin.service-categories.order'), [
        'ids' => [$b->id, $a->id],
    ]);

    expect($b->fresh()->order)->toBe(0);
    expect($a->fresh()->order)->toBe(1);
});
