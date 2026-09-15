<?php

namespace App\Http\Controllers\Associate\Concerns;

use App\Models\Associate;
use App\Models\AssociateProject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

/**
 * Micrositio › Proyectos. Plan 0021, corte 21-D.
 *
 * CRUD por ítem; las imágenes viven en la tabla hija associate_project_images
 * (hasta 6 por proyecto; se añaden/quitan desde el mismo modal).
 */
trait ManagesMicrositeProjects
{
    public function projects(Request $request)
    {
        $associate = Associate::with('projects.images')
            ->findOrFail($request->user()->associate_id);
        $disk = config('filesystems.default');
        $url = fn (?string $p) => $p ? Storage::disk($disk)->url($p) : null;

        return Inertia::render('Associate/Microsite/Proyectos', [
            'slug' => $associate->slug,
            'micrositeUrl' => $this->micrositeUrl($associate),
            'projects' => $associate->projects->map(fn ($p) => [
                'id' => $p->id,
                'title' => $p->title,
                'description' => $p->description,
                'client' => $p->client,
                'images' => $p->images->map(fn ($img) => [
                    'id' => $img->id,
                    'url' => $url($img->path),
                ])->values(),
            ])->values(),
        ]);
    }

    public function storeProject(Request $request)
    {
        $associate = Associate::findOrFail($request->user()->associate_id);
        $data = $this->validateProject($request);
        $project = $associate->projects()->create([
            'title' => $data['title'],
            'description' => $request->input('description') ?: null,
            'client' => $request->input('client') ?: null,
            'sort' => $this->nextSort($associate->projects()),
        ]);
        $this->addProjectImages($request, $project, $associate->id);

        return back()->with('success', 'Proyecto añadido.');
    }

    public function updateProject(Request $request, AssociateProject $project)
    {
        $this->guard($project, $request);
        $data = $this->validateProject($request);
        $project->update([
            'title' => $data['title'],
            'description' => $request->input('description') ?: null,
            'client' => $request->input('client') ?: null,
        ]);

        // Quitar las imágenes marcadas en el modal.
        $removeIds = array_filter((array) $request->input('remove_image_ids', []));
        if ($removeIds) {
            $disk = config('filesystems.default');
            foreach ($project->images()->whereIn('id', $removeIds)->get() as $img) {
                $this->deleteFile($disk, $img->path);
                $img->delete();
            }
        }
        $this->addProjectImages($request, $project, (int) $project->associate_id);

        return back()->with('success', 'Proyecto actualizado.');
    }

    public function destroyProject(Request $request, AssociateProject $project)
    {
        $this->guard($project, $request);
        $disk = config('filesystems.default');
        foreach ($project->images as $img) {
            $this->deleteFile($disk, $img->path);
        }
        $project->images()->delete();
        $project->delete();

        return back()->with('success', 'Proyecto eliminado.');
    }

    private function validateProject(Request $request): array
    {
        return $request->validate([
            'title' => 'required|string|max:160',
            'description' => 'nullable|string|max:3000',
            'client' => 'nullable|string|max:160',
            'images' => 'nullable|array|max:6',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:5120',
            'remove_image_ids' => 'nullable|array',
            'remove_image_ids.*' => 'integer',
        ]);
    }

    private function addProjectImages(Request $request, AssociateProject $project, int $associateId): void
    {
        if (! $request->hasFile('images')) {
            return;
        }
        $disk = config('filesystems.default');
        $sort = (int) $project->images()->max('sort');
        foreach ($request->file('images') as $file) {
            $sort++;
            $project->images()->create([
                'path' => $file->store($this->dirFor($associateId), $disk),
                'sort' => $sort,
            ]);
        }
    }
}
