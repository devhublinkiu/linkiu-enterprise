import { parseISO } from 'date-fns';
import { Paperclip } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Attachment } from '@/Components/base/Attachment';
import { Marker } from '@/Components/base/Marker';
import { Message } from '@/Components/base/Message';
import { MessageScroller } from '@/Components/base/MessageScroller';
import { useConversationChannel } from '@/hooks/useConversationChannel';

export interface MessageAttachment {
    id: number;
    name: string;
    size: number | null;
    url: string;
}

export interface MessageRow {
    id: number;
    body: string | null;
    mine: boolean;
    sender: string | null;
    at: string | null;
    attachments: MessageAttachment[];
    has_attachments?: boolean;
}

interface Props {
    conversationId: number;
    messages: MessageRow[];
    myId?: number;
    query?: string;
    // Envío en curso: pinta una burbuja "Enviando…" al final del hilo.
    pending?: boolean;
}

function formatTime(value: string | null): string {
    if (!value) return '';
    const d = parseISO(value.replace(' ', 'T'));
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

// Cuerpo de un hilo: mezcla los mensajes de props con los que llegan en vivo
// (canal privado, dedupe por id para no duplicar mis propios envíos), filtra por
// búsqueda y auto-scrollea. Compartido admin/asociado.
export default function MessageList({
    conversationId,
    messages,
    myId,
    query = '',
    pending = false,
}: Props) {
    const [live, setLive] = useState<MessageRow[]>([]);

    useConversationChannel(conversationId, (p) => {
        setLive((prev) =>
            prev.some((m) => m.id === p.id)
                ? prev
                : [
                      ...prev,
                      {
                          id: p.id,
                          body: p.body,
                          mine: Number(p.sender_id) === Number(myId),
                          sender: p.sender,
                          at: p.at,
                          attachments: [],
                          has_attachments: p.has_attachments,
                      },
                  ],
        );
    });

    const merged = useMemo(() => {
        const byId = new Map<number, MessageRow>();
        for (const m of live) byId.set(m.id, m);
        for (const m of messages) byId.set(m.id, m); // props mandan (traen adjuntos)
        return Array.from(byId.values()).sort((a, b) => a.id - b.id);
    }, [messages, live]);

    const visible = useMemo(() => {
        const needle = query.trim().toLowerCase();
        if (!needle) return merged;
        return merged.filter((m) =>
            (m.body ?? '').toLowerCase().includes(needle),
        );
    }, [merged, query]);

    return (
        <MessageScroller
            autoScrollKey={`${visible.length}:${pending}`}
            className="bg-muted/30 p-4"
        >
            {visible.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                    {query ? 'Sin coincidencias.' : 'Todavía no hay mensajes.'}
                </p>
            ) : (
                visible.map((m) => (
                    <Message
                        key={m.id}
                        mine={m.mine}
                        sender={m.mine ? null : m.sender}
                        at={formatTime(m.at)}
                    >
                        {m.body && (
                            <span className="whitespace-pre-wrap">
                                {m.body}
                            </span>
                        )}
                        {m.attachments.length > 0 && (
                            <span className="mt-2 flex flex-col gap-1.5">
                                {m.attachments.map((a) => (
                                    <Attachment
                                        key={a.id}
                                        name={a.name}
                                        size={a.size}
                                        href={a.url}
                                    />
                                ))}
                            </span>
                        )}
                        {m.attachments.length === 0 && m.has_attachments && (
                            <span className="mt-1 flex items-center gap-1 text-xs opacity-80">
                                <Paperclip className="size-3.5" />
                                Contiene adjuntos
                            </span>
                        )}
                    </Message>
                ))
            )}

            {pending && (
                <div className="flex justify-end">
                    <div className="rounded-2xl rounded-br-sm bg-muted px-3.5 py-2">
                        <Marker label="Enviando" />
                    </div>
                </div>
            )}
        </MessageScroller>
    );
}
