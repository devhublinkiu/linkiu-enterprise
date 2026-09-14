import { Target } from 'lucide-react';

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
import { DocumentationForm, INTERESTS } from '../types';

interface Props {
    data: DocumentationForm;
    setData: <K extends keyof DocumentationForm>(
        key: K,
        value: DocumentationForm[K],
    ) => void;
    errors: Partial<Record<string, string>>;
    disabled: boolean;
}

export default function MembershipInterest({
    data,
    setData,
    errors,
    disabled,
}: Props) {
    const toggle = (interest: string) => {
        const next = data.membership_interest.includes(interest)
            ? data.membership_interest.filter((i) => i !== interest)
            : [...data.membership_interest, interest];
        setData('membership_interest', next);
        if (interest === 'Otro' && !next.includes('Otro')) {
            setData('membership_interest_other', '');
        }
    };

    const hasOtro = data.membership_interest.includes('Otro');

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Target className="size-4 text-muted-foreground" />
                    Interés de afiliación
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <Field
                    data-invalid={
                        errors.membership_interest ? 'true' : undefined
                    }
                >
                    <FieldLabel>
                        ¿Qué buscas en CAMEP?
                        <span className="text-destructive"> *</span>
                    </FieldLabel>
                    <FieldDescription>
                        Marca todas las que apliquen.
                    </FieldDescription>
                    <div className="flex flex-wrap gap-x-6 gap-y-3 pt-1">
                        {INTERESTS.map((interest) => {
                            const id = `interest-${interest}`;
                            return (
                                <Field key={interest} orientation="horizontal">
                                    <Checkbox
                                        id={id}
                                        checked={data.membership_interest.includes(
                                            interest,
                                        )}
                                        onCheckedChange={() => toggle(interest)}
                                        disabled={disabled}
                                        aria-invalid={
                                            !!errors.membership_interest
                                        }
                                    />
                                    <FieldLabel
                                        htmlFor={id}
                                        className="font-normal"
                                    >
                                        {interest}
                                    </FieldLabel>
                                </Field>
                            );
                        })}
                    </div>
                    <FieldError>{errors.membership_interest}</FieldError>
                </Field>

                {hasOtro && (
                    <FormField
                        id="membership_interest_other"
                        label="¿Cuál?"
                        error={errors.membership_interest_other}
                    >
                        <Input
                            id="membership_interest_other"
                            value={data.membership_interest_other}
                            onChange={(e) =>
                                setData(
                                    'membership_interest_other',
                                    e.target.value,
                                )
                            }
                            disabled={disabled}
                            aria-invalid={!!errors.membership_interest_other}
                            placeholder="Describe tu interés"
                            maxLength={500}
                        />
                    </FormField>
                )}
            </CardContent>
        </Card>
    );
}
