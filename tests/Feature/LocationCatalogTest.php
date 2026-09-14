<?php

use App\Models\City;
use App\Models\Department;
use App\Models\User;
use Database\Seeders\DivipolaSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('siembra los 33 departamentos y >1000 municipios del DANE', function () {
    $this->seed(DivipolaSeeder::class);

    expect(Department::count())->toBe(33);
    expect(City::count())->toBeGreaterThan(1000);

    $antioquia = Department::where('name', 'Antioquia')->first();
    expect($antioquia)->not->toBeNull();
    expect($antioquia->cities()->where('name', 'Medellín')->exists())->toBeTrue();
});

it('el seeder es idempotente', function () {
    $this->seed(DivipolaSeeder::class);
    $depts = Department::count();
    $cities = City::count();

    $this->seed(DivipolaSeeder::class);

    expect(Department::count())->toBe($depts);
    expect(City::count())->toBe($cities);
});

it('el endpoint de departamentos requiere auth', function () {
    $this->getJson(route('locations.departments'))->assertUnauthorized();
});

it('un usuario autenticado obtiene departamentos y sus ciudades', function () {
    $this->seed(DivipolaSeeder::class);
    $user = User::factory()->create();

    $this->actingAs($user)
        ->getJson(route('locations.departments'))
        ->assertOk()
        ->assertJsonFragment(['name' => 'Antioquia']);

    $antioquia = Department::where('name', 'Antioquia')->first();

    $this->actingAs($user)
        ->getJson(route('locations.cities', $antioquia))
        ->assertOk()
        ->assertJsonFragment(['name' => 'Medellín']);
});
