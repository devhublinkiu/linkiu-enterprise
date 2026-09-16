<?php

use App\Mail\NewTenderPublished;
use App\Models\BienesServiciosEmpresa;
use App\Models\Licitacion;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('local');
    Storage::fake('public');
    Mail::fake();
});

// ─── Fábricas locales ────────────────────────────────────────────────────────

function bsPlan(): Plan
{
    return Plan::create([
        'name' => 'Plan '.Str::random(5),
        'slug' => 'plan-'.Str::lower(Str::random(8)),
        'grace_days' => 0,
    ]);
}

function bsAdmin(): User
{
    return User::factory()->create(['is_superadmin' => true]);
}

// Asociado con suscripción activa o vencida. Usa el borrador de Información
// Básica para crear la ficha (como el resto de la suite).
function bsAssociateUser(bool $active): User
{
    $plan = bsPlan();
    $user = User::factory()->create();

    test()->actingAs($user)->post(route('associate.company.save.draft'), [
        'company_name' => 'Asociada '.Str::random(5),
    ]);

    $associate = $user->fresh()->associate;
    $associate->update([
        'plan_id' => $plan->id,
        'plan_expires_at' => $active ? now()->addDays(10) : now()->subDays(10),
        'status' => 'verified',
    ]);

    return $user->fresh();
}

function bsEmpresa(): BienesServiciosEmpresa
{
    return BienesServiciosEmpresa::create([
        'nombre' => 'Proveedora '.Str::random(5),
        'estado' => 'activo',
    ]);
}

function bsTender(string $target, string $estado = 'publicado'): Licitacion
{
    return Licitacion::create([
        'empresa_id' => bsEmpresa()->id,
        'titulo' => 'Licitación '.Str::random(6),
        'contenido' => '<p>Contenido reservado</p>',
        'enlace_externo' => 'https://ejemplo.test/pliego',
        'publico_objetivo' => $target, // abierto | exclusivo_asociados
        'estado' => $estado,
        'fecha_publicacion' => now(),
    ]);
}

function bsAttachDocument(Licitacion $tender)
{
    // Contenido real: Spatie detecta el mime del contenido, no del nombre.
    return $tender
        ->addMedia(UploadedFile::fake()->createWithContent('pliego.pdf', "%PDF-1.4\n1 0 obj<<>>endobj\n%%EOF"))
        ->toMediaCollection('documents');
}

function bsDocUrl(Licitacion $tender, $media): string
{
    return route('bienes-servicios.document', ['tender' => $tender->id, 'media' => $media->id]);
}

// ─── Documentos van al disco privado ─────────────────────────────────────────

it('guarda los documentos en el disco privado, no en el público', function () {
    $tender = bsTender('abierto');
    $media = bsAttachDocument($tender);

    expect($media->disk)->toBe('local');
});

// ─── Descarga: abierto ───────────────────────────────────────────────────────

it('permite a cualquiera descargar un documento de licitación abierta', function () {
    $tender = bsTender('abierto');
    $media = bsAttachDocument($tender);

    test()->get(bsDocUrl($tender, $media))->assertOk();
});

// ─── Descarga: exclusivo ─────────────────────────────────────────────────────

it('niega al invitado el documento de una licitación exclusiva', function () {
    $tender = bsTender('exclusivo_asociados');
    $media = bsAttachDocument($tender);

    test()->get(bsDocUrl($tender, $media))->assertForbidden();
});

it('niega al asociado vencido el documento exclusivo', function () {
    $tender = bsTender('exclusivo_asociados');
    $media = bsAttachDocument($tender);

    test()->actingAs(bsAssociateUser(active: false))
        ->get(bsDocUrl($tender, $media))
        ->assertForbidden();
});

it('permite al asociado activo el documento exclusivo', function () {
    $tender = bsTender('exclusivo_asociados');
    $media = bsAttachDocument($tender);

    test()->actingAs(bsAssociateUser(active: true))
        ->get(bsDocUrl($tender, $media))
        ->assertOk();
});

it('permite al admin el documento exclusivo', function () {
    $tender = bsTender('exclusivo_asociados');
    $media = bsAttachDocument($tender);

    test()->actingAs(bsAdmin())
        ->get(bsDocUrl($tender, $media))
        ->assertOk();
});

