<?php

namespace App\Console\Commands;

use App\Models\Associate;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class AlignExpirationToDay19 extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'associates:align-expiration-day
                            {--dry-run : Muestra los cambios sin guardarlos}
                            {--day=19 : Día del mes al que se alineará el vencimiento}
                            {--month= : Fija el vencimiento al día indicado de este año-mes (formato YYYY-MM, ej. 2026-07)}
                            {--next : Fija el vencimiento al próximo día indicado a partir de hoy}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Alinea plan_expires_at de los asociados con plan activo al día indicado (por defecto 19). Por defecto conserva el mes; con --month o --next puede moverlo al mes correcto.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $day     = (int) $this->option('day');
        $dryRun  = (bool) $this->option('dry-run');
        $monthOp = $this->option('month');
        $next    = (bool) $this->option('next');

        if ($day < 1 || $day > 28) {
            $this->error("El día debe estar entre 1 y 28 (recibido: {$day}) para evitar problemas con meses cortos.");
            return self::FAILURE;
        }

        if ($monthOp && $next) {
            $this->error('Usa solo --month o --next, no ambos.');
            return self::FAILURE;
        }

        // Base fija para --month (mismo destino para todos).
        $monthBase = null;
        if ($monthOp) {
            if (! preg_match('/^\d{4}-\d{2}$/', $monthOp)) {
                $this->error("Formato de --month inválido: '{$monthOp}'. Usa YYYY-MM, ej. 2026-07.");
                return self::FAILURE;
            }
            $monthBase = Carbon::createFromFormat('Y-m-d', $monthOp . '-01')->startOfDay();
        }

        $associates = Associate::whereNotNull('plan_id')
            ->whereNotNull('plan_expires_at')
            ->get();

        if ($associates->isEmpty()) {
            $this->info('No hay asociados con plan activo y fecha de vencimiento.');
            return self::SUCCESS;
        }

        $modeMsg = $monthOp ? "al {$day} de {$monthOp}" : ($next ? "al próximo día {$day} desde hoy" : "al día {$day} (conservando el mes)");
        $this->info(($dryRun ? '[DRY-RUN] ' : '') . "Alineando vencimiento {$modeMsg} para {$associates->count()} asociado(s)...");
        $this->newLine();

        $rows    = [];
        $changed = 0;

        foreach ($associates as $associate) {
            $current = $associate->plan_expires_at;
            $target  = $this->targetFor($current, $day, $monthBase, $next);

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
            $this->info("Listo. {$changed} asociado(s) actualizados.");
        }

        return self::SUCCESS;
    }

    /**
     * Calcula la fecha destino conservando la hora del vencimiento actual.
     */
    private function targetFor(Carbon $current, int $day, ?Carbon $monthBase, bool $next): Carbon
    {
        if ($monthBase) {
            return $monthBase->copy()->day($day)->setTimeFrom($current);
        }

        if ($next) {
            $target = Carbon::today()->day($day);
            if ($target->lessThan(Carbon::today())) {
                $target->addMonthNoOverflow();
            }
            return $target->setTimeFrom($current);
        }

        // Por defecto: conserva mes y año, solo cambia el día.
        return $current->copy()->day($day);
    }
}
