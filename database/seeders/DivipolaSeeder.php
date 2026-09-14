<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\Department;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

// Catálogo oficial de departamentos y municipios (DANE / DIVIPOLA).
// Fuente empaquetada: database/data/divipola.json (dataset gdxc-w37w de datos.gov.co).
// Idempotente: seguro de correr varias veces. Ver plan 0007 (corte 7-B) y ADR-0005.
class DivipolaSeeder extends Seeder
{
    public function run(): void
    {
        $path = database_path('data/divipola.json');

        if (! File::exists($path)) {
            $this->command->error("No se encontró {$path}. Descarga el DIVIPOLA del DANE.");

            return;
        }

        /** @var array<int,array<string,string>> $rows */
        $rows = json_decode(File::get($path), true) ?? [];

        DB::transaction(function () use ($rows) {
            // Departamentos: distintos por código.
            $departments = [];
            foreach ($rows as $row) {
                $departments[$row['cod_dpto']] = $row['dpto'];
            }
            foreach ($departments as $code => $name) {
                Department::updateOrCreate(
                    ['code' => $code],
                    ['name' => $this->pretty($name)],
                );
            }

            $idByCode = Department::pluck('id', 'code');

            // Municipios.
            foreach ($rows as $row) {
                City::updateOrCreate(
                    ['code' => $row['cod_mpio']],
                    [
                        'department_id' => $idByCode[$row['cod_dpto']],
                        'name' => $this->pretty($row['nom_mpio']),
                    ],
                );
            }
        });

        $this->command->info(
            'DIVIPOLA sembrado: '.Department::count().' departamentos, '.City::count().' municipios.',
        );
    }

    /**
     * Normaliza el nombre en MAYÚSCULAS del DANE a Título con conectores en minúscula
     * (uso habitual en Colombia): "SAN PEDRO DE LOS MILAGROS" → "San Pedro de los Milagros".
     */
    private function pretty(string $raw): string
    {
        $title = mb_convert_case(mb_strtolower(trim($raw), 'UTF-8'), MB_CASE_TITLE, 'UTF-8');

        $connectors = ['De', 'Del', 'La', 'Las', 'Los', 'Y', 'E'];
        $words = explode(' ', $title);
        foreach ($words as $i => $word) {
            if ($i > 0 && in_array($word, $connectors, true)) {
                $words[$i] = mb_strtolower($word, 'UTF-8');
            }
        }

        return str_replace('D.c.', 'D.C.', implode(' ', $words));
    }
}
