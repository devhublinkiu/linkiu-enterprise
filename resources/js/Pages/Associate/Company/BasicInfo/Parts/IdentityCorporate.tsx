import { Building2 } from 'lucide-react';

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

import { BasicInfoForm, LEGAL_STATUSES } from '../types';
import FormField from './FormField';

// Países más frecuentes para el origen de la empresa (Colombia primero). Lista curada:
// no necesitamos el catálogo ISO completo para este campo.
const COUNTRIES = [
    'Colombia',
    'Argentina',
    'Bolivia',
    'Brasil',
    'Canadá',
    'Chile',
    'Ecuador',
    'España',
    'Estados Unidos',
    'México',
    'Panamá',
    'Perú',
    'Reino Unido',
    'Uruguay',
    'Venezuela',
    'Otro',
];

interface Props {
    data: BasicInfoForm;
    setData: (key: keyof BasicInfoForm, value: string | number | null) => void;
    errors: Partial<Record<keyof BasicInfoForm, string>>;
    disabled: boolean;
}

export default function IdentityCorporate({
    data,
    setData,
    errors,
    disabled,
}: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Building2 className="size-4 text-muted-foreground" />
                    Identificación corporativa
                </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
                <FormField
                    id="company_name"
                    label="Razón social"
                    required
                    error={errors.company_name}
                >
                    <Input
                        id="company_name"
                        value={data.company_name}
                        onChange={(e) =>
                            setData('company_name', e.target.value)
                        }
                        disabled={disabled}
                        aria-invalid={!!errors.company_name}
                        placeholder="Ej. Minera Los Andes SAS"
                    />
                </FormField>

                <FormField id="initials" label="Sigla" error={errors.initials}>
                    <Input
                        id="initials"
                        value={data.initials}
                        onChange={(e) => setData('initials', e.target.value)}
                        disabled={disabled}
                        aria-invalid={!!errors.initials}
                        placeholder="Ej. MLA"
                    />
                </FormField>

                <FormField
                    id="nit"
                    label="NIT"
                    required
                    error={errors.nit}
                    hint="Incluye el dígito de verificación. Ej. 900123456-7"
                >
                    <Input
                        id="nit"
                        value={data.nit}
                        onChange={(e) => setData('nit', e.target.value)}
                        disabled={disabled}
                        aria-invalid={!!errors.nit}
                        placeholder="900123456-7"
                    />
                </FormField>

                <FormField
                    id="constitution_date"
                    label="Fecha de constitución"
                    error={errors.constitution_date}
                >
                    <Input
                        id="constitution_date"
                        type="date"
                        value={data.constitution_date}
                        onChange={(e) =>
                            setData('constitution_date', e.target.value)
                        }
                        disabled={disabled}
                        aria-invalid={!!errors.constitution_date}
                    />
                </FormField>

                <FormField
                    id="legal_status"
                    label="Tipo de sociedad"
                    required
                    error={errors.legal_status}
                >
                    <Select
                        value={data.legal_status}
                        onValueChange={(v) => {
                            setData('legal_status', v);
                            if (v !== 'Otro') setData('legal_status_other', '');
                        }}
                        disabled={disabled}
                    >
                        <SelectTrigger
                            id="legal_status"
                            className="w-full"
                            aria-invalid={!!errors.legal_status}
                        >
                            <SelectValue placeholder="Selecciona una opción" />
                        </SelectTrigger>
                        <SelectContent>
                            {LEGAL_STATUSES.map((o) => (
                                <SelectItem key={o} value={o}>
                                    {o}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FormField>

                <FormField
                    id="country_origin"
                    label="País de origen"
                    required
                    error={errors.country_origin}
                >
                    <Select
                        value={data.country_origin}
                        onValueChange={(v) => setData('country_origin', v)}
                        disabled={disabled}
                    >
                        <SelectTrigger
                            id="country_origin"
                            className="w-full"
                            aria-invalid={!!errors.country_origin}
                        >
                            <SelectValue placeholder="Selecciona un país" />
                        </SelectTrigger>
                        <SelectContent>
                            {COUNTRIES.map((c) => (
                                <SelectItem key={c} value={c}>
                                    {c}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FormField>

                {data.legal_status === 'Otro' && (
                    <FormField
                        id="legal_status_other"
                        label="¿Cuál tipo de sociedad?"
                        required
                        error={errors.legal_status_other}
                        className="sm:col-span-2"
                    >
                        <Input
                            id="legal_status_other"
                            value={data.legal_status_other}
                            onChange={(e) =>
                                setData('legal_status_other', e.target.value)
                            }
                            disabled={disabled}
                            aria-invalid={!!errors.legal_status_other}
                            placeholder="Especifica el tipo de sociedad"
                        />
                    </FormField>
                )}
            </CardContent>
        </Card>
    );
}
