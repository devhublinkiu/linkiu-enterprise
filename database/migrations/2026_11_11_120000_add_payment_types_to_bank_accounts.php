<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Métodos de pago que CAMEP muestra al asociado para pagar: además de la cuenta
 * bancaria, ahora **llave Bre-B** y **QR** (imagen en disco público). Migración
 * aditiva: se agregan columnas y se hacen opcionales los campos de cuenta (Bre-B
 * y QR no los usan).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bank_accounts', function (Blueprint $table) {
            $table->string('type')->default('cuenta')->after('id'); // cuenta | bre_b | qr
            $table->string('payment_key')->nullable()->after('account_number'); // llave Bre-B
            $table->string('qr_path')->nullable()->after('payment_key'); // imagen QR (disco público)
        });

        // Los campos de cuenta dejan de ser obligatorios: Bre-B y QR no los usan.
        Schema::table('bank_accounts', function (Blueprint $table) {
            $table->string('bank_name')->nullable()->change();
            $table->string('account_type')->nullable()->change();
            $table->string('account_number')->nullable()->change();
            $table->string('holder_name')->nullable()->change();
            $table->string('holder_document')->nullable()->change();
            $table->string('holder_document_type')->nullable()->default('NIT')->change();
        });
    }

    public function down(): void
    {
        Schema::table('bank_accounts', function (Blueprint $table) {
            $table->dropColumn(['type', 'payment_key', 'qr_path']);
        });
    }
};
