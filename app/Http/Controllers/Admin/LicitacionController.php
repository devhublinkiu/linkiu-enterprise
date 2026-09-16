<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\NewTenderPublished;
use App\Models\BienesServiciosEmpresa;
use App\Models\Licitacion;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class LicitacionController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/BusinessServices/Tenders/Index', [
            'tenders' => Licitacion::with('empresa')->latest()->get()->map(function ($tender) {
                return [
                    'id' => $tender->id,
                    'titulo' => $tender->titulo,
                    'empresa_nombre' => $tender->empresa->nombre ?? 'N/A',
                    'publico_objetivo' => $tender->publico_objetivo,
                    'estado' => $tender->estado,
                    'fecha_publicacion' => $tender->fecha_publicacion?->format('Y-m-d H:i'),
                    'fecha_cierre' => $tender->fecha_cierre?->format('Y-m-d H:i'),
                ];
            }),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/BusinessServices/Tenders/Form', [
            'companies' => BienesServiciosEmpresa::where('estado', 'activo')->get(['id', 'nombre']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'empresa_id' => 'required|exists:bienes_servicios_empresas,id',
            'titulo' => 'required|string|max:255',
            'enlace_externo' => 'nullable|url',
            'extracto' => 'nullable|string',
            'contenido' => 'nullable|string',
            'publico_objetivo' => 'required|in:abierto,exclusivo_asociados',
            'estado' => 'required|in:borrador,publicado,cerrado',
            'fecha_publicacion' => 'nullable|date',
            'fecha_cierre' => 'nullable|date',
            'featured_image' => 'nullable|image|max:2048',
            'documents.*' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx|max:5120',
        ]);

        $tender = Licitacion::create($validated);

        if ($request->hasFile('featured_image')) {
            $tender->addMediaFromRequest('featured_image')->toMediaCollection('featured_image');
        }

        if ($request->hasFile('documents')) {
            foreach ($request->file('documents') as $file) {
                $tender->addMedia($file)->toMediaCollection('documents');
            }
        }

        // Recién creada: si nace publicada, es una publicación nueva → avisar.
        if ($tender->estado === 'publicado') {
            $this->notifyAssociatesOfPublication($tender);
        }

        return redirect()->route('admin.bienes-servicios.tenders.index')
            ->with('success', 'Licitación creada correctamente.');
    }

    public function edit(Licitacion $tender)
    {
        return Inertia::render('Admin/BusinessServices/Tenders/Form', [
            'tender' => array_merge($tender->toArray(), [
                'fecha_publicacion' => $tender->fecha_publicacion?->format('Y-m-d\TH:i'),
                'fecha_cierre' => $tender->fecha_cierre?->format('Y-m-d\TH:i'),
                'featured_image_url' => $tender->getFirstMediaUrl('featured_image'),
                'documents' => $tender->getMedia('documents')->map(function ($media) {
                    return [
                        'id' => $media->id,
                        'name' => $media->file_name,
                        'url' => $media->getUrl(),
                    ];
                }),
            ]),
            'companies' => BienesServiciosEmpresa::where('estado', 'activo')->get(['id', 'nombre']),
        ]);
    }

    public function update(Request $request, Licitacion $tender)
    {
        $validated = $request->validate([
            'empresa_id' => 'required|exists:bienes_servicios_empresas,id',
            'titulo' => 'required|string|max:255',
            'enlace_externo' => 'nullable|url',
            'extracto' => 'nullable|string',
            'contenido' => 'nullable|string',
            'publico_objetivo' => 'required|in:abierto,exclusivo_asociados',
            'estado' => 'required|in:borrador,publicado,cerrado',
            'fecha_publicacion' => 'nullable|date',
            'fecha_cierre' => 'nullable|date',
            'featured_image' => 'nullable|image|max:2048',
        ]);

        // Estado ANTES de guardar: solo avisamos en la transición a "publicado",
        // no en cada edición de una licitación que ya estaba publicada.
        $wasPublished = $tender->estado === 'publicado';

        $tender->update($validated);

        if ($request->hasFile('featured_image')) {
            $tender->clearMediaCollection('featured_image');
            $tender->addMediaFromRequest('featured_image')->toMediaCollection('featured_image');
        }

        if ($request->hasFile('documents')) {
            foreach ($request->file('documents') as $file) {
                $tender->addMedia($file)->toMediaCollection('documents');
            }
        }

        // Solo en la transición borrador/cerrado → publicado. Editar una ya
        // publicada NO reenvía correo (antes se spameaba a todos en cada guardado).
        if ($tender->estado === 'publicado' && ! $wasPublished) {
            $this->notifyAssociatesOfPublication($tender);
        }

        return redirect()->route('admin.bienes-servicios.tenders.index')
            ->with('success', 'Licitación actualizada correctamente.');
    }

    public function destroy(Licitacion $tender)
    {
        $tender->delete();

        return redirect()->route('admin.bienes-servicios.tenders.index')
            ->with('success', 'Licitación eliminada correctamente.');
    }

    public function deleteDocument(Licitacion $tender, $mediaId)
    {
        $media = $tender->media()->findOrFail($mediaId);
        $media->delete();

        return back()->with('success', 'Documento eliminado.');
    }

    /**
     * Avisa a los asociados verificados de una licitación recién publicada.
     *
     * Diferido con defer() (se manda tras la respuesta; bajo Octane corre en la
     * corrutina de la petición) y por lotes de BCC para no armar una cabecera
     * gigante ni bloquear el guardado. Se llama solo en la transición a
     * "publicado", nunca en cada edición.
     */
    private function notifyAssociatesOfPublication(Licitacion $tender): void
    {
        defer(function () use ($tender) {
            User::whereHas('associate', fn ($q) => $q->where('status', 'verified'))
                ->pluck('email')
                ->chunk(50)
                ->each(function ($emails) use ($tender) {
                    try {
                        Mail::bcc($emails->all())->send(new NewTenderPublished($tender));
                    } catch (\Throwable $e) {
                        Log::error('Error enviando alerta de licitación: '.$e->getMessage());
                    }
                });
        });
    }
}
