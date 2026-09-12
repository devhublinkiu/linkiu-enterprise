<?php

namespace App\Console\Commands;

use App\Models\Associate;
use App\Services\BillingService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class GenerateMonthlyInvoices extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'invoices:generate-monthly
                            {--dry-run : Muestra qué cuentas de cobro se generarían sin crearlas}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Genera la cuenta de cobro (día 15) de los asociados que deben: los que vencen este mes y los que ya venían vencidos.';

    public function __construct(private BillingService $billing)
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $now    = Carbon::now();

        $this->info(($dryRun ? '[DRY-RUN] ' : '') . 'Generando cuentas de cobro para: ' . BillingService::periodLabel($now));
        $this->newLine();

        // Se factura a quien DEBE, no solo a quien vence justo este mes.
        //
        // El filtro anterior (whereMonth == mes actual) dejaba de emitirle al
        // moroso: si no pagaba, su vencimiento se quedaba en el mes anterior y
        // nunca volvía a coincidir. El sistema dejaba de cobrarle justo a quien
        // debía. Ver docs/adr/0001-motor-de-cobro-unificado.md
        $associates = Associate::with(['plan', 'users'])
            ->whereNotNull('plan_id')
            ->whereNotNull('plan_expires_at')
            ->where('plan_expires_at', '<=', $now->copy()->endOfMonth())
            ->orderBy('plan_expires_at')
            ->get();

        if ($associates->isEmpty()) {
            $this->info('No hay asociados por facturar este mes.');
            return self::SUCCESS;
        }

        $created = 0;
        $skipped = 0;
        $rows    = [];

        foreach ($associates as $associate) {
            $overdue = $associate->plan_expires_at->isPast();

            if ($dryRun) {
                $cycle       = $associate->billing_cycle ?: 'monthly';
                $periodLabel = BillingService::periodLabel($now, $this->prefixLabel($cycle));

                if ($this->billing->periodAlreadyBilled($associate, $periodLabel)) {
                    $skipped++;
                    $rows[] = [$associate->id, $associate->company_name, '—', 'ya existe'];
                    continue;
                }

                $created++;
                $rows[] = [
                    $associate->id,
                    $associate->company_name,
                    number_format(BillingService::amountFor($associate->plan, $cycle), 2),
                    $overdue ? 'se crearía (en mora)' : 'se crearía',
                ];
                continue;
            }

            $invoice = $this->billing->issuePeriodInvoice($associate, $now);

            if (!$invoice) {
                $skipped++;
                $rows[] = [$associate->id, $associate->company_name, '—', 'ya existe o sin plan'];
                continue;
            }

            $sent = $this->billing->notify($invoice);

            $created++;
            $rows[] = [
                $associate->id,
                $associate->company_name,
                number_format((float) $invoice->amount, 2),
                ($sent ? 'creada + correo' : 'creada (sin correo)') . ($overdue ? ' · en mora' : ''),
            ];
        }

        $this->table(['ID', 'Asociado', 'Monto', 'Resultado'], $rows);
        $this->newLine();

        if ($dryRun) {
            $this->warn("[DRY-RUN] Se generarían {$created} cuenta(s) de cobro, {$skipped} omitida(s). No se creó nada.");
        } else {
            $this->info("Listo. {$created} cuenta(s) de cobro creada(s), {$skipped} omitida(s).");
        }

        return self::SUCCESS;
    }

    private function prefixLabel(?string $cycle): string
    {
        return match ($cycle) {
            'semiannual' => 'Semestralidad',
            'annual'     => 'Anualidad',
            default      => 'Mensualidad',
        };
    }
}
