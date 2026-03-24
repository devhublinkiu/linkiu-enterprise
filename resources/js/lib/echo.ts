import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Pusher: typeof Pusher;
        Echo: Echo<any>;
    }
}

let echo: Echo<any> | null = null;

export function getEcho(): Echo<any> {
    if (!echo) {
        window.Pusher = Pusher;

        // ABLY_KEY format is "appId.keyName:keySecret"
        // Ably's Pusher-compatible endpoint only accepts the public part "appId.keyName"
        const fullKey = import.meta.env.VITE_ABLY_KEY as string;
        const publicKey = fullKey.split(':')[0]; // e.g. "nqBbNw.xKFt7g"

        echo = new Echo({
            broadcaster: 'ably',
            key: publicKey,
            wsHost: 'realtime-pusher.ably.io',
            wsPort: 443,
            wssPort: 443,
            enableStats: false,
            encrypted: true,
            enabledTransports: ['ws', 'wss'],
        });
    }
    return echo;
}

export function disconnectEcho(): void {
    if (echo) {
        echo.disconnect();
        echo = null;
    }
}
