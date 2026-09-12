<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Catálogo de módulos + siembra del pivote preservando el acceso actual.
        // Idempotente: seguro de correr en producción. Ver ADR-0002.
        $this->call(FeatureSeeder::class);
    }
}
