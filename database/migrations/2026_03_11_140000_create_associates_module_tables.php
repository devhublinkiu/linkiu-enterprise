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
        Schema::create('associates', function (Blueprint $table) {
            $table->id();
            // Información Básica
            $table->string('company_name');
            $table->string('initials', 20)->nullable();
            $table->string('legal_status')->nullable(); // Ltda, SAS, etc.
            $table->date('constitution_date')->nullable();
            $table->string('country_origin')->nullable();
            $table->string('nit', 30)->unique();
            $table->string('address')->nullable();
            $table->string('department')->nullable(); // Para API Colombia
            $table->string('city')->nullable();
            $table->string('phone')->nullable();
            $table->string('website')->nullable();
            $table->string('rep_name')->nullable();
            $table->string('rep_position')->nullable();
            $table->string('company_classification')->nullable(); // Grande, Mediana, etc.

            // Caracterización
            $table->integer('employees_direct_count')->default(0);
            $table->integer('employees_tech')->default(0);
            $table->integer('employees_prof')->default(0);
            $table->integer('employees_admin')->default(0);
            $table->integer('employees_exec')->default(0);
            $table->integer('employees_other')->default(0);
            $table->string('employees_other_desc')->nullable();
            $table->boolean('hydrocarbons_participation')->default(false);
            $table->string('hydrocarbons_level')->nullable(); // Nacional, etc.
            $table->integer('private_income_pct')->default(0);
            $table->integer('public_income_pct')->default(0);

            // PEP
            $table->boolean('pep_declaration')->default(false);
            $table->string('pep_name')->nullable();
            $table->string('pep_doc_type')->nullable();
            $table->string('pep_entity')->nullable();
            $table->string('other_guilds')->nullable();

            // Declaración
            $table->boolean('funds_origin_declaration')->default(false);

            // Datos de Contacto Extra
            $table->string('main_ciiu')->nullable();
            $table->string('secondary_ciiu')->nullable();
            $table->string('billing_email')->nullable();
            $table->json('company_type')->nullable(); // Suministros, Proveedor, etc.
            $table->string('social_instagram')->nullable();
            $table->string('social_facebook')->nullable();
            $table->string('social_linkedin')->nullable();
            $table->string('social_other')->nullable();

            // Capacitaciones
            $table->boolean('capacitation_plan')->default(false);
            $table->string('capacitation_level')->nullable();
            $table->string('capacitation_no_reason')->nullable();

            // Documentos e Interés
            $table->json('membership_interest')->nullable();
            $table->string('logo_path')->nullable(); // Logo individual
            $table->json('gallery_paths')->nullable(); // Galería (multi-file)
            $table->json('files')->nullable(); // RUT, Cámara Comercio, etc.
            $table->json('audit_log')->nullable(); // Log de aprobación por campo

            // Administrativo
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamps();
        });

        Schema::create('associate_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('associate_id')->constrained()->onDelete('cascade');
            $table->string('area'); // Gerencia, Comercial, etc.
            $table->string('name')->nullable();
            $table->string('position')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->timestamps();
        });

        Schema::create('associate_references', function (Blueprint $table) {
            $table->id();
            $table->foreignId('associate_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['commercial', 'bank']);
            $table->string('name');
            $table->string('contact_person')->nullable();
            $table->string('position')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('associate_id')->nullable()->after('password')->constrained('associates')->onDelete('set null');
            $table->string('role')->default('user')->after('associate_id'); // admin, member_admin, member_staff
            $table->boolean('has_verified_profile')->default(false)->after('role'); // Control de directorio público
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['associate_id']);
            $table->dropColumn(['associate_id', 'role']);
        });
        Schema::dropIfExists('associate_references');
        Schema::dropIfExists('associate_contacts');
        Schema::dropIfExists('associates');
    }
};
