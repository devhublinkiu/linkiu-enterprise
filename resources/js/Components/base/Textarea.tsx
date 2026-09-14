import * as React from 'react';

import { cn } from '@/lib/utils';

// Spec de shadcn (Tailwind v4). Adaptaciones a nuestro stack (v3 + tokens HSL, light-only):
//   · `field-sizing-content` (v4) → `[field-sizing:content]` (propiedad arbitraria; autocrece
//     donde el navegador lo soporte).
//   · `min-h-16` (no está en la escala v3) → `min-h-[4rem]`.
//   · Se quitan las variantes `dark:` (regla light-only).
//   · Tokens: `input`, `ring`, `destructive`, `muted-foreground` (existen).
function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
    return (
        <textarea
            data-slot="textarea"
            className={cn(
                'flex min-h-[4rem] w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none transition-colors [field-sizing:content] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm',
                className,
            )}
            {...props}
        />
    );
}

export { Textarea };
