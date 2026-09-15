<?php

namespace App\Http\Controllers\Associate\Concerns;

use App\Models\Associate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * Helpers compartidos por los concerns del micrositio (plan 0021): verificación de
 * dueño, subida/borrado de imágenes en el disco por defecto, orden de ítems y la
 * dirección pública. Un solo lugar para no duplicar entre pestañas.
 */
trait InteractsWithMicrositeMedia
{
    private function guard($model, Request $request): void
    {
        abort_unless(
            (int) $model->associate_id === (int) $request->user()->associate_id,
            403
        );
    }

    private function uploadOrNull(Request $request, int $associateId, string $key): ?string
    {
        return $request->hasFile($key)
            ? $request->file($key)->store($this->dirFor($associateId), config('filesystems.default'))
            : null;
    }

    private function applyImage(Request $request, $model, string $fileKey, string $pathKey, string $removeKey, int $associateId, string $disk): void
    {
        if ($request->hasFile($fileKey)) {
            $this->deleteFile($disk, $model->{$pathKey});
            $model->{$pathKey} = $request->file($fileKey)->store($this->dirFor($associateId), $disk);
        } elseif ($request->boolean($removeKey)) {
            $this->deleteFile($disk, $model->{$pathKey});
            $model->{$pathKey} = null;
        }
    }

    private function dirFor(int $associateId): string
    {
        return "associates/{$associateId}/microsite";
    }

    private function nextSort($relation): int
    {
        return (int) $relation->max('sort') + 1;
    }

    private function intOrNull($value): ?int
    {
        return is_numeric($value) ? (int) $value : null;
    }

    private function deleteFile(string $disk, ?string $path): void
    {
        if (! $path) {
            return;
        }
        try {
            Storage::disk($disk)->delete($path);
        } catch (\Throwable $e) {
            // Silencioso: un archivo ya ausente no debe romper el guardado.
        }
    }

    private function micrositeUrl(Associate $associate): string
    {
        return $associate->slug
            ? url('/'.$associate->slug)
            : route('companies.show', $associate->id);
    }
}
