<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Payment;
use App\Models\PaymentRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

/**
 * Entrega de documentos de facturación tras comprobar quién pide.
 *
 * Los comprobantes de transferencia y las facturas se guardaban en el disco
 * `public`, es decir, accesibles por URL directa para cualquiera que la
 * tuviera. Se sirven ahora desde aquí, con el mismo patrón que ya usaba
 * AssociateController::showDocument().
 *
 * Ver docs/adr/0001-motor-de-cobro-unificado.md
 */
class BillingDocumentController extends Controller
{
    /** Disco donde se guardan los archivos nuevos. */
    public const DISK = 'local';

    /**
     * Comprobante de pago subido por el asociado. Lo ven el dueño y los admin.
     */
    public function proof(Request $request, PaymentRequest $paymentRequest): Response
    {
        $user = $request->user();

        $isOwner = $user->id === $paymentRequest->user_id;

        if (!$isOwner && !$user->isAdmin()) {
            abort(403);
        }

        return $this->serve($paymentRequest->proof_path, 'comprobante-' . $paymentRequest->id);
    }

    /**
     * Comprobante adjunto a un pago del motor nuevo. Lo ven el asociado dueño
     * y los admin.
     */
    public function paymentProof(Request $request, Payment $payment): Response
    {
        $user = $request->user();

        $isOwner = $user->associate_id && $user->associate_id === $payment->associate_id;

        if (!$isOwner && !$user->isAdmin()) {
            abort(403);
        }

        return $this->serve($payment->proof_path, 'comprobante-pago-' . $payment->id);
    }

    /**
     * Documento adjunto a una factura. Lo ven el asociado dueño y los admin.
     */
    public function invoice(Request $request, Invoice $invoice): Response
    {
        $user = $request->user();

        $isOwner = $user->associate_id && $user->associate_id === $invoice->associate_id;

        if (!$isOwner && !$user->isAdmin()) {
            abort(403);
        }

        return $this->serve($invoice->document_path, 'factura-' . $invoice->id);
    }

    /**
     * Busca el archivo primero en el disco privado y, si no está, en el
     * público — ahí siguen los que se subieron antes de este cambio. Así no
     * hace falta mover nada en producción para que todo siga abriendo.
     */
    private function serve(?string $path, string $downloadName): Response
    {
        if (!$path) {
            abort(404);
        }

        foreach ([self::DISK, config('filesystems.default'), 'public'] as $diskName) {
            if (!$diskName) {
                continue;
            }

            $disk = Storage::disk($diskName);

            if (!$disk->exists($path)) {
                continue;
            }

            if (in_array($diskName, ['s3', 'minio'], true)) {
                return redirect()->away($disk->temporaryUrl($path, now()->addMinutes(10)));
            }

            return $disk->response($path, $downloadName . '.' . pathinfo($path, PATHINFO_EXTENSION));
        }

        abort(404);
    }
}
