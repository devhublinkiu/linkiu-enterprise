<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use App\Models\BlogCategory;
use App\Models\BlogTag;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class BlogController extends Controller
{
    public function index()
    {
        $posts = BlogPost::with(['author', 'category', 'tags'])
            ->latest()
            ->paginate(10);

        $categories = BlogCategory::withCount('posts')->get();

        return Inertia::render('Admin/Blog/Index', [
            'posts' => $posts,
            'categories' => $categories
        ]);
    }

    public function create()
    {
        $categories = BlogCategory::all();
        $tags = BlogTag::all();

        return Inertia::render('Admin/Blog/Create', [
            'categories' => $categories,
            'tags' => $tags
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'nullable|exists:blog_categories,id',
            'excerpt' => 'nullable|string',
            'content' => 'required|string',
            'status' => 'required|in:draft,published,archived',
            'is_featured' => 'boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'published_at' => 'nullable|date',
            'cover' => 'nullable|image|max:10240',
            'tags' => 'nullable|array',
        ]);

        $post = BlogPost::create(array_merge($validated, [
            'user_id' => auth()->id(),
            'published_at' => $validated['status'] === 'published' ? ($validated['published_at'] ?? now()) : $validated['published_at'],
        ]));

        if ($request->hasFile('cover')) {
            $post->addMediaFromRequest('cover')->toMediaCollection('cover');
        }

        if ($request->has('tags')) {
            $post->tags()->sync($request->tags);
        }

        return redirect()->route('admin.blog.index')->with('success', 'Entrada de blog creada correctamente.');
    }

    public function edit(BlogPost $blog)
    {
        $blog->load(['category', 'tags']);
        $blog->cover_url = $blog->getFirstMediaUrl('cover');
        $categories = BlogCategory::all();
        $tags = BlogTag::all();

        return Inertia::render('Admin/Blog/Edit', [
            'post' => $blog,
            'categories' => $categories,
            'tags' => $tags
        ]);
    }

    public function update(Request $request, BlogPost $blog)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'nullable|exists:blog_categories,id',
            'excerpt' => 'nullable|string',
            'content' => 'required|string',
            'status' => 'required|in:draft,published,archived',
            'is_featured' => 'boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'published_at' => 'nullable|date',
            'cover' => 'nullable|image|max:10240',
            'tags' => 'nullable|array',
        ]);

        $blog->update(array_merge($validated, [
            'published_at' => $validated['status'] === 'published' && !$blog->published_at ? now() : $validated['published_at'],
        ]));

        if ($request->hasFile('cover')) {
            $blog->clearMediaCollection('cover');
            $blog->addMediaFromRequest('cover')->toMediaCollection('cover');
        }

        if ($request->has('tags')) {
            $blog->tags()->sync($request->tags);
        }

        return redirect()->route('admin.blog.index')->with('success', 'Entrada de blog actualizada correctamente.');
    }

    public function destroy(BlogPost $blog)
    {
        $blog->delete();
        return redirect()->route('admin.blog.index')->with('success', 'Entrada de blog eliminada.');
    }

    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:10240', // 10MB
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('blog/content', 'public');
            return response()->json([
                'url' => asset('storage/' . $path)
            ]);
        }

        return response()->json(['error' => 'No image uploaded'], 400);
    }

    // Taxonomy Management
    public function storeCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:blog_categories,name',
        ]);

        $category = BlogCategory::create($validated);

        if ($request->wantsJson()) {
            return response()->json($category);
        }

        return back()->with('success', 'Categoría creada.');
    }

    public function destroyCategory(BlogCategory $category)
    {
        $category->delete();
        
        if (request()->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return back()->with('success', 'Categoría eliminada.');
    }

    public function storeTag(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:blog_tags,name',
        ]);

        $tag = BlogTag::create($validated);

        return response()->json($tag);
    }
}
