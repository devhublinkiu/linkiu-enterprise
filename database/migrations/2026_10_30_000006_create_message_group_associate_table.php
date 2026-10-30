<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('message_group_associate', function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_group_id')->constrained('message_groups')->cascadeOnDelete();
            $table->foreignId('associate_id')->constrained('associates')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['message_group_id', 'associate_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('message_group_associate');
    }
};
