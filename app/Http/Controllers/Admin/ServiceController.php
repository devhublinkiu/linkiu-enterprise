<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\ServiceCategory;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index()
    {
        return inertia('Admin/Services/Index', [
            'services' => Service::with('category')->withCount('associates')->get(),
            'categories' => ServiceCategory::all()
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
