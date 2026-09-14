<?php

use App\Models\Associate;
use App\Models\DocumentRequirement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function docAdmin(): User
{
    return User::factory()->create(['is_superadmin' => true]);
}

function docAssociateUser(): User
{
    $associate = Associate::create(['company_name' => 'Empresa X']);

    return User::factory()->create([
        'is_superadmin' => false,
        'role' => 'user',
        'associate_id' => $associate->id,
    ]);
}

/** @return array<string, mixed> */
function docPayload(array $overrides = []): array
{
    return array_merge([
        'key' => 'rut',
        'label' => 'RUT',
        'icon' => 'FileText',
        'accepts' => ['pdf'],
        'is_required' => true,
        'is_active' => true,
        'legend' => null,
    ], $overrides);
}

// ─── Autorización del panel (ADR-0006) ──────────────────────────────────────────

it('un asociado no puede entrar al catálogo de documentos', function () {
    $this->actingAs(docAssociateUser())
        ->get(route('admin.document-requirements.index'))
        ->assertForbidden();
});

it('un asociado no puede crear documentos', function () {
    $this->actingAs(docAssociateUser())
        ->post(route('admin.document-requirements.store'), docPayload())
        ->assertForbidden();

    expect(DocumentRequirement::count())->toBe(0);
});

it('un admin sí entra al catálogo de documentos', function () {
    $this->actingAs(docAdmin())
        ->get(route('admin.document-requirements.index'))
        ->assertOk();
});

// ─── Alta ────────────────────────────────────────────────────────────────────────

it('crea un documento con datos válidos', function () {
    $this->actingAs(docAdmin())
        ->post(route('admin.document-requirements.store'), docPayload());

    $doc = DocumentRequirement::first();
    expect($doc)->not->toBeNull();
    expect($doc->key)->toBe('rut');
    expect($doc->accepts)->toBe(['pdf']);
});

// ─── Validación ────────────────────────────────────────────────────────────────

it('rechaza crear un documento sin nombre', function () {
    $this->actingAs(docAdmin())
        ->post(route('admin.document-requirements.store'), docPayload(['label' => '']))
        ->assertSessionHasErrors('label');
});

it('rechaza un ícono fuera de la lista permitida', function () {
    $this->actingAs(docAdmin())
        ->post(route('admin.document-requirements.store'), docPayload(['icon' => 'NoExiste']))
        ->assertSessionHasErrors('icon');
});

it('rechaza crear un documento sin tipos de archivo', function () {
    $this->actingAs(docAdmin())
        ->post(route('admin.document-requirements.store'), docPayload(['accepts' => []]))
        ->assertSessionHasErrors('accepts');
});

it('rechaza una clave duplicada', function () {
    DocumentRequirement::create(docPayload());

    $this->actingAs(docAdmin())
        ->post(route('admin.document-requirements.store'), docPayload(['label' => 'Otro RUT']))
        ->assertSessionHasErrors('key');

    expect(DocumentRequirement::count())->toBe(1);
});

// ─── Clave inmutable ─────────────────────────────────────────────────────────────

it('no cambia la clave al editar (es inmutable)', function () {
    $doc = DocumentRequirement::create(docPayload());

    $this->actingAs(docAdmin())->post(route('admin.document-requirements.update', $doc), docPayload([
        'key' => 'clave_nueva',
        'label' => 'RUT actualizado',
    ]));

    $fresh = $doc->fresh();
    expect($fresh->key)->toBe('rut');
    expect($fresh->label)->toBe('RUT actualizado');
});

// ─── Activar / desactivar ────────────────────────────────────────────────────────

it('alterna el estado activo del documento', function () {
    $doc = DocumentRequirement::create(docPayload(['is_active' => true]));

    $this->actingAs(docAdmin())->post(route('admin.document-requirements.toggle', $doc));

    expect($doc->fresh()->is_active)->toBeFalse();
});

// ─── Borrado seguro ──────────────────────────────────────────────────────────────

it('no borra un documento que ya tiene archivos de asociados', function () {
    $doc = DocumentRequirement::create(docPayload(['key' => 'rut']));
    Associate::create([
        'company_name' => 'Con archivo SAS',
        'files' => ['rut' => 'associate_files/rut.pdf'],
    ]);

    $this->actingAs(docAdmin())
        ->delete(route('admin.document-requirements.destroy', $doc))
        ->assertSessionHas('error');

    expect(DocumentRequirement::find($doc->id))->not->toBeNull();
});

it('borra un documento que nadie ha usado', function () {
    $doc = DocumentRequirement::create(docPayload(['key' => 'libre']));

    $this->actingAs(docAdmin())->delete(route('admin.document-requirements.destroy', $doc));

    expect(DocumentRequirement::find($doc->id))->toBeNull();
});

// ─── Reorden ─────────────────────────────────────────────────────────────────────

it('reordena los documentos según el arreglo de ids', function () {
    $a = DocumentRequirement::create(docPayload(['key' => 'doc_a', 'label' => 'A']));
    $b = DocumentRequirement::create(docPayload(['key' => 'doc_b', 'label' => 'B']));

    $this->actingAs(docAdmin())->post(route('admin.document-requirements.reorder'), [
        'order' => [$b->id, $a->id],
    ]);

    expect($b->fresh()->display_order)->toBe(0);
    expect($a->fresh()->display_order)->toBe(1);
});
