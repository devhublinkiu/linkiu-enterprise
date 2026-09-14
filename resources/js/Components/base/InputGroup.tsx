'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { Button } from '@/Components/base/Button';
import { Input } from '@/Components/base/Input';
import { Textarea } from '@/Components/base/Textarea';
import { cn } from '@/lib/utils';

// Spec de shadcn (Tailwind v4). Adaptaciones a nuestro stack (v3 + tokens HSL, light-only):
//   · `in-data-[slot=combobox-content]:` (dentro de un ancestro) → `[[data-slot=combobox-content]_&]:`.
//   · `has-disabled:` → `has-[:disabled]:`.
//   · `[.border-b]:` / `[.border-t]:` (el propio elemento con esa clase) → `[&.border-b]:` / `[&.border-t]:`.
//   · Se quitan las variantes `dark:`. `ring-3` está en el config. Tokens `input`, `ring`,
//     `destructive`, `muted-foreground` (existen).

function InputGroup({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="input-group"
            role="group"
            className={cn(
                'group/input-group relative flex h-8 w-full min-w-0 items-center rounded-lg border border-input outline-none transition-colors has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-start]]:h-auto has-[>textarea]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:flex-col has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot][aria-invalid=true]]:border-destructive has-[:disabled]:bg-input/50 has-[:disabled]:opacity-50 has-[[data-slot=input-group-control]:focus-visible]:ring-3 has-[[data-slot][aria-invalid=true]]:ring-3 has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50 has-[[data-slot][aria-invalid=true]]:ring-destructive/20 has-[>[data-align=block-end]]:[&>input]:pt-3 has-[>[data-align=block-start]]:[&>input]:pb-3 has-[>[data-align=inline-end]]:[&>input]:pr-1.5 has-[>[data-align=inline-start]]:[&>input]:pl-1.5 [[data-slot=combobox-content]_&]:focus-within:border-inherit [[data-slot=combobox-content]_&]:focus-within:ring-0',
                className,
            )}
            {...props}
        />
    );
}

const inputGroupAddonVariants = cva(
    "flex h-auto cursor-text select-none items-center justify-center gap-2 py-1.5 text-sm font-medium text-muted-foreground group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-4",
    {
        variants: {
            align: {
                'inline-start':
                    'order-first pl-2 has-[>button]:ml-[-0.3rem] has-[>kbd]:ml-[-0.15rem]',
                'inline-end':
                    'order-last pr-2 has-[>button]:mr-[-0.3rem] has-[>kbd]:mr-[-0.15rem]',
                'block-start':
                    'order-first w-full justify-start px-2.5 pt-2 group-has-[>input]/input-group:pt-2 [&.border-b]:pb-2',
                'block-end':
                    'order-last w-full justify-start px-2.5 pb-2 group-has-[>input]/input-group:pb-2 [&.border-t]:pt-2',
            },
        },
        defaultVariants: {
            align: 'inline-start',
        },
    },
);

function InputGroupAddon({
    className,
    align = 'inline-start',
    ...props
}: React.ComponentProps<'div'> & VariantProps<typeof inputGroupAddonVariants>) {
    return (
        <div
            role="group"
            data-slot="input-group-addon"
            data-align={align}
            className={cn(inputGroupAddonVariants({ align }), className)}
            onClick={(e) => {
                if ((e.target as HTMLElement).closest('button')) {
                    return;
                }
                e.currentTarget.parentElement?.querySelector('input')?.focus();
            }}
            {...props}
        />
    );
}

const inputGroupButtonVariants = cva(
    'flex items-center gap-2 text-sm shadow-none',
    {
        variants: {
            size: {
                xs: "h-6 gap-1 rounded-[calc(var(--radius)-3px)] px-1.5 [&>svg:not([class*='size-'])]:size-3.5",
                sm: '',
                'icon-xs':
                    'size-6 rounded-[calc(var(--radius)-3px)] p-0 has-[>svg]:p-0',
                'icon-sm': 'size-8 p-0 has-[>svg]:p-0',
            },
        },
        defaultVariants: {
            size: 'xs',
        },
    },
);

// forwardRef: Base UI pasa el `ref` a través de `render` (p. ej. desde ComboboxTrigger). Ver Button/Input.
const InputGroupButton = React.forwardRef<
    HTMLButtonElement,
    Omit<React.ComponentProps<typeof Button>, 'size'> &
        VariantProps<typeof inputGroupButtonVariants>
>(function InputGroupButton(
    { className, type = 'button', variant = 'ghost', size = 'xs', ...props },
    ref,
) {
    return (
        <Button
            ref={ref}
            type={type}
            data-size={size}
            variant={variant}
            className={cn(inputGroupButtonVariants({ size }), className)}
            {...props}
        />
    );
});

function InputGroupText({ className, ...props }: React.ComponentProps<'span'>) {
    return (
        <span
            className={cn(
                "flex items-center gap-2 text-sm text-muted-foreground [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none",
                className,
            )}
            {...props}
        />
    );
}

// forwardRef: Base UI pasa el `ref` a través de `render` (ComboboxInput → InputGroupInput → Input).
const InputGroupInput = React.forwardRef<
    HTMLInputElement,
    React.ComponentProps<'input'>
>(function InputGroupInput({ className, ...props }, ref) {
    return (
        <Input
            ref={ref}
            data-slot="input-group-control"
            className={cn(
                'flex-1 rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0 disabled:bg-transparent aria-invalid:ring-0',
                className,
            )}
            {...props}
        />
    );
});

function InputGroupTextarea({
    className,
    ...props
}: React.ComponentProps<'textarea'>) {
    return (
        <Textarea
            data-slot="input-group-control"
            className={cn(
                'flex-1 resize-none rounded-none border-0 bg-transparent py-2 shadow-none ring-0 focus-visible:ring-0 disabled:bg-transparent aria-invalid:ring-0',
                className,
            )}
            {...props}
        />
    );
}

export {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
    InputGroupText,
    InputGroupTextarea,
};
