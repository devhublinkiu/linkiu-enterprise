<?php

namespace App\Http\Controllers\Associate\Concerns;

use App\Models\Associate;
use App\Models\AssociateCertification;
use App\Models\AssociateClient;
use App\Models\AssociateTeamMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

/**
 * Micrositio › "Quiénes somos". Plan 0021, corte 21-C.
 *
 * Historia + imagen, y tres colecciones con CRUD por ítem: certificaciones (máx 5),
 * equipo y clientes. Cada colección es lista compacta + modal en el panel.
 */
trait ManagesMicrositeAbout
{
    public function about(Request $request)
    {
        $associate = Associate::with(['certifications', 'teamMembers', 'clients'])
            ->findOrFail($request->user()->associate_id);
        $disk = config('filesystems.default');
        $url = fn (?string $p) => $p ? Storage::disk($disk)->url($p) : null;

        return Inertia::render('Associate/Microsite/QuienesSomos', [
            'slug' => $associate->slug,
            'micrositeUrl' => $this->micrositeUrl($associate),
            'about' => [
                'story' => $associate->about_story,
                'image_url' => $url($associate->about_image_path),
            ],
            'certifications' => $associate->certifications->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'year' => $c->year,
                'image_path' => $c->image_path,
                'image_url' => $url($c->image_path),
            ])->values(),
            'team' => $associate->teamMembers->map(fn ($m) => [
                'id' => $m->id,
                'name' => $m->name,
                'position' => $m->position,
                'email' => $m->email,
                'phone' => $m->phone,
                'photo_path' => $m->photo_path,
                'photo_url' => $url($m->photo_path),
            ])->values(),
            'clients' => $associate->clients->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'logo_path' => $c->logo_path,
                'logo_url' => $url($c->logo_path),
            ])->values(),
        ]);
    }

    // Historia + imagen (formulario corto propio).
    public function updateStory(Request $request)
    {
        $associate = Associate::findOrFail($request->user()->associate_id);
        $disk = config('filesystems.default');

        $request->validate([
            'about_story' => 'nullable|string|max:1500',
            'about_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'remove_about_image' => 'nullable|boolean',
        ]);

        $associate->about_story = $request->input('about_story') ?: null;
        $this->applyImage($request, $associate, 'about_image', 'about_image_path', 'remove_about_image', $associate->id, $disk);
        $associate->save();

        return back()->with('success', 'Historia actualizada.');
    }

    // ── Certificaciones (CRUD por ítem, máx 5) ───────────────────────────────
    public function storeCertification(Request $request)
    {
        $associate = Associate::findOrFail($request->user()->associate_id);
        if ($associate->certifications()->count() >= 5) {
            throw ValidationException::withMessages([
                'name' => 'Ya tienes el máximo de 5 certificaciones.',
            ]);
        }
        $data = $this->validateCert($request);
        $associate->certifications()->create([
            'name' => $data['name'],
            'year' => $this->intOrNull($request->input('year')),
            'image_path' => $this->uploadOrNull($request, $associate->id, 'image'),
            'sort' => $this->nextSort($associate->certifications()),
        ]);

        return back()->with('success', 'Certificación añadida.');
    }

    public function updateCertification(Request $request, AssociateCertification $certification)
    {
        $this->guard($certification, $request);
        $this->validateCert($request);
        $certification->name = $request->input('name');
        $certification->year = $this->intOrNull($request->input('year'));
        $this->applyImage($request, $certification, 'image', 'image_path', 'remove_image', (int) $certification->associate_id, config('filesystems.default'));
        $certification->save();

        return back()->with('success', 'Certificación actualizada.');
    }

    public function destroyCertification(Request $request, AssociateCertification $certification)
    {
        $this->guard($certification, $request);
        $this->deleteFile(config('filesystems.default'), $certification->image_path);
        $certification->delete();

        return back()->with('success', 'Certificación eliminada.');
    }

    // ── Equipo ────────────────────────────────────────────────────────────────
    public function storeTeamMember(Request $request)
    {
        $associate = Associate::findOrFail($request->user()->associate_id);
        $data = $this->validateMember($request);
        $associate->teamMembers()->create([
            'name' => $data['name'],
            'position' => $request->input('position') ?: null,
            'email' => $request->input('email') ?: null,
            'phone' => $request->input('phone') ?: null,
            'photo_path' => $this->uploadOrNull($request, $associate->id, 'photo'),
            'sort' => $this->nextSort($associate->teamMembers()),
        ]);

        return back()->with('success', 'Integrante añadido.');
    }

    public function updateTeamMember(Request $request, AssociateTeamMember $teamMember)
    {
        $this->guard($teamMember, $request);
        $this->validateMember($request);
        $teamMember->fill([
            'name' => $request->input('name'),
            'position' => $request->input('position') ?: null,
            'email' => $request->input('email') ?: null,
            'phone' => $request->input('phone') ?: null,
        ]);
        $this->applyImage($request, $teamMember, 'photo', 'photo_path', 'remove_image', (int) $teamMember->associate_id, config('filesystems.default'));
        $teamMember->save();

        return back()->with('success', 'Integrante actualizado.');
    }

    public function destroyTeamMember(Request $request, AssociateTeamMember $teamMember)
    {
        $this->guard($teamMember, $request);
        $this->deleteFile(config('filesystems.default'), $teamMember->photo_path);
        $teamMember->delete();

        return back()->with('success', 'Integrante eliminado.');
    }

    // ── Clientes ──────────────────────────────────────────────────────────────
    public function storeClient(Request $request)
    {
        $associate = Associate::findOrFail($request->user()->associate_id);
        $data = $this->validateClient($request);
        $associate->clients()->create([
            'name' => $data['name'],
            'logo_path' => $this->uploadOrNull($request, $associate->id, 'logo'),
            'sort' => $this->nextSort($associate->clients()),
        ]);

        return back()->with('success', 'Cliente añadido.');
    }

    public function updateClient(Request $request, AssociateClient $client)
    {
        $this->guard($client, $request);
        $this->validateClient($request);
        $client->name = $request->input('name');
        $this->applyImage($request, $client, 'logo', 'logo_path', 'remove_image', (int) $client->associate_id, config('filesystems.default'));
        $client->save();

        return back()->with('success', 'Cliente actualizado.');
    }

    public function destroyClient(Request $request, AssociateClient $client)
    {
        $this->guard($client, $request);
        $this->deleteFile(config('filesystems.default'), $client->logo_path);
        $client->delete();

        return back()->with('success', 'Cliente eliminado.');
    }

    private function validateCert(Request $request): array
    {
        return $request->validate([
            'name' => 'required|string|max:120',
            'year' => 'nullable|integer|min:1900|max:'.((int) date('Y') + 1),
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'remove_image' => 'nullable|boolean',
        ]);
    }

    private function validateMember(Request $request): array
    {
        return $request->validate([
            'name' => 'required|string|max:120',
            'position' => 'nullable|string|max:120',
            'email' => 'nullable|email|max:160',
            'phone' => 'nullable|string|max:40',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'remove_image' => 'nullable|boolean',
        ]);
    }

    private function validateClient(Request $request): array
    {
        return $request->validate([
            'name' => 'required|string|max:120',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'remove_image' => 'nullable|boolean',
        ]);
    }
}
