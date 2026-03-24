<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class CreateAdmin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'create:admin {name} {email} {password}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a new admin user for the platform';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $name = $this->argument('name');
        $email = $this->argument('email');
        $password = $this->argument('password');

        if (User::where('email', $email)->exists()) {
            $this->error("Error: El usuario con el correo {$email} ya existe.");
            return 1;
        }

        try {
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make($password),
                'is_superadmin' => true, // Establecer como superadmin para acceso total
                'role' => 'admin',      // Rol descriptivo
            ]);

            $this->info("¡Éxito! El administrador {$name} ({$email}) ha sido creado correctamente.");
            return 0;
        } catch (\Exception $e) {
            $this->error("Error al crear el administrador: " . $e->getMessage());
            return 1;
        }
    }
}
