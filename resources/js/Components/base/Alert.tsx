import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

// Spec de shadcn (Tailwind v4). Adaptaciones a nuestro stack (v3 + tokens HSL, light-only).
// NO se cambia el diseño; solo lo necesario para que funcione igual en v3:
//   · `has-data-[slot=…]:` (v4) → `has-[[data-slot=…]]:`.
//   · `pr-18` (v4, escala libre) → `pr-[4.5rem]` (18×0.25rem; no existe en la escala v3).
//   · `*:[svg]:…` (v4) → `[&>svg]:…`.
//   · `underline-offset-3` (no está en la escala) → `underline-offset-[3px]`.
//   · `[&_a]:hover:` → `[&_a:hover]:` (hover sobre el <a>, no sobre el contenedor).
//   · Se quitan las variantes `dark:` (light-only, regla 10).
//
// Variantes: además de `default` (neutral/info) y `destructive` (error, del spec) se agregan
// `success` y `warning` con los tokens de marca (regla: solo se cambia color/tipografía).
// No hay token azul de "info": el neutral por defecto cumple ese rol.
const alertVariants = cva(
    "group/alert relative grid w-full gap-0.5 rounded-lg border px-2.5 py-2 text-left text-sm has-[[data-slot=alert-action]]:relative has-[[data-slot=alert-action]]:pr-[4.5rem] has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 [&>svg]:row-span-2 [&>svg]:translate-y-0.5 [&>svg]:text-current [&>svg:not([class*='size-'])]:size-4",
    {
        variants: {
            variant: {
                default: 'bg-card text-card-foreground',
                destructive:
                    'bg-card text-destructive [&>[data-slot=alert-description]]:text-destructive/90 [&>svg]:text-current',
                success:
                    'bg-card text-success [&>[data-slot=alert-description]]:text-success/90 [&>svg]:text-current',
                warning:
                    'bg-card text-accent-strong [&>[data-slot=alert-description]]:text-accent-strong/90 [&>svg]:text-current',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);

function Alert({
    className,
    variant,
    ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
    return (
        <div
            data-slot="alert"
            role="alert"
            className={cn(alertVariants({ variant }), className)}
            {...props}
        />
    );
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="alert-title"
            className={cn(
                'font-medium group-has-[>svg]/alert:col-start-2 [&_a:hover]:text-foreground [&_a]:underline [&_a]:underline-offset-[3px]',
                className,
            )}
            {...props}
        />
    );
}

function AlertDescription({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="alert-description"
            className={cn(
                'text-balance text-sm text-muted-foreground md:text-pretty [&_a:hover]:text-foreground [&_a]:underline [&_a]:underline-offset-[3px] [&_p:not(:last-child)]:mb-4',
                className,
            )}
            {...props}
        />
    );
}

function AlertAction({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="alert-action"
            className={cn('absolute right-2 top-2', className)}
            {...props}
        />
    );
}

export { Alert, AlertAction, AlertDescription, AlertTitle };
