import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Archive,
    ArchiveRestore,
    ArrowLeft,
    MailMinus,
    MoreVertical,
    Search,
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/Components/base/Badge';
import { Button } from '@/Components/base/Button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/base/DropdownMenu';
import { Input } from '@/Components/base/Input';
import Composer from '@/Components/messaging/Composer';
import MessageList, {
    type MessageRow,
} from '@/Components/messaging/MessageList';
import AppLayout from '@/Layouts/AppLayout';

interface Props {
    conversation: {
        id: number;
        subject: string | null;
        status: string;
        archived: boolean;
    };
    messages: MessageRow[];
}

export default function Show({ conversation, messages }: Props) {
    const { auth } = usePage().props as unknown as {
        auth: { user?: { id?: number } };
    };
    const myId = auth?.user?.id;

    const [searching, setSearching] = useState(false);
    const [q, setQ] = useState('');
    const [sending, setSending] = useState(false);

    const closed = conversation.status === 'closed';

    const post = (name: string, opts = {}) =>
        router.post(route(name, conversation.id), {}, opts);

    return (
        <div className="mx-auto flex h-[calc(100svh-9rem)] max-w-3xl flex-col overflow-hidden rounded-xl border border-border bg-card">
            <Head title={`${conversation.subject ?? 'Mensaje'} | Mensajes`} />

            {/* Encabezado del hilo */}
            <header className="flex items-center gap-2 border-b border-border px-3 py-3">
                <Button asChild variant="ghost" size="icon" aria-label="Volver">
                    <Link href={route('associate.messages.index')}>
                        <ArrowLeft className="size-5" />
                    </Link>
                </Button>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <h1 className="truncate text-sm font-semibold text-foreground">
                            {conversation.subject ?? 'Conversación'}
                        </h1>
                        {closed && <Badge variant="secondary">Cerrada</Badge>}
                        {conversation.archived && (
                            <Badge variant="secondary">Archivada</Badge>
                        )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                        Equipo CAMEP
                    </p>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Más acciones"
                        >
                            <MoreVertical className="size-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-60">
                        <DropdownMenuItem
                            onClick={() => {
                                setSearching((s) => !s);
                                setQ('');
                            }}
                        >
                            <Search className="size-4" />
                            Buscar en la conversación
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() =>
                                post('associate.messages.mark-unread')
                            }
                        >
                            <MailMinus className="size-4" />
                            Marcar como no leída
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            onClick={() =>
                                post('associate.messages.archive', {
                                    preserveScroll: true,
                                })
                            }
                        >
                            {conversation.archived ? (
                                <>
                                    <ArchiveRestore className="size-4" />
                                    Restaurar conversación
                                </>
                            ) : (
                                <>
                                    <Archive className="size-4" />
                                    Archivar conversación
                                </>
                            )}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </header>

            {searching && (
                <div className="border-b border-border p-2">
                    <Input
                        autoFocus
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Buscar en la conversación…"
                    />
                </div>
            )}

            <MessageList
                conversationId={conversation.id}
                messages={messages}
                myId={myId}
                query={q}
                pending={sending}
            />

            {closed ? (
                <p className="border-t border-border bg-muted/30 px-4 py-3 text-center text-sm text-muted-foreground">
                    El equipo de CAMEP cerró esta conversación.
                </p>
            ) : (
                !conversation.archived && (
                    <Composer
                        action={route(
                            'associate.messages.reply',
                            conversation.id,
                        )}
                        onSendingChange={setSending}
                    />
                )
            )}
        </div>
    );
}

Show.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
