<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Plan 0021 — certificaciones ("Quiénes somos"). Máx. 5 por asociado (se valida
 * en el controlador). Imagen/logo + nombre + año.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('associate_certifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('associate_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->unsignedSmallInteger('year')->nullable();
            $table->string('image_path')->nullable();
            $table->unsignedInteger('sort')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('associate_certifications');
    }
};
