<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicAnnouncementController extends Controller
{
    public function index()
    {
        $announcements = Announcement::with('author')
            ->published()
            ->where('visibility', 'public')
            ->latest('published_at')
            ->paginate(12)
            ->through(fn ($announcement) => [
                'id' => $announcement->id,
                'title' => $announcement->title,
                'slug' => $announcement->slug,
                'excerpt' => $announcement->excerpt,
                'published_at' => $announcement->published_at ? $announcement->published_at->format('d M, Y') : null,
                'cover_url' => $announcement->getFirstMediaUrl('cover', 'thumb') ?: null,
            ]);

        return Inertia::render('Public/Announcements/Index', [
            'announcements' => $announcements,
        ]);
    }

    public function show($slug)
    {
        $announcement = Announcement::where('slug', $slug)
            ->published()
            ->firstOrFail();

        // If it's members_only and user is not logged in, we should redirect or show a partial view
        if ($announcement->visibility === 'members_only' && !auth()->check()) {
            return Inertia::render('Public/Announcements/Restricted', [
                'title' => $announcement->title,
                'excerpt' => $announcement->excerpt,
                'cover_url' => $announcement->getFirstMediaUrl('cover') ?: null,
            ]);
        }

        $documents = $announcement->getMedia('documents')->map(function ($media) {
            return [
                'id' => $media->id,
                'name' => $media->name,
                'file_name' => $media->file_name,
                'size' => $media->human_readable_size,
                'url' => $media->getUrl(),
                'ext' => $media->extension,
            ];
        });

        return Inertia::render('Public/Announcements/Show', [
            'announcement' => [
                'id' => $announcement->id,
                'title' => $announcement->title,
                'content' => $announcement->content,
                'excerpt' => $announcement->excerpt,
                'visibility' => $announcement->visibility,
                'published_at' => $announcement->published_at ? $announcement->published_at->format('d M, Y') : null,
                'cover_url' => $announcement->getFirstMediaUrl('cover') ?: null,
                'author' => $announcement->author ? $announcement->author->name : 'CAMEP',
            ],
            'documents' => $documents,
        ]);
    }
}
