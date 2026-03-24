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
        Schema::create('camep_announcements', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->longText('content');
            $table->text('excerpt')->nullable();
            
            // Visibility: public or members_only
            $table->enum('visibility', ['public', 'members_only'])->default('public');
            
            // Publishing Status
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->timestamp('published_at')->nullable();
            
            // Optional closing/expiration date (e.g., for tenders)
            $table->timestamp('expires_at')->nullable();
            
            $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
            
            // Legacy cover url just in case, though we use MediaLibrary
            $table->string('cover_url')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('camep_announcements');
    }
};
