<?php

use App\Models\Associate;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

function micrositeAssociate(array $attrs = []): Associate
{
    return Associate::create(array_merge([
        'company_name' => 'Perforaciones SAS',
        'status' => 'approved',
        'is_public' => true,
        'microsite_published' => true,
    ], $attrs));
}

function micrositeUser(Associate $associate): User
{
    return User::factory()->create(['associate_id' => $associate->id]);
}

function micrositeService(string $name = 'Perforación'): Service
{
    $category = ServiceCategory::create([
        'name' => 'Minería',
        'slug' => 'mineria-'.Str::random(5),
    ]);

    return Service::create([
        'category_id' => $category->id,
        'name' => $name,
        'slug' => Str::slug($name).'-'.Str::random(5),
        'is_active' => true,
    ]);
}

// ─── Normalización ────────────────────────────────────────────────────────────

it('normaliza el slug (espacios, mayúsculas, tildes y ñ)', function () {
    expect(Associate::normalizeSlug('Empresa X'))->toBe('empresa-x');
    expect(Associate::normalizeSlug('Construcción Ñandú'))->toBe('construccion-nandu');
    expect(Associate::normalizeSlug('  Perforaciones y Servicios del Llano '))
        ->toBe('perforaciones-y-servicios-del-llano');
});

it('reconoce slugs reservados', function () {
    expect(Associate::isReservedSlug('admin'))->toBeTrue();
    expect(Associate::isReservedSlug('empresas'))->toBeTrue();
    expect(Associate::isReservedSlug('perforaciones-llano'))->toBeFalse();
});

// ─── Disponibilidad en vivo ───────────────────────────────────────────────────

it('el endpoint de disponibilidad normaliza y responde libre/ocupado', function () {
    $associate = micrositeAssociate();

    $this->actingAs(micrositeUser($associate))
        ->post(route('associate.company.microsite.slug.check'), ['value' => 'Empresa X'])
        ->assertOk()
        ->assertJson(['slug' => 'empresa-x', 'available' => true]);

    // Ocupado por otro asociado.
    micrositeAssociate(['company_name' => 'Otra SAS', 'slug' => 'empresa-x']);

    $this->actingAs(micrositeUser($associate))
        ->post(route('associate.company.microsite.slug.check'), ['value' => 'empresa x'])
        ->assertOk()
        ->assertJson(['slug' => 'empresa-x', 'available' => false]);

    // Reservado.
    $this->actingAs(micrositeUser($associate))
        ->post(route('associate.company.microsite.slug.check'), ['value' => 'admin'])
        ->assertJson(['available' => false]);
});

// ─── Guardado (una sola vez) ──────────────────────────────────────────────────

it('guarda el slug normalizado y luego lo bloquea', function () {
    $associate = micrositeAssociate();
    $user = micrositeUser($associate);

    $this->actingAs($user)
        ->post(route('associate.company.microsite.slug.update'), ['slug' => 'Mi Empresa'])
        ->assertSessionHasNoErrors();

    expect($associate->fresh()->slug)->toBe('mi-empresa');

    // Segundo intento: se rechaza (una sola vez).
    $this->actingAs($user)
        ->post(route('associate.company.microsite.slug.update'), ['slug' => 'otra-cosa'])
        ->assertSessionHasErrors('slug');

    expect($associate->fresh()->slug)->toBe('mi-empresa');
});

// ─── Ruteo público ────────────────────────────────────────────────────────────

it('sirve el micrositio por slug en el raíz', function () {
    micrositeAssociate(['slug' => 'perforaciones-llano']);

    $this->get('/perforaciones-llano')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Public/Companies/Show'));
});

it('redirige /empresas/{id} al slug canónico cuando existe', function () {
    $associate = micrositeAssociate(['slug' => 'perforaciones-llano']);

    $this->get(route('companies.show', $associate->id))
        ->assertRedirect('/perforaciones-llano');
});

it('sin slug sigue funcionando /empresas/{id}', function () {
    $associate = micrositeAssociate();

    $this->get(route('companies.show', $associate->id))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Public/Companies/Show'));
});

it('el micrositio expone el payload de las 5 pestañas', function () {
    $associate = micrositeAssociate(['slug' => 'con-payload']);

    $this->get('/con-payload')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Public/Companies/Show')
            ->has('company.legal')
            ->has('company.contact')
            ->has('company.services')
            ->has('company.projects')
            ->has('company.gallery')
            ->has('company.certifications')
            ->has('company.team')
            ->has('company.clients')
        );
});

it('un slug inexistente da 404', function () {
    $this->get('/no-existe-xyz')->assertNotFound();
});

