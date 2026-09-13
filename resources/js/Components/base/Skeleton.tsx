import * as React from 'react';

import { cn } from '@/lib/utils';

// Spec de shadcn (Tailwind v4). Sin adaptaciones: `bg-muted` ya es un token (gris neutro) y
// `animate-pulse`/`rounded-md` son utilidades estándar. Ver design.md.
function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="skeleton"
            className={cn('animate-pulse rounded-md bg-muted', className)}
            {...props}
        />
    );
}

export { Skeleton };
