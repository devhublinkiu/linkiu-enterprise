<?php

namespace App\Services\Bold;

use App\Models\Payment;
use Illuminate\Support\Arr;

/**
 * Todo el contrato con Bold vive aquí.
 *
 * Nada del resto de la aplicación sabe cómo se firma un checkout ni cómo viene
 * un webhook: si Bold cambia nombres de eventos o el formato de la firma, se
 * ajusta este archivo y config/services.php, y nada más.
 *
 * Ver docs/adr/0001-motor-de-cobro-unificado.md
 */
class BoldGateway
{
    /**
     * Sin credenciales, el riel de pago en línea queda apagado y la plataforma
     * sigue cobrando por transferencia y efectivo.
     */
    public function isEnabled(): bool
    {
        return !empty(config('services.bold.api_key'))
            && !empty(config('services.bold.secret_key'));
    }

    public function scriptUrl(): string
    {
        return (string) config('services.bold.script_url');
    }

    /**
     * Atributos del botón de pago para un intento concreto.
     *
     * La firma de integridad es SHA-256 de la concatenación
     * {referencia}{monto}{moneda}{llave secreta}, que es lo que impide que
     * alguien altere el monto desde el navegador.
     */
    public function checkoutAttributes(Payment $payment, string $redirectUrl): array
    {
        $reference = $payment->reference;
        // Bold espera el monto en unidades enteras de la moneda.
        $amount    = (string) (int) round((float) $payment->amount);
        $currency  = $payment->currency ?: config('services.bold.currency', 'COP');

        return [
            'apiKey'             => (string) config('services.bold.api_key'),
            'orderId'            => $reference,
            'amount'             => $amount,
            'currency'           => $currency,
            'integritySignature' => $this->integritySignature($reference, $amount, $currency),
            'redirectionUrl'     => $redirectUrl,
            'description'        => 'CAMEP · ' . ($payment->invoice?->period ?? 'Cuenta de cobro'),
        ];
    }

    public function integritySignature(string $reference, string $amount, string $currency): string
    {
        return hash('sha256', $reference . $amount . $currency . config('services.bold.secret_key'));
    }

    // ─── Webhook ──────────────────────────────────────────────────────────────

    public function signatureHeader(): string
    {
        return (string) config('services.bold.signature_header', 'x-bold-signature');
    }

    /**
     * Comprueba la firma del webhook.
     *
     * Contrato confirmado con Bold (ver docs/bold-integracion.md §2.4):
     *   1. Se toma el cuerpo CRUDO de la petición.
     *   2. Se codifica en Base64.
     *   3. HMAC-SHA256 de ese Base64, con la llave secreta.
     *   4. Salida en hexadecimal.
     *   5. Se compara con el header x-bold-signature.
     *
     * Devuelve:
     *   true  → la firma coincide.
     *   false → la firma no coincide (o no vino firma).
     *   null  → no hay secreto configurado: no hay con qué verificar. El
     *           controlador decide según el entorno.
     */
    public function verifySignature(string $rawBody, ?string $signature): ?bool
    {
        $secret = $this->webhookSecret();

        // Distinguimos "no configurado" (null) de "cadena vacía". En el sandbox
        // de Bold la llave de firma ES la cadena vacía "", y con ella hay que
        // verificar igual — no saltarse el chequeo.
        if ($secret === null) {
            return null;
        }

        if ($signature === null || $signature === '') {
            return false;
        }

        $expected = hash_hmac('sha256', base64_encode($rawBody), $secret);

        // hash_hmac devuelve hex en minúsculas; normalizamos el header recibido.
        return hash_equals($expected, strtolower(trim($signature)));
    }

    /**
     * Llave con la que Bold firma los webhooks.
     *
     * Se prefiere BOLD_WEBHOOK_SECRET; si no está definida (null) se cae a la
     * llave secreta. Una cadena vacía "" es un valor VÁLIDO y explícito (el
     * secreto del sandbox), no un "sin configurar", por eso se compara con null
     * y no con empty().
     */
    private function webhookSecret(): ?string
    {
        $webhookSecret = config('services.bold.webhook_secret');

        if ($webhookSecret !== null) {
            return (string) $webhookSecret;
        }

        $secretKey = config('services.bold.secret_key');

        return $secretKey === null ? null : (string) $secretKey;
    }

    /**
     * Normaliza el aviso de Bold a lo único que nos importa.
     *
     * @return array{reference:?string,outcome:string,payment_id:?string,amount:?float,payload:array}
     */
    public function parseWebhook(array $body): array
    {
        $type = strtoupper((string) Arr::get($body, 'type', Arr::get($body, 'event', '')));

        $approved = array_map('strtoupper', (array) config('services.bold.approved_events', []));
        $rejected = array_map('strtoupper', (array) config('services.bold.rejected_events', []));
        $void     = array_map('strtoupper', (array) config('services.bold.void_events', []));

        $outcome = match (true) {
            in_array($type, $approved, true) => 'approved',
            in_array($type, $rejected, true) => 'rejected',
            in_array($type, $void, true)     => 'void',
            default                          => 'unknown',
        };

        // Estructura real del webhook (docs/bold-integracion.md §2.3): el evento
        // en la raíz y el detalle bajo `data`. Se deja un fallback a la raíz por
        // si Bold varía la envoltura; ojo: el `id` de la raíz es el de la
        // notificación, no el del pago (ese es `data.payment_id` / `subject`).
        $reference = Arr::get($body, 'data.metadata.reference')
            ?? Arr::get($body, 'metadata.reference');

        $paymentId = Arr::get($body, 'data.payment_id')
            ?? Arr::get($body, 'subject');

        $amount = Arr::get($body, 'data.amount.total')
            ?? Arr::get($body, 'amount.total');

        return [
            'reference'  => $reference ? (string) $reference : null,
            'outcome'    => $outcome,
            'event'      => $type,
            'payment_id' => $paymentId ? (string) $paymentId : null,
            'amount'     => is_numeric($amount) ? (float) $amount : null,
            'payload'    => $body,
        ];
    }
}
