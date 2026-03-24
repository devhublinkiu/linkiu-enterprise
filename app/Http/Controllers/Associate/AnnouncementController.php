<?php

namespace App\Http\Controllers\Associate;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnnouncementController extends Controller
{
    public function index()
    {
        $announcements = Announcement::with('author')
            ->published()
            ->latest('published_at')
            ->paginate(12)
            ->through(fn ($announcement) => [
                'id' => $announcement->id,
                'title' => $announcement->title,
                'slug' => $announcement->slug,
                'excerpt' => $announcement->excerpt,
                'visibility' => $announcement->visibility,
                'published_at' => $announcement->published_at ? $announcement->published_at->format('d M, Y') : null,
                'expires_at' => $announcement->expires_at ? $announcement->expires_at->format('d M, Y') : null,
                'cover_url' => $announcement->getFirstMediaUrl('cover', 'thumb') ?: null,
                'documents_count' => $announcement->getMedia('documents')->count(),
            ]);

        return Inertia::render('Associate/Announcements/Index', [
            'announcements' => $announcements,
        ]);
    }

    public function show($slug)
    {
        $announcement = Announcement::where('slug', $slug)
            ->published()
            ->firstOrFail();

        $user = auth()->user();
        $associate = \App\Models\Associate::find($user->associate_id);
        $canDownload = $associate?->plan?->can_download_tenders ?? false;

        $documents = $announcement->getMedia('documents')->map(function ($media) use ($canDownload) {
            return [
                'id' => $media->id,
                'name' => $media->name,
                'file_name' => $media->file_name,
                'size' => $media->human_readable_size,
                'url' => $canDownload ? $media->getUrl() : null,
                'ext' => $media->extension,
                'is_locked' => !$canDownload,
            ];
        });

        return Inertia::render('Associate/Announcements/Show', [
            'announcement' => [
                'id' => $announcement->id,
                'title' => $announcement->title,
                'content' => $announcement->content,
                'excerpt' => $announcement->excerpt,
                'visibility' => $announcement->visibility,
                'published_at' => $announcement->published_at ? $announcement->published_at->format('d M, Y') : null,
                'expires_at' => $announcement->expires_at ? $announcement->expires_at->format('d M, Y') : null,
                'cover_url' => $announcement->getFirstMediaUrl('cover') ?: null,
                'author' => $announcement->author ? $announcement->author->name : 'CAMEP',
            ],
            'documents' => $documents,
            'can_download' => $canDownload,
        ]);
    }
}
