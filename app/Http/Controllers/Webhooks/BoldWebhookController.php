<?php

namespace App\Http\Controllers\Webhooks;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\Bold\BoldGateway;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Recibe los avisos de pago de Bold.
 *
 * Ver docs/adr/0001-motor-de-cobro-unificado.md
 *
 * Tres reglas que hacen esto seguro:
 *
 *   1. Se verifica la firma contra el cuerpo crudo. En producción, un aviso sin
 *      firma válida se descarta.
 *   2. Es idempotente: la aplicación real está guardada por `applied_at` con
 *      bloqueo de fila, así que un aviso repetido no extiende dos veces.
 *   3. Siempre se responde 200 salvo que la firma falle. Si respondiéramos 500
 *      ante un error nuestro, Bold reintentaría en bucle; preferimos registrar
 *      y dejar que el conciliador lo recoja.
 */
class BoldWebhookController extends Controller
{
    public function __construct(
        private BoldGateway $bold,
        private PaymentService $payments,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        $raw = $request->getContent();
        $signature = $request->header($this->bold->signatureHeader());

        $verified = $this->bold->verifySignature($raw, $signature);

        if ($verified === false) {
            // Diagnóstico seguro (sin secreto ni cuerpo): distingue un escáner
            // (sin header) de un esquema o llave equivocados. Ver BoldGateway.
            Log::warning('Webhook de Bold con firma inválida.', array_merge(
                ['ip' => $request->ip()],
                $this->bold->signatureDiagnostics($raw, $signature),
            ));

            return response()->json(['message' => 'firma inválida'], 401);
        }

        if ($verified === null) {
            // No hay secreto configurado. En producción eso es un fallo de
            // configuración, no una invitación a confiar en el aviso.
            if (app()->environment('production')) {
                Log::error('Llegó un webhook de Bold pero no hay secreto configurado para verificarlo.');

                return response()->json(['message' => 'webhook no configurado'], 503);
            }
            Log::info('Webhook de Bold aceptado sin verificar: no hay secreto configurado (entorno no productivo).');
        }

        $body = json_decode($raw, true);
        if (! is_array($body)) {
            Log::warning('Webhook de Bold con cuerpo no interpretable.');

            return response()->json(['message' => 'recibido']);
        }

        $event = $this->bold->parseWebhook($body);

        if (! $event['reference']) {
            Log::warning('Webhook de Bold sin referencia; no se puede asociar a un pago.', [
                'event' => $event['event'],
            ]);

            return response()->json(['message' => 'recibido']);
        }

        $payment = Payment::where('reference', $event['reference'])->first();

        if (! $payment) {
            Log::warning('Webhook de Bold para una referencia desconocida.', [
                'reference' => $event['reference'],
            ]);

            return response()->json(['message' => 'recibido']);
        }

        try {
            // Las anulaciones llegan sobre un pago YA aplicado, así que se
            // manejan antes del guard de idempotencia. No revierten la vigencia
            // automáticamente: un reembolso de suscripción se revisa a mano.
            if ($event['outcome'] === 'void') {
                $this->handleVoid($payment, $event);

                return response()->json(['message' => 'recibido']);
            }

            if ($payment->isApplied()) {
                // Aviso repetido de un pago ya aplicado: idempotencia, todo bien.
                return response()->json(['message' => 'ya aplicado']);
            }

            match ($event['outcome']) {
                'approved' => $this->handleApproved($payment, $event),
                'rejected' => $this->payments->reject(
                    $payment,
                    'Rechazado por la pasarela ('.$event['event'].').',
                    null,
                    ['payload' => $event['payload']]
                ),
                default => Log::info('Webhook de Bold con evento no contemplado.', [
                    'event' => $event['event'],
                    'reference' => $event['reference'],
                ]),
            };
        } catch (\Throwable $e) {
            // No devolvemos 500: el conciliador horario lo recogerá.
            Log::error('Error procesando el webhook de Bold: '.$e->getMessage(), [
                'reference' => $event['reference'],
            ]);
        }

        return response()->json(['message' => 'recibido']);
    }

    /**
     * Anulación o reembolso reportado por Bold.
     *
     * No revertimos la vigencia de forma automática: revertir una suscripción
     * ya activa es una decisión con revisión (ver ADR-0001). Se deja registro y
     * se anota en el propio pago para que el equipo lo vea en la bandeja.
     */
    private function handleVoid(Payment $payment, array $event): void
    {
        // VOID_REJECTED: la anulación falló, la venta sigue vigente. Nada que hacer.
        if ($event['event'] === 'VOID_REJECTED') {
            Log::info('Bold: anulación rechazada; la venta sigue vigente.', [
                'reference' => $event['reference'],
                'payment_id' => $event['payment_id'],
            ]);

            return;
        }

        // VOID_APPROVED: se devolvió el dinero.
        Log::warning('Bold: anulación/reembolso aprobado. La vigencia NO se revirtió automáticamente; requiere revisión.', [
            'reference' => $event['reference'],
            'payment_id' => $event['payment_id'],
        ]);

        $nota = 'Bold reportó '.$event['event'].' el '.now()->format('d/m/Y H:i')
            .'. Se devolvió el dinero; la vigencia NO se revirtió automáticamente. Requiere revisión.';

        $payment->update([
            'gateway_payload' => $event['payload'],
            'admin_notes' => $payment->admin_notes
                ? $payment->admin_notes.' | '.$nota
                : $nota,
        ]);
    }

    /**
     * Antes de dar por bueno un pago, comprobamos que el monto coincida con lo
     * que se cobró. Si no cuadra, se deja pendiente para revisión humana en vez
     * de extender la suscripción por un importe que nadie miró.
     */
    private function handleApproved(Payment $payment, array $event): void
    {
        $expected = (float) $payment->amount;
        $received = $event['amount'];

        if ($received !== null && $expected > 0 && abs($received - $expected) > 0.5) {
            Log::warning('Webhook de Bold con monto distinto al cobrado; queda para revisión.', [
                'reference' => $payment->reference,
                'esperado' => $expected,
                'recibido' => $received,
            ]);

            $payment->update([
                'gateway_payload' => $event['payload'],
                'gateway_payment_id' => $event['payment_id'],
                'admin_notes' => "La pasarela reportó {$received} y se cobraron {$expected}. Requiere revisión.",
            ]);

            return;
        }

        $this->payments->approve($payment, null, [
            'payment_id' => $event['payment_id'],
            'payload' => $event['payload'],
        ]);
    }
}
