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
        Schema::create('blog_categories', function (Blueprint $col) {
            $col->id();
            $col->string('name');
            $col->string('slug')->unique();
            $col->timestamps();
        });

        Schema::create('blog_posts', function (Blueprint $col) {
            $col->id();
            $col->foreignId('user_id')->constrained()->onDelete('cascade');
            $col->foreignId('category_id')->nullable()->constrained('blog_categories')->onDelete('set null');
            
            // Content
            $col->string('title');
            $col->string('slug')->unique();
            $col->text('excerpt')->nullable();
            $col->longText('content')->nullable();
            
            // Status & Features
            $col->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $col->boolean('is_featured')->default(false);
            
            // SEO
            $col->string('meta_title')->nullable();
            $col->text('meta_description')->nullable();
            
            // Stats
            $col->unsignedBigInteger('visits_count')->default(0);
            
            // Dates
            $col->timestamp('published_at')->nullable();
            $col->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blog_posts');
        Schema::dropIfExists('blog_categories');
    }
};
