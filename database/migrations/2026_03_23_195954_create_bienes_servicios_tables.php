<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bienes_servicios_empresas', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('slug')->unique();
            $table->string('departamento')->nullable();
            $table->string('ciudad')->nullable();
            $table->string('estado')->default('activo'); // activo, inactivo
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('licitaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->constrained('bienes_servicios_empresas')->onDelete('cascade');
            $table->string('titulo');
            $table->string('slug')->unique();
            $table->string('enlace_externo')->nullable();
            $table->text('extracto')->nullable();
            $table->longText('contenido')->nullable();
            $table->enum('publico_objetivo', ['abierto', 'exclusivo_asociados'])->default('abierto');
            $table->enum('estado', ['borrador', 'publicado', 'cerrado'])->default('publicado');
            $table->dateTime('fecha_publicacion')->nullable();
            $table->dateTime('fecha_cierre')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('licitaciones');
        Schema::dropIfExists('bienes_servicios_empresas');
    }
};
