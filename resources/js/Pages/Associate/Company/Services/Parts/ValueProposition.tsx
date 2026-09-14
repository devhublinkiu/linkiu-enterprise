import { Target } from 'lucide-react';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/Components/base/Card';
import { Textarea } from '@/Components/base/Textarea';

import FormField from '../../BasicInfo/Parts/FormField';
import { ServicesForm } from '../types';

interface Props {
    data: ServicesForm;
    setData: <K extends keyof ServicesForm>(
        key: K,
        value: ServicesForm[K],
    ) => void;
    errors: Partial<Record<string, string>>;
    disabled: boolean;
}

export default function ValueProposition({
    data,
    setData,
    errors,
    disabled,
}: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Target className="size-4 text-muted-foreground" />
                    Propuesta de valor
                </CardTitle>
            </CardHeader>
            <CardContent>
                <FormField
                    id="svc-description"
                    label="¿Por qué elegir a tu empresa?"
                    required
                    error={errors.description}
                    hint="Describe proyectos clave, experiencia y diferenciadores. Es el texto que verá el público en el directorio."
                >
                    <Textarea
                        id="svc-description"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        disabled={disabled}
                        aria-invalid={!!errors.description}
                        placeholder="Nuestra organización destaca por…"
                        className="min-h-40"
                    />
                </FormField>
            </CardContent>
        </Card>
    );
}
