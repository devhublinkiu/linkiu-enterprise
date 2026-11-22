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
     * Avisa de una licitación recién publicada SOLO a quien puede abrirla: los
     * asociados admitidos, al día y con el módulo Bienes y Servicios en su plan
     * (ADR-0002). Antes se mandaba a los `verified` (admitidos sin pagar), que no
     * pueden entrar. Se reusa la lógica autoritativa (isSubscriptionActive +
     * allows) en vez de replicarla en SQL.
     *
     * Diferido con defer() y por lotes de BCC para no bloquear el guardado. Se
     * llama solo en la transición a "publicado".
     */
    private function notifyAssociatesOfPublication(Licitacion $tender): void
    {
        defer(function () use ($tender) {
            $emails = User::query()
                ->whereHas('associate', fn ($q) => $q->where('status', 'approved'))
                ->with('associate.plan.features')
                ->get()
                ->filter(fn ($user) => $user->associate
                    && $user->associate->isSubscriptionActive()
                    && $user->associate->plan?->allows('bienes_servicios'))
                ->pluck('email')
                ->filter()
                ->values();

            $emails->chunk(50)->each(function ($chunk) use ($tender) {
                try {
                    // Resend exige un `to`: mandamos a la casilla de envío y los
                    // asociados en BCC (ocultos entre sí). Sin `to`, la API
                    // responde "Missing `to` field" y el aviso no sale.
                    $to = config('mail.from.address') ?: 'afiliate@camepg.org';
                    Mail::to($to)->bcc($chunk->all())->send(new NewTenderPublished($tender));
                } catch (\Throwable $e) {
                    Log::error('Error enviando alerta de licitación: '.$e->getMessage());
                }
            });
        });
    }
}
