import { MapPin } from 'lucide-react';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/Components/base/Card';
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '@/Components/base/Combobox';
import { Input } from '@/Components/base/Input';

import { BasicInfoForm, LocationOption } from '../types';
import FormField from './FormField';

interface Props {
    data: BasicInfoForm;
    setData: (key: keyof BasicInfoForm, value: string | number | null) => void;
    errors: Partial<Record<keyof BasicInfoForm, string>>;
    disabled: boolean;
    departments: LocationOption[];
    cities: LocationOption[];
    loadingCities: boolean;
    onDepartment: (name: string) => void;
    onCity: (name: string) => void;
}

export default function LocationContact({
    data,
    setData,
    errors,
    disabled,
    departments,
    cities,
    loadingCities,
    onDepartment,
    onCity,
}: Props) {
    const noDepartment = !data.department;
    const departmentNames = departments.map((d) => d.name);
    const cityNames = cities.map((c) => c.name);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <MapPin className="size-4 text-muted-foreground" />
                    Ubicación y contacto
                </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
                <FormField
                    id="department"
                    label="Departamento"
                    required
                    error={errors.department}
                >
                    <Combobox
                        items={departmentNames}
                        value={data.department || null}
                        onValueChange={(v: string | null) =>
                            onDepartment(v ?? '')
                        }
                        disabled={disabled}
                    >
                        <ComboboxInput
                            id="department"
                            className="w-full"
                            placeholder="Busca un departamento"
                            aria-invalid={!!errors.department}
                            disabled={disabled}
                        />
                        <ComboboxContent>
                            <ComboboxEmpty>Sin resultados.</ComboboxEmpty>
                            <ComboboxList>
                                {(name: string) => (
                                    <ComboboxItem key={name} value={name}>
                                        {name}
                                    </ComboboxItem>
                                )}
                            </ComboboxList>
                        </ComboboxContent>
                    </Combobox>
                </FormField>

                <FormField
                    id="city"
                    label="Ciudad / Municipio"
                    required
                    error={errors.city}
                    hint={
                        noDepartment
                            ? 'Elige primero un departamento.'
                            : undefined
                    }
                >
                    <Combobox
                        items={cityNames}
                        value={data.city || null}
                        onValueChange={(v: string | null) => onCity(v ?? '')}
                        disabled={disabled || noDepartment || loadingCities}
                    >
                        <ComboboxInput
                            id="city"
                            className="w-full"
                            placeholder={
                                loadingCities
                                    ? 'Cargando ciudades…'
                                    : 'Busca una ciudad'
                            }
                            aria-invalid={!!errors.city}
                            disabled={disabled || noDepartment || loadingCities}
                        />
                        <ComboboxContent>
                            <ComboboxEmpty>Sin resultados.</ComboboxEmpty>
                            <ComboboxList>
                                {(name: string) => (
                                    <ComboboxItem key={name} value={name}>
                                        {name}
                                    </ComboboxItem>
                                )}
                            </ComboboxList>
                        </ComboboxContent>
                    </Combobox>
                </FormField>

                <FormField
                    id="address"
                    label="Dirección"
                    required
                    error={errors.address}
                    className="sm:col-span-2"
                >
                    <Input
                        id="address"
                        value={data.address}
                        onChange={(e) => setData('address', e.target.value)}
                        disabled={disabled}
                        aria-invalid={!!errors.address}
                        placeholder="Ej. Calle 10 # 20-30, Oficina 401"
                    />
                </FormField>

                <FormField
                    id="phone"
                    label="Teléfono"
                    required
                    error={errors.phone}
                >
                    <Input
                        id="phone"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        disabled={disabled}
                        aria-invalid={!!errors.phone}
                        placeholder="Ej. 3001234567"
                    />
                </FormField>

                <FormField
                    id="website"
                    label="Sitio web"
                    error={errors.website}
                >
                    <Input
                        id="website"
                        value={data.website}
                        onChange={(e) => setData('website', e.target.value)}
                        disabled={disabled}
                        aria-invalid={!!errors.website}
                        placeholder="https://tuempresa.com"
                    />
                </FormField>
            </CardContent>
        </Card>
    );
}
