<?php

namespace App\Console\Commands;

use App\Models\Invoice;
use App\Models\Payment;
use App\Models\PaymentRequest;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Traslada el histórico de `payment_requests` al modelo nuevo.
 *
 * Ver docs/adr/0001-motor-de-cobro-unificado.md
 *
 * Deliberadamente NO es una migración: toca datos de producción y conviene
 * ejecutarlo a mano, mirando primero el --dry-run. La tabla original no se
 * modifica ni se borra; queda como estaba.
 *
 * Es idempotente: una solicitud ya trasladada se reconoce por la referencia
 * PR-{id} del pago y se omite.
 */
class BackfillPaymentRequests extends Command
{
    protected $signature = 'billing:backfill-payment-requests
                            {--dry-run : Muestra qué se trasladaría sin escribir nada}';

    protected $description = 'Copia el histórico de payment_requests a invoices + payments. No borra nada.';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');

        $requests = PaymentRequest::with(['user', 'plan'])->orderBy('id')->get();

        if ($requests->isEmpty()) {
            $this->info('No hay solicitudes de pago que trasladar.');
            return self::SUCCESS;
        }

        $this->info(($dryRun ? '[DRY-RUN] ' : '') . "Solicitudes encontradas: {$requests->count()}");
        $this->newLine();

        $moved = 0;
        $skipped = 0;
        $rows = [];

        foreach ($requests as $req) {
            $reference = 'PR-' . $req->id;

            if (Payment::where('reference', $reference)->exists()) {
                $skipped++;
                $rows[] = [$req->id, $req->user?->name ?? '—', $req->status, 'ya trasladada'];
                continue;
            }

            $associateId = $req->user?->associate_id;

            if (!$associateId) {
                $skipped++;
                $rows[] = [$req->id, $req->user?->name ?? '—', $req->status, 'sin empresa asociada'];
                continue;
            }

            if ($dryRun) {
                $moved++;
                $rows[] = [$req->id, $req->user?->name ?? '—', $req->status, 'se trasladaría'];
                continue;
            }

            DB::transaction(function () use ($req, $reference, $associateId) {
                $concept = ($req->is_signup ? 'Inscripción' : 'Afiliación')
                    . ' - ' . ($req->plan?->name ?? 'Plan')
                    . ' (histórico #' . $req->id . ')';

                $invoice = Invoice::create([
                    'associate_id'      => $associateId,
                    'created_by'        => null,
                    'plan_id'           => $req->plan_id,
                    'type'              => 'cuenta_cobro',
                    'period'            => $concept,
                    'cycle'             => $req->is_signup ? 'signup' : $req->billing_cycle,
                    'amount'            => $req->amount,
                    'status'            => $req->status === 'approved' ? 'pagada' : 'pendiente',
                    'payment_method'    => $req->status === 'approved' ? Payment::METHOD_TRANSFER : null,
                    'payment_reference' => $reference,
                    'paid_at'           => $req->status === 'approved' ? $req->reviewed_at : null,
                    'paid_by'           => $req->reviewed_by,
                    'notes'             => 'Trasladada desde payment_requests durante la migración del motor de cobro.',
                    'created_at'        => $req->created_at,
                    'updated_at'        => $req->updated_at,
                ]);

                Payment::create([
                    'invoice_id'   => $invoice->id,
                    'associate_id' => $associateId,
                    'method'       => Payment::METHOD_TRANSFER,
                    'status'       => $this->mapStatus($req->status),
                    'amount'       => $req->amount,
                    'reference'    => $reference,
                    'proof_path'   => $req->proof_path,
                    'paid_at'      => $req->status === 'approved' ? $req->reviewed_at : null,
                    // Ya se aplicó en su momento: marcarlo evita que alguien lo
                    // "apruebe" otra vez y vuelva a extender la vigencia.
                    'applied_at'   => $req->status === 'approved' ? $req->reviewed_at : null,
                    'submitted_by' => $req->user_id,
                    'reviewed_by'  => $req->reviewed_by,
                    'reviewed_at'  => $req->reviewed_at,
                    'admin_notes'  => $req->admin_notes,
                    'notes'        => 'Histórico trasladado desde payment_requests #' . $req->id . '.',
                    'created_at'   => $req->created_at,
                    'updated_at'   => $req->updated_at,
                ]);
            });

            $moved++;
            $rows[] = [$req->id, $req->user?->name ?? '—', $req->status, 'trasladada'];
        }

        $this->table(['PR #', 'Usuario', 'Estado', 'Resultado'], $rows);
        $this->newLine();

        if ($dryRun) {
            $this->warn("[DRY-RUN] Se trasladarían {$moved}, se omitirían {$skipped}. No se escribió nada.");
        } else {
            $this->info("Listo. {$moved} trasladada(s), {$skipped} omitida(s). payment_requests queda intacta.");
        }

        return self::SUCCESS;
    }

    private function mapStatus(?string $status): string
    {
        return match ($status) {
            'approved'  => Payment::STATUS_APPROVED,
            'rejected'  => Payment::STATUS_REJECTED,
            'cancelled' => Payment::STATUS_CANCELLED,
            default     => Payment::STATUS_PENDING,
        };
    }
}
