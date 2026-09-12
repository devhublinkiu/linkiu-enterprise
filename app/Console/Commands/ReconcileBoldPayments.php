<?php

namespace App\Console\Commands;

use App\Models\Payment;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

/**
 * Red de seguridad del riel de Bold.
 *
 * Un pago en línea queda pendiente mientras el asociado está en el checkout de
 * la pasarela. Si el webhook nunca llega —porque se perdió, porque el asociado
 * abandonó, o porque la pasarela falló— esa fila se queda pendiente para
 * siempre, y como startOnlinePayment() reutiliza el intento pendiente, el
 * asociado no podría volver a intentarlo.
 *
 * Este comando cierra los intentos abandonados para desatascar el reintento, y
 * deja constancia de los que llevan demasiado tiempo colgados.
 *
 * Ver docs/adr/0001-motor-de-cobro-unificado.md
 */
class ReconcileBoldPayments extends Command
{
    protected $signature = 'payments:reconcile-bold
                            {--stale=45 : Minutos tras los que un intento se considera abandonado}
                            {--dry-run  : Muestra qué se cerraría sin tocar nada}';

    protected $description = 'Cierra los intentos de pago en línea abandonados para que el asociado pueda reintentar.';

    public function handle(): int
    {
        $staleMinutes = max(5, (int) $this->option('stale'));
        $dryRun       = (bool) $this->option('dry-run');
        $cutoff       = now()->subMinutes($staleMinutes);

        $stale = Payment::with('invoice')
            ->where('method', Payment::METHOD_BOLD)
            ->where('status', Payment::STATUS_PENDING)
            ->whereNull('applied_at')
            ->where('created_at', '<', $cutoff)
            ->get();

        if ($stale->isEmpty()) {
            $this->info('No hay intentos de pago en línea colgados.');
            return self::SUCCESS;
        }

        $rows = [];

        foreach ($stale as $payment) {
            $minutes = (int) $payment->created_at->diffInMinutes(now());

            $rows[] = [
                $payment->id,
                $payment->reference,
                $payment->associate?->company_name ?? '—',
                number_format((float) $payment->amount, 2),
                $minutes . ' min',
            ];

            if ($dryRun) {
                continue;
            }

            $payment->update([
                'status'      => Payment::STATUS_FAILED,
                'admin_notes' => "Intento cerrado automáticamente tras {$minutes} minutos sin confirmación de la pasarela.",
            ]);
        }

        $this->table(['ID', 'Referencia', 'Asociado', 'Monto', 'Antigüedad'], $rows);

        $count = $stale->count();

        if ($dryRun) {
            $this->warn("[DRY-RUN] Se cerrarían {$count} intento(s). No se tocó nada.");
            return self::SUCCESS;
        }

        // Que un pago llegue aquí no es normal: o el webhook no está llegando o
        // los asociados están abandonando el checkout. Conviene verlo en el log.
        Log::info("payments:reconcile-bold cerró {$count} intento(s) de pago en línea sin confirmar.");

        $this->info("Listo. {$count} intento(s) cerrado(s); el asociado ya puede reintentar.");

        return self::SUCCESS;
    }
}
