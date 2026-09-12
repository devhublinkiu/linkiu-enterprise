<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Feature;
use App\Models\Plan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class PlanController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Plans/Index', [
            'plans' => Plan::latest()->get()
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
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price_monthly' => 'required|numeric|min:0',
            'price_semiannual' => 'required|numeric|min:0',
            'price_annual' => 'required|numeric|min:0',
            'currency' => 'required|string|max:3',
            'limit_services' => 'required|integer|min:0',
            'limit_gallery' => 'required|integer|min:0',
            'has_priority_directory' => 'required|boolean',
            'can_download_tenders' => 'required|boolean',
            'has_job_board' => 'required|boolean',
            'has_network' => 'required|boolean',
            'has_reviews' => 'required|boolean',
            'has_priority_support' => 'required|boolean',
            'color_hex' => ['required', 'string', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'grace_days' => 'required|integer|min:0',
            'signup_fee' => 'required|numeric|min:0',
            'signup_only_first_period' => 'required|boolean',
            'is_active' => 'required|boolean',
            'is_popular' => 'required|boolean',
        ]);

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
            'plan'         => $plan,
            'features'     => $this->featureCatalog(),
            // Valores actuales del pivote para este plan, por clave de módulo.
            'planFeatures' => $plan->features->mapWithKeys(fn ($f) => [
                $f->key => [
                    'enabled'     => (bool) $f->pivot->enabled,
                    'limit_value' => $f->pivot->limit_value,
                ],
            ]),
        ]);
    }

    public function update(Request $request, Plan $plan)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price_monthly' => 'required|numeric|min:0',
            'price_semiannual' => 'required|numeric|min:0',
            'price_annual' => 'required|numeric|min:0',
            'currency' => 'required|string|max:3',
            'limit_services' => 'required|integer|min:0',
            'limit_gallery' => 'required|integer|min:0',
            'has_priority_directory' => 'required|boolean',
            'can_download_tenders' => 'required|boolean',
            'has_job_board' => 'required|boolean',
            'has_network' => 'required|boolean',
            'has_reviews' => 'required|boolean',
            'has_priority_support' => 'required|boolean',
            'color_hex' => ['required', 'string', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'grace_days' => 'required|integer|min:0',
            'signup_fee' => 'required|numeric|min:0',
            'signup_only_first_period' => 'required|boolean',
            'is_active' => 'required|boolean',
            'is_popular' => 'required|boolean',
        ]);

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
     * @return array<string, array{enabled:bool, limit_value:?int}>
     */
    private function validateFeatures(Request $request): array
    {
        $keys = Feature::pluck('key')->all();

        $validated = $request->validate([
            'features'                 => 'sometimes|array',
            'features.*.enabled'       => 'required|boolean',
            'features.*.limit_value'   => 'nullable|integer|min:0',
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
            if (!$feature) {
                continue;
            }

            $enabled = (bool) ($values['enabled'] ?? false);
            $limit   = $feature->isLimit()
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

        if (!empty($legacyUpdates)) {
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
