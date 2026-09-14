<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Feature;
use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PlanController extends Controller
{
    public function index()
    {
        // El catálogo real de módulos (ADR-0002 + plan 0016). Un módulo con
        // is_enabled=false está "Próximamente": se muestra pero no es accesible.
        $catalog = Feature::orderBy('sort')->get();

        $plans = Plan::with('features')->withCount('associates')->latest()->get()->map(function (Plan $plan) use ($catalog) {
            // Valores del pivote por clave de módulo (mismo patrón que edit()).
            $pivots = $plan->features->mapWithKeys(fn ($f) => [
                $f->key => [
                    'enabled' => (bool) $f->pivot->enabled,
                    'limit_value' => $f->pivot->limit_value,
                ],
            ]);

            // Módulos resueltos por plan: qué incluye cada membresía de verdad.
            $modules = $catalog->map(function (Feature $f) use ($pivots) {
                $pivot = $pivots->get($f->key);

                return [
                    'key' => $f->key,
                    'name' => $f->name,
                    'type' => $f->type,
                    'group' => $f->group,
                    'coming_soon' => ! $f->is_enabled,
                    'enabled' => (bool) ($pivot['enabled'] ?? false),
                    'limit_value' => $pivot['limit_value'] ?? null,
                ];
            })->all();

            return array_merge($plan->toArray(), ['modules' => $modules]);
        });

        return Inertia::render('Admin/Plans/Index', [
            'plans' => $plans,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Plans/Form', [
            'features' => $this->featureCatalog(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validatePlan($request);
        $data['slug'] = Str::slug($data['name']);

        $featureInput = $this->validateFeatures($request);

        $plan = Plan::create($data);
        $this->syncFeatures($plan, $featureInput);

        return redirect()->route('admin.plans.index')->with('success', 'Plan creado exitosamente.');
    }

    public function edit(Plan $plan)
    {
        $plan->load('features');

        return Inertia::render('Admin/Plans/Form', [
            'plan' => $plan,
            'features' => $this->featureCatalog(),
            // Valores actuales del pivote para este plan, por clave de módulo.
            'planFeatures' => $plan->features->mapWithKeys(fn ($f) => [
                $f->key => [
                    'enabled' => (bool) $f->pivot->enabled,
                    'limit_value' => $f->pivot->limit_value,
                ],
            ]),
        ]);
    }

    public function update(Request $request, Plan $plan)
    {
        $data = $this->validatePlan($request);
        $data['slug'] = Str::slug($data['name']);

        $featureInput = $this->validateFeatures($request);

        $plan->update($data);
        $this->syncFeatures($plan, $featureInput);

        return redirect()->route('admin.plans.index')->with('success', 'Plan actualizado exitosamente.');
    }

    // ─── Módulos por plan ─────────────────────────────────────────────────────
    // Ver docs/adr/0002-interruptores-de-modulo-por-plan.md

    private function featureCatalog()
    {
        return Feature::orderBy('sort')->get(['id', 'key', 'name', 'description', 'type', 'group', 'is_enabled']);
    }

    /**
     * Datos base del plan. Los módulos (incluidos los límites de galería y
     * servicios) se editan por el catálogo `features` y `syncFeatures` sincroniza
     * las columnas históricas — por eso ya no se validan aquí. Ver plan 0016.
     *
     * @return array<string, mixed>
     */
    private function validatePlan(Request $request): array
    {
        return $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price_monthly' => 'required|numeric|min:0',
            'price_semiannual' => 'required|numeric|min:0',
            'price_annual' => 'required|numeric|min:0',
            'currency' => 'required|string|max:3',
            'grace_days' => 'required|integer|min:0',
            'signup_fee' => 'required|numeric|min:0',
            'is_active' => 'required|boolean',
            'is_popular' => 'required|boolean',
        ]);
    }

    /**
     * @return array<string, array{enabled:bool, limit_value:?int}>
     */
    private function validateFeatures(Request $request): array
    {
        $keys = Feature::pluck('key')->all();

        $validated = $request->validate([
            'features' => 'sometimes|array',
            'features.*.enabled' => 'required|boolean',
            'features.*.limit_value' => 'nullable|integer|min:0',
        ]);

        $input = $validated['features'] ?? [];

        // Solo aceptamos claves que existen en el catálogo.
        return array_filter(
            $input,
            fn ($key) => in_array($key, $keys, true),
            ARRAY_FILTER_USE_KEY
        );
    }

    /**
     * Persiste el pivote y sincroniza las columnas booleanas/límite históricas,
     * para que el fallback y un eventual rollback sigan siendo coherentes.
     */
    private function syncFeatures(Plan $plan, array $featureInput): void
    {
        if (empty($featureInput)) {
            return;
        }

        $features = Feature::whereIn('key', array_keys($featureInput))->get()->keyBy('key');
        $legacyUpdates = [];

        foreach ($featureInput as $key => $values) {
            $feature = $features->get($key);
            if (! $feature) {
                continue;
            }

            $enabled = (bool) ($values['enabled'] ?? false);
            $limit = $feature->isLimit()
                ? (isset($values['limit_value']) && $values['limit_value'] !== null && $values['limit_value'] !== ''
                    ? (int) $values['limit_value']
                    : null)
                : null;

            $plan->features()->syncWithoutDetaching([
                $feature->id => ['enabled' => $enabled, 'limit_value' => $limit],
            ]);

            // Sincroniza la columna histórica si el módulo tiene una.
            $column = Feature::legacyColumnFor($key);
            if ($column) {
                if ($feature->isLimit()) {
                    // 0 en la columna = ilimitado (convención histórica).
                    $legacyUpdates[$column] = $enabled ? ($limit ?? 0) : 0;
                } else {
                    $legacyUpdates[$column] = $enabled;
                }
            }
        }

        if (! empty($legacyUpdates)) {
            $plan->forceFill($legacyUpdates)->save();
        }
    }

    public function destroy(Plan $plan)
    {
        if ($plan->associates()->count() > 0) {
            return redirect()->back()->with('error', 'No se puede eliminar un plan que tiene socios activos.');
        }

        $plan->delete();

        return redirect()->route('admin.plans.index')->with('success', 'Plan eliminado exitosamente.');
    }
}
