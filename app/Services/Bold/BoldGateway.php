<?php

namespace App\Services\Bold;

use App\Models\BoldSetting;
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
    /** Configuración editable desde admin (fila única), cargada una vez por petición. */
    private ?BoldSetting $settings = null;

    private bool $settingsLoaded = false;

    private function settings(): ?BoldSetting
    {
        if (! $this->settingsLoaded) {
            $this->settings = BoldSetting::current();
            $this->settingsLoaded = true;
        }

        return $this->settings;
    }

    /**
     * Llaves del ENTORNO ACTIVO resueltas: primero la configuración de admin
     * (columna `{entorno}_{campo}` en BD), luego config/.env como respaldo
     * (compatibilidad con instalaciones configuradas por entorno).
     */
    private function apiKey(): ?string
    {
        return $this->envKey('api_key');
    }

    private function secretKey(): ?string
    {
        return $this->envKey('secret_key');
    }

    private function envKey(string $field): ?string
    {
        $s = $this->settings();

        if ($s) {
            $v = $s->{$this->environment().'_'.$field};  // test_api_key / production_secret_key

            return ($v !== null && $v !== '') ? $v : null;
        }

        // Sin fila en BD: config/.env (una sola pareja de llaves).
        return config('services.bold.'.$field) ?: null;
    }

    /**
     * ¿El admin dejó el pago en línea encendido? Sin fila de settings estamos en
     * "modo entorno": se considera activo y manda la presencia de llaves.
     */
    public function isActive(): bool
    {
        $s = $this->settings();

        return $s ? (bool) $s->is_active : true;
    }

    /**
     * Entorno de Bold en uso: 'test' (sandbox) o 'production'. Sin fila en BD se
     * asume el de config/.env (o 'test' por defecto).
     */
    public function environment(): string
    {
        return $this->settings()?->environment
            ?: (string) config('services.bold.environment', 'test');
    }

    /**
     * Sin credenciales (o apagado por el admin), el riel de pago en línea queda
     * apagado y la plataforma sigue cobrando por transferencia y efectivo.
     */
    public function isEnabled(): bool
    {
        return $this->isActive()
            && ! empty($this->apiKey())
            && ! empty($this->secretKey());
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
        $amount = (string) (int) round((float) $payment->amount);
        $currency = $payment->currency ?: config('services.bold.currency', 'COP');

        return [
            'apiKey' => (string) $this->apiKey(),
            'orderId' => $reference,
            'amount' => $amount,
            'currency' => $currency,
            'integritySignature' => $this->integritySignature($reference, $amount, $currency),
            'redirectionUrl' => $redirectUrl,
            'description' => 'CAMEP · '.($payment->invoice?->period ?? 'Cuenta de cobro'),
        ];
    }

    public function integritySignature(string $reference, string $amount, string $currency): string
    {
        return hash('sha256', $reference.$amount.$currency.(string) $this->secretKey());
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
     * Metadatos SEGUROS para diagnosticar por qué falló una firma, sin exponer
     * el secreto ni el cuerpo. Sirve para distinguir un escáner (sin header) de
     * un esquema equivocado (formato distinto) o una llave equivocada.
     *
     * @return array{secret_configured:bool,signature_present:bool,received_len:int,received_format:string,received_sample:?string,expected_len:int,expected_sample:?string,matches:bool}
     */
    public function signatureDiagnostics(string $rawBody, ?string $signature): array
    {
        $secret = $this->webhookSecret();
        $received = $signature !== null ? strtolower(trim($signature)) : null;
        $expected = $secret !== null
            ? hash_hmac('sha256', base64_encode($rawBody), $secret)
            : null;

        return [
            'secret_configured' => $secret !== null,
            'signature_present' => $received !== null && $received !== '',
            'received_len' => $received !== null ? strlen($received) : 0,
            'received_format' => $this->signatureFormat($received),
            // Una muestra de un hash no revela el secreto.
            'received_sample' => $received !== null ? substr($received, 0, 10) : null,
            'expected_len' => $expected !== null ? strlen($expected) : 0,
            'expected_sample' => $expected !== null ? substr($expected, 0, 10) : null,
            'matches' => $expected !== null && $received !== null && $received !== ''
                ? hash_equals($expected, $received)
                : false,
        ];
    }

    private function signatureFormat(?string $value): string
    {
        if ($value === null || $value === '') {
            return 'ausente';
        }
        if (preg_match('/^[0-9a-f]+$/', $value)) {
            return 'hex';
        }
        if (preg_match('#^[A-Za-z0-9+/]+={0,2}$#', $value)) {
            return 'base64';
        }

        return 'otro';
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
        // Configuración de admin (BD): webhook_secret y, si está vacío, la secret
        // key del entorno activo.
        $s = $this->settings();
        if ($s) {
            if ($s->webhook_secret !== null && $s->webhook_secret !== '') {
                return (string) $s->webhook_secret;
            }
            $sec = $this->secretKey();
            if ($sec !== null && $sec !== '') {
                return (string) $sec;
            }

            return null;
        }

        // Respaldo a config/.env, conservando la distinción null vs "" del sandbox.
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
        $void = array_map('strtoupper', (array) config('services.bold.void_events', []));

        $outcome = match (true) {
            in_array($type, $approved, true) => 'approved',
            in_array($type, $rejected, true) => 'rejected',
            in_array($type, $void, true) => 'void',
            default => 'unknown',
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
            'reference' => $reference ? (string) $reference : null,
            'outcome' => $outcome,
            'event' => $type,
            'payment_id' => $paymentId ? (string) $paymentId : null,
            'amount' => is_numeric($amount) ? (float) $amount : null,
            'payload' => $body,
        ];
    }
}
