import * as React from 'react';

import { cn } from '@/lib/utils';

// Contenedor desplazable de mensajes que auto-baja al final. Cambia `autoScrollKey`
// (p. ej. el nº de mensajes) para re-scrollear al llegar/enviar uno nuevo.
export interface MessageScrollerProps extends React.HTMLAttributes<HTMLDivElement> {
    autoScrollKey?: unknown;
}

export const MessageScroller = React.forwardRef<
    HTMLDivElement,
    MessageScrollerProps
>(({ autoScrollKey, className, children, ...props }, ref) => {
    const innerRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => innerRef.current as HTMLDivElement);

    React.useEffect(() => {
        const el = innerRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [autoScrollKey]);

    return (
        <div
            ref={innerRef}
            className={cn('flex-1 space-y-3 overflow-y-auto', className)}
            {...props}
        >
            {children}
        </div>
    );
});
MessageScroller.displayName = 'MessageScroller';
