'use client';

import { Separator as SeparatorPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/utils';

// Spec de shadcn (Tailwind v4). Única adaptación a v3: `data-horizontal:` / `data-vertical:`
// usan los alias de tailwind.config.js, que mapean a `[data-orientation=…]` de Radix.
function Separator({
    className,
    orientation = 'horizontal',
    decorative = true,
    ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
    return (
        <SeparatorPrimitive.Root
            data-slot="separator"
            decorative={decorative}
            orientation={orientation}
            className={cn(
                'shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch',
                className,
            )}
            {...props}
        />
    );
}

export { Separator };
