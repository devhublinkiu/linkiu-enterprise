<?php

namespace App\Http\Controllers\Concerns;

use App\Models\Associate;
use App\Models\DocumentRequirement;
use Illuminate\Support\Facades\Storage;

/**
 * Helpers de archivos/catálogo del asociado, compartidos por el controlador del
 * asociado (ficha) y el de auditoría admin (Show). Ver plan 0015.
 */
trait InteractsWithAssociateFiles
{
    protected function appendFileUrls(Associate $associate): void
    {
        $urls = [];

        if ($associate->logo_path) {
            $urls['logo'] = Storage::url($associate->logo_path);
        }
        if ($associate->cover_path) {
            $urls['cover'] = Storage::url($associate->cover_path);
        }
        if ($associate->files) {
            foreach ($associate->files as $key => $path) {
                $urls[$key] = route('associate.documents.show', ['associate' => $associate->id, 'docKey' => $key]);
            }
        }

        $associate->document_urls = $urls;

        if ($associate->cover_path) {
            $associate->cover_url = Storage::url($associate->cover_path);
        }

        $gallery = [];
        if ($associate->gallery_paths) {
            foreach ($associate->gallery_paths as $path) {
                $gallery[] = ['path' => $path, 'url' => Storage::url($path)];
            }
        }
        $associate->gallery_urls = $gallery;
    }

    protected function documentCatalog(): array
    {
        $docs = DocumentRequirement::active()->ordered()->get();

        return [
            'mandatory' => $docs->where('is_required', true)->values()
                ->map(fn ($d) => $d->toCatalogEntry())->all(),
            'optional' => $docs->where('is_required', false)->values()
                ->map(fn ($d) => $d->toCatalogEntry())->all(),
        ];
    }

    /**
     * Mapa plano key => spec de todos los documentos ACTIVOS.
     */
    protected function documentSpecsByKey(): array
    {
        return DocumentRequirement::active()
            ->get()
            ->keyBy('key')
            ->map(fn ($d) => $d->toCatalogEntry())
            ->all();
    }
}
