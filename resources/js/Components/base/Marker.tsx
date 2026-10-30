import * as React from 'react';

import { cn } from '@/lib/utils';

// Indicador de actividad: "Enviando…" / "Escribiendo…" con tres puntos animados.
export interface MarkerProps extends React.HTMLAttributes<HTMLDivElement> {
    label?: string;
}

export const Marker = React.forwardRef<HTMLDivElement, MarkerProps>(
    ({ label = 'Enviando', className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                'flex items-center gap-2 px-1 text-[11px] text-muted-foreground',
                className,
            )}
            {...props}
        >
            <span className="flex gap-0.5">
                <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
            </span>
            {label}
        </div>
    ),
);
Marker.displayName = 'Marker';
