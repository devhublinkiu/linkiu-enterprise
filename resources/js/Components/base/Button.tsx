import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/utils';

// Spec de shadcn (Tailwind v4). Adaptaciones para nuestro stack (v3 + tokens HSL,
// solo tema claro). NO se cambia el diseño; solo lo necesario para que compile igual:
//   · Se quitan las variantes `dark:` (proyecto light-only, regla 10).
//   · `not-aria-[haspopup]:` (v4) → variante arbitraria `[&:active:not([aria-haspopup])]:`.
//   · `in-data-[slot=button-group]:` (v4) → `[[data-slot=button-group]_&]:`.
//   · `has-data-[icon=...]:` (v4) → `has-[[data-icon=...]]:`.
//   · `color-mix(... var(--secondary) ...)`: nuestras vars son tripletas HSL, así que se
//     envuelven en `hsl(var(--…))` para que sean colores válidos.
//   · `forwardRef`: la spec (React 19) recibe el `ref` como prop; en React 18 un componente de
//     función no puede recibirlo, así que se envuelve en `React.forwardRef` para que Radix
//     (`asChild` de Tooltip/Sheet/Sidebar…) pueda anclar el botón. No cambia el comportamiento.
// `ring-3` y `aria-invalid:` funcionan gracias a la extensión en tailwind.config.js.
const buttonVariants = cva(
    "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 [&:active:not([aria-haspopup])]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    {
        variants: {
            variant: {
                default:
                    'bg-primary text-primary-foreground hover:bg-primary/80',
                outline:
                    'border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground',
                secondary:
                    'bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,hsl(var(--secondary)),hsl(var(--foreground))_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
                ghost: 'hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground',
                destructive:
                    'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20',
                link: 'text-primary underline-offset-4 hover:underline',
            },
            size: {
                default:
                    'h-8 gap-1.5 px-2.5 has-[[data-icon=inline-end]]:pr-2 has-[[data-icon=inline-start]]:pl-2',
                xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs [[data-slot=button-group]_&]:rounded-lg has-[[data-icon=inline-end]]:pr-1.5 has-[[data-icon=inline-start]]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
                sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] [[data-slot=button-group]_&]:rounded-lg has-[[data-icon=inline-end]]:pr-1.5 has-[[data-icon=inline-start]]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
                lg: 'h-9 gap-1.5 px-2.5 has-[[data-icon=inline-end]]:pr-2 has-[[data-icon=inline-start]]:pl-2',
                icon: 'size-8',
                'icon-xs':
                    "size-6 rounded-[min(var(--radius-md),10px)] [[data-slot=button-group]_&]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
                'icon-sm':
                    'size-7 rounded-[min(var(--radius-md),12px)] [[data-slot=button-group]_&]:rounded-lg',
                'icon-lg': 'size-9',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

const Button = React.forwardRef<
    HTMLButtonElement,
    React.ComponentProps<'button'> &
        VariantProps<typeof buttonVariants> & {
            asChild?: boolean;
        }
>(function Button(
    {
        className,
        variant = 'default',
        size = 'default',
        asChild = false,
        ...props
    },
    ref,
) {
    const Comp = asChild ? Slot.Root : 'button';

    return (
        <Comp
            ref={ref}
            data-slot="button"
            data-variant={variant}
            data-size={size}
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        />
    );
});

export { Button, buttonVariants };
