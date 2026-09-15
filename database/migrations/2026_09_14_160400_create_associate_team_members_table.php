<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Plan 0021 — equipo ("Quiénes somos"). Nombre + cargo + foto; correo y teléfono
 * opcionales.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('associate_team_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('associate_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('position')->nullable();
            $table->string('photo_path')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->unsignedInteger('sort')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('associate_team_members');
    }
};
