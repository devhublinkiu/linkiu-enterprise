<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class AnnouncementController extends Controller
{
    public function index()
    {
        $announcements = Announcement::with('author')
            ->latest('created_at')
            ->paginate(10)
            ->through(fn ($announcement) => [
                'id' => $announcement->id,
                'title' => $announcement->title,
                'slug' => $announcement->slug,
                'status' => $announcement->status,
                'visibility' => $announcement->visibility,
                'published_at' => $announcement->published_at ? $announcement->published_at->format('Y-m-d H:i') : null,
                'expires_at' => $announcement->expires_at ? $announcement->expires_at->format('Y-m-d H:i') : null,
                'author' => $announcement->author ? $announcement->author->name : 'N/A',
                'cover_url' => $announcement->getFirstMediaUrl('cover', 'thumb') ?: null,
            ]);

        return Inertia::render('Admin/Announcements/Index', [
            'announcements' => $announcements,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Announcements/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'excerpt' => 'nullable|string|max:500',
            'status' => 'required|in:draft,published,archived',
            'visibility' => 'required|in:public,members_only',
            'published_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after_or_equal:published_at',
            'cover' => 'nullable|image|max:2048', // Max 2MB for cover
            'documents.*' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx|max:10240', // Max 10MB per doc
        ]);

        $announcement = Announcement::create([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'excerpt' => $validated['excerpt'],
            'status' => $validated['status'],
            'visibility' => $validated['visibility'],
            'published_at' => $validated['published_at'] ?? ($validated['status'] === 'published' ? now() : null),
            'expires_at' => $validated['expires_at'] ?? null,
            'author_id' => auth()->id(),
        ]);

        if ($request->hasFile('cover')) {
            $announcement->addMediaFromRequest('cover')->toMediaCollection('cover');
        }

        if ($request->hasFile('documents')) {
            foreach ($request->file('documents') as $file) {
                $announcement->addMedia($file)->toMediaCollection('documents');
            }
        }

        return redirect()->route('admin.announcements.index')->with('success', 'Anuncio o licitación creada exitosamente.');
    }

    public function edit(Announcement $announcement)
    {
        $documents = $announcement->getMedia('documents')->map(function ($media) {
            return [
                'id' => $media->id,
                'name' => $media->name,
                'file_name' => $media->file_name,
                'size' => $media->human_readable_size,
                'url' => $media->getUrl(),
            ];
        });

        return Inertia::render('Admin/Announcements/Edit', [
            'announcement' => [
                'id' => $announcement->id,
                'title' => $announcement->title,
                'slug' => $announcement->slug,
                'content' => $announcement->content,
                'excerpt' => $announcement->excerpt,
                'status' => $announcement->status,
                'visibility' => $announcement->visibility,
                'published_at' => $announcement->published_at ? $announcement->published_at->format('Y-m-d\TH:i') : null,
                'expires_at' => $announcement->expires_at ? $announcement->expires_at->format('Y-m-d\TH:i') : null,
                'cover_url' => $announcement->getFirstMediaUrl('cover') ?: null,
            ],
            'documents' => $documents,
        ]);
    }

    public function update(Request $request, Announcement $announcement)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'excerpt' => 'nullable|string|max:500',
            'status' => 'required|in:draft,published,archived',
            'visibility' => 'required|in:public,members_only',
            'published_at' => 'nullable|date',
            'expires_at' => 'nullable|date',
            'cover' => 'nullable|image|max:2048',
            'documents.*' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx|max:10240',
        ]);

        $announcement->update([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'excerpt' => $validated['excerpt'],
            'status' => $validated['status'],
            'visibility' => $validated['visibility'],
            'published_at' => $validated['published_at'],
            'expires_at' => $validated['expires_at'],
        ]);

        if ($request->hasFile('cover')) {
            $announcement->clearMediaCollection('cover');
            $announcement->addMediaFromRequest('cover')->toMediaCollection('cover');
        }

        if ($request->hasFile('documents')) {
            foreach ($request->file('documents') as $file) {
                $announcement->addMedia($file)->toMediaCollection('documents');
            }
        }

        return redirect()->route('admin.announcements.index')->with('success', 'Anuncio o licitación actualizada exitosamente.');
    }

    public function destroy(Announcement $announcement)
    {
        $announcement->delete();
        return redirect()->route('admin.announcements.index')->with('success', 'Anuncio eliminado.');
    }

    public function destroyDocument(Announcement $announcement, $mediaId)
    {
        $media = $announcement->getMedia('documents')->where('id', $mediaId)->first();
        if ($media) {
            $media->delete();
            return response()->json(['success' => true]);
        }
        return response()->json(['error' => 'Document not found'], 404);
    }
}
