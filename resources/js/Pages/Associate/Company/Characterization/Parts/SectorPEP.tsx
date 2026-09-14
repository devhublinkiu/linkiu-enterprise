import { Target, UserRound } from 'lucide-react';

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

import FormField from '../../BasicInfo/Parts/FormField';
import { DOC_TYPES } from '../../BasicInfo/types';
import { CharacterizationForm, HYDROCARBON_LEVELS } from '../types';
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

export default function SectorPEP({ data, setData, errors, disabled }: Props) {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Hidrocarburos */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Target className="size-4 text-muted-foreground" />
                        Hidrocarburos
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    <FormField
                        id="hydrocarbons_participation"
                        label="¿Participa en licitaciones del sector?"
                        required
                        error={errors.hydrocarbons_participation}
                    >
                        <YesNo
                            id="hydrocarbons_participation"
                            value={data.hydrocarbons_participation}
                            onChange={(v) => {
                                setData('hydrocarbons_participation', v);
                                if (!v) setData('hydrocarbons_level', '');
                            }}
                            disabled={disabled}
                            invalid={!!errors.hydrocarbons_participation}
                            yesLabel="Sí participa"
                            noLabel="No participa"
                        />
                    </FormField>

                    {data.hydrocarbons_participation === true && (
                        <FormField
                            id="hydrocarbons_level"
                            label="Nivel de alcance"
                            required
                            error={errors.hydrocarbons_level}
                        >
                            <OptionGroup
                                id="hydrocarbons_level"
                                value={data.hydrocarbons_level}
                                options={HYDROCARBON_LEVELS}
                                onChange={(v) =>
                                    setData('hydrocarbons_level', v)
                                }
                                disabled={disabled}
                                invalid={!!errors.hydrocarbons_level}
                            />
                        </FormField>
                    )}
                </CardContent>
            </Card>

            {/* PEP */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <UserRound className="size-4 text-muted-foreground" />
                        Persona políticamente expuesta (PEP)
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    <FormField
                        id="pep_declaration"
                        label="¿Hay una persona PEP en la organización?"
                        required
                        error={errors.pep_declaration}
                    >
                        <YesNo
                            id="pep_declaration"
                            value={data.pep_declaration}
                            onChange={(v) => {
                                setData('pep_declaration', v);
                                if (!v) {
                                    setData('pep_name', '');
                                    setData('pep_doc_type', '');
                                    setData('pep_entity', '');
                                }
                            }}
                            disabled={disabled}
                            invalid={!!errors.pep_declaration}
                            yesLabel="Sí declara"
                            noLabel="No declara"
                        />
                    </FormField>

                    {data.pep_declaration === true && (
                        <div className="grid gap-5 sm:grid-cols-2">
                            <FormField
                                id="pep_name"
                                label="Nombre del PEP"
                                required
                                error={errors.pep_name}
                                className="sm:col-span-2"
                            >
                                <Input
                                    id="pep_name"
                                    value={data.pep_name}
                                    onChange={(e) =>
                                        setData('pep_name', e.target.value)
                                    }
                                    disabled={disabled}
                                    aria-invalid={!!errors.pep_name}
                                    placeholder="Nombre completo"
                                />
                            </FormField>

                            <FormField
                                id="pep_doc_type"
                                label="Tipo de documento"
                                required
                                error={errors.pep_doc_type}
                            >
                                <Select
                                    value={data.pep_doc_type}
                                    onValueChange={(v) =>
                                        setData('pep_doc_type', v)
                                    }
                                    disabled={disabled}
                                >
                                    <SelectTrigger
                                        id="pep_doc_type"
                                        className="w-full"
                                        aria-invalid={!!errors.pep_doc_type}
                                    >
                                        <SelectValue placeholder="Selecciona" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {DOC_TYPES.map((d) => (
                                            <SelectItem
                                                key={d.value}
                                                value={d.value}
                                            >
                                                {d.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormField>

                            <FormField
                                id="pep_entity"
                                label="Entidad vinculada"
                                required
                                error={errors.pep_entity}
                            >
                                <Input
                                    id="pep_entity"
                                    value={data.pep_entity}
                                    onChange={(e) =>
                                        setData('pep_entity', e.target.value)
                                    }
                                    disabled={disabled}
                                    aria-invalid={!!errors.pep_entity}
                                    placeholder="Ej. Alcaldía, Congreso…"
                                />
                            </FormField>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
