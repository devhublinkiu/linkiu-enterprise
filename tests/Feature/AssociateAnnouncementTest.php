<?php

use App\Models\Announcement;
use App\Models\Feature;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('local');
    Storage::fake('public');
});

// Asociado admitido y al día. `canDownload` controla si su plan incluye el
// módulo (feature bienes_servicios), que gobierna la descarga de documentos.
function annAssociate(bool $canDownload): User
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
    $plan->features()->attach($feature->id, ['enabled' => $canDownload]);

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

function annAnnouncement(string $visibility = 'members_only', $expiresAt = null): Announcement
{
    return Announcement::create([
        'title' => 'Aviso '.Str::random(6),
        'content' => '<p>cuerpo</p>',
        'excerpt' => 'resumen',
        'visibility' => $visibility,
        'status' => 'published',
        'published_at' => now()->subDay(),
        'expires_at' => $expiresAt,
    ]);
}

// ─── Vencidos no aparecen ────────────────────────────────────────────────────

it('no lista anuncios vencidos en la vista del asociado', function () {
    annAnnouncement('public', now()->subDay());        // vencido ayer
    $vigente = annAnnouncement('public', now()->addDays(5));

    test()->actingAs(annAssociate(true))
        ->get(route('associate.announcements.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('Associate/Announcements/Index')
            ->has('announcements.data', 1)
            ->where('announcements.data.0.slug', $vigente->slug),
        );
});

it('devuelve 404 al abrir un anuncio vencido', function () {
    $vencido = annAnnouncement('public', now()->subDay());

    test()->actingAs(annAssociate(true))
        ->get(route('associate.announcements.show', $vencido->slug))
        ->assertNotFound();
});

// ─── Descarga gateada por el módulo del plan ─────────────────────────────────

it('permite descargar documentos cuando el plan incluye el módulo', function () {
    $ann = annAnnouncement('members_only', now()->addDays(5));
    $ann->addMedia(UploadedFile::fake()->createWithContent('doc.pdf', "%PDF-1.4\n1 0 obj<<>>endobj\n%%EOF"))
        ->toMediaCollection('documents');

    test()->actingAs(annAssociate(canDownload: true))
        ->get(route('associate.announcements.show', $ann->slug))
        ->assertInertia(fn (Assert $page) => $page
            ->where('can_download', true)
            ->where('documents.0.is_locked', false),
        );
});

it('bloquea la descarga cuando el plan no incluye el módulo', function () {
    $ann = annAnnouncement('members_only', now()->addDays(5));
    $ann->addMedia(UploadedFile::fake()->createWithContent('doc.pdf', "%PDF-1.4\n1 0 obj<<>>endobj\n%%EOF"))
        ->toMediaCollection('documents');

    test()->actingAs(annAssociate(canDownload: false))
        ->get(route('associate.announcements.show', $ann->slug))
        ->assertInertia(fn (Assert $page) => $page
            ->where('can_download', false)
            ->where('documents.0.is_locked', true)
            ->where('documents.0.url', null),
        );
});
