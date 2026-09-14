import { useForm } from '@inertiajs/react';
import { FolderPlus } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/Components/base/Button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/base/Dialog';
import { Field, FieldContent, FieldLabel } from '@/Components/base/Field';
import { Input } from '@/Components/base/Input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/base/Select';
import { Switch } from '@/Components/base/Switch';

import FormField from '../../../Associate/Company/BasicInfo/Parts/FormField';
import { Category, Service } from '../types';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    service: Service | null;
    categories: Category[];
}

export default function ServiceDialog({
    open,
    onOpenChange,
    service,
    categories,
}: Props) {
    const isEdit = !!service;
    const [newCategory, setNewCategory] = useState(false);
    const { data, setData, post, patch, processing, errors, clearErrors } =
        useForm({
            name: '',
            category_id: '',
            new_category_name: '',
            is_active: true as boolean,
        });

    // Sincroniza el form al abrir (crear vacío / editar con los datos del servicio).
    useEffect(() => {
        if (!open) return;
        clearErrors();
        setNewCategory(false);
        setData({
            name: service?.name ?? '',
            category_id: service ? String(service.category_id) : '',
            new_category_name: '',
            is_active: service ? service.is_active : true,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, service]);

    const submit = () => {
        if (isEdit && service) {
            patch(route('admin.services.update', service.id), {
                preserveScroll: true,
                onSuccess: () => onOpenChange(false),
            });
        } else {
            post(route('admin.services.store'), {
                preserveScroll: true,
                onSuccess: () => onOpenChange(false),
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? 'Editar servicio' : 'Nuevo servicio'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-5">
                    <FormField
                        id="svc-name"
                        label="Nombre del servicio"
                        required
                        error={errors.name}
                    >
                        <Input
                            id="svc-name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            aria-invalid={!!errors.name}
                            placeholder="Ej. Consultoría ambiental"
                            autoFocus
                        />
                    </FormField>

                    {/* Categoría: elegir existente o (solo al crear) crear nueva */}
                    {newCategory && !isEdit ? (
                        <FormField
                            id="svc-new-cat"
                            label="Nueva categoría"
                            required
                            error={errors.new_category_name}
                        >
                            <Input
                                id="svc-new-cat"
                                value={data.new_category_name}
                                onChange={(e) =>
                                    setData('new_category_name', e.target.value)
                                }
                                aria-invalid={!!errors.new_category_name}
                                placeholder="Nombre de la categoría"
                            />
                        </FormField>
                    ) : (
                        <FormField
                            id="svc-cat"
                            label="Categoría"
                            required
                            error={errors.category_id}
                        >
                            <Select
                                value={data.category_id}
                                onValueChange={(v) => setData('category_id', v)}
                            >
                                <SelectTrigger
                                    id="svc-cat"
                                    className="w-full"
                                    aria-invalid={!!errors.category_id}
                                >
                                    <SelectValue placeholder="Selecciona una categoría" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((c) => (
                                        <SelectItem
                                            key={c.id}
                                            value={String(c.id)}
                                        >
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormField>
                    )}

                    {!isEdit && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setNewCategory(!newCategory)}
                        >
                            <FolderPlus className="size-4" />
                            {newCategory
                                ? 'Elegir categoría existente'
                                : 'Crear categoría nueva'}
                        </Button>
                    )}

                    <Field orientation="horizontal">
                        <FieldContent>
                            <FieldLabel htmlFor="svc-active">
                                Servicio activo
                            </FieldLabel>
                        </FieldContent>
                        <Switch
                            id="svc-active"
                            checked={data.is_active}
                            onCheckedChange={(v) => setData('is_active', v)}
                        />
                    </Field>
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">
                            Cancelar
                        </Button>
                    </DialogClose>
                    <Button
                        type="button"
                        onClick={submit}
                        disabled={processing}
                    >
                        {isEdit ? 'Guardar' : 'Crear'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
