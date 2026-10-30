import { useEffect, useRef } from 'react';

import { getEcho } from '@/lib/echo';

// Payload del evento .MessageSent (ver App\Events\MessageSent::broadcastWith).
export interface IncomingMessage {
    id: number;
    conversation_id: number;
    body: string | null;
    sender_id: number;
    sender: string | null;
    at: string | null;
    has_attachments?: boolean;
}

/**
 * Suscribe al canal privado de un hilo (conversation.{id}) y entrega los mensajes
 * nuevos en vivo (evento .MessageSent). Reúsa el Echo/Ably ya configurado. Las
 * páginas (corte 7) le pasan el id del hilo abierto y un callback que agrega el
 * mensaje a la lista.
 */
export function useConversationChannel(
    conversationId: number | null,
    onMessage: (payload: IncomingMessage) => void,
): void {
    const cb = useRef(onMessage);
    cb.current = onMessage;

    useEffect(() => {
        if (!conversationId) return;

        let echo: ReturnType<typeof getEcho>;
        try {
            echo = getEcho();
        } catch (e) {
            console.error('[Echo] Failed to initialize:', e);
            return;
        }

        const channel = `conversation.${conversationId}`;
        echo.private(channel).listen(
            '.MessageSent',
            (payload: IncomingMessage) => cb.current(payload),
        );

        return () => {
            echo.leave(channel);
        };
    }, [conversationId]);
}
