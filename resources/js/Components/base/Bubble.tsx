import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

// Burbuja de mensaje. Entrante (muted) o saliente (primary). Solo tokens.
const bubbleVariants = cva(
    'inline-block max-w-[82%] break-words rounded-2xl px-3.5 py-2 text-sm leading-relaxed',
    {
        variants: {
            variant: {
                in: 'rounded-bl-sm bg-muted text-foreground',
                out: 'rounded-br-sm bg-primary text-primary-foreground',
            },
        },
        defaultVariants: {
            variant: 'in',
        },
    },
);

export interface BubbleProps
    extends
        React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof bubbleVariants> {}

export const Bubble = React.forwardRef<HTMLDivElement, BubbleProps>(
    ({ className, variant, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(bubbleVariants({ variant }), className)}
            {...props}
        />
    ),
);
Bubble.displayName = 'Bubble';
