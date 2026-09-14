<?php

namespace Database\Seeders;

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

        // Catálogo de ubicaciones DANE (DIVIPOLA). Idempotente. Ver ADR-0005 / plan 0007.
        $this->call(DivipolaSeeder::class);
    }
}
