<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Corte 3 — interruptores de módulo por plan.
 * Ver docs/adr/0002-interruptores-de-modulo-por-plan.md
 *
 * Migración estrictamente aditiva: no toca `plans` ni ninguna columna
 * existente. Las seis banderas booleanas de `plans` se conservan como capa de
 * compatibilidad y las llena el seeder en el pivote.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Catálogo de módulos. Añadir un módulo nuevo es insertar una fila aquí,
        // no una migración sobre `plans`.
        Schema::create('features', function (Blueprint $table) {
            $table->id();
            $table->string('key', 50)->unique();     // 'foros', 'servicios', ...
            $table->string('name');                  // nombre visible
            $table->string('description')->nullable();
            $table->string('type', 10)->default('boolean'); // boolean | limit
            $table->string('group', 40)->nullable();        // agrupación en el panel
            // Interruptor global de plataforma: apagado aquí = el módulo no
            // existe para nadie, sin importar el plan. Permite subir un módulo
            // a producción apagado y encenderlo sin desplegar de nuevo.
            $table->boolean('is_enabled')->default(true);
            $table->integer('sort')->default(0);
            $table->timestamps();
        });

        // Interruptor por plan.
        Schema::create('plan_feature', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plan_id')->constrained()->cascadeOnDelete();
            $table->foreignId('feature_id')->constrained()->cascadeOnDelete();
            $table->boolean('enabled')->default(false);
            // Solo para features de tipo 'limit'. null = sin límite (ilimitado).
            $table->integer('limit_value')->nullable();
            $table->timestamps();

            $table->unique(['plan_id', 'feature_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plan_feature');
        Schema::dropIfExists('features');
    }
};
