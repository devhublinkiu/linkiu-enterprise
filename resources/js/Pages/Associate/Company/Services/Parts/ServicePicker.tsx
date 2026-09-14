import { Layers, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge } from '@/Components/base/Badge';
import { Button } from '@/Components/base/Button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/Components/base/Card';
import { Checkbox } from '@/Components/base/Checkbox';
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldLabel,
    FieldTitle,
} from '@/Components/base/Field';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from '@/Components/base/InputGroup';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/base/Select';

import { CategoryItem, ServiceItem } from '../types';

interface Props {
    selectedIds: number[];
    toggle: (id: number) => void;
    clearAll: () => void;
    availableServices: ServiceItem[];
    serviceCategories: CategoryItem[];
    disabled: boolean;
    limit: number; // 0 = ilimitado
    error?: string;
}

export default function ServicePicker({
    selectedIds,
    toggle,
    clearAll,
    availableServices,
    serviceCategories,
    disabled,
    limit,
    error,
}: Props) {
    const [term, setTerm] = useState('');
    const [category, setCategory] = useState<string>('all');

    const atLimit = limit > 0 && selectedIds.length >= limit;
    // Catálogo grande: no se lista completo. Se muestra solo al buscar o filtrar por categoría.
    const hasFilter = term.trim() !== '' || category !== 'all';

    const selected = useMemo(
        () => availableServices.filter((s) => selectedIds.includes(s.id)),
        [availableServices, selectedIds],
    );

    const shown = useMemo(
        () =>
            availableServices.filter((s) => {
                const okSearch = s.name
                    .toLowerCase()
                    .includes(term.toLowerCase());
                const okCat =
                    category === 'all' || String(s.category_id) === category;
                return okSearch && okCat;
            }),
        [availableServices, term, category],
    );

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Layers className="size-4 text-muted-foreground" />
                    Portafolio de servicios
                </CardTitle>
                <Badge variant={error ? 'destructive' : 'secondary'}>
                    {selectedIds.length}
                    {limit > 0 ? ` / ${limit}` : ''} elegidos
                </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
                {error && <FieldError>{error}</FieldError>}

                {/* Selección actual */}
                {selected.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 rounded-lg border p-3">
                        {selected.map((s) => (
                            <Badge
                                key={s.id}
                                variant="secondary"
                                className="gap-1"
                            >
                                {s.name}
                                {!disabled && (
                                    <button
                                        type="button"
                                        onClick={() => toggle(s.id)}
                                        aria-label={`Quitar ${s.name}`}
                                        className="text-muted-foreground hover:text-destructive"
                                    >
                                        <X className="size-3" />
                                    </button>
                                )}
                            </Badge>
                        ))}
                        {!disabled && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="xs"
                                onClick={clearAll}
                                className="ml-auto"
                            >
                                Limpiar
                            </Button>
                        )}
                    </div>
                )}

                {/* Filtros */}
                <div className="flex flex-wrap gap-3">
                    <InputGroup className="h-9 max-w-xs flex-1">
                        <InputGroupAddon>
                            <Search />
                        </InputGroupAddon>
                        <InputGroupInput
                            value={term}
                            onChange={(e) => setTerm(e.target.value)}
                            placeholder="Buscar servicio…"
                            disabled={disabled}
                        />
                    </InputGroup>
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="w-52">
                            <SelectValue placeholder="Todas las categorías" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                Todas las categorías
                            </SelectItem>
                            {serviceCategories.map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>
                                    {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {atLimit && (
                    <p
                        className="text-sm text-muted-foreground"
                        aria-live="polite"
                    >
                        Alcanzaste el máximo de tu plan ({limit}). Quita uno
                        para elegir otro.
                    </p>
                )}

                {/* Grid de servicios — solo al filtrar, y con alto acotado (catálogo grande) */}
                {!hasFilter ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                        Busca por nombre o elige una categoría para ver los
                        servicios del catálogo.
                    </p>
                ) : shown.length > 0 ? (
                    <div className="grid max-h-96 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
                        {shown.map((s) => {
                            const checked = selectedIds.includes(s.id);
                            const id = `svc-${s.id}`;
                            return (
                                <FieldLabel key={s.id} htmlFor={id}>
                                    <Field
                                        orientation="horizontal"
                                        className="!items-center gap-3 !p-3"
                                    >
                                        <Checkbox
                                            id={id}
                                            checked={checked}
                                            onCheckedChange={() => toggle(s.id)}
                                            disabled={
                                                disabled ||
                                                (!checked && atLimit)
                                            }
                                        />
                                        <FieldContent>
                                            <FieldTitle>{s.name}</FieldTitle>
                                            {category === 'all' &&
                                                s.category?.name && (
                                                    <FieldDescription>
                                                        {s.category.name}
                                                    </FieldDescription>
                                                )}
                                        </FieldContent>
                                    </Field>
                                </FieldLabel>
                            );
                        })}
                    </div>
                ) : (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                        No se encontraron servicios con esos filtros.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
