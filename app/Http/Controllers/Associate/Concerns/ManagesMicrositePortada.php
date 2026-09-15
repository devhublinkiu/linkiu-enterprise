<?php

namespace App\Http\Controllers\Associate\Concerns;

use App\Models\Associate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

/**
 * Micrositio › Portada. Plan 0021, corte 21-G.
 *
 * La portada es el fondo del hero (donde va el nombre de la empresa). El asociado
 * elige entre un **gradiente animado** (por defecto) o una **imagen** propia con
 * medida precisa (apaisada). La imagen vive en el disco por defecto.
 */
trait ManagesMicrositePortada
{
    public function portada(Request $request)
    {
        $associate = Associate::findOrFail($request->user()->associate_id);
        $disk = config('filesystems.default');
        $url = fn (?string $p) => $p ? Storage::disk($disk)->url($p) : null;

        return Inertia::render('Associate/Microsite/Portada', [
            'slug' => $associate->slug,
            'micrositeUrl' => $this->micrositeUrl($associate),
            'coverType' => $associate->cover_type ?: 'gradient',
            'coverUrl' => $url($associate->microsite_cover_path),
        ]);
    }

    public function updatePortada(Request $request)
    {
        $associate = Associate::findOrFail($request->user()->associate_id);
        $disk = config('filesystems.default');

        $request->validate([
            'cover_type' => 'required|in:gradient,image',
            'cover' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'remove_cover' => 'nullable|boolean',
        ]);

        $associate->cover_type = $request->input('cover_type');
        $this->applyImage($request, $associate, 'cover', 'microsite_cover_path', 'remove_cover', $associate->id, $disk);
        $associate->save();

        return back()->with('success', 'Portada actualizada.');
    }
}
