import { FileSignature } from 'lucide-react';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/Components/base/Card';
import { Checkbox } from '@/Components/base/Checkbox';
import { Field, FieldError, FieldLabel } from '@/Components/base/Field';
import { Input } from '@/Components/base/Input';

import FormField from '../../BasicInfo/Parts/FormField';
import { DocumentationForm } from '../types';

interface Props {
    data: DocumentationForm;
    setData: <K extends keyof DocumentationForm>(
        key: K,
        value: DocumentationForm[K],
    ) => void;
    errors: Partial<Record<string, string>>;
    disabled: boolean;
}

export default function SwornDeclaration({
    data,
    setData,
    errors,
    disabled,
}: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <FileSignature className="size-4 text-muted-foreground" />
                    Declaración jurada
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                    <FormField
                        id="rep_name"
                        label="Representante legal"
                        required
                        error={errors.rep_name}
                        hint="Nombre como aparece en el documento de identidad."
                    >
                        <Input
                            id="rep_name"
                            value={data.rep_name}
                            onChange={(e) =>
                                setData('rep_name', e.target.value)
                            }
                            disabled={disabled}
                            aria-invalid={!!errors.rep_name}
                            placeholder="Nombre completo"
                        />
                    </FormField>

                    <FormField
                        id="rep_doc"
                        label="Cédula de ciudadanía"
                        required
                        error={errors.rep_doc}
                    >
                        <Input
                            id="rep_doc"
                            value={data.rep_doc}
                            onChange={(e) => setData('rep_doc', e.target.value)}
                            disabled={disabled}
                            aria-invalid={!!errors.rep_doc}
                            placeholder="Número de identificación"
                        />
                    </FormField>
                </div>

                <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground">
                    Yo,{' '}
                    <span className="font-medium text-foreground">
                        {data.rep_name || '[Representante legal]'}
                    </span>
                    , bajo la gravedad del juramento, declaro que los recursos
                    de mi representada provienen de actividades lícitas y no
                    serán destinados a la financiación de actos delictivos.
                    Autorizo el tratamiento de mis datos personales para fines
                    de verificación gremial.
                </div>

                <Field
                    data-invalid={
                        errors.funds_origin_declaration ? 'true' : undefined
                    }
                >
                    <Field orientation="horizontal">
                        <Checkbox
                            id="funds_origin_declaration"
                            checked={data.funds_origin_declaration}
                            onCheckedChange={(v) =>
                                setData('funds_origin_declaration', v === true)
                            }
                            disabled={disabled}
                            aria-invalid={!!errors.funds_origin_declaration}
                        />
                        <FieldLabel
                            htmlFor="funds_origin_declaration"
                            className="font-normal"
                        >
                            Acepto y firmo esta declaración como representante
                            legal.
                        </FieldLabel>
                    </Field>
                    <FieldError>{errors.funds_origin_declaration}</FieldError>
                </Field>
            </CardContent>
        </Card>
    );
}
