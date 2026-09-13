<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabla de códigos OTP por correo, reutilizable para registro y recuperación
     * de contraseña. Ver ADR-0003. Una fila activa por (email, purpose).
     */
    public function up(): void
    {
        Schema::create('email_otps', function (Blueprint $table) {
            $table->id();
            $table->string('email');
            $table->string('purpose', 32); // registration | password_reset
            $table->string('code_hash');
            $table->timestamp('expires_at');
            $table->unsignedTinyInteger('attempts')->default(0);   // intentos de verificación
            $table->unsignedTinyInteger('resends')->default(0);    // envíos en la ventana actual
            $table->timestamp('locked_until')->nullable();         // cooldown tras alcanzar el tope
            $table->timestamp('verified_at')->nullable();          // prueba para el paso final
            $table->timestamps();

            $table->unique(['email', 'purpose']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_otps');
    }
};
