import { Briefcase } from 'lucide-react';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/Components/base/Card';
import { Checkbox } from '@/Components/base/Checkbox';
import {
    Field,
    FieldDescription,
    FieldError,
    FieldLabel,
} from '@/Components/base/Field';
import { Input } from '@/Components/base/Input';

import FormField from '../../BasicInfo/Parts/FormField';
import { COMPANY_TYPES, ContactsForm } from '../types';

interface Props {
    data: ContactsForm;
    setData: <K extends keyof ContactsForm>(
        key: K,
        value: ContactsForm[K],
    ) => void;
    errors: Partial<Record<string, string>>;
    disabled: boolean;
}

export default function CommerceBilling({
    data,
    setData,
    errors,
    disabled,
}: Props) {
    const toggleType = (type: string) =>
        setData(
            'company_type',
            data.company_type.includes(type)
                ? data.company_type.filter((t) => t !== type)
                : [...data.company_type, type],
        );

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Briefcase className="size-4 text-muted-foreground" />
                    Información comercial y facturación
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                    <FormField
                        id="main_ciiu"
                        label="CIIU principal"
                        required
                        error={errors.main_ciiu}
                        hint="Código de actividad económica DIAN/DANE, ej. 0610."
                    >
                        <Input
                            id="main_ciiu"
                            value={data.main_ciiu}
                            onChange={(e) =>
                                setData('main_ciiu', e.target.value)
                            }
                            disabled={disabled}
                            aria-invalid={!!errors.main_ciiu}
                            placeholder="Ej. 0610"
                        />
                    </FormField>

                    <FormField
                        id="secondary_ciiu"
                        label="CIIU secundario"
                        error={errors.secondary_ciiu}
                        hint="Opcional."
                    >
                        <Input
                            id="secondary_ciiu"
                            value={data.secondary_ciiu}
                            onChange={(e) =>
                                setData('secondary_ciiu', e.target.value)
                            }
                            disabled={disabled}
                            aria-invalid={!!errors.secondary_ciiu}
                            placeholder="Ej. 0910"
                        />
                    </FormField>
                </div>

                <FormField
                    id="billing_email"
                    label="Email para facturación electrónica"
                    required
                    error={errors.billing_email}
                >
                    <Input
                        id="billing_email"
                        type="email"
                        value={data.billing_email}
                        onChange={(e) =>
                            setData('billing_email', e.target.value)
                        }
                        disabled={disabled}
                        aria-invalid={!!errors.billing_email}
                        placeholder="facturacion@empresa.com"
                    />
                </FormField>

                <Field data-invalid={errors.company_type ? 'true' : undefined}>
                    <FieldLabel>
                        Perfil de operación
                        <span className="text-destructive"> *</span>
                    </FieldLabel>
                    <FieldDescription>
                        Marca todas las que apliquen.
                    </FieldDescription>
                    <div className="flex flex-wrap gap-x-6 gap-y-3 pt-1">
                        {COMPANY_TYPES.map((type) => {
                            const id = `company-type-${type}`;
                            return (
                                <Field key={type} orientation="horizontal">
                                    <Checkbox
                                        id={id}
                                        checked={data.company_type.includes(
                                            type,
                                        )}
                                        onCheckedChange={() => toggleType(type)}
                                        disabled={disabled}
                                        aria-invalid={!!errors.company_type}
                                    />
                                    <FieldLabel
                                        htmlFor={id}
                                        className="font-normal"
                                    >
                                        {type}
                                    </FieldLabel>
                                </Field>
                            );
                        })}
                    </div>
                    <FieldError>{errors.company_type}</FieldError>
                </Field>
            </CardContent>
        </Card>
    );
}
