<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Catálogo propio de ubicaciones (DANE / DIVIPOLA). Reemplaza la dependencia en runtime
// de api-colombia.com. Se llena con DivipolaSeeder desde database/data/divipola.json.
// Ver plan 0007 (corte 7-B) y ADR-0005.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->string('code', 5)->unique(); // DANE cod_dpto, ej. "05"
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('cities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('department_id')->constrained()->cascadeOnDelete();
            $table->string('code', 10)->unique(); // DANE cod_mpio, ej. "05001"
            $table->string('name');
            $table->timestamps();

            $table->index(['department_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cities');
        Schema::dropIfExists('departments');
    }
};
