<?php

use App\Models\Associate;
use App\Models\DocumentRequirement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

// Helpers locales (nombres propios para no chocar con otras suites).
function docSecOwner(): User
{
    return User::factory()->create();
}

function docSecAdmin(): User
{
    return User::factory()->create(['is_superadmin' => true]);
}

// Crea la empresa (vía borrador de Información Básica) y devuelve el associate.
function bootstrapDocSecAssociate($test): Associate
{
    $user = docSecOwner();
    $test->actingAs($user)->post(route('associate.company.save.draft'), [
        'company_name' => 'Minera Los Andes SAS',
    ]);

    return $user->fresh()->associate;
}

// Un documento obligatorio activo en el catálogo (clave "rut").
function docSecRequirement(array $overrides = []): DocumentRequirement
{
    return DocumentRequirement::create(array_merge([
        'key' => 'rut',
        'label' => 'RUT',
        'icon' => 'FileText',
        'accepts' => ['pdf'],
        'is_required' => true,
        'is_active' => true,
    ], $overrides));
}

// Payload completo (sin archivos) para "Enviar a revisión".
function docSecPayload(array $overrides = []): array
{
    return array_merge([
        'funds_origin_declaration' => true,
        'rep_name' => 'Juan Pérez',
        'rep_doc' => '123456789',
        'membership_interest' => ['Gestión Gremial'],
        'membership_interest_other' => '',
    ], $overrides);
}

beforeEach(function () {
    Storage::fake(config('filesystems.default'));
    Mail::fake();
});

// ─── Modelo: máquina de estados ────────────────────────────────────────────────

it('el modelo deriva editable/reabrible para documentation', function () {
    $a = new Associate;

    $a->setSectionStatus('documentation', Associate::SEC_DRAFT);
    expect($a->canEditSection('documentation'))->toBeTrue();
    expect($a->canReopenSection('documentation'))->toBeFalse();

    $a->setSectionStatus('documentation', Associate::SEC_APPROVED);
    expect($a->canEditSection('documentation'))->toBeFalse();
    expect($a->canReopenSection('documentation'))->toBeTrue();
});

// ─── Envío ───────────────────────────────────────────────────────────────────────

it('envía documentación completa y pasa a pending', function () {
    $associate = bootstrapDocSecAssociate($this);
    $user = $associate->users->first();
    docSecRequirement();

    $this->actingAs($user)->post(route('associate.company.update.documentation'), docSecPayload([
        'files' => ['rut' => UploadedFile::fake()->create('rut.pdf', 100, 'application/pdf')],
    ]))->assertSessionHasNoErrors();

    expect($associate->fresh()->getSectionStatus('documentation'))->toBe('pending');
});

it('rechaza el envío si falta un documento obligatorio', function () {
    $associate = bootstrapDocSecAssociate($this);
    $user = $associate->users->first();
    docSecRequirement();

    $this->actingAs($user)
        ->post(route('associate.company.update.documentation'), docSecPayload())
        ->assertSessionHas('error');

    expect($associate->fresh()->getSectionStatus('documentation'))->not->toBe('pending');
});

it('rechaza el envío sin aceptar el juramento', function () {
    $associate = bootstrapDocSecAssociate($this);
    $user = $associate->users->first();
    docSecRequirement();

    $this->actingAs($user)->post(route('associate.company.update.documentation'), docSecPayload([
        'funds_origin_declaration' => false,
        'files' => ['rut' => UploadedFile::fake()->create('rut.pdf', 100, 'application/pdf')],
    ]))->assertSessionHasErrors('funds_origin_declaration');
});

it('rechaza el envío sin representante legal', function () {
    $associate = bootstrapDocSecAssociate($this);
    $user = $associate->users->first();
    docSecRequirement();

    $this->actingAs($user)->post(route('associate.company.update.documentation'), docSecPayload([
        'rep_name' => '',
        'files' => ['rut' => UploadedFile::fake()->create('rut.pdf', 100, 'application/pdf')],
    ]))->assertSessionHasErrors('rep_name');
});

it('rechaza el envío sin interés de afiliación', function () {
    $associate = bootstrapDocSecAssociate($this);
    $user = $associate->users->first();
    docSecRequirement();

    $this->actingAs($user)->post(route('associate.company.update.documentation'), docSecPayload([
        'membership_interest' => [],
        'files' => ['rut' => UploadedFile::fake()->create('rut.pdf', 100, 'application/pdf')],
    ]))->assertSessionHasErrors('membership_interest');
});

it('rechaza un archivo con formato no permitido', function () {
    $associate = bootstrapDocSecAssociate($this);
    $user = $associate->users->first();
    docSecRequirement(); // acepta solo pdf

    $this->actingAs($user)->post(route('associate.company.update.documentation'), docSecPayload([
        'files' => ['rut' => UploadedFile::fake()->create('rut.txt', 10, 'text/plain')],
    ]))->assertSessionHasErrors('files.rut');
});

// ─── Borrador ──────────────────────────────────────────────────────────────────

it('guardar borrador no degrada una sección ya aprobada', function () {
    $associate = bootstrapDocSecAssociate($this);
    $user = $associate->users->first();
    $associate->setSectionStatus('documentation', Associate::SEC_APPROVED);
    $associate->save();

    $this->actingAs($user)->post(route('associate.company.save.documentation.draft'), [
        'rep_name' => 'Otro Nombre',
    ]);

    expect($associate->fresh()->getSectionStatus('documentation'))->toBe('approved');
});

// ─── Reapertura con "Editar" ─────────────────────────────────────────────────────

it('reabre la sección aprobada a draft con Editar', function () {
    $associate = bootstrapDocSecAssociate($this);
    $user = $associate->users->first();
    $associate->setSectionStatus('documentation', Associate::SEC_APPROVED);
    $associate->save();

    $this->actingAs($user)->post(route('associate.company.reopen.documentation'));

    expect($associate->fresh()->getSectionStatus('documentation'))->toBe('draft');
});

it('no reabre una sección que no está aprobada', function () {
    $associate = bootstrapDocSecAssociate($this);
    $user = $associate->users->first();
    // Estado inicial: draft.

    $this->actingAs($user)
        ->post(route('associate.company.reopen.documentation'))
        ->assertSessionHas('error');
});

// ─── Acceso a documentos ─────────────────────────────────────────────────────────

it('un tercero no puede ver los documentos de otra empresa', function () {
    $associate = bootstrapDocSecAssociate($this);
    $associate->files = ['rut' => 'associates/'.$associate->id.'/docs/rut.pdf'];
    $associate->save();

    $intruder = docSecOwner();

    $this->actingAs($intruder)
        ->get(route('associate.documents.show', ['associate' => $associate->id, 'docKey' => 'rut']))
        ->assertForbidden();
});

// ─── Hora local ──────────────────────────────────────────────────────────────────

it('la marca de "borrador guardado" de documentación se muestra en hora de Colombia', function () {
    Carbon::setTestNow(Carbon::parse('2026-09-14 02:12:29', 'UTC'));

    $associate = bootstrapDocSecAssociate($this);
    $user = $associate->users->first();

    $this->actingAs($user)
        ->post(route('associate.company.save.documentation.draft'), ['rep_name' => 'Juan'])
        ->assertSessionHas('draft_saved', '13/09/2026 21:12:29');

    Carbon::setTestNow();
});
