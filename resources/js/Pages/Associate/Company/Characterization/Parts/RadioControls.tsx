import { Field, FieldLabel } from '@/Components/base/Field';
import { RadioGroup, RadioGroupItem } from '@/Components/base/RadioGroup';

// Composición local (no es base/): envuelve base/RadioGroup en los dos usos de la sección
// —sí/no y lista de opción única— para no repetir el markup. Ver plan 0008.

const slug = (s: string) => s.toLowerCase().replace(/\s+/g, '-');

interface YesNoProps {
    id: string;
    value: boolean | null;
    onChange: (v: boolean) => void;
    disabled?: boolean;
    invalid?: boolean;
    yesLabel?: string;
    noLabel?: string;
}

export function YesNo({
    id,
    value,
    onChange,
    disabled,
    invalid,
    yesLabel = 'Sí',
    noLabel = 'No',
}: YesNoProps) {
    return (
        <RadioGroup
            className="flex gap-6"
            value={value === null ? '' : value ? 'yes' : 'no'}
            onValueChange={(v) => onChange(v === 'yes')}
            disabled={disabled}
            aria-invalid={invalid || undefined}
        >
            <Field orientation="horizontal">
                <RadioGroupItem
                    value="yes"
                    id={`${id}-yes`}
                    aria-invalid={invalid || undefined}
                />
                <FieldLabel htmlFor={`${id}-yes`} className="font-normal">
                    {yesLabel}
                </FieldLabel>
            </Field>
            <Field orientation="horizontal">
                <RadioGroupItem
                    value="no"
                    id={`${id}-no`}
                    aria-invalid={invalid || undefined}
                />
                <FieldLabel htmlFor={`${id}-no`} className="font-normal">
                    {noLabel}
                </FieldLabel>
            </Field>
        </RadioGroup>
    );
}

interface OptionGroupProps {
    id: string;
    value: string;
    options: readonly string[];
    onChange: (v: string) => void;
    disabled?: boolean;
    invalid?: boolean;
}

export function OptionGroup({
    id,
    value,
    options,
    onChange,
    disabled,
    invalid,
}: OptionGroupProps) {
    return (
        <RadioGroup
            className="flex flex-wrap gap-x-6 gap-y-3"
            value={value || ''}
            onValueChange={onChange}
            disabled={disabled}
            aria-invalid={invalid || undefined}
        >
            {options.map((opt) => {
                const oid = `${id}-${slug(opt)}`;
                return (
                    <Field key={opt} orientation="horizontal">
                        <RadioGroupItem
                            value={opt}
                            id={oid}
                            aria-invalid={invalid || undefined}
                        />
                        <FieldLabel htmlFor={oid} className="font-normal">
                            {opt}
                        </FieldLabel>
                    </Field>
                );
            })}
        </RadioGroup>
    );
}
