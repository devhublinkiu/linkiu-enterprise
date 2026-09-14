import { Plus, ShieldCheck, Trash2 } from 'lucide-react';

import { Button } from '@/Components/base/Button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/Components/base/Card';
import { Field, FieldError, FieldLabel } from '@/Components/base/Field';
import { Input } from '@/Components/base/Input';
import { RadioGroup, RadioGroupItem } from '@/Components/base/RadioGroup';

import FormField from '../../BasicInfo/Parts/FormField';
import { ContactsForm, emptyReference, ReferenceRow } from '../types';

interface Props {
    data: ContactsForm;
    setData: <K extends keyof ContactsForm>(
        key: K,
        value: ContactsForm[K],
    ) => void;
    errors: Partial<Record<string, string>>;
    disabled: boolean;
}

export default function SupportReferences({
    data,
    setData,
    errors,
    disabled,
}: Props) {
    const add = () =>
        setData('references', [...data.references, emptyReference()]);

    const remove = (i: number) =>
        setData(
            'references',
            data.references.filter((_, idx) => idx !== i),
        );

    const update = (i: number, key: keyof ReferenceRow, value: string) => {
        const next = [...data.references];
        next[i] = { ...next[i], [key]: value };
        setData('references', next);
    };

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2 text-base">
                    <ShieldCheck className="size-4 text-muted-foreground" />
                    Referencias de respaldo
                </CardTitle>
                {!disabled && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={add}
                    >
                        <Plus className="size-4" /> Agregar referencia
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                {errors.references && (
                    <FieldError>{errors.references}</FieldError>
                )}

                {data.references.map((ref, i) => {
                    const isBank = ref.type === 'bank';
                    return (
                        <div
                            key={i}
                            className="relative space-y-4 rounded-lg border p-4"
                        >
                            {!disabled && data.references.length > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => remove(i)}
                                    aria-label={`Eliminar referencia ${i + 1}`}
                                    className="absolute right-2 top-2 text-muted-foreground hover:text-destructive"
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            )}

                            <FormField
                                id={`ref-${i}-type`}
                                label="Tipo de referencia"
                                required
                            >
                                <RadioGroup
                                    className="flex gap-6"
                                    value={ref.type}
                                    onValueChange={(v) => update(i, 'type', v)}
                                    disabled={disabled}
                                >
                                    <Field orientation="horizontal">
                                        <RadioGroupItem
                                            value="commercial"
                                            id={`ref-${i}-commercial`}
                                        />
                                        <FieldLabel
                                            htmlFor={`ref-${i}-commercial`}
                                            className="font-normal"
                                        >
                                            Comercial
                                        </FieldLabel>
                                    </Field>
                                    <Field orientation="horizontal">
                                        <RadioGroupItem
                                            value="bank"
                                            id={`ref-${i}-bank`}
                                        />
                                        <FieldLabel
                                            htmlFor={`ref-${i}-bank`}
                                            className="font-normal"
                                        >
                                            Bancaria
                                        </FieldLabel>
                                    </Field>
                                </RadioGroup>
                            </FormField>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField
                                    id={`ref-${i}-name`}
                                    label={
                                        isBank
                                            ? 'Nombre del banco'
                                            : 'Nombre de la empresa'
                                    }
                                    required
                                    error={errors[`references.${i}.name`]}
                                    className="sm:col-span-2"
                                >
                                    <Input
                                        id={`ref-${i}-name`}
                                        value={ref.name}
                                        onChange={(e) =>
                                            update(i, 'name', e.target.value)
                                        }
                                        disabled={disabled}
                                        aria-invalid={
                                            !!errors[`references.${i}.name`]
                                        }
                                        placeholder={
                                            isBank
                                                ? 'Ej. Banco de Bogotá'
                                                : 'Ej. Constructora ACME SAS'
                                        }
                                    />
                                </FormField>

                                <FormField
                                    id={`ref-${i}-contact_person`}
                                    label="Persona de contacto"
                                    error={
                                        errors[`references.${i}.contact_person`]
                                    }
                                >
                                    <Input
                                        id={`ref-${i}-contact_person`}
                                        value={ref.contact_person}
                                        onChange={(e) =>
                                            update(
                                                i,
                                                'contact_person',
                                                e.target.value,
                                            )
                                        }
                                        disabled={disabled}
                                        placeholder="Nombre de quien atiende"
                                    />
                                </FormField>

                                <FormField
                                    id={`ref-${i}-position`}
                                    label="Cargo"
                                    error={errors[`references.${i}.position`]}
                                >
                                    <Input
                                        id={`ref-${i}-position`}
                                        value={ref.position}
                                        onChange={(e) =>
                                            update(
                                                i,
                                                'position',
                                                e.target.value,
                                            )
                                        }
                                        disabled={disabled}
                                        placeholder="Ej. Ejecutivo de cuenta"
                                    />
                                </FormField>

                                <FormField
                                    id={`ref-${i}-phone`}
                                    label="Teléfono"
                                    error={errors[`references.${i}.phone`]}
                                    hint="Indica teléfono o email (al menos uno) para poder verificarla."
                                >
                                    <Input
                                        id={`ref-${i}-phone`}
                                        type="tel"
                                        value={ref.phone}
                                        onChange={(e) =>
                                            update(i, 'phone', e.target.value)
                                        }
                                        disabled={disabled}
                                        aria-invalid={
                                            !!errors[`references.${i}.phone`]
                                        }
                                        placeholder="3001234567"
                                    />
                                </FormField>

                                <FormField
                                    id={`ref-${i}-email`}
                                    label="Email"
                                    error={errors[`references.${i}.email`]}
                                >
                                    <Input
                                        id={`ref-${i}-email`}
                                        type="email"
                                        value={ref.email}
                                        onChange={(e) =>
                                            update(i, 'email', e.target.value)
                                        }
                                        disabled={disabled}
                                        aria-invalid={
                                            !!errors[`references.${i}.email`]
                                        }
                                        placeholder="contacto@referencia.com"
                                    />
                                </FormField>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
