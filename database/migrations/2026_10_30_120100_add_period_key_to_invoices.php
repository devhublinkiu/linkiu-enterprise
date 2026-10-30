<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Clave de periodo (YYYY-MM) para deduplicar la cuenta de cobro mensual sin
 * depender de la etiqueta (que incluye el prefijo del ciclo). Antes, si el
 * asociado cambiaba de ciclo dentro del mes, la etiqueta cambiaba y se podía
 * emitir una segunda factura del mismo periodo. Migración aditiva.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->string('period_key', 7)->nullable()->after('period')->index();
        });
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropIndex(['period_key']);
            $table->dropColumn('period_key');
        });
    }
};