it('devuelve 404 si el documento es de otra licitación (anti-IDOR)', function () {
    $tenderA = bsTender('abierto');
    $tenderB = bsTender('abierto');
    $mediaB = bsAttachDocument($tenderB);

    // media de B pedido a través de A → no pertenece a A.
    test()->get(bsDocUrl($tenderA, $mediaB))->assertNotFound();
});

// ─── Contenido exclusivo en la página pública ────────────────────────────────

it('oculta el contenido exclusivo al invitado en la vista pública', function () {
    $tender = bsTender('exclusivo_asociados');
    $tender->load('empresa');

    test()->get(route('bienes-servicios.tender', [
        'company' => $tender->empresa->slug,
        'tender' => $tender->slug,
    ]))->assertInertia(fn (Assert $page) => $page
        ->component('Public/BusinessServices/TenderDetail')
        ->where('isRestricted', true)
        ->where('tender.contenido', null)
        ->where('tender.enlace_externo', null)
        ->where('documents', [])
    );
});

it('muestra el contenido exclusivo al asociado activo en la vista pública', function () {
    $tender = bsTender('exclusivo_asociados');
    $tender->load('empresa');

    test()->actingAs(bsAssociateUser(active: true))
        ->get(route('bienes-servicios.tender', [
            'company' => $tender->empresa->slug,
            'tender' => $tender->slug,
        ]))->assertInertia(fn (Assert $page) => $page
        ->where('isRestricted', false)
        ->where('tender.contenido', '<p>Contenido reservado</p>')
        );
});

it('el sitio público solo lista las licitaciones abiertas de la empresa', function () {
    $empresa = bsEmpresa();

    Licitacion::create([
        'empresa_id' => $empresa->id,
        'titulo' => 'Convocatoria pública ABC',
        'publico_objetivo' => 'abierto',
        'estado' => 'publicado',
        'fecha_publicacion' => now(),
    ]);
    Licitacion::create([
        'empresa_id' => $empresa->id,
        'titulo' => 'Convocatoria exclusiva XYZ',
        'publico_objetivo' => 'exclusivo_asociados',
        'estado' => 'publicado',
        'fecha_publicacion' => now(),
    ]);

    test()->get(route('bienes-servicios.company', $empresa->slug))->assertInertia(
        fn (Assert $page) => $page
            ->component('Public/BusinessServices/CompanyTenders')
            ->has('tenders', 1)
            ->where('tenders.0.titulo', 'Convocatoria pública ABC'),
    );
});

// ─── Correo: solo en la transición a publicado ───────────────────────────────

it('avisa a los asociados al publicar una licitación nueva', function () {
    bsAssociateUser(active: true); // destinatario verificado

    test()->actingAs(bsAdmin())->post(route('admin.bienes-servicios.tenders.store'), [
        'empresa_id' => bsEmpresa()->id,
        'titulo' => 'Nueva licitación',
        'publico_objetivo' => 'abierto',
        'estado' => 'publicado',
    ]);

    Mail::assertSent(NewTenderPublished::class);
});

it('NO reenvía correo al editar una licitación ya publicada', function () {
    bsAssociateUser(active: true);
    $tender = bsTender('abierto', estado: 'publicado');

    test()->actingAs(bsAdmin())->put(route('admin.bienes-servicios.tenders.update', $tender), [
        'empresa_id' => $tender->empresa_id,
        'titulo' => $tender->titulo.' (corregido)',
        'publico_objetivo' => 'abierto',
        'estado' => 'publicado',
    ]);

    Mail::assertNothingSent();
});

it('avisa al pasar una licitación de borrador a publicado', function () {
    bsAssociateUser(active: true);
    $tender = bsTender('abierto', estado: 'borrador');

    test()->actingAs(bsAdmin())->put(route('admin.bienes-servicios.tenders.update', $tender), [
        'empresa_id' => $tender->empresa_id,
        'titulo' => $tender->titulo,
        'publico_objetivo' => 'abierto',
        'estado' => 'publicado',
    ]);

    Mail::assertSent(NewTenderPublished::class);
});
