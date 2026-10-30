import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

import { getEcho } from '@/lib/echo';

/**
 * Escucha el canal de bandeja (inbox.{userId}) y ejecuta `onUpdate` cuando llega
 * `.InboxUpdated` (mensaje nuevo). Lo usa el index de mensajes para recargar la
 * lista en vivo (corte 7 · 1.B).
 *
 * Importante: en la limpieza usa `stopListening` del handler concreto, NO
 * `echo.leave`, porque el layout también escucha ese mismo canal para el badge;
 * `leave` tumbaría la suscripción compartida.
 */
export function useInboxUpdates(onUpdate: () => void): void {
    const { auth } = usePage().props as unknown as {
        auth: { user?: { id?: number } };
    };
    const userId = auth?.user?.id;
    const cb = useRef(onUpdate);
    cb.current = onUpdate;

    useEffect(() => {
        if (!userId) return;

        let echo: ReturnType<typeof getEcho>;
        try {
            echo = getEcho();
        } catch (e) {
            console.error('[Echo] Failed to initialize:', e);
            return;
        }

        const handler = () => cb.current();
        const channel = echo.private(`inbox.${userId}`);
        channel.listen('.InboxUpdated', handler);

        return () => {
            channel.stopListening('.InboxUpdated', handler);
        };
    }, [userId]);
}
