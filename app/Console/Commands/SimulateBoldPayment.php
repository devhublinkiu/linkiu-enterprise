<?php

namespace App\Console\Commands;

use App\Models\Payment;
use App\Services\Bold\BoldGateway;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

/**
 * Simula un webhook de Bold para un pago concreto: arma el aviso con la estructura
 * real de Bold, lo firma con NUESTRO propio secreto y lo **envía por HTTP al propio
 * endpoint** `/webhooks/bold`. Al ir por HTTP corre en el mismo contexto que un
 * aviso real de Bold (bajo Octane/Swoole, dentro de la corrutina de la petición),
 * así que `defer()` y todo el pipeline funcionan igual que en producción.
 *
 * Sirve para dos cosas:
 *   1. Validar de punta a punta (firma + aplicación) sin depender de que Bold
 *      entregue el aviso.
 *   2. Recuperar a mano un pago que quedó "procesando" porque el webhook se perdió.
 *
 * OJO: aplicar un pago extiende la vigencia. Úsalo sólo cuando sepas que el pago
 * fue realmente aprobado en Bold. Ver docs/adr/0001-motor-de-cobro-unificado.md
 */
class SimulateBoldPayment extends Command
{
    protected $signature = 'payments:simulate-bold
                            {reference : Referencia del pago (Payment->reference)}
                            {--outcome=approved : approved|rejected}
                            {--url= : URL del webhook (por defecto, la del propio sitio)}
                            {--dry-run : Verifica la firma y muestra el payload, sin enviarlo}';

    protected $description = 'Simula un webhook de Bold firmado con nuestro secreto (diagnóstico/recuperación manual).';

    public function handle(BoldGateway $bold): int
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

        // Firmamos con nuestro secreto (mismo esquema que verifica el webhook).
        $signature = $bold->sign($raw);
        if ($signature === null) {
            $this->error('No hay secreto de webhook configurado; no se puede firmar.');

            return self::FAILURE;
        }
        $this->info('Firma calculada ✔');

        if ($this->option('dry-run')) {
            $this->line($raw);
            $this->warn('[DRY-RUN] No se envió nada.');

            return self::SUCCESS;
        }

        // Enviamos el aviso firmado al propio endpoint (contexto HTTP/Octane).
        $url = (string) ($this->option('url') ?: url('/webhooks/bold'));
        $response = Http::withHeaders([
            $bold->signatureHeader() => $signature,
            'Accept' => 'application/json',
        ])->withBody($raw, 'application/json')->post($url);

        $this->line("POST {$url} → HTTP {$response->status()}: ".$response->body());

        if ($response->successful()) {
            $this->info('Webhook procesado. Verifica el estado del pago.');

            return self::SUCCESS;
        }

        $this->error('El endpoint respondió con error (revisa la firma/config o la URL).');

        return self::FAILURE;
    }
}
