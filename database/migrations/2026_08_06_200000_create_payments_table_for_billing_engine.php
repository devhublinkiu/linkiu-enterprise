<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Corte 2 del motor de cobro unificado — ver docs/adr/0001-motor-de-cobro-unificado.md
 *
 * `payments` es la transacción: una fila por cada intento o asiento de pago
 * contra una factura, venga por Bold, por transferencia o en efectivo.
 *
 * Ya existía una tabla `payments` de un diseño anterior a la que nunca se
 * escribió (ninguna referencia en el código). Si trae filas se conserva
 * renombrada antes de crear la nueva; si está vacía se descarta.
 */
return new class extends Migration
{
    private const LEGACY_BACKUP = 'payments_legacy_sin_uso';

    public function up(): void
    {
        if (Schema::hasTable('payments')) {
            $legacyRows = DB::table('payments')->count();

            if ($legacyRows > 0 && !Schema::hasTable(self::LEGACY_BACKUP)) {
                // No perdemos nada aunque no esperemos encontrar filas aquí.
                Schema::rename('payments', self::LEGACY_BACKUP);
            } else {
                Schema::dropIfExists('payments');
            }
        }

        Schema::create('payments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('invoice_id')->constrained('invoices')->cascadeOnDelete();
            // Denormalizado a propósito: casi toda consulta filtra por asociado.
            $table->foreignId('associate_id')->constrained('associates')->cascadeOnDelete();

            $table->string('method', 20);                       // bold|transferencia|efectivo|consignacion|otro
            $table->string('status', 20)->default('pendiente'); // pendiente|aprobado|rechazado|fallido|cancelado

            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('COP');

            // Referencia con la que se reconoce el pago: order id de Bold o el
            // número de recibo cuando lo asienta un administrador. Es la clave
            // de idempotencia del webhook.
            $table->string('reference', 100)->nullable()->unique();
            $table->string('gateway_payment_id', 100)->nullable();
            $table->json('gateway_payload')->nullable();

            $table->string('proof_path')->nullable();           // comprobante de transferencia

            $table->timestamp('paid_at')->nullable();           // fecha real del pago
            $table->timestamp('reviewed_at')->nullable();
            // Marca de idempotencia: cuándo este pago extendió la suscripción.
            $table->timestamp('applied_at')->nullable();

            $table->foreignId('submitted_by')->nullable()->constrained('users')->nullOnDelete();  // asociado
            $table->foreignId('registered_by')->nullable()->constrained('users')->nullOnDelete(); // admin que lo asentó
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();   // admin que lo revisó

            $table->text('notes')->nullable();
            $table->text('admin_notes')->nullable();

            $table->timestamps();

            $table->index(['associate_id', 'status']);
            $table->index(['method', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');

        if (Schema::hasTable(self::LEGACY_BACKUP)) {
            Schema::rename(self::LEGACY_BACKUP, 'payments');
        }
    }
};
