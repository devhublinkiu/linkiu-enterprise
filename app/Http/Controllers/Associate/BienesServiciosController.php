<?php

namespace App\Http\Controllers\Associate;

use App\Http\Controllers\Controller;
use App\Models\BienesServiciosEmpresa;
use App\Models\Licitacion;
use Inertia\Inertia;

class BienesServiciosController extends Controller
{
    public function index()
    {
        $companies = BienesServiciosEmpresa::where('estado', 'activo')->get();

        // Licitaciones visibles para asociados (publicadas o cerradas), agrupadas
        // por empresa en un solo query (sin N+1) para contar activas/vencidas.
        $porEmpresa = Licitacion::whereIn('empresa_id', $companies->pluck('id'))
            ->whereIn('estado', ['publicado', 'cerrado'])
            ->get(['empresa_id', 'estado', 'fecha_cierre'])
            ->groupBy('empresa_id');

        $companies = $companies->map(function ($company) use ($porEmpresa) {
            $licitaciones = $porEmpresa->get($company->id, collect());

            // Vencida = cerrada a mano o con fecha de cierre ya pasada.
            $vencidas = $licitaciones->filter(
                fn ($l) => $l->estado === 'cerrado'
                    || ($l->fecha_cierre && $l->fecha_cierre->isPast())
            )->count();

            return [
                'id' => $company->id,
                'nombre' => $company->nombre,
                'slug' => $company->slug,
                'departamento' => $company->departamento,
                'ciudad' => $company->ciudad,
                'logo_url' => $company->getFirstMediaUrl('logo') ?: null,
                'licitaciones_activas' => $licitaciones->count() - $vencidas,
                'licitaciones_vencidas' => $vencidas,
            ];
        });

        return Inertia::render('Associate/BusinessServices/Index', [
            'companies' => $companies,
        ]);
    }

    public function showCompany($companySlug)
    {
        $company = BienesServiciosEmpresa::where('slug', $companySlug)
            ->where('estado', 'activo')
            ->firstOrFail();

        $tenders = $company->licitaciones()
            ->whereIn('estado', ['publicado', 'cerrado'])
            ->latest('fecha_publicacion')
            ->get()
            ->map(fn ($tender) => [
                'id' => $tender->id,
                'titulo' => $tender->titulo,
                'slug' => $tender->slug,
                'extracto' => $tender->extracto,
                'publico_objetivo' => $tender->publico_objetivo,
                'estado' => $tender->estado,
                'fecha_publicacion' => $tender->fecha_publicacion ? $tender->fecha_publicacion->format('d M, Y') : null,
                'featured_image_url' => $tender->getFirstMediaUrl('featured_image', 'thumb') ?: null,
            ]);

        return Inertia::render('Associate/BusinessServices/CompanyTenders', [
            'company' => [
                'nombre' => $company->nombre,
                'slug' => $company->slug,
                'departamento' => $company->departamento,
                'ciudad' => $company->ciudad,
                'logo_url' => $company->getFirstMediaUrl('logo') ?: null,
            ],
            'tenders' => $tenders,
        ]);
    }

    public function showTender($companySlug, $tenderSlug)
    {
        $company = BienesServiciosEmpresa::where('slug', $companySlug)
            ->where('estado', 'activo')
            ->firstOrFail();

        $tender = $company->licitaciones()
            ->where('slug', $tenderSlug)
            ->whereIn('estado', ['publicado', 'cerrado'])
            ->firstOrFail();

        $documents = $tender->getMedia('documents')->map(function ($media) use ($tender) {
            return [
                'id' => $media->id,
                'name' => $media->name,
                'file_name' => $media->file_name,
                'size' => $media->human_readable_size,
                // URL gateada (no la pública de Spatie); el controlador reautoriza.
                'url' => route('bienes-servicios.document', ['tender' => $tender->id, 'media' => $media->id]),
                'ext' => $media->extension,
            ];
        });

        return Inertia::render('Associate/BusinessServices/TenderDetail', [
            'company' => [
                'nombre' => $company->nombre,
                'slug' => $company->slug,
                'departamento' => $company->departamento,
                'ciudad' => $company->ciudad,
                'logo_url' => $company->getFirstMediaUrl('logo') ?: null,
            ],
            'tender' => [
                'id' => $tender->id,
                'titulo' => $tender->titulo,
                'contenido' => $tender->contenido,
                'extracto' => $tender->extracto,
                'enlace_externo' => $tender->enlace_externo,
                'estado' => $tender->estado,
                'fecha_publicacion' => $tender->fecha_publicacion ? $tender->fecha_publicacion->format('d M, Y') : null,
                'fecha_cierre' => $tender->fecha_cierre ? $tender->fecha_cierre->format('d M, Y') : null,
                'featured_image_url' => $tender->getFirstMediaUrl('featured_image') ?: null,
            ],
            'documents' => $documents,
        ]);
    }
}
