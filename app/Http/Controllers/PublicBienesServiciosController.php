<?php

namespace App\Http\Controllers;

use App\Models\BienesServiciosEmpresa;
use App\Models\Licitacion;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicBienesServiciosController extends Controller
{
    public function index()
    {
        $companies = BienesServiciosEmpresa::where('estado', 'activo')
            ->get()
            ->map(fn ($company) => [
                'id' => $company->id,
                'nombre' => $company->nombre,
                'slug' => $company->slug,
                'logo_url' => $company->getFirstMediaUrl('logo') ?: null,
            ]);

        return Inertia::render('Public/BusinessServices/Index', [
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

        return Inertia::render('Public/BusinessServices/CompanyTenders', [
            'company' => [
                'nombre' => $company->nombre,
                'slug' => $company->slug,
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

        $isRestricted = $tender->publico_objetivo === 'exclusivo_asociados' && !auth()->check();

        $documents = $tender->getMedia('documents')->map(function ($media) {
            return [
                'id' => $media->id,
                'name' => $media->name,
                'file_name' => $media->file_name,
                'size' => $media->human_readable_size,
                'url' => $media->getUrl(),
                'ext' => $media->extension,
            ];
        });

        return Inertia::render('Public/BusinessServices/TenderDetail', [
            'company' => [
                'nombre' => $company->nombre,
                'slug' => $company->slug,
                'logo_url' => $company->getFirstMediaUrl('logo') ?: null,
            ],
            'tender' => [
                'id' => $tender->id,
                'titulo' => $tender->titulo,
                'contenido' => $isRestricted ? null : $tender->contenido,
                'extracto' => $tender->extracto,
                'enlace_externo' => $isRestricted ? null : $tender->enlace_externo,
                'estado' => $tender->estado,
                'publico_objetivo' => $tender->publico_objetivo,
                'fecha_publicacion' => $tender->fecha_publicacion ? $tender->fecha_publicacion->format('d M, Y') : null,
                'fecha_cierre' => $tender->fecha_cierre ? $tender->fecha_cierre->format('d M, Y') : null,
                'featured_image_url' => $tender->getFirstMediaUrl('featured_image') ?: null,
            ],
            'isRestricted' => $isRestricted,
            'documents' => $isRestricted ? [] : $documents,
        ]);
    }
}
