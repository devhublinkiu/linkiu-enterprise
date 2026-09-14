<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\ServiceCategory;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index(Request $request)
    {
        $query = Service::with('category')->withCount('associates');

        if ($request->filled('search')) {
            $query->where('name', 'like', '%'.$request->search.'%');
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $perPage = in_array((int) $request->per_page, [10, 25, 50]) ? (int) $request->per_page : 10;

        // Conteo de servicios por categoría (para el panel de categorías, sin withCount
        // para no depender de la relación en el análisis estático).
        $counts = Service::query()
            ->selectRaw('category_id, COUNT(*) as total')
            ->groupBy('category_id')
            ->pluck('total', 'category_id');

        return inertia('Admin/Services/Index', [
            'services' => $query->latest()->paginate($perPage)->withQueryString(),
            'categories' => ServiceCategory::orderBy('order')->orderBy('name')->get(),
            'categoryServiceCounts' => $counts,
            'filters' => $request->only(['search', 'category_id', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required_without:new_category_name|nullable|exists:service_categories,id',
            'new_category_name' => 'required_without:category_id|nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        if ($request->filled('new_category_name')) {
            $category = ServiceCategory::create(['name' => $request->new_category_name]);
            $validated['category_id'] = $category->id;
        }

        // El slug se genera único en el modelo (HasUniqueSlug).
        Service::create($validated);

        return back()->with('success', 'Servicio creado.');
    }

    public function update(Request $request, Service $service)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:service_categories,id',
            'is_active' => 'boolean',
        ]);

        // El slug es estable (no se regenera al renombrar): preserva los enlaces públicos.
        $service->update($validated);

        return back()->with('success', 'Servicio actualizado.');
    }

    public function destroy(Service $service)
    {
        // No se puede eliminar un servicio que usan empresas asociadas: hay que desactivarlo
        // primero (interruptor "Activo"). El borrado en duro rompería el pivot. Ver plan 0015.
        if ($service->associates()->exists()) {
            return back()->with('error', 'No puedes eliminar este servicio: lo usan empresas asociadas. Desactívalo en su lugar.');
        }

        $service->delete();

        return back()->with('success', 'Servicio eliminado.');
    }
}
