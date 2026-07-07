<?php

namespace App\Console\Commands;

use App\Models\Associate;
use Illuminate\Console\Command;

class AlignExpirationToDay19 extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'associates:align-expiration-day
                            {--dry-run : Muestra los cambios sin guardarlos}
                            {--day=19 : Día del mes al que se alineará el vencimiento}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Alinea el día de plan_expires_at de los asociados con plan activo (por defecto al día 19), conservando el mes y año.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $day    = (int) $this->option('day');
        $dryRun = (bool) $this->option('dry-run');

        if ($day < 1 || $day > 28) {
            $this->error("El día debe estar entre 1 y 28 (recibido: {$day}) para evitar problemas con meses cortos.");
            return self::FAILURE;
        }

        $associates = Associate::whereNotNull('plan_id')
            ->whereNotNull('plan_expires_at')
            ->get();

        if ($associates->isEmpty()) {
            $this->info('No hay asociados con plan activo y fecha de vencimiento.');
            return self::SUCCESS;
        }

        $this->info(($dryRun ? '[DRY-RUN] ' : '') . "Alineando vencimiento al día {$day} para {$associates->count()} asociado(s)...");
        $this->newLine();

        $rows    = [];
        $changed = 0;

        foreach ($associates as $associate) {
            $current = $associate->plan_expires_at;
            $target  = $current->copy()->day($day); // conserva mes, año y hora

            $willChange = ! $current->equalTo($target);

            $rows[] = [
                $associate->id,
                $associate->company_name,
                $current->format('Y-m-d H:i'),
                $target->format('Y-m-d H:i'),
                $willChange ? 'sí' : 'no',
            ];

            if ($willChange) {
                $changed++;
                if (! $dryRun) {
                    $associate->update(['plan_expires_at' => $target]);
                }
            }
        }

        $this->table(
            ['ID', 'Asociado', 'Vencimiento actual', 'Nuevo vencimiento', '¿Cambia?'],
            $rows
        );

        $this->newLine();

        if ($dryRun) {
            $this->warn("[DRY-RUN] {$changed} asociado(s) cambiarían. No se guardó nada. Ejecuta sin --dry-run para aplicar.");
        } else {
            $this->info("Listo. {$changed} asociado(s) actualizados al día {$day}.");
        }

        return self::SUCCESS;
    }
}
