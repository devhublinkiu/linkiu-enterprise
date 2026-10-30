<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Bandera de "requiere revisión" en pagos: la enciende el webhook de Bold cuando
 * reporta una anulación/reembolso o un monto distinto al cobrado. Antes eso solo
 * quedaba en el log + admin_notes y podía pasar inadvertido. Migración aditiva.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->boolean('needs_review')->default(false)->after('status')->index();
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex(['needs_review']);
            $table->dropColumn('needs_review');
        });
    }
};
