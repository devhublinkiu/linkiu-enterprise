<?php

namespace App\Http\Controllers\Admin;

use App\Events\MessageSent;
use App\Http\Controllers\Concerns\HandlesMessageAttachments;
use App\Http\Controllers\Controller;
use App\Http\Requests\AdminSendMessageRequest;
use App\Http\Requests\BroadcastMessageRequest;
use App\Http\Requests\ReplyMessageRequest;
use App\Jobs\SendGroupMessage;
use App\Models\Associate;
use App\Models\Conversation;
use App\Models\MessageAttachment;
use App\Models\MessageGroup;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

/**
 * Bandeja interna del admin (plan 0026, corte 4): ve todas las conversaciones,
 * escribe a un asociado específico y hace fan-out a un grupo (en cola). El envío a
 * grupo crea un hilo privado por asociado — nunca compartido.
 */
class ConversationController extends Controller
{
    use AuthorizesRequests, HandlesMessageAttachments;

    public function index(Request $request)
    {
        $user = $request->user();
        $archived = $request->boolean('archived');

        $conversations = Conversation::with([
            'associate:id,company_name',
            'messages' => fn ($q) => $q->latest()->limit(1),
        ])
            ->orderByDesc('last_message_at')
            ->get()
            ->filter(fn ($c) => $c->isArchivedFor($user) === $archived)
            ->map(fn ($c) => [
                'id' => $c->id,
                'subject' => $c->subject,
                'status' => $c->status,
                'associate' => $c->associate?->company_name,
                'last' => optional($c->messages->first())->body,
                'last_at' => optional($c->last_message_at)?->toIso8601String(),
                'unread' => $c->unreadCountFor($user),
            ])->values();

        return Inertia::render('Admin/Mensajes/Index', [
            'conversations' => $conversations,
            'archived' => $archived,
            // Destinatarios para el compositor (ADR-0012: el admin inicia a un asociado
            // o a un grupo). Los endpoints store/broadcast ya validan contra estos.
            'associates' => Associate::orderBy('company_name')->get(['id', 'company_name'])
                ->map(fn ($a) => ['id' => $a->id, 'name' => $a->company_name]),
            'groups' => MessageGroup::withCount('associates')->orderBy('name')->get()
                ->map(fn ($g) => ['id' => $g->id, 'name' => $g->name, 'count' => $g->associates_count]),
        ]);
    }

    public function show(Conversation $conversation, Request $request)
    {
        $this->authorize('view', $conversation);

        $conversation->markReadBy($request->user());
        $conversation->load(['associate:id,company_name', 'messages.sender:id,name', 'messages.attachments']);

        return Inertia::render('Admin/Mensajes/Show', [
            'conversation' => [
                'id' => $conversation->id,
                'subject' => $conversation->subject,
                'status' => $conversation->status,
                'associate' => $conversation->associate?->company_name,
                'associate_id' => $conversation->associate_id,
                'archived' => $conversation->isArchivedFor($request->user()),
            ],
            'messages' => $conversation->messages->map(fn ($m) => [
                'id' => $m->id,
                'body' => $m->body,
                'mine' => (int) $m->sender_id === (int) $request->user()->id,
                'sender' => $m->sender?->name,
                'at' => $m->created_at?->toIso8601String(),
                'attachments' => $m->attachments->map(fn ($a) => [
                    'id' => $a->id,
                    'name' => $a->name,
                    'size' => $a->size,
                    'url' => route('admin.messages.attachment', $a),
                ])->values(),
            ])->values(),
        ]);
    }

    public function store(AdminSendMessageRequest $request)
    {
        $this->authorize('create', Conversation::class);

        $user = $request->user();
        $data = $request->validated();

        $conversation = Conversation::create([
            'associate_id' => $data['associate_id'],
            'subject' => $data['subject'],
            'created_by' => $user->id,
            'last_message_at' => now(),
        ]);

        $message = $conversation->messages()->create([
            'sender_id' => $user->id,
            'body' => $data['body'],
        ]);

        $this->storeAttachments($message, $request->file('attachments') ?? []);
        MessageSent::dispatch($message);
        $conversation->markReadBy($user);

        return redirect()
            ->route('admin.messages.show', $conversation)
            ->with('success', 'Mensaje enviado.');
    }

    public function broadcast(BroadcastMessageRequest $request)
    {
        $this->authorize('create', MessageGroup::class); // solo admin

        $data = $request->validated();
        $group = MessageGroup::withCount('associates')->findOrFail($data['group_id']);

        SendGroupMessage::dispatch($group->id, $request->user()->id, $data['subject'], $data['body']);

        return redirect()
            ->route('admin.messages.index')
            ->with('success', "Mensaje en camino a {$group->associates_count} asociado(s).");
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
        MessageSent::dispatch($message);
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

    public function markUnread(Conversation $conversation, Request $request)
    {
        $this->authorize('view', $conversation);

        $conversation->markUnreadBy($request->user());

        return redirect()
            ->route('admin.messages.index')
            ->with('success', 'Marcada como no leída.');
    }

    public function close(Conversation $conversation, Request $request)
    {
        $this->authorize('close', $conversation);

        $closed = $conversation->status !== 'closed';
        $conversation->update(['status' => $closed ? 'closed' : 'open']);

        return back()->with('success', $closed ? 'Conversación cerrada.' : 'Conversación reabierta.');
    }

    public function downloadAttachment(MessageAttachment $attachment)
    {
        $this->authorize('view', $attachment->message->conversation);

        return Storage::disk($attachment->disk)->download($attachment->path, $attachment->name);
    }
}
