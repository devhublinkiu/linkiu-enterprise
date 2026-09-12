<?php

namespace App\Console\Commands;

use App\Models\Associate;
use App\Models\Invoice;
use App\Services\SubscriptionService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Avisos escalonados de cobro.
 *
 * Corre a diario y decide qué toca según dónde esté cada asociado en el
 * calendario. El calendario completo está en
 * docs/adr/0002-interruptores-de-modulo-por-plan.md#calendario-de-cortes
 *
 *   día 18                     → «vence mañana»
 *   día 20                     → «venció ayer, te quedan N días de gracia»
 *   víspera del fin de gracia  → «mañana se oculta tu perfil»
 *
 * La emisión del día 15 y el corte del fin de gracia los avisan
 * invoices:generate-monthly y subscription:check-expiration.
 */
class SendBillingReminders extends Command
{
    protected $signature = 'billing:send-reminders
                            {--dry-run : Muestra a quién se le escribiría sin enviar nada}';

    protected $description = 'Envía los recordatorios de pago escalonados: víspera del corte, mora y aviso final antes de ocultar el perfil.';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $today  = Carbon::now()->startOfDay();

        $associates = Associate::with(['plan', 'users'])
            ->whereNotNull('plan_id')
            ->whereNotNull('plan_expires_at')
            ->get();

        if ($associates->isEmpty()) {
            $this->info('No hay suscripciones que vigilar.');
            return self::SUCCESS;
        }

        $rows = [];
        $sent = 0;

        foreach ($associates as $associate) {
            $aviso = $this->avisoPara($associate, $today);

            if (!$aviso) {
                continue;
            }

            [$tipo, $dias] = $aviso;

            // Sin cuenta de cobro pendiente no hay nada que reclamar: el
            // asociado ya pagó o todavía no se le ha emitido.
            if (!$this->tienePendiente($associate)) {
                $rows[] = [$associate->company_name, $tipo, '—', 'sin cobro pendiente'];
                continue;
            }

            $recipient = $associate->users->first()?->email ?? $associate->billing_email;

            if (!$recipient) {
                $rows[] = [$associate->company_name, $tipo, '—', 'sin correo'];
                continue;
            }

            if ($dryRun) {
                $rows[] = [$associate->company_name, $tipo, $recipient, 'se enviaría'];
                $sent++;
                continue;
            }

            $rows[] = [
                $associate->company_name,
                $tipo,
                $recipient,
                $this->enviar($associate, $tipo, $dias, $recipient) ? 'enviado' : 'error (ver log)',
            ];
            $sent++;
        }

        if (empty($rows)) {
            $this->info('Hoy no le toca aviso a nadie.');
            return self::SUCCESS;
        }

        $this->table(['Asociado', 'Aviso', 'Destinatario', 'Resultado'], $rows);
        $this->info(($dryRun ? '[DRY-RUN] ' : '') . "{$sent} aviso(s).");

        return self::SUCCESS;
    }

    /**
     * @return array{0:string,1:int}|null  [tipo de aviso, días relevantes]
     */
    private function avisoPara(Associate $associate, Carbon $today): ?array
    {
        $expira = $associate->plan_expires_at->copy()->startOfDay();
        $gracia = (int) ($associate->plan->grace_days ?? 0);
        $finGracia = $expira->copy()->addDays($gracia);

        // Víspera del corte.
        if ($today->equalTo($expira->copy()->subDay())) {
            return ['vispera', 1];
        }

        // Primer día de mora (el día siguiente al corte).
        if ($today->equalTo($expira->copy()->addDay())) {
            return ['mora', $gracia];
        }

        // Víspera de que se oculte el perfil. Solo tiene sentido si el plan
        // concede gracia; si no, el corte y el apagado son el mismo día.
        if ($gracia > 0 && $today->equalTo($finGracia->copy()->subDay())) {
            return ['ultimo', 1];
        }

        return null;
    }

    private function tienePendiente(Associate $associate): bool
    {
        return Invoice::where('associate_id', $associate->id)
            ->where('status', 'pendiente')
            ->where('type', 'cuenta_cobro')
            ->exists();
    }

    private function enviar(Associate $associate, string $tipo, int $dias, string $recipient): bool
    {
        try {
            $mailable = $tipo === 'ultimo'
                ? new \App\Mail\SubscriptionExpired($associate)
                : new \App\Mail\SubscriptionExpiringSoon($associate, $dias);

            Mail::to($recipient)->send($mailable);

            return true;
        } catch (\Exception $e) {
            Log::error("Error enviando recordatorio '{$tipo}' al asociado {$associate->id}: " . $e->getMessage());
            return false;
        }
    }
}
