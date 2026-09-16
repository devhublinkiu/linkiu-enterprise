<?php

namespace App\Http\Controllers;

use App\Models\Licitacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

/**
 * Entrega los documentos adjuntos de una licitación tras comprobar quién pide.
 *
 * Antes se servían por la URL pública de Spatie (disco `public`), así que un
 * documento `exclusivo_asociados` era descargable por cualquiera con el enlace.
 * Ahora la colección `documents` vive en disco privado y se sirve solo desde
 * aquí, con el mismo patrón que AssociateController::showDocument() y
 * BillingDocumentController: en s3/minio se firma una URL de 10 min, en local
 * se hace stream. La autorización es la regla única de Licitacion::isAccessibleBy.
 *
 * Ver docs/adr/0010-documentos-licitacion-privados.md
 */
class LicitacionDocumentController extends Controller
{
    public function download(Request $request, Licitacion $tender, string $media): Response
    {
        // Acotado a la propia licitación y a la colección `documents`: un id de
        // media de otra licitación (o de otra colección) da 404, no IDOR.
        $item = $tender->media()
            ->where('collection_name', 'documents')
            ->findOrFail($media);

        if (! $tender->isAccessibleBy($request->user())) {
            abort(403);
        }

        $disk = Storage::disk($item->disk);
        $path = $item->getPathRelativeToRoot();

        if (! $disk->exists($path)) {
            abort(404);
        }

        // Compatibilidad con documentos subidos antes de este cambio (disco s3/minio).
        if (in_array($item->disk, ['s3', 'minio'], true)) {
            return redirect()->away($disk->temporaryUrl($path, now()->addMinutes(10)));
        }

        return $disk->response($path, $item->file_name);
    }
}
