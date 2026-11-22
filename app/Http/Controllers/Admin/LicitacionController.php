<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\NewTenderPublished;
use App\Mail\TenderUpdatedAlert;
use App\Models\BienesServiciosEmpresa;
use App\Models\Licitacion;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Mail\Mailable;
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

        $addedDocuments = false;
        if ($request->hasFile('documents')) {
            foreach ($request->file('documents') as $file) {
                $tender->addMedia($file)->toMediaCollection('documents');
            }
            $addedDocuments = true;
        }

        // Solo en la transición borrador/cerrado → publicado. Editar una ya
        // publicada NO reenvía el correo de publicación (antes se spameaba en cada
        // guardado).
        if ($tender->estado === 'publicado' && ! $wasPublished) {
            $this->notifyAssociatesOfPublication($tender);
        } elseif ($wasPublished && $tender->estado === 'publicado' && $addedDocuments) {
            // Ya estaba publicada y se le subieron documentos nuevos: aviso de
            // actualización (asunto propio), sin reenviar el de publicación.
            $this->notifyAssociatesOfUpdate($tender);
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
     * Aviso de una licitación recién publicada. Se llama solo en la transición a
     * "publicado". El público y el envío los resuelve notifyAssociates().
     */
    private function notifyAssociatesOfPublication(Licitacion $tender): void
    {
        $this->notifyAssociates(fn () => new NewTenderPublished($tender));
    }

    /**
     * Aviso de actualización (documentos nuevos) de una licitación ya publicada.
     * Mismo público que la publicación; se llama solo al subir documentos.
     */
    private function notifyAssociatesOfUpdate(Licitacion $tender): void
    {
        $this->notifyAssociates(fn () => new TenderUpdatedAlert($tender));
    }

    /**
     * Envía el correo (uno nuevo por lote, vía la fábrica) SOLO a quien puede abrir
     * la licitación: asociados admitidos, al día y con el módulo Bienes y Servicios
     * en su plan (ADR-0002). Se reusa la lógica autoritativa (isSubscriptionActive +
     * allows) en vez de replicarla en SQL. Diferido con defer() y por lotes de BCC
     * para no bloquear el guardado (ADR-0011).
     *
     * @param  Closure(): Mailable  $makeMail  Fábrica del correo a enviar.
     */
    private function notifyAssociates(Closure $makeMail): void
    {
        defer(function () use ($makeMail) {
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

            $emails->chunk(50)->each(function ($chunk) use ($makeMail) {
                try {
                    // Resend exige un `to`: mandamos a la casilla de envío y los
                    // asociados en BCC (ocultos entre sí). Sin `to`, la API
                    // responde "Missing `to` field" y el aviso no sale.
                    $to = config('mail.from.address') ?: 'afiliate@camepg.org';
                    Mail::to($to)->bcc($chunk->all())->send($makeMail());
                } catch (\Throwable $e) {
                    Log::error('Error enviando alerta de licitación: '.$e->getMessage());
                }
            });
        });
    }
}
