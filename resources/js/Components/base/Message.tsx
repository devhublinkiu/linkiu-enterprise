import * as React from 'react';

import { cn } from '@/lib/utils';

import { Bubble } from './Bubble';

// Fila de mensaje: alinea según el autor, muestra la burbuja y el meta (remitente · hora).
export interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
    mine?: boolean;
    sender?: string | null;
    at?: string | null;
}

export const Message = React.forwardRef<HTMLDivElement, MessageProps>(
    ({ mine = false, sender, at, className, children, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                'flex flex-col gap-1',
                mine ? 'items-end' : 'items-start',
                className,
            )}
            {...props}
        >
            <Bubble variant={mine ? 'out' : 'in'}>{children}</Bubble>
            {(sender || at) && (
                <span className="px-1 text-[11px] text-muted-foreground">
                    {sender}
                    {sender && at ? ' · ' : ''}
                    {at}
                </span>
            )}
        </div>
    ),
);
Message.displayName = 'Message';
