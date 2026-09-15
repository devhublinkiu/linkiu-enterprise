<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Plan 0021 — clientes ("Quiénes somos"). Nombre + logo; el logo se muestra a
 * tamaño fijo en el micrositio para conservar la limpieza visual.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('associate_clients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('associate_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('logo_path')->nullable();
            $table->unsignedInteger('sort')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('associate_clients');
    }
};
