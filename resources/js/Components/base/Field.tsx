'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { Label } from '@/Components/base/Label';
import { Separator } from '@/Components/base/Separator';
import { cn } from '@/lib/utils';

// Spec de shadcn (Tailwind v4). Adaptaciones a nuestro stack (v3 + tokens HSL, light-only).
// NO se cambia el diseño; solo lo necesario para que funcione igual en v3:
//   · Container queries (`@container/field-group`, `@md/field-group:`): habilitadas con el
//     plugin @tailwindcss/container-queries (tailwind.config.js).
//   · `has-data-checked:` (v4) → `has-[[data-state=checked]]:` (Radix usa data-state).
//   · `not-has-[:disabled,[data-disabled]]:hover:` (v4 `not-`) → variante arbitraria
//     `[&:has(>[data-slot=field]):not(:has(:disabled)):not(:has([data-disabled])):hover]:`.
//   · `[&>[role=checkbox],[role=radio]]` (selector con coma) → dos clases separadas y bien
//     alcanzadas con `>` (checkbox y radio), que era la intención.
//   · `nth-last-2:` (v4) → `[&:nth-last-child(2)]:`.
//   · `group-has-data-horizontal/field:` (ambiguo) → `group-data-[orientation=horizontal]/field:`
//     que es lo que casa con nuestro `data-orientation`.
//   · Se quitan las variantes `dark:` (light-only, regla 10).

function FieldSet({ className, ...props }: React.ComponentProps<'fieldset'>) {
    return (
        <fieldset
            data-slot="field-set"
            className={cn(
                'flex flex-col gap-4 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3',
                className,
            )}
            {...props}
        />
    );
}

function FieldLegend({
    className,
    variant = 'legend',
    ...props
}: React.ComponentProps<'legend'> & { variant?: 'legend' | 'label' }) {
    return (
        <legend
            data-slot="field-legend"
            data-variant={variant}
            className={cn(
                'mb-1.5 font-medium data-[variant=label]:text-sm data-[variant=legend]:text-base',
                className,
            )}
            {...props}
        />
    );
}

function FieldGroup({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="field-group"
            className={cn(
                'group/field-group flex w-full flex-col gap-5 @container/field-group data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4',
                className,
            )}
            {...props}
        />
    );
}

const fieldVariants = cva(
    'group/field flex w-full gap-2 data-[invalid=true]:text-destructive',
    {
        variants: {
            orientation: {
                vertical: 'flex-col *:w-full [&>.sr-only]:w-auto',
                horizontal:
                    'flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox]]:mt-px has-[>[data-slot=field-content]]:[&>[role=radio]]:mt-px',
                responsive:
                    'flex-col *:w-full [&>.sr-only]:w-auto @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox]]:mt-px @md/field-group:has-[>[data-slot=field-content]]:[&>[role=radio]]:mt-px',
            },
        },
        defaultVariants: {
            orientation: 'vertical',
        },
    },
);

function Field({
    className,
    orientation = 'vertical',
    ...props
}: React.ComponentProps<'div'> & VariantProps<typeof fieldVariants>) {
    return (
        <div
            role="group"
            data-slot="field"
            data-orientation={orientation}
            className={cn(fieldVariants({ orientation }), className)}
            {...props}
        />
    );
}

function FieldContent({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="field-content"
            className={cn(
                'group/field-content flex flex-1 flex-col gap-0.5 leading-snug',
                className,
            )}
            {...props}
        />
    );
}

function FieldLabel({
    className,
    ...props
}: React.ComponentProps<typeof Label>) {
    return (
        <Label
            data-slot="field-label"
            className={cn(
                'group/field-label peer/field-label flex w-fit gap-2 leading-snug has-[>[data-slot=field]]:rounded-lg has-[>[data-slot=field]]:border has-[>[data-slot=field]]:has-[:focus-visible]:border-ring has-[[data-state=checked]]:border-primary/30 has-[[data-state=checked]]:bg-primary/5 has-[>[data-slot=field]]:has-[:focus-visible]:ring-3 has-[>[data-slot=field]]:has-[:focus-visible]:ring-ring/50 *:data-[slot=field]:p-2.5 group-data-[disabled=true]/field:opacity-50 [&:has(>[data-slot=field]):not(:has(:disabled)):not(:has([data-disabled])):hover]:bg-muted/50',
                'has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col',
                className,
            )}
            {...props}
        />
    );
}

function FieldTitle({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="field-label"
            className={cn(
                'flex w-fit items-center gap-2 text-sm font-medium group-data-[disabled=true]/field:opacity-50',
                className,
            )}
            {...props}
        />
    );
}

function FieldDescription({ className, ...props }: React.ComponentProps<'p'>) {
    return (
        <p
            data-slot="field-description"
            className={cn(
                'text-left text-sm font-normal leading-normal text-muted-foreground group-data-[orientation=horizontal]/field:text-balance [[data-variant=legend]+&]:-mt-1.5',
                'last:mt-0 [&:nth-last-child(2)]:-mt-1',
                '[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4',
                className,
            )}
            {...props}
        />
    );
}

function FieldSeparator({
    children,
    className,
    ...props
}: React.ComponentProps<'div'> & {
    children?: React.ReactNode;
}) {
    return (
        <div
            data-slot="field-separator"
            data-content={!!children}
            className={cn(
                'relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2',
                className,
            )}
            {...props}
        >
            <Separator className="absolute inset-0 top-1/2" />
            {children && (
                <span
                    className="relative mx-auto block w-fit bg-background px-2 text-muted-foreground"
                    data-slot="field-separator-content"
                >
                    {children}
                </span>
            )}
        </div>
    );
}

function FieldError({
    className,
    children,
    errors,
    ...props
}: React.ComponentProps<'div'> & {
    errors?: Array<{ message?: string } | undefined>;
}) {
    const content = React.useMemo(() => {
        if (children) {
            return children;
        }

        if (!errors?.length) {
            return null;
        }

        const uniqueErrors = [
            ...new Map(errors.map((error) => [error?.message, error])).values(),
        ];

        if (uniqueErrors?.length == 1) {
            return uniqueErrors[0]?.message;
        }

        return (
            <ul className="ml-4 flex list-disc flex-col gap-1">
                {uniqueErrors.map(
                    (error, index) =>
                        error?.message && <li key={index}>{error.message}</li>,
                )}
            </ul>
        );
    }, [children, errors]);

    if (!content) {
        return null;
    }

    return (
        <div
            role="alert"
            data-slot="field-error"
            className={cn('text-sm font-normal text-destructive', className)}
            {...props}
        >
            {content}
        </div>
    );
}

export {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSeparator,
    FieldSet,
    FieldTitle,
};
