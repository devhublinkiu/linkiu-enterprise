import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/utils';

// Spec de shadcn (Tailwind v4). Adaptaciones a v3 / design.md:
//   · `dark:` fuera (light-only): se retiran las variantes `dark:*` de invalid/destructive/ghost.
//   · `rounded-4xl` → `rounded-full` (píldora; a `h-5` el radio efectivo es el mismo).
//   · `[a]:hover:` → `[a&]:hover:` (forma canónica en v3: `a` + `&` = el propio elemento cuando
//     es un enlace, para el caso `asChild` sobre `<a>`).
//   · `has-data-[icon=…]` → `has-[[data-icon=…]]`; `[&>svg]:size-3!` → `[&>svg]:!size-3`.
//   · Colores: ya salen de tokens (`primary`, `secondary`, `muted`, `destructive`, `border`,
//     `foreground`, `ring`); sin hardcode.
const badgeVariants = cva(
    'group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-full border border-transparent px-2 py-0.5 text-xs font-medium transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-[[data-icon=inline-end]]:pr-1.5 has-[[data-icon=inline-start]]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&>svg]:pointer-events-none [&>svg]:!size-3',
    {
        variants: {
            variant: {
                default:
                    'bg-primary text-primary-foreground [a&]:hover:bg-primary/80',
                secondary:
                    'bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/80',
                destructive:
                    'bg-destructive/10 text-destructive focus-visible:ring-destructive/20 [a&]:hover:bg-destructive/20',
                outline:
                    'border-border text-foreground [a&]:hover:bg-muted [a&]:hover:text-muted-foreground',
                ghost: 'hover:bg-muted hover:text-muted-foreground',
                link: 'text-primary underline-offset-4 hover:underline',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);

function Badge({
    className,
    variant = 'default',
    asChild = false,
    ...props
}: React.ComponentProps<'span'> &
    VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
    const Comp = asChild ? Slot.Root : 'span';

    return (
        <Comp
            data-slot="badge"
            data-variant={variant}
            className={cn(badgeVariants({ variant }), className)}
            {...props}
        />
    );
}

export { Badge, badgeVariants };
