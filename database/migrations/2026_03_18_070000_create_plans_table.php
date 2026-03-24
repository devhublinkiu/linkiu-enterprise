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
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            
            // Precios
            $table->decimal('price_monthly', 12, 2)->default(0);
            $table->decimal('price_semiannual', 12, 2)->default(0);
            $table->decimal('price_annual', 12, 2)->default(0);
            $table->string('currency', 3)->default('COP');
            
            // Límites actuales
            $table->integer('limit_services')->default(0); // 0 = Sin límite o según lógica
            $table->integer('limit_gallery')->default(1);
            $table->boolean('has_priority_directory')->default(false);
            $table->boolean('can_download_tenders')->default(false);
            
            // Roadmap futuro
            $table->boolean('has_job_board')->default(false);
            $table->boolean('has_network')->default(false);
            $table->boolean('has_reviews')->default(false);
            $table->boolean('has_priority_support')->default(false);
            
            // Estética y Prórroga
            $table->string('color_hex', 7)->default('#64748b'); // Slate-500
            $table->integer('grace_days')->default(0);
            
            $table->boolean('is_active')->default(true);
            $table->boolean('is_popular')->default(false);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
