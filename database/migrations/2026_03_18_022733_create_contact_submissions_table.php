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
        Schema::create('contact_submissions', function (Blueprint $table) {
            $table->id();
            $table->string('company_name')->nullable();
            $table->string('nit')->nullable();
            $table->string('full_name');
            $table->string('id_number');
            $table->string('email');
            $table->string('phone');
            $table->json('types'); // Petición, Queja, Reclamo, etc.
            $table->string('service');
            $table->text('message');
            $table->string('status')->default('pending'); // pending, reviewing, resolved
            $table->text('admin_notes')->nullable();
            $table->boolean('accepted_terms')->default(false);
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contact_submissions');
    }
};
