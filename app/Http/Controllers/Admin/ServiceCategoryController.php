<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\ServiceCategory;
use Illuminate\Http\Request;

class ServiceCategoryController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255|unique:service_categories,name',
        ]);

        ServiceCategory::create($data); // slug único vía HasUniqueSlug

        return back()->with('success', 'Categoría creada.');
    }

    public function update(Request $request, ServiceCategory $category)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255|unique:service_categories,name,'.$category->id,
        ]);

        // Slug estable: solo se actualiza el nombre (no se rompen los enlaces públicos).
        $category->update(['name' => $data['name']]);

        return back()->with('success', 'Categoría actualizada.');
    }

    public function destroy(ServiceCategory $category)
    {
        if (Service::where('category_id', $category->id)->exists()) {
            return back()->with('error', 'La categoría tiene servicios; muévelos o elimínalos primero.');
        }

        $category->delete();

        return back()->with('success', 'Categoría eliminada.');
    }

    public function order(Request $request)
    {
        $data = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:service_categories,id',
        ]);

        foreach ($data['ids'] as $position => $id) {
            ServiceCategory::where('id', $id)->update(['order' => $position]);
        }

        return back()->with('success', 'Orden actualizado.');
    }
}
