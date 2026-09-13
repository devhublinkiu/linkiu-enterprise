import * as React from 'react';

import { cn } from '@/lib/utils';

// Spec de shadcn (Tailwind v4). Adaptaciones a nuestro stack (v3 + tokens HSL, light-only).
// NO se cambia el diseño; solo lo necesario para que funcione igual en v3:
//   · `gap-(--card-spacing)` / `py-(--card-spacing)` … (v4) → `gap-[var(--card-spacing)]` …
//   · `[--card-spacing:--spacing(4)]` (función v4) → `[--card-spacing:1rem]` (4×0.25rem);
//     tamaño `sm` → `0.75rem`.
//   · `has-data-[slot=…]:` (v4) → `has-[[data-slot=…]]:`.
//   · `*:[img:first-child]:` (v4) → `[&>img:first-child]:`.
//   · `cn-font-heading` (clase del design system ajeno) → `font-display` (nuestro titular).
//   · `@container/card-header` funciona con el plugin @tailwindcss/container-queries.

function Card({
    className,
    size = 'default',
    ...props
}: React.ComponentProps<'div'> & { size?: 'default' | 'sm' }) {
    return (
        <div
            data-slot="card"
            data-size={size}
            className={cn(
                'group/card flex flex-col gap-[var(--card-spacing)] overflow-hidden rounded-xl bg-card py-[var(--card-spacing)] text-sm text-card-foreground ring-1 ring-foreground/10 [--card-spacing:1rem] has-[>img:first-child]:pt-0 has-[[data-slot=card-footer]]:pb-0 data-[size=sm]:[--card-spacing:0.75rem] data-[size=sm]:has-[[data-slot=card-footer]]:pb-0 [&>img:first-child]:rounded-t-xl [&>img:last-child]:rounded-b-xl',
                className,
            )}
            {...props}
        />
    );
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="card-header"
            className={cn(
                'group/card-header [.border-b]:pb-[var(--card-spacing)] grid auto-rows-min items-start gap-1 rounded-t-xl px-[var(--card-spacing)] @container/card-header has-[[data-slot=card-action]]:grid-cols-[1fr_auto] has-[[data-slot=card-description]]:grid-rows-[auto_auto]',
                className,
            )}
            {...props}
        />
    );
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="card-title"
            className={cn(
                'font-display text-base font-medium leading-snug group-data-[size=sm]/card:text-sm',
                className,
            )}
            {...props}
        />
    );
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="card-description"
            className={cn('text-sm text-muted-foreground', className)}
            {...props}
        />
    );
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="card-action"
            className={cn(
                'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
                className,
            )}
            {...props}
        />
    );
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="card-content"
            className={cn('px-[var(--card-spacing)]', className)}
            {...props}
        />
    );
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="card-footer"
            className={cn(
                'flex items-center rounded-b-xl border-t bg-muted/50 p-[var(--card-spacing)]',
                className,
            )}
            {...props}
        />
    );
}

export {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
};
