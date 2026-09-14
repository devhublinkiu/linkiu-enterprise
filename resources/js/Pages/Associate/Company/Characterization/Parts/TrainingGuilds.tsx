import { GraduationCap } from 'lucide-react';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/Components/base/Card';
import { Textarea } from '@/Components/base/Textarea';

import FormField from '../../BasicInfo/Parts/FormField';
import {
    CAPACITATION_LEVELS,
    CharacterizationForm,
    NO_PLAN_REASONS,
} from '../types';
import { OptionGroup, YesNo } from './RadioControls';

interface Props {
    data: CharacterizationForm;
    setData: (
        key: keyof CharacterizationForm,
        value: string | number | boolean | null,
    ) => void;
    errors: Partial<Record<keyof CharacterizationForm, string>>;
    disabled: boolean;
}

export default function TrainingGuilds({
    data,
    setData,
    errors,
    disabled,
}: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <GraduationCap className="size-4 text-muted-foreground" />
                    Capacitación y gremios
                </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-8 md:grid-cols-2">
                <div className="space-y-5">
                    <FormField
                        id="capacitation_plan"
                        label="¿Cuenta con un plan de capacitación?"
                        required
                        error={errors.capacitation_plan}
                    >
                        <YesNo
                            id="capacitation_plan"
                            value={data.capacitation_plan}
                            onChange={(v) => {
                                setData('capacitation_plan', v);
                                setData(
                                    'capacitation_level',
                                    v ? data.capacitation_level : '',
                                );
                                setData(
                                    'capacitation_no_reason',
                                    v ? '' : data.capacitation_no_reason,
                                );
                            }}
                            disabled={disabled}
                            invalid={!!errors.capacitation_plan}
                            yesLabel="Sí tiene plan"
                            noLabel="No tiene plan"
                        />
                    </FormField>

                    {data.capacitation_plan === true && (
                        <FormField
                            id="capacitation_level"
                            label="Nivel que prioriza"
                            required
                            error={errors.capacitation_level}
                        >
                            <OptionGroup
                                id="capacitation_level"
                                value={data.capacitation_level}
                                options={CAPACITATION_LEVELS}
                                onChange={(v) =>
                                    setData('capacitation_level', v)
                                }
                                disabled={disabled}
                                invalid={!!errors.capacitation_level}
                            />
                        </FormField>
                    )}

                    {data.capacitation_plan === false && (
                        <FormField
                            id="capacitation_no_reason"
                            label="Principal motivo"
                            required
                            error={errors.capacitation_no_reason}
                        >
                            <OptionGroup
                                id="capacitation_no_reason"
                                value={data.capacitation_no_reason}
                                options={NO_PLAN_REASONS}
                                onChange={(v) =>
                                    setData('capacitation_no_reason', v)
                                }
                                disabled={disabled}
                                invalid={!!errors.capacitation_no_reason}
                            />
                        </FormField>
                    )}
                </div>

                <FormField
                    id="other_guilds"
                    label="Afiliación a otros gremios o asociaciones"
                    error={errors.other_guilds}
                    hint="Menciona ANDI, Camacol, ACOPI, etc."
                >
                    <Textarea
                        id="other_guilds"
                        value={data.other_guilds}
                        onChange={(e) =>
                            setData('other_guilds', e.target.value)
                        }
                        disabled={disabled}
                        aria-invalid={!!errors.other_guilds}
                        placeholder="Describe brevemente…"
                        className="min-h-[8rem]"
                    />
                </FormField>
            </CardContent>
        </Card>
    );
}
