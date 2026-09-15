<?php

namespace App\Http\Controllers\Associate\Concerns;

use App\Models\Associate;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

/**
 * Micrositio › Servicios. Plan 0021, corte 21-D.
 *
 * Solo enriquece (descripción + cover) los servicios YA seleccionados en
 * "Mi empresa > Servicios" (sección revisada). Aquí no se crean ni se quitan
 * servicios: eso sigue pasando por su flujo con revisión de admin (ADR-0002).
 */
trait ManagesMicrositeServices
{
    public function services(Request $request)
    {
        $associate = Associate::with('services.category')
            ->findOrFail($request->user()->associate_id);
        $disk = config('filesystems.default');
        $url = fn (?string $p) => $p ? Storage::disk($disk)->url($p) : null;

        return Inertia::render('Associate/Microsite/Servicios', [
            'slug' => $associate->slug,
            'micrositeUrl' => $this->micrositeUrl($associate),
            'servicesUrl' => route('associate.company.services'),
            'services' => $associate->services->map(fn ($s) => [
                'id' => $s->id,
                'name' => $s->name,
                'category' => $s->category?->name,
                'description' => $s->pivot->description,
                'cover_url' => $url($s->pivot->cover_path),
            ])->values(),
        ]);
    }

    public function updateService(Request $request, Service $service)
    {
        $associate = Associate::findOrFail($request->user()->associate_id);
        // El servicio debe estar entre los aprobados/seleccionados del asociado.
        abort_unless(
            $associate->services()->where('services.id', $service->id)->exists(),
            403
        );

        $request->validate([
            'description' => 'nullable|string|max:2000',
            'cover' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'remove_cover' => 'nullable|boolean',
        ]);

        $disk = config('filesystems.default');
        $current = $associate->services()->where('services.id', $service->id)->first();
        $coverPath = $current?->pivot->cover_path;

        if ($request->hasFile('cover')) {
            $this->deleteFile($disk, $coverPath);
            $coverPath = $request->file('cover')->store($this->dirFor($associate->id), $disk);
        } elseif ($request->boolean('remove_cover')) {
            $this->deleteFile($disk, $coverPath);
            $coverPath = null;
        }

        $associate->services()->updateExistingPivot($service->id, [
            'description' => $request->input('description') ?: null,
            'cover_path' => $coverPath,
        ]);

        return back()->with('success', 'Servicio actualizado.');
    }
}
