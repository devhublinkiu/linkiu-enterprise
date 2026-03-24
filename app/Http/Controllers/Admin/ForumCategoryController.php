<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ForumCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ForumCategoryController extends Controller
{
    public function index()
    {
        $categories = ForumCategory::orderBy('order')->get();
        return Inertia::render('Admin/Forums/Categories/Index', [
            'categories' => $categories
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'is_private' => 'boolean',
            'order' => 'integer',
        ]);

        ForumCategory::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'description' => $request->description,
            'icon' => $request->icon ?: 'MessageCircle',
            'is_private' => $request->is_private,
            'order' => $request->order,
        ]);

        return back()->with('success', 'Categoría creada correctamente');
    }

    public function update(Request $request, ForumCategory $category)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'is_private' => 'boolean',
            'order' => 'integer',
        ]);

        $category->update([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'description' => $request->description,
            'icon' => $request->icon ?: 'MessageCircle',
            'is_private' => $request->is_private,
            'order' => $request->order,
        ]);

        return back()->with('success', 'Categoría actualizada');
    }

    public function destroy(ForumCategory $category)
    {
        $category->delete();
        return back()->with('success', 'Categoría eliminada');
    }
}
