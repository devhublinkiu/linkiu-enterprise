<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Corte 1 del motor de cobro unificado — ver docs/adr/0001-motor-de-cobro-unificado.md
 *
 * Migración estrictamente aditiva: no se borra ni se altera ninguna columna
 * existente. Las filas que ya están en producción se rellenan con valores
 * derivados de lo que ya se sabe de ellas.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            // Qué se está cobrando
            $table->foreignId('plan_id')->nullable()->after('created_by')
                ->constrained('plans')->nullOnDelete();
            $table->string('cycle', 20)->nullable()->after('period');   // monthly|semiannual|annual|signup
            $table->date('due_date')->nullable()->after('amount');

            // Cómo se pagó
            $table->string('payment_method', 30)->nullable()->after('status');   // transferencia|efectivo|consignacion|otro
            $table->string('payment_reference', 100)->nullable()->after('payment_method');
            $table->text('payment_notes')->nullable()->after('payment_reference');
            $table->timestamp('paid_at')->nullable()->after('payment_notes');
            $table->foreignId('paid_by')->nullable()->after('paid_at')
                ->constrained('users')->nullOnDelete();
        });

        // Las facturas que ya existen son todas del ciclo mensual: es el único
        // que se ha emitido hasta hoy.
        DB::table('invoices')->whereNull('cycle')->update(['cycle' => 'monthly']);

        // Las que ya estaban pagadas no tienen fecha de pago registrada.
        // Lo más cercano que sabemos es cuándo se marcaron.
        DB::table('invoices')
            ->where('status', 'pagada')
            ->whereNull('paid_at')
            ->update([
                'paid_at'        => DB::raw('updated_at'),
                'payment_method' => 'otro',
            ]);

        Schema::table('associates', function (Blueprint $table) {
            // Con qué periodicidad factura este asociado. Hasta hoy se asumía
            // mensual en el cron; ahora queda explícito.
            $table->string('billing_cycle', 20)->default('monthly')->after('plan_expires_at');
        });
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropForeign(['plan_id']);
            $table->dropForeign(['paid_by']);
            $table->dropColumn([
                'plan_id',
                'cycle',
                'due_date',
                'payment_method',
                'payment_reference',
                'payment_notes',
                'paid_at',
                'paid_by',
            ]);
        });

        Schema::table('associates', function (Blueprint $table) {
            $table->dropColumn('billing_cycle');
        });
    }
};
