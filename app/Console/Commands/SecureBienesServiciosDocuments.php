<?php

namespace App\Console\Commands;

use App\Models\Licitacion;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

/**
 * Mueve al disco privado `local` los documentos de licitación que se subieron
 * antes de ADR-0010 (cuando la colección `documents` vivía en el disco público).
 *
 * Los documentos nuevos ya nacen privados (ver Licitacion::registerMediaCollections);
 * esto asegura los antiguos, que si no seguirían accesibles por URL directa.
 *
 * Idempotente: los que ya están en `local` se saltan. Correr al desplegar.
 */
class SecureBienesServiciosDocuments extends Command
{
    protected $signature = 'bienes-servicios:secure-documents {--dry-run : Muestra qué movería, sin tocar nada}';

    protected $description = 'Mueve los documentos de licitación del disco público al privado (ADR-0010).';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $moved = 0;
        $skipped = 0;

        Licitacion::withTrashed()->get()->each(function (Licitacion $tender) use ($dryRun, &$moved, &$skipped) {
            foreach ($tender->getMedia('documents') as $media) {
                if ($media->disk === 'local') {
                    $skipped++;

                    continue;
                }

                $from = Storage::disk($media->disk);
                $to = Storage::disk('local');
                $path = $media->getPathRelativeToRoot();

                if (! $from->exists($path)) {
                    $this->warn("· Ausente en disco {$media->disk}: {$path} (media {$media->id})");

                    continue;
                }

                $this->line("· {$media->disk} → local: {$path} (licitación {$tender->id}, media {$media->id})");

                if ($dryRun) {
                    $moved++;

                    continue;
                }

                $to->writeStream($path, $from->readStream($path));
                $oldDisk = $media->disk;
                $media->disk = 'local';
                $media->save();

                // Limpia la carpeta {id}/ del disco viejo (documentos no tienen conversiones).
                Storage::disk($oldDisk)->deleteDirectory(dirname($path));

                $moved++;
            }
        });

        $verbo = $dryRun ? 'se moverían' : 'movidos';
        $this->info("Listo: {$moved} {$verbo}, {$skipped} ya estaban en privado.");

        return self::SUCCESS;
    }
}
