'use client';

import { CheckIcon } from 'lucide-react';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/utils';

// Spec de shadcn (Tailwind v4). Adaptaciones para nuestro stack (v3 + tokens HSL,
// solo tema claro). NO se cambia el diseño; solo lo necesario para que funcione igual:
//   · `data-checked:` / `not-data-checked:` (v4) → usamos los alias `data-checked` /
//     `data-unchecked` de tailwind.config.js, que mapean a `[data-state=…]` de Radix.
//   · Se quitan las variantes `dark:` (proyecto light-only, regla 10).
//   · `ring-3` y `aria-invalid:` funcionan por la extensión en tailwind.config.js.
//   · `group-has-[…]/field` y `group-has-[…]/field-label`: activan estilos según el estado
//     del Field contenedor. Los grupos los definen Field (`group/field`) y FieldLabel
//     (`group/field-label`) en base/Field.tsx.
function Checkbox({
    className,
    ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
    return (
        <CheckboxPrimitive.Root
            data-slot="checkbox"
            className={cn(
                'peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input outline-none transition-colors after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 group-has-[:disabled]/field:opacity-50 group-has-[:focus-visible]/field-label:ring-0 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground group-has-[:focus-visible]/field-label:data-checked:border-primary group-has-[:focus-visible]/field-label:data-unchecked:border-input',
                className,
            )}
            {...props}
        >
            <CheckboxPrimitive.Indicator
                data-slot="checkbox-indicator"
                className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
            >
                <CheckIcon />
            </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
    );
}

export { Checkbox };
