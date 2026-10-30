<?php

namespace App\Http\Controllers\Associate;

use App\Http\Controllers\Concerns\HandlesMessageAttachments;
use App\Http\Controllers\Controller;
use App\Http\Requests\ReplyMessageRequest;
use App\Http\Requests\StoreConversationRequest;
use App\Models\Conversation;
use App\Models\MessageAttachment;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

/**
 * Bandeja interna del asociado (plan 0026, corte 3). Todo acotado a su empresa por
 * ConversationPolicy; un asociado nunca ve un hilo de otro. Sin tiempo real aún
 * (corte 5) ni contador global (corte 6): aquí solo persiste y gatea.
 */
class ConversationController extends Controller
{
    use AuthorizesRequests, HandlesMessageAttachments;

    public function index(Request $request)
    {
        $user = $request->user();
        $archived = $request->boolean('archived');

        $conversations = Conversation::where('associate_id', $user->associate_id)
            ->with(['messages' => fn ($q) => $q->latest()->limit(1)])
            ->orderByDesc('last_message_at')
            ->get()
            ->filter(fn ($c) => $c->isArchivedFor($user) === $archived)
            ->map(fn ($c) => [
                'id' => $c->id,
                'subject' => $c->subject,
                'status' => $c->status,
                'last' => optional($c->messages->first())->body,
                'last_at' => optional($c->last_message_at)?->toDateTimeString(),
                'unread' => $c->unreadCountFor($user),
            ])->values();

        return Inertia::render('Associate/Mensajes/Index', [
            'conversations' => $conversations,
            'archived' => $archived,
        ]);
    }

    public function show(Conversation $conversation, Request $request)
    {
        $this->authorize('view', $conversation);

        $conversation->markReadBy($request->user());
        $conversation->load(['messages.sender:id,name', 'messages.attachments']);

        return Inertia::render('Associate/Mensajes/Show', [
            'conversation' => [
                'id' => $conversation->id,
                'subject' => $conversation->subject,
                'status' => $conversation->status,
                'archived' => $conversation->isArchivedFor($request->user()),
            ],
            'messages' => $conversation->messages->map(fn ($m) => [
                'id' => $m->id,
                'body' => $m->body,
                'mine' => (int) $m->sender_id === (int) $request->user()->id,
                'sender' => $m->sender?->name,
                'at' => $m->created_at?->toDateTimeString(),
                'attachments' => $m->attachments->map(fn ($a) => [
                    'id' => $a->id,
                    'name' => $a->name,
                    'size' => $a->size,
                    'url' => route('associate.messages.attachment', $a),
                ])->values(),
            ])->values(),
        ]);
    }

    public function store(StoreConversationRequest $request)
    {
        $this->authorize('create', Conversation::class);

        $user = $request->user();
        $data = $request->validated();

        $conversation = Conversation::create([
            'associate_id' => $user->associate_id,
            'subject' => $data['subject'],
            'created_by' => $user->id,
            'last_message_at' => now(),
        ]);

        $message = $conversation->messages()->create([
            'sender_id' => $user->id,
            'body' => $data['body'],
        ]);

        $this->storeAttachments($message, $request->file('attachments') ?? []);
        $conversation->markReadBy($user);

        return redirect()
            ->route('associate.messages.show', $conversation)
            ->with('success', 'Mensaje enviado.');
    }

    public function reply(Conversation $conversation, ReplyMessageRequest $request)
    {
        $this->authorize('reply', $conversation);

        $user = $request->user();

        $message = $conversation->messages()->create([
            'sender_id' => $user->id,
            'body' => $request->validated('body'),
        ]);

        $this->storeAttachments($message, $request->file('attachments') ?? []);
        $conversation->update(['last_message_at' => now()]);
        $conversation->markReadBy($user);

        return back()->with('success', 'Mensaje enviado.');
    }

    public function archive(Conversation $conversation, Request $request)
    {
        $this->authorize('view', $conversation);

        $user = $request->user();
        $archived = ! $conversation->isArchivedFor($user);
        $conversation->setArchivedFor($user, $archived);

        return back()->with('success', $archived ? 'Conversación archivada.' : 'Conversación restaurada.');
    }

    public function downloadAttachment(MessageAttachment $attachment, Request $request)
    {
        $this->authorize('view', $attachment->message->conversation);

        return Storage::disk($attachment->disk)->download($attachment->path, $attachment->name);
    }
}
