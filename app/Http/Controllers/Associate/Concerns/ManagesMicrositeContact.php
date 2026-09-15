<?php

namespace App\Http\Controllers\Associate\Concerns;

use App\Models\Associate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

/**
 * Micrositio › Contacto + interruptor de publicado. Plan 0021, corte 21-E.
 *
 * Reúsa los datos del perfil (solo lectura) y añade lo propio del micrositio:
 * WhatsApp, correo de contacto y hasta 3 fotos de fachada (slider público). El
 * interruptor de publicado alterna borrador ↔ público: en borrador solo el dueño
 * ve el micrositio (vista previa); el público recibe 404 (ver PublicCompanyController).
 */
trait ManagesMicrositeContact
{
    public function contact(Request $request)
    {
        $associate = Associate::findOrFail($request->user()->associate_id);
        $disk = config('filesystems.default');
        $url = fn (?string $p) => $p ? Storage::disk($disk)->url($p) : null;

        return Inertia::render('Associate/Microsite/Contacto', [
            'slug' => $associate->slug,
            'micrositeUrl' => $this->micrositeUrl($associate),
            'published' => (bool) $associate->microsite_published,
            'contactsUrl' => route('associate.company.contacts'),
            'contact' => [
                'whatsapp' => $associate->whatsapp,
                'contact_email' => $associate->contact_email,
            ],
            'reused' => [
                'phone' => $associate->phone,
                'email' => $associate->billing_email,
                'website' => $associate->website,
                'address' => $associate->address,
                'city' => $associate->city,
                'department' => $associate->department,
                'facebook' => $associate->social_facebook,
                'instagram' => $associate->social_instagram,
                'linkedin' => $associate->social_linkedin,
            ],
            'facades' => collect($associate->facade_paths ?? [])
                ->take(3)
                ->map(fn ($p) => ['path' => $p, 'url' => $url($p)])
                ->values(),
        ]);
    }

    public function updateContact(Request $request)
    {
        $associate = Associate::findOrFail($request->user()->associate_id);
        $disk = config('filesystems.default');

        $request->validate([
            'whatsapp' => 'nullable|string|max:40',
            'contact_email' => 'nullable|email|max:160',
            'facades' => 'nullable|array|max:3',
            'facades.*' => 'image|mimes:jpeg,png,jpg,webp|max:5120',
            'remove_facades' => 'nullable|array',
            'remove_facades.*' => 'string',
        ]);

        $associate->whatsapp = $request->input('whatsapp') ?: null;
        $associate->contact_email = $request->input('contact_email') ?: null;

        $current = collect($associate->facade_paths ?? []);
        $remove = collect($request->input('remove_facades', []));
        // Borrar del disco las fachadas marcadas.
        $current->filter(fn ($p) => $remove->contains($p))
            ->each(fn ($p) => $this->deleteFile($disk, $p));
        $kept = $current->reject(fn ($p) => $remove->contains($p))->values();
        // Añadir las nuevas respetando el tope de 3.
        if ($request->hasFile('facades')) {
            foreach ($request->file('facades') as $file) {
                if ($kept->count() >= 3) {
                    break;
                }
                $kept->push($file->store($this->dirFor($associate->id), $disk));
            }
        }
        $associate->facade_paths = $kept->values()->all();
        $associate->save();

        return back()->with('success', 'Contacto actualizado.');
    }

    public function togglePublished(Request $request)
    {
        $associate = Associate::findOrFail($request->user()->associate_id);
        $request->validate(['published' => 'required|boolean']);
        $associate->microsite_published = $request->boolean('published');
        $associate->save();

        return back()->with('success', $associate->microsite_published
            ? 'Micrositio publicado.'
            : 'Micrositio en borrador.');
    }
}
