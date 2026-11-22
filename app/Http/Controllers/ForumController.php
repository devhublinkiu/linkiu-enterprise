<?php

namespace App\Http\Controllers;

use App\Mail\ForumReportAlert;
use App\Mail\NewForumReply;
use App\Mail\NewForumTopicAlert;
use App\Models\ForumCategory;
use App\Models\ForumReaction;
use App\Models\ForumReply;
use App\Models\ForumReport;
use App\Models\ForumTopic;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ForumController extends Controller
{
    public function index()
    {
        $categories = ForumCategory::withCount(['topics', 'replies'])->orderBy('order')->get();

        $stats = [
            'total_topics' => ForumTopic::count(),
            'total_replies' => ForumReply::count(),
        ];

        return Inertia::render('Forums/Index', [
            'categories' => $categories,
            'stats' => $stats,
        ]);
    }

    public function showCategory($slug)
    {
        $category = ForumCategory::where('slug', $slug)->firstOrFail();

        // If private, check auth
        if ($category->is_private && ! Auth::check()) {
            return redirect()->route('login')->with('error', 'Este círculo es privado. Inicia sesión para entrar.');
        }

        $topics = ForumTopic::where('category_id', $category->id)
            ->with(['user.associate'])
            ->withCount('replies')
            ->orderBy('is_pinned', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('Forums/CategoryShow', [
            'category' => $category,
            'topics' => $topics,
        ]);
    }

    public function showTopic($categorySlug, $topicSlug)
    {
        $category = ForumCategory::where('slug', $categorySlug)->firstOrFail();

        // Use withTrashed() to catch deleted topics and redirect gracefully
        $topic = ForumTopic::withTrashed()
            ->where('slug', $topicSlug)
            ->where('category_id', $category->id)
            ->with([
                'user.associate',
                'replies' => function ($query) {
                    $query->withCount('reactions')
                        ->withExists(['reactions as is_liked' => function ($q) {
                            $q->where('user_id', Auth::id());
                        }])
                        ->with(['user.associate']);
                },
            ])
            ->withCount('reactions')
            ->withExists(['reactions as is_liked' => function ($q) {
                $q->where('user_id', Auth::id());
            }])
            ->first();

        if (! $topic) {
            return redirect()->route('forums.index')
                ->with('error', 'El debate que buscas no existe.');
        }

        if ($topic->trashed()) {
            return redirect()->route('forums.category', $category->slug)
                ->with('info', 'Este debate ha sido eliminado por un moderador o por su autor.');
        }

        // If private, check auth
        if ($category->is_private && ! Auth::check()) {
            return redirect()->route('login')->with('error', 'Este debate es privado.');
        }

        // Increment Views
        $topic->increment('views_count');

        return Inertia::render('Forums/TopicShow', [
            'category' => $category,
            'topic' => $topic,
        ]);
    }

    public function storeTopic(Request $request, ForumCategory $category)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $topic = ForumTopic::create([
            'category_id' => $category->id,
            'user_id' => Auth::id(),
            'title' => $request->title,
            'slug' => Str::slug($request->title).'-'.uniqid(),
            'content' => $request->content,
        ]);

        try {
            Mail::to(config('mail.admin_recipient', env('ADMIN_EMAIL')))
                ->send(new NewForumTopicAlert($topic));
        } catch (\Exception $e) {
            Log::error('Error enviando alerta de nuevo tema: '.$e->getMessage());
        }

        return redirect()->route('forums.topic', [$category->slug, $topic->slug])
            ->with('success', 'Debate iniciado correctamente');
    }

    public function storeReply(Request $request, ForumTopic $topic)
    {
        if ($topic->is_locked) {
            return back()->with('error', 'Este debate está cerrado.');
        }

        $request->validate([
            'content' => 'required|string',
        ]);

        $reply = ForumReply::create([
            'topic_id' => $topic->id,
            'user_id' => Auth::id(),
            'content' => $request->content,
        ]);

        // Notificar al autor del tema si no es el mismo que responde
        if ($topic->user_id !== Auth::id()) {
            try {
                Mail::to($topic->user->email)
                    ->send(new NewForumReply($reply));
            } catch (\Exception $e) {
                Log::error('Error enviando notificación de foro: '.$e->getMessage());
            }
        }

        return back()->with('success', 'Respuesta enviada');
    }

    public function react(Request $request, string $reactable, $type, $id)
    {
        $user = Auth::user();

        // El id de un tema y el de una respuesta pueden coincidir: el tipo de
        // objeto viene explícito en la ruta, no se adivina por id.
        $reactableType = $reactable === 'reply' ? ForumReply::class : ForumTopic::class;
        $reactable = $reactableType::find($id);

        if (! $reactable) {
            return back()->with('error', 'Contenido no encontrado');
        }

        $existing = ForumReaction::where('user_id', $user->id)
            ->where('reactable_id', $reactable->id)
            ->where('reactable_type', $reactableType)
            ->where('type', $type)
            ->first();

        if ($existing) {
            $existing->delete();
        } else {
            ForumReaction::create([
                'user_id' => $user->id,
                'reactable_id' => $reactable->id,
                'reactable_type' => $reactableType,
                'type' => $type,
            ]);
        }

        return back();
    }

    public function report(Request $request, $type, $id)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $user = Auth::user();

        $data = [
            'user_id' => $user->id,
            'reason' => $request->reason,
            'status' => 'pending',
        ];

        if ($type === 'topic') {
            $data['topic_id'] = $id;
        } else {
            $data['reply_id'] = $id;
        }

        $report = ForumReport::create($data);

        // Notificar al administrador
        try {
            Mail::to(config('mail.admin_recipient', env('ADMIN_EMAIL')))
                ->send(new ForumReportAlert($report));
        } catch (\Exception $e) {
            Log::error('Error enviando alerta de reporte a admin: '.$e->getMessage());
        }

        return back()->with('success', 'Reporte enviado correctamente. El equipo de administración lo revisará.');
    }
}
