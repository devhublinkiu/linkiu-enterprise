<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BienesServiciosEmpresa;
use App\Models\Licitacion;
use Illuminate\Http\Request;
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

        // Notificar a todos los asociados si se publica
        if ($tender->estado === 'publicado') {
            try {
                $emails = \App\Models\User::whereHas('associate', function ($q) {
                    $q->where('status', 'verified');
                })->pluck('email')->toArray();

                if (!empty($emails)) {
                    \Illuminate\Support\Facades\Mail::bcc($emails)
                        ->send(new \App\Mail\NewTenderPublished($tender));
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Error enviando alerta de licitación: ' . $e->getMessage());
            }
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

        // Notificar a todos los asociados si se actualiza y ya está publicada
        if ($tender->estado === 'publicado') {
            try {
                $emails = \App\Models\User::whereHas('associate', function ($q) {
                    $q->where('status', 'verified');
                })->pluck('email')->toArray();

                if (!empty($emails)) {
                    \Illuminate\Support\Facades\Mail::bcc($emails)
                        ->send(new \App\Mail\TenderUpdatedAlert($tender));
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Error enviando alerta de actualización de licitación: ' . $e->getMessage());
            }
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
}
