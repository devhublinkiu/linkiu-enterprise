import { router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';

import { getEcho } from '@/lib/echo';

/**
 * Mantiene vivo el contador de no leídos de la bandeja (prop compartida
 * `unread_messages`). Escucha inbox.{userId} y, al llegar `.InboxUpdated`, recarga
 * solo esa prop sin recargar la página. Lo usa el layout (corte 7).
 */
export function useInboxBadge(): void {
    const { auth } = usePage().props as any;
    const userId = auth?.user?.id;

    useEffect(() => {
        if (!userId) return;

        let echo: ReturnType<typeof getEcho>;
        try {
            echo = getEcho();
        } catch (e) {
            console.error('[Echo] Failed to initialize:', e);
            return;
        }

        const channel = `inbox.${userId}`;
        echo.private(channel).listen('.InboxUpdated', () => {
            router.reload({ only: ['unread_messages'] });
        });

        return () => {
            echo.leave(channel);
        };
    }, [userId]);
}
