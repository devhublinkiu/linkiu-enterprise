import { Building2, CheckCircle2 } from 'lucide-react';

import { Badge } from '@/Components/base/Badge';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/Components/base/Card';
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldLabel,
    FieldTitle,
} from '@/Components/base/Field';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
    InputGroupText,
} from '@/Components/base/InputGroup';
import { RadioGroup, RadioGroupItem } from '@/Components/base/RadioGroup';

import FormField from '../../BasicInfo/Parts/FormField';
import { CharacterizationForm, CLASSIFICATIONS } from '../types';

interface Props {
    data: CharacterizationForm;
    setData: (
        key: keyof CharacterizationForm,
        value: string | number | boolean | null,
    ) => void;
    errors: Partial<Record<keyof CharacterizationForm, string>>;
    disabled: boolean;
}

const INCOME_FIELDS = [
    { key: 'public_income_pct', label: 'Sector público' },
    { key: 'private_income_pct', label: 'Sector privado' },
] as const;

export default function ClassificationIncome({
    data,
    setData,
    errors,
    disabled,
}: Props) {
    const sum =
        (Number(data.public_income_pct) || 0) +
        (Number(data.private_income_pct) || 0);
    const sumOk = sum === 100;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Building2 className="size-4 text-muted-foreground" />
                    Clasificación e ingresos
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
                <FormField
                    id="company_classification"
                    label="Tamaño de la organización"
                    required
                    error={errors.company_classification}
                >
                    <RadioGroup
                        className="gap-3 sm:grid-cols-2"
                        value={data.company_classification || ''}
                        onValueChange={(v) =>
                            setData('company_classification', v)
                        }
                        disabled={disabled}
                        aria-invalid={!!errors.company_classification}
                    >
                        {CLASSIFICATIONS.map((c) => {
                            const id = `classification-${c.value}`;
                            return (
                                <FieldLabel key={c.value} htmlFor={id}>
                                    <Field
                                        orientation="horizontal"
                                        className="!items-center gap-4 !p-4"
                                    >
                                        <FieldContent>
                                            <FieldTitle>{c.title}</FieldTitle>
                                            <FieldDescription>
                                                {c.desc}
                                            </FieldDescription>
                                        </FieldContent>
                                        <RadioGroupItem
                                            value={c.value}
                                            id={id}
                                            aria-invalid={
                                                !!errors.company_classification
                                            }
                                        />
                                    </Field>
                                </FieldLabel>
                            );
                        })}
                    </RadioGroup>
                </FormField>

                <div className="space-y-4 border-t pt-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <FieldLabel className="font-normal">
                            Distribución de ingresos anual
                        </FieldLabel>
                        <div aria-live="polite">
                            <Badge
                                variant={sumOk ? 'secondary' : 'destructive'}
                                className="gap-1.5"
                            >
                                {sumOk && <CheckCircle2 className="size-3.5" />}
                                Suma actual: {sum}%
                                {!sumOk && ' · debe ser 100%'}
                            </Badge>
                        </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                        {INCOME_FIELDS.map((f) => (
                            <FormField
                                key={f.key}
                                id={f.key}
                                label={f.label}
                                required
                                error={errors[f.key]}
                            >
                                <InputGroup>
                                    <InputGroupInput
                                        id={f.key}
                                        type="number"
                                        min={0}
                                        max={100}
                                        inputMode="numeric"
                                        value={
                                            Number(data[f.key]) > 0
                                                ? Number(data[f.key])
                                                : ''
                                        }
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            setData(
                                                f.key,
                                                v === ''
                                                    ? 0
                                                    : Math.min(
                                                          100,
                                                          Math.max(
                                                              0,
                                                              parseInt(v, 10) ||
                                                                  0,
                                                          ),
                                                      ),
                                            );
                                        }}
                                        disabled={disabled}
                                        aria-invalid={!!errors[f.key]}
                                        placeholder="0"
                                    />
                                    <InputGroupAddon align="inline-end">
                                        <InputGroupText>%</InputGroupText>
                                    </InputGroupAddon>
                                </InputGroup>
                            </FormField>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
