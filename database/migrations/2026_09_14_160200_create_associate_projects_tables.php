<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Plan 0021 — pestaña "Proyectos" del micrositio.
 *
 * Cada proyecto: título + descripción + cliente (opcional) + una galería de
 * imágenes en tabla hija (`associate_project_images`), para poder ordenar y
 * borrar imágenes individualmente.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('associate_projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('associate_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('client')->nullable();
            $table->unsignedInteger('sort')->default(0);
            $table->timestamps();
        });

        Schema::create('associate_project_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('associate_project_id')->constrained()->cascadeOnDelete();
            $table->string('path');
            $table->unsignedInteger('sort')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('associate_project_images');
        Schema::dropIfExists('associate_projects');
    }
};
