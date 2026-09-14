'use client';

import { RadioGroup as RadioGroupPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/utils';

// Spec de shadcn (Tailwind v4). Adaptaciones para nuestro stack (v3 + tokens HSL, light-only),
// idénticas a las de Checkbox para no divergir del patrón (regla: copiar la spec "tal cual"):
//   · `data-checked:` / `not-data-checked:` (v4) → alias `data-checked` / `data-unchecked` de
//     tailwind.config.js, que mapean a `[data-state=…]` de Radix.
//   · `ring-3` y `aria-invalid:` funcionan por la extensión de tailwind.config.js (no se convierten).
//   · Se quitan las variantes `dark:` (proyecto light-only, regla 10).
//   · `group-has-[…]/field-label`: activa estilos según el estado del FieldLabel contenedor
//     (`group/field-label` en base/Field.tsx); así la "choice card" enciende su anillo de foco.
//   · `data-slot="radio-group"` casa con `FieldSet has-[>[data-slot=radio-group]]:gap-3` y el ítem
//     con `role="radio"` (que Radix pone) casa con las reglas `[&>[role=radio]]` de `Field`.
//   · Tokens `input`, `ring`, `destructive`, `primary`, `primary-foreground` (existen).

function RadioGroup({
    className,
    ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
    return (
        <RadioGroupPrimitive.Root
            data-slot="radio-group"
            className={cn('grid w-full gap-2', className)}
            {...props}
        />
    );
}

function RadioGroupItem({
    className,
    ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
    return (
        <RadioGroupPrimitive.Item
            data-slot="radio-group-item"
            className={cn(
                'group/radio-group-item peer relative flex aspect-square size-4 shrink-0 rounded-full border border-input outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 group-has-[:disabled]/field:opacity-50 group-has-[:focus-visible]/field-label:ring-0 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground group-has-[:focus-visible]/field-label:data-checked:border-primary group-has-[:focus-visible]/field-label:data-unchecked:border-input',
                className,
            )}
            {...props}
        >
            <RadioGroupPrimitive.Indicator
                data-slot="radio-group-indicator"
                className="flex size-4 items-center justify-center"
            >
                <span className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-foreground" />
            </RadioGroupPrimitive.Indicator>
        </RadioGroupPrimitive.Item>
    );
}

export { RadioGroup, RadioGroupItem };
