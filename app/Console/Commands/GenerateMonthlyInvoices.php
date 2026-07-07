<?php

namespace App\Console\Commands;

use App\Mail\NewInvoiceGenerated;
use App\Models\Associate;
use App\Models\Invoice;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

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
    protected $description = 'Genera la cuenta de cobro mensual (día 15) para los asociados con plan activo cuyo vencimiento cae este mes.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $dryRun      = (bool) $this->option('dry-run');
        $now         = Carbon::now();
        $periodLabel = 'Mensualidad - ' . ucfirst($now->locale('es')->isoFormat('MMMM YYYY'));

        $this->info(($dryRun ? '[DRY-RUN] ' : '') . "Generando cuentas de cobro para: {$periodLabel}");
        $this->newLine();

        // Asociados con plan activo cuyo vencimiento (día 19) cae en el mes/año actual.
        $associates = Associate::with(['plan', 'users'])
            ->whereNotNull('plan_id')
            ->whereNotNull('plan_expires_at')
            ->whereMonth('plan_expires_at', $now->month)
            ->whereYear('plan_expires_at', $now->year)
            ->get();

        if ($associates->isEmpty()) {
            $this->info('No hay asociados por facturar este mes.');
            return self::SUCCESS;
        }

        $created = 0;
        $skipped = 0;
        $rows    = [];

        foreach ($associates as $associate) {
            // Evitar duplicados si el comando corre más de una vez en el mes.
            $exists = Invoice::where('associate_id', $associate->id)
                ->where('period', $periodLabel)
                ->exists();

            if ($exists) {
                $skipped++;
                $rows[] = [$associate->id, $associate->company_name, '—', 'ya existe'];
                continue;
            }

            $amount = $associate->plan?->price_monthly ?? 0;

            if ($dryRun) {
                $created++;
                $rows[] = [$associate->id, $associate->company_name, number_format($amount, 2), 'se crearía'];
                continue;
            }

            $invoice = Invoice::create([
                'associate_id' => $associate->id,
                'created_by'   => null, // generada por el sistema
                'type'         => 'cuenta_cobro',
                'period'       => $periodLabel,
                'amount'       => $amount,
                'notes'        => 'Cuenta de cobro mensual generada automáticamente. Fecha de pago: día ' . Associate::BILLING_DAY . '.',
                'status'       => 'pendiente',
            ]);

            $recipient = $associate->users->first()?->email ?? $associate->billing_email ?? null;
            if ($recipient) {
                try {
                    Mail::to($recipient)->send(new NewInvoiceGenerated($invoice));
                } catch (\Exception $e) {
                    Log::error("Error enviando cuenta de cobro mensual (asociado {$associate->id}): " . $e->getMessage());
                }
            }

            $created++;
            $rows[] = [$associate->id, $associate->company_name, number_format($amount, 2), $recipient ? 'creada + correo' : 'creada (sin correo)'];
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
}
