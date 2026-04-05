<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Alter status ENUM to include 'draft'
        DB::statement("ALTER TABLE `associates` MODIFY COLUMN `status` ENUM('draft','pending','approved','rejected','verified','active') NOT NULL DEFAULT 'draft'");
    }

    public function down(): void
    {
        // Remove 'draft' — change any existing drafts to 'pending' first to avoid data loss
        DB::statement("UPDATE `associates` SET `status` = 'pending' WHERE `status` = 'draft'");
        DB::statement("ALTER TABLE `associates` MODIFY COLUMN `status` ENUM('pending','approved','rejected','verified','active') NOT NULL DEFAULT 'pending'");
    }
};
