import { Users } from 'lucide-react';

import { Badge } from '@/Components/base/Badge';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/Components/base/Card';
import { Input } from '@/Components/base/Input';

import FormField from '../../BasicInfo/Parts/FormField';
import { CharacterizationForm, EMPLOYEE_CATS } from '../types';

interface Props {
    data: CharacterizationForm;
    setData: (
        key: keyof CharacterizationForm,
        value: string | number | boolean | null,
    ) => void;
    errors: Partial<Record<keyof CharacterizationForm, string>>;
    disabled: boolean;
}

export default function HumanTalent({
    data,
    setData,
    errors,
    disabled,
}: Props) {
    const total = EMPLOYEE_CATS.reduce(
        (sum, cat) => sum + (Number(data[cat.key]) || 0),
        0,
    );

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="size-4 text-muted-foreground" />
                    Talento humano
                </CardTitle>
                <Badge variant="secondary" className="gap-1.5">
                    Total
                    <span className="text-sm font-semibold text-foreground">
                        {total}
                    </span>
                </Badge>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                    {EMPLOYEE_CATS.map((cat) => (
                        <FormField
                            key={cat.key}
                            id={cat.key}
                            label={cat.label}
                            error={errors[cat.key]}
                        >
                            <Input
                                id={cat.key}
                                type="number"
                                min={0}
                                inputMode="numeric"
                                value={
                                    Number(data[cat.key]) > 0
                                        ? Number(data[cat.key])
                                        : ''
                                }
                                onChange={(e) => {
                                    const v = e.target.value;
                                    setData(
                                        cat.key,
                                        v === ''
                                            ? 0
                                            : Math.max(0, parseInt(v, 10) || 0),
                                    );
                                }}
                                disabled={disabled}
                                aria-invalid={!!errors[cat.key]}
                                placeholder="0"
                                className="text-center"
                            />
                        </FormField>
                    ))}
                </div>

                {Number(data.employees_other) > 0 && (
                    <FormField
                        id="employees_other_desc"
                        label='Descripción de "Otros" perfiles'
                        error={errors.employees_other_desc}
                    >
                        <Input
                            id="employees_other_desc"
                            value={data.employees_other_desc}
                            onChange={(e) =>
                                setData('employees_other_desc', e.target.value)
                            }
                            disabled={disabled}
                            aria-invalid={!!errors.employees_other_desc}
                            placeholder="Especifica los cargos adicionales…"
                        />
                    </FormField>
                )}
            </CardContent>
        </Card>
    );
}
