<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use App\Models\BlogCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class PublicBlogController extends Controller
{
    public function index(Request $request)
    {
        $query = BlogPost::published()
            ->with(['author', 'category', 'tags']);

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('excerpt', 'like', '%' . $request->search . '%');
        }

        $posts = $query->latest('published_at')->paginate(12)->through(function ($post) {
            $disk = config('filesystems.default');
            $coverUrl = null;
            
            // Try spatie media library first
            $coverUrl = $post->getFirstMediaUrl('cover', 'card') ?: $post->getFirstMediaUrl('cover');
            
            if (!$coverUrl && $post->cover_url) {
                // Fallback for older implementations if they exist
                 $coverUrl = Storage::disk($disk)->url($post->cover_url);
            }

            return [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'excerpt' => $post->excerpt,
                'cover_url' => $coverUrl,
                'category' => $post->category ? [
                    'id' => $post->category->id,
                    'name' => $post->category->name,
                    'slug' => $post->category->slug,
                ] : null,
                'published_at' => $post->published_at->format('d/m/Y'),
                'author' => [
                    'id' => $post->author->id ?? null,
                    'name' => $post->author->name ?? 'Admin',
                ],
                'visits_count' => $post->visits_count,
            ];
        });

        $categories = BlogCategory::withCount(['posts' => function($q) {
            $q->published();
        }])->having('posts_count', '>', 0)->get();

        return Inertia::render('Public/Blog/Index', [
            'posts' => $posts,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category_id']),
        ]);
    }

    public function show($slug)
    {
        $post = BlogPost::published()
            ->with(['author', 'category', 'tags'])
            ->where('slug', $slug)
            ->firstOrFail();

        // Increment visit counter
        $post->increment('visits_count');

        $coverUrl = $post->getFirstMediaUrl('cover') ?: ($post->cover_url ? Storage::disk(config('filesystems.default'))->url($post->cover_url) : null);

        // Get related posts (same category, excluding current)
        $relatedPosts = collect();
        if ($post->category_id) {
            $relatedPosts = BlogPost::published()
                ->where('category_id', $post->category_id)
                ->where('id', '!=', $post->id)
                ->latest('published_at')
                ->take(3)
                ->get()
                ->map(function ($related) {
                    return [
                        'id' => $related->id,
                        'title' => $related->title,
                        'slug' => $related->slug,
                        'cover_url' => $related->getFirstMediaUrl('cover', 'card') ?: $related->getFirstMediaUrl('cover'),
                        'published_at' => $related->published_at->format('d/m/Y'),
                    ];
                });
        }

        return Inertia::render('Public/Blog/Show', [
            'post' => [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'content' => $post->content,
                'excerpt' => $post->excerpt,
                'cover_url' => $coverUrl,
                'category' => $post->category ? [
                    'id' => $post->category->id,
                    'name' => $post->category->name,
                    'slug' => $post->category->slug,
                ] : null,
                'tags' => $post->tags->map(fn($t) => ['id' => $t->id, 'name' => $t->name]),
                'published_at' => $post->published_at->format('d/m/Y'),
                'author' => [
                    'id' => $post->author->id ?? null,
                    'name' => $post->author->name ?? 'Admin',
                ],
                'meta_title' => $post->meta_title,
                'meta_description' => $post->meta_description,
            ],
            'relatedPosts' => $relatedPosts
        ]);
    }
}
