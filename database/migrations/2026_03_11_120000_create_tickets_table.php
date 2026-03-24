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
        Schema::create('tickets', function (Blueprint $blueprint) {
            $blueprint->id();
            $blueprint->string('subject');
            $blueprint->text('message');
            $blueprint->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $blueprint->enum('status', ['open', 'in_progress', 'resolved', 'closed'])->default('open');
            $blueprint->foreignId('user_id')->constrained()->onDelete('cascade');
            $blueprint->timestamp('last_reply_at')->nullable();
            $blueprint->json('attachments')->nullable();
            $blueprint->timestamps();
        });

        Schema::create('ticket_replies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id'); // Quien responde (Superadmin o Cliente)
            $table->text('message');
            $table->boolean('is_admin_reply')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ticket_replies');
        Schema::dropIfExists('tickets');
    }
};
