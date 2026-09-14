<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Plan 0019 — credenciales de Bold editables desde admin (Integraciones > Bold).
 *
 * Fila única. Se guardan las llaves de AMBOS entornos (pruebas y producción)
 * por separado, cifradas (cast `encrypted` en el modelo), y `environment` marca
 * cuál está en uso. `BoldGateway` resuelve desde aquí con fallback a config/.env.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bold_settings', function (Blueprint $table) {
            $table->id();
            // Texto: el valor cifrado ocupa bastante más que la llave en claro.
            $table->text('test_api_key')->nullable();
            $table->text('test_secret_key')->nullable();
            $table->text('production_api_key')->nullable();
            $table->text('production_secret_key')->nullable();
            // Secreto del webhook (compartido). Si Bold no entrega uno aparte, se
            // usa la secret key del entorno activo.
            $table->text('webhook_secret')->nullable();
            // Entorno en uso: 'test' (sandbox) o 'production'.
            $table->string('environment', 20)->default('test');
            // Interruptor: apaga el pago en línea sin borrar las llaves.
            $table->boolean('is_active')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bold_settings');
    }
};
