<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bank_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('bank_name');           // Bancolombia, Davivienda, etc.
            $table->string('account_type');         // ahorros, corriente
            $table->string('account_number');
            $table->string('holder_name');          // Titular de la cuenta
            $table->string('holder_document');      // NIT o CC del titular
            $table->string('holder_document_type')->default('NIT'); // NIT, CC
            $table->string('color_hex', 7)->default('#64748b');     // Color badge
            $table->boolean('is_active')->default(true);
            $table->integer('order')->default(0);   // Para ordenar las tarjetas
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bank_accounts');
    }
};
