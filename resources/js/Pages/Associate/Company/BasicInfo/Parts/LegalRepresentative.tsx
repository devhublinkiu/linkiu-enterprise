import { UserRound } from 'lucide-react';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/Components/base/Card';
import { Input } from '@/Components/base/Input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/base/Select';

import { BasicInfoForm, DOC_TYPES } from '../types';
import FormField from './FormField';

interface Props {
    data: BasicInfoForm;
    setData: (key: keyof BasicInfoForm, value: string | number | null) => void;
    errors: Partial<Record<keyof BasicInfoForm, string>>;
    disabled: boolean;
}

export default function LegalRepresentative({
    data,
    setData,
    errors,
    disabled,
}: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <UserRound className="size-4 text-muted-foreground" />
                    Representante legal
                </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
                <FormField
                    id="rep_name"
                    label="Nombre completo"
                    required
                    error={errors.rep_name}
                    className="sm:col-span-2"
                >
                    <Input
                        id="rep_name"
                        value={data.rep_name}
                        onChange={(e) => setData('rep_name', e.target.value)}
                        disabled={disabled}
                        aria-invalid={!!errors.rep_name}
                        placeholder="Ej. Ana Pérez"
                    />
                </FormField>

                <FormField
                    id="rep_position"
                    label="Cargo"
                    required
                    error={errors.rep_position}
                >
                    <Input
                        id="rep_position"
                        value={data.rep_position}
                        onChange={(e) =>
                            setData('rep_position', e.target.value)
                        }
                        disabled={disabled}
                        aria-invalid={!!errors.rep_position}
                        placeholder="Ej. Gerente General"
                    />
                </FormField>

                <FormField
                    id="rep_doc_type"
                    label="Tipo de documento"
                    required
                    error={errors.rep_doc_type}
                >
                    <Select
                        value={data.rep_doc_type}
                        onValueChange={(v) => setData('rep_doc_type', v)}
                        disabled={disabled}
                    >
                        <SelectTrigger
                            id="rep_doc_type"
                            className="w-full"
                            aria-invalid={!!errors.rep_doc_type}
                        >
                            <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                        <SelectContent>
                            {DOC_TYPES.map((d) => (
                                <SelectItem key={d.value} value={d.value}>
                                    {d.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FormField>

                <FormField
                    id="rep_doc"
                    label="Número de documento"
                    required
                    error={errors.rep_doc}
                >
                    <Input
                        id="rep_doc"
                        value={data.rep_doc}
                        onChange={(e) => setData('rep_doc', e.target.value)}
                        disabled={disabled}
                        aria-invalid={!!errors.rep_doc}
                        placeholder="Ej. 1234567890"
                    />
                </FormField>
            </CardContent>
        </Card>
    );
}
