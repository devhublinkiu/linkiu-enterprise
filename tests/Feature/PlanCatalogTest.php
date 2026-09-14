<?php

use App\Models\Feature;
use App\Models\Plan;
use App\Models\User;
use Database\Seeders\FeatureSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

/**
 * Catálogo de módulos reconciliado (plan 0016): módulos reales + Próximamente,
 * sin `directorio_prioritario`, con `licitaciones` renombrado a `bienes_servicios`.
 */
function catalogAdmin(): User
{
    return User::factory()->create(['is_superadmin' => true]);
}

it('el catálogo refleja los módulos reales tras sembrar', function () {
    Plan::create(['name' => 'Plan', 'slug' => 'plan-'.uniqid()]);
    $this->seed(FeatureSeeder::class);

    expect(Feature::where('key', 'directorio_prioritario')->exists())->toBeFalse();
    expect(Feature::where('key', 'licitaciones')->exists())->toBeFalse();
    expect(Feature::where('key', 'bienes_servicios')->exists())->toBeTrue();

    // Próximamente = apagados globalmente.
    expect(Feature::where('key', 'ranking')->value('is_enabled'))->toBeFalsy();
    expect(Feature::where('key', 'bolsa_empleo')->value('is_enabled'))->toBeFalsy();
    expect(Feature::where('key', 'resenas')->value('is_enabled'))->toBeFalsy();
    expect(Feature::where('key', 'soporte_prioritario')->value('is_enabled'))->toBeFalsy();

    // Activos.
    expect(Feature::where('key', 'anuncios')->value('is_enabled'))->toBeTruthy();
    expect(Feature::where('key', 'galeria')->value('is_enabled'))->toBeTruthy();
});

it('la lista admin de planes expone los módulos del catálogo, no las banderas muertas', function () {
    Plan::create(['name' => 'Plan Base', 'slug' => 'plan-base-'.uniqid()]);
    $this->seed(FeatureSeeder::class);

    $this->actingAs(catalogAdmin())
        ->get(route('admin.plans.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Plans/Index')
            ->has('plans.0.modules')
            ->where('plans.0.modules', function ($modules) {
                $keys = collect($modules)->pluck('key');
                $ranking = collect($modules)->firstWhere('key', 'ranking');

                return $keys->contains('bienes_servicios')
                    && $keys->contains('anuncios')
                    && $keys->contains('ranking')
                    && ! $keys->contains('directorio_prioritario')
                    && $ranking['coming_soon'] === true;
            })
        );
});