it('el comodín de slug NO pisa login ni el directorio', function () {
    // Rutas reales se resuelven antes que el comodín.
    $this->get('/login')->assertOk();
    $this->get(route('companies.index'))->assertOk();
});

// ─── Mi Página › Quiénes somos (21-C) ─────────────────────────────────────────

it('carga la pantalla de Quiénes somos', function () {
    $associate = micrositeAssociate();

    $this->actingAs(micrositeUser($associate))
        ->get(route('associate.company.microsite.about'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Associate/Microsite/QuienesSomos')
            ->has('certifications')
            ->has('team')
            ->has('clients')
        );
});

it('guarda la historia', function () {
    $associate = micrositeAssociate();

    $this->actingAs(micrositeUser($associate))
        ->post(route('associate.company.microsite.story.update'), [
            'about_story' => 'Nuestra historia.',
        ])
        ->assertSessionHasNoErrors();

    expect($associate->fresh()->about_story)->toBe('Nuestra historia.');
});

it('crea, edita y elimina una certificación', function () {
    $associate = micrositeAssociate();
    $user = micrositeUser($associate);

    $this->actingAs($user)
        ->post(route('associate.company.microsite.certifications.store'), [
            'name' => 'ISO 9001', 'year' => 2021,
        ])->assertSessionHasNoErrors();

    $cert = $associate->certifications()->first();
    expect($cert->name)->toBe('ISO 9001');
    expect($cert->year)->toBe(2021);

    $this->actingAs($user)
        ->post(route('associate.company.microsite.certifications.update', $cert->id), [
            'name' => 'ISO 14001',
        ])->assertSessionHasNoErrors();
    expect($cert->fresh()->name)->toBe('ISO 14001');

    $this->actingAs($user)
        ->delete(route('associate.company.microsite.certifications.destroy', $cert->id))
        ->assertSessionHasNoErrors();
    expect($associate->certifications()->count())->toBe(0);
});

it('no deja pasar de 5 certificaciones', function () {
    $associate = micrositeAssociate();
    foreach (range(1, 5) as $n) {
        $associate->certifications()->create(['name' => "C{$n}", 'sort' => $n]);
    }

    $this->actingAs(micrositeUser($associate))
        ->post(route('associate.company.microsite.certifications.store'), ['name' => 'C6'])
        ->assertSessionHasErrors('name');

    expect($associate->certifications()->count())->toBe(5);
});

it('añade un integrante y un cliente', function () {
    $associate = micrositeAssociate();
    $user = micrositeUser($associate);

    $this->actingAs($user)
        ->post(route('associate.company.microsite.team.store'), [
            'name' => 'Ana', 'position' => 'Gerente', 'email' => 'ana@x.co',
        ])->assertSessionHasNoErrors();
    $this->actingAs($user)
        ->post(route('associate.company.microsite.clients.store'), ['name' => 'Ecopetrol'])
        ->assertSessionHasNoErrors();

    expect($associate->teamMembers()->first()->email)->toBe('ana@x.co');
    expect($associate->clients()->count())->toBe(1);
});

it('no permite editar una certificación de otro asociado', function () {
    $mine = micrositeAssociate();
    $other = micrositeAssociate(['company_name' => 'Otra SAS']);
    $cert = $other->certifications()->create(['name' => 'Ajena', 'sort' => 0]);

    $this->actingAs(micrositeUser($mine))
        ->post(route('associate.company.microsite.certifications.update', $cert->id), [
            'name' => 'Hackeada',
        ])
        ->assertForbidden();
});

// ─── Mi Página › Servicios (21-D) ─────────────────────────────────────────────

it('carga la pantalla de Servicios con los seleccionados', function () {
    $associate = micrositeAssociate();
    $service = micrositeService();
    $associate->services()->attach($service->id);

    $this->actingAs(micrositeUser($associate))
        ->get(route('associate.company.microsite.services'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Associate/Microsite/Servicios')
            ->has('services', 1)
        );
});

it('enriquece la descripción de un servicio seleccionado', function () {
    $associate = micrositeAssociate();
    $service = micrositeService();
    $associate->services()->attach($service->id);

    $this->actingAs(micrositeUser($associate))
        ->post(route('associate.company.microsite.services.update', $service->id), [
            'description' => 'Perforación de pozos profundos.',
        ])->assertSessionHasNoErrors();

    $pivot = $associate->services()->where('services.id', $service->id)->first()->pivot;
    expect($pivot->description)->toBe('Perforación de pozos profundos.');
});

it('no enriquece un servicio que no está seleccionado', function () {
    $associate = micrositeAssociate();
    $service = micrositeService(); // no attach

    $this->actingAs(micrositeUser($associate))
        ->post(route('associate.company.microsite.services.update', $service->id), [
            'description' => 'Colado.',
        ])
        ->assertForbidden();
});

// ─── Mi Página › Proyectos (21-D) ─────────────────────────────────────────────

it('crea, edita y elimina un proyecto', function () {
    $associate = micrositeAssociate();
    $user = micrositeUser($associate);

    $this->actingAs($user)
        ->post(route('associate.company.microsite.projects.store'), [
            'title' => 'Planta Norte', 'client' => 'Ecopetrol',
        ])->assertSessionHasNoErrors();

    $project = $associate->projects()->first();
    expect($project->title)->toBe('Planta Norte');
    expect($project->client)->toBe('Ecopetrol');

    $this->actingAs($user)
        ->post(route('associate.company.microsite.projects.update', $project->id), [
            'title' => 'Planta Sur',
        ])->assertSessionHasNoErrors();
    expect($project->fresh()->title)->toBe('Planta Sur');

    $this->actingAs($user)
        ->delete(route('associate.company.microsite.projects.destroy', $project->id))
        ->assertSessionHasNoErrors();
    expect($associate->projects()->count())->toBe(0);
});

it('no permite editar un proyecto de otro asociado', function () {
    $mine = micrositeAssociate();
    $other = micrositeAssociate(['company_name' => 'Otra SAS']);
    $project = $other->projects()->create(['title' => 'Ajeno', 'sort' => 0]);

    $this->actingAs(micrositeUser($mine))
        ->post(route('associate.company.microsite.projects.update', $project->id), [
            'title' => 'Robado',
        ])
        ->assertForbidden();
});

// ─── Mi Página › Contacto + publicado (21-E) ──────────────────────────────────

it('carga la pantalla de Contacto', function () {
    $associate = micrositeAssociate();

    $this->actingAs(micrositeUser($associate))
        ->get(route('associate.company.microsite.contact'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Associate/Microsite/Contacto')
            ->has('contact')
            ->has('reused')
            ->has('facades')
            ->where('published', true)
        );
});

it('guarda WhatsApp y correo de contacto', function () {
    $associate = micrositeAssociate();

    $this->actingAs(micrositeUser($associate))
        ->post(route('associate.company.microsite.contact.update'), [
            'whatsapp' => '+57 300 111 2233',
            'contact_email' => 'contacto@x.co',
        ])->assertSessionHasNoErrors();

    $associate->refresh();
    expect($associate->whatsapp)->toBe('+57 300 111 2233');
    expect($associate->contact_email)->toBe('contacto@x.co');
});

it('alterna el estado de publicado', function () {
    $associate = micrositeAssociate();

    $this->actingAs(micrositeUser($associate))
        ->post(route('associate.company.microsite.published.toggle'), ['published' => false])
        ->assertSessionHasNoErrors();
    expect($associate->fresh()->microsite_published)->toBeFalse();

    $this->actingAs(micrositeUser($associate))
        ->post(route('associate.company.microsite.published.toggle'), ['published' => true])
        ->assertSessionHasNoErrors();
    expect($associate->fresh()->microsite_published)->toBeTrue();
});

// ─── Compuerta de publicado (21-E) ────────────────────────────────────────────

it('un micrositio en borrador da 404 al público', function () {
    micrositeAssociate(['slug' => 'borrador-co', 'microsite_published' => false]);

    $this->get('/borrador-co')->assertNotFound();
});

it('el dueño ve su micrositio en borrador como vista previa', function () {
    $associate = micrositeAssociate(['slug' => 'borrador-co', 'microsite_published' => false]);

    $this->actingAs(micrositeUser($associate))
        ->get('/borrador-co')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Public/Companies/Show')
            ->where('preview', true)
        );
});

it('el directorio oculta los micrositios en borrador', function () {
    micrositeAssociate(['company_name' => 'Publicada SAS', 'microsite_published' => true]);
    micrositeAssociate(['company_name' => 'Borrador SAS', 'microsite_published' => false]);

    $this->get(route('companies.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('associates', 1));
});

// ─── Botón "Ver mi página" en el topbar (21-F) ────────────────────────────────

it('comparte la dirección del micrositio para el topbar del asociado', function () {
    $associate = micrositeAssociate(['slug' => 'mi-empresa-top']);

    $this->actingAs(micrositeUser($associate))
        ->get(route('associate.company.microsite.contact'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('auth.associate.microsite_url', url('/mi-empresa-top'))
            ->where('auth.associate.microsite_published', true)
        );
});
