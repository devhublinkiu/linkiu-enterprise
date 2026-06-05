<?php

namespace App\Console\Commands;

use App\Models\Associate;
use App\Models\DocumentRequirement;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class MigrateLogoFromDocs extends Command
{
    protected $signature = 'associates:migrate-logo-from-docs
                            {--dry-run : Solo reporta qué pasaría, sin escribir cambios}
                            {--deactivate-catalog : Marca el documento logo_hd como inactivo en el catálogo después}';

    protected $description = 'Mueve files.logo_hd → logo_path en cada asociado y opcionalmente desactiva logo_hd del catálogo.';

    public function handle(): int
    {
        $dry = $this->option('dry-run');

        $associates = Associate::query()
            ->whereNotNull('files')
            ->get()
            ->filter(fn($a) => is_array($a->files) && !empty($a->files['logo_hd']));

        if ($associates->isEmpty()) {
            $this->info('No hay asociados con files.logo_hd para migrar.');
        } else {
            $this->info("Encontrados {$associates->count()} asociados con logo_hd en files.");
        }

        $migrated = 0;
        $skipped  = 0;
        $copied   = 0;
        $disk     = config('filesystems.default');

        foreach ($associates as $assoc) {
            $logoPath = $assoc->files['logo_hd'] ?? null;

            if (!$logoPath) {
                $skipped++;
                continue;
            }

            $action = $assoc->logo_path
                ? "ya tiene logo_path={$assoc->logo_path}, se conserva, solo se limpia files.logo_hd"
                : "logo_path vacío → copiando {$logoPath}";

            $this->line("  #{$assoc->id} {$assoc->company_name}: {$action}");

            if ($dry) {
                $migrated++;
                continue;
            }

            $newFiles = $assoc->files;
            unset($newFiles['logo_hd']);

            $update = ['files' => $newFiles];

            if (!$assoc->logo_path) {
                $update['logo_path'] = $logoPath;
                $copied++;
            }

            $assoc->update($update);
            $migrated++;
        }

        $this->newLine();
        $this->info("Procesados: {$migrated} | Copias a logo_path: {$copied} | Omitidos: {$skipped}");

        if ($this->option('deactivate-catalog')) {
            $doc = DocumentRequirement::where('key', 'logo_hd')->first();
            if ($doc) {
                if (!$dry) {
                    $doc->update(['is_active' => false]);
                }
                $this->info($dry
                    ? "[dry-run] Se marcaría logo_hd como inactivo en el catálogo."
                    : "logo_hd desactivado del catálogo."
                );
            } else {
                $this->warn("No existe un DocumentRequirement con key=logo_hd; nada que desactivar.");
            }
        }

        if ($dry) {
            $this->warn('Modo dry-run: ningún cambio fue persistido.');
        }

        return self::SUCCESS;
    }
}
