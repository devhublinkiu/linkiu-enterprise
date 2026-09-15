<?php

namespace App\Console\Commands;

use App\Models\Payment;
use App\Services\Bold\BoldGateway;
use App\Services\PaymentService;
use Illuminate\Console\Command;

/**
 * Simula un webhook de Bold para un pago concreto, firmándolo con NUESTRO propio
 * secreto y pasándolo por el mismo camino que el webhook real (verificar firma →
 * parsear → aplicar). Sirve para dos cosas:
 *
 *   1. Validar de punta a punta el pipeline (firma + aplicación) sin depender de
 *      que Bold entregue el aviso.
 *   2. Recuperar a mano un pago que quedó "procesando" porque el webhook se
 *      perdió (uso de diagnóstico/soporte, sólo por consola).
 *
 * OJO: aplicar un pago extiende la vigencia. Úsalo sólo cuando sepas que el pago
 * fue realmente aprobado en Bold. Ver docs/adr/0001-motor-de-cobro-unificado.md
 */
class SimulateBoldPayment extends Command
{
    protected $signature = 'payments:simulate-bold
                            {reference : Referencia del pago (Payment->reference)}
                            {--outcome=approved : approved|rejected}
                            {--dry-run : Verifica la firma y muestra el payload, sin aplicar}';

    protected $description = 'Simula un webhook de Bold firmado con nuestro secreto (diagnóstico/recuperación manual).';

    public function handle(BoldGateway $bold, PaymentService $payments): int
    {
        $reference = (string) $this->argument('reference');
        $payment = Payment::where('method', Payment::METHOD_BOLD)
            ->where('reference', $reference)
            ->first();

        if (! $payment) {
            $this->error("No hay pago Bold con referencia {$reference}.");

            return self::FAILURE;
        }

        $outcome = $this->option('outcome') === 'rejected' ? 'rejected' : 'approved';
        $event = $outcome === 'approved'
            ? (config('services.bold.approved_events')[0] ?? 'SALE_APPROVED')
            : (config('services.bold.rejected_events')[0] ?? 'SALE_REJECTED');

        // Estructura real del webhook de Bold (evento en la raíz, detalle en data).
        $body = [
            'type' => $event,
            'subject' => 'SIM-'.$payment->id,
            'data' => [
                'payment_id' => 'SIM-'.$payment->id,
                'metadata' => ['reference' => $payment->reference],
                'amount' => ['total' => (float) $payment->amount],
            ],
        ];
        $raw = json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        // Firmamos con nuestro secreto y verificamos por el mismo camino del webhook.
        $signature = $bold->sign($raw);
        if ($signature === null) {
            $this->error('No hay secreto de webhook configurado; no se puede firmar.');

            return self::FAILURE;
        }
        if ($bold->verifySignature($raw, $signature) !== true) {
            $this->error('La firma simulada no verifica (revisa la configuración de Bold).');

            return self::FAILURE;
        }
        $this->info('Firma verificada ✔');

        if ($this->option('dry-run')) {
            $this->line($raw);
            $this->warn('[DRY-RUN] No se aplicó nada.');

            return self::SUCCESS;
        }

        if ($payment->isApplied()) {
            $this->warn('El pago ya estaba aplicado. Nada que hacer.');

            return self::SUCCESS;
        }

        $parsed = $bold->parseWebhook($body);

        if ($outcome === 'approved') {
            $payments->approve($payment, null, [
                'payment_id' => $parsed['payment_id'],
                'payload' => $parsed['payload'],
            ]);
            $this->info("Pago {$reference} aplicado (simulado).");
        } else {
            $payments->reject(
                $payment,
                'Rechazo simulado con payments:simulate-bold.',
                null,
                ['payload' => $parsed['payload']],
            );
            $this->info("Pago {$reference} marcado como rechazado (simulado).");
        }

        return self::SUCCESS;
    }
}
