import { ReactNode } from 'react';

import {
    Field,
    FieldDescription,
    FieldError,
    FieldLabel,
} from '@/Components/base/Field';

// Envoltura de un campo del formulario: etiqueta + control + ayuda + error.
// El control (Input / Select) se pasa como children. Reemplaza al viejo FieldWrapper
// (que arrastraba la auditoría campo a campo, ya retirada). Ver ADR-0005-a.
interface Props {
    id: string;
    label: string;
    required?: boolean;
    error?: string;
    hint?: string;
    className?: string;
    children: ReactNode;
}

export default function FormField({
    id,
    label,
    required,
    error,
    hint,
    className,
    children,
}: Props) {
    return (
        <Field data-invalid={error ? 'true' : undefined} className={className}>
            <FieldLabel htmlFor={id}>
                {label}
                {required && <span className="text-destructive"> *</span>}
            </FieldLabel>
            {children}
            {hint && !error && <FieldDescription>{hint}</FieldDescription>}
            <FieldError>{error}</FieldError>
        </Field>
    );
}
