<?php

namespace App\Http\Controllers\Associate;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Associate;
use Inertia\Inertia;

class AnnouncementController extends Controller
{
    public function index()
    {
        $announcements = Announcement::with('author')
            ->published()
            ->notExpired()
            ->latest('published_at')
            ->paginate(12)
            ->through(fn ($announcement) => [
                'id' => $announcement->id,
                'title' => $announcement->title,
                'slug' => $announcement->slug,
                'excerpt' => $announcement->excerpt,
                'visibility' => $announcement->visibility,
                'published_at' => $announcement->published_at ? $announcement->published_at->translatedFormat('d M Y') : null,
                'expires_at' => $announcement->expires_at ? $announcement->expires_at->translatedFormat('d M Y') : null,
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
            ->notExpired()
            ->firstOrFail();

        $user = auth()->user();
        $associate = Associate::find($user->associate_id);
        // La descarga de documentos es la capacidad del feature de catálogo (que se
        // sembró de la antigua columna can_download_tenders): respeta el valor por
        // plan y el interruptor global del módulo. Ver ADR-0002.
        $canDownload = $associate?->plan?->allows('bienes_servicios') ?? false;

        $documents = $announcement->getMedia('documents')->map(function ($media) use ($canDownload) {
            return [
                'id' => $media->id,
                'name' => $media->name,
                'file_name' => $media->file_name,
                'size' => $media->human_readable_size,
                'url' => $canDownload ? $media->getUrl() : null,
                'ext' => $media->extension,
                'is_locked' => ! $canDownload,
            ];
        });

        return Inertia::render('Associate/Announcements/Show', [
            'announcement' => [
                'id' => $announcement->id,
                'title' => $announcement->title,
                'content' => $announcement->content,
                'excerpt' => $announcement->excerpt,
                'visibility' => $announcement->visibility,
                'published_at' => $announcement->published_at ? $announcement->published_at->translatedFormat('d M Y') : null,
                'expires_at' => $announcement->expires_at ? $announcement->expires_at->translatedFormat('d M Y') : null,
                'cover_url' => $announcement->getFirstMediaUrl('cover') ?: null,
                'author' => $announcement->author ? $announcement->author->name : 'CAMEP',
            ],
            'documents' => $documents,
            'can_download' => $canDownload,
        ]);
    }
}
