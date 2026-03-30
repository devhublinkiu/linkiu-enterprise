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
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $perPage = in_array((int) $request->per_page, [10, 25, 50]) ? (int) $request->per_page : 10;

        return inertia('Admin/Services/Index', [
            'services'   => $query->latest()->paginate($perPage)->withQueryString(),
            'categories' => ServiceCategory::all(),
            'filters'    => $request->only(['search', 'category_id', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required_without:new_category_name|nullable|exists:service_categories,id',
            'new_category_name' => 'required_without:category_id|nullable|string|max:255',
            'is_active' => 'boolean'
        ]);

        if ($request->filled('new_category_name')) {
            $category = ServiceCategory::create(['name' => $request->new_category_name]);
            $validated['category_id'] = $category->id;
        }

        Service::create($validated);

        return back()->with('success', 'Servicio creado exitosamente');
    }

    public function update(Request $request, Service $service)
    {
        $service->update($request->all());
        return back();
    }

    public function destroy(Service $service)
    {
        $service->delete();
        return back();
    }
}
