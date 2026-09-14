import { Plus, Trash2, Users } from 'lucide-react';

import { Button } from '@/Components/base/Button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/Components/base/Card';
import { FieldError } from '@/Components/base/Field';
import { Input } from '@/Components/base/Input';

import FormField from '../../BasicInfo/Parts/FormField';
import { ContactRow, ContactsForm, emptyContact } from '../types';

interface Props {
    data: ContactsForm;
    setData: <K extends keyof ContactsForm>(
        key: K,
        value: ContactsForm[K],
    ) => void;
    errors: Partial<Record<string, string>>;
    disabled: boolean;
}

// Todos los campos del contacto son obligatorios (decisión del plan 0009).
const FIELDS = [
    {
        key: 'name',
        label: 'Nombre',
        placeholder: 'Ej. Juan Pérez',
        type: 'text',
    },
    {
        key: 'position',
        label: 'Cargo',
        placeholder: 'Ej. Gerente general',
        type: 'text',
    },
    { key: 'area', label: 'Área', placeholder: 'Ej. Comercial', type: 'text' },
    {
        key: 'email',
        label: 'Email',
        placeholder: 'nombre@empresa.com',
        type: 'email',
    },
    { key: 'phone', label: 'Teléfono', placeholder: '3001234567', type: 'tel' },
] as const satisfies ReadonlyArray<{
    key: keyof ContactRow;
    label: string;
    placeholder: string;
    type: string;
}>;

export default function Directory({ data, setData, errors, disabled }: Props) {
    const add = () => setData('contacts', [...data.contacts, emptyContact()]);

    const remove = (i: number) =>
        setData(
            'contacts',
            data.contacts.filter((_, idx) => idx !== i),
        );

    const update = (i: number, key: keyof ContactRow, value: string) => {
        const next = [...data.contacts];
        next[i] = { ...next[i], [key]: value };
        setData('contacts', next);
    };

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="size-4 text-muted-foreground" />
                    Directorio de contactos
                </CardTitle>
                {!disabled && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={add}
                    >
                        <Plus className="size-4" /> Agregar contacto
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                {errors.contacts && <FieldError>{errors.contacts}</FieldError>}

                {data.contacts.map((contact, i) => (
                    <div
                        key={i}
                        className="relative space-y-4 rounded-lg border p-4"
                    >
                        {!disabled && data.contacts.length > 1 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => remove(i)}
                                aria-label={`Eliminar contacto ${i + 1}`}
                                className="absolute right-2 top-2 text-muted-foreground hover:text-destructive"
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        )}

                        <div className="grid gap-4 pr-8 sm:grid-cols-2">
                            {FIELDS.map((f) => {
                                const id = `contact-${i}-${f.key}`;
                                return (
                                    <FormField
                                        key={f.key}
                                        id={id}
                                        label={f.label}
                                        required
                                        error={errors[`contacts.${i}.${f.key}`]}
                                    >
                                        <Input
                                            id={id}
                                            type={f.type}
                                            value={contact[f.key]}
                                            onChange={(e) =>
                                                update(i, f.key, e.target.value)
                                            }
                                            disabled={disabled}
                                            aria-invalid={
                                                !!errors[
                                                    `contacts.${i}.${f.key}`
                                                ]
                                            }
                                            placeholder={f.placeholder}
                                        />
                                    </FormField>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
