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
        Schema::table('associates', function (Blueprint $table) {
            $table->text('other_guilds')->nullable()->change();
            $table->text('capacitation_no_reason')->nullable()->change();
            $table->text('employees_other_desc')->nullable()->change();
            $table->text('pep_name')->nullable()->change();
            $table->text('pep_entity')->nullable()->change();
            $table->text('hydrocarbons_level')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('associates', function (Blueprint $table) {
            $table->string('other_guilds')->nullable()->change();
            $table->string('capacitation_no_reason')->nullable()->change();
            $table->string('employees_other_desc')->nullable()->change();
            $table->string('pep_name')->nullable()->change();
            $table->string('pep_entity')->nullable()->change();
            $table->string('hydrocarbons_level')->nullable()->change();
        });
    }
};
