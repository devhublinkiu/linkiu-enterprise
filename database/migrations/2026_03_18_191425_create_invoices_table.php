<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('associate_id')->constrained()->onDelete('cascade');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade'); // admin que la subió
            $table->string('type');                          // 'factura' | 'cuenta_cobro'
            $table->string('period');                        // e.g. "Marzo 2026"
            $table->decimal('amount', 12, 2)->nullable();   // valor opcional
            $table->string('document_path')->nullable();     // archivo PDF/imagen
            $table->string('external_link')->nullable();     // URL externo opcional
            $table->text('notes')->nullable();               // observaciones
            $table->string('status')->default('pendiente');  // pendiente | pagada
            $table->timestamp('read_at')->nullable();        // cuándo la vio el asociado
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
