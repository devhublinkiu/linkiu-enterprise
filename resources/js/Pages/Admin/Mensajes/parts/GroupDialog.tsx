import { useForm } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/Components/base/Button';
import { Checkbox } from '@/Components/base/Checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/base/Dialog';
import { Input } from '@/Components/base/Input';
import { Label } from '@/Components/base/Label';
import { ScrollArea } from '@/Components/base/ScrollArea';

export interface GroupItem {
    id: number;
    name: string;
    count: number;
    associate_ids?: number[];
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    associates: { id: number; name: string }[];
    group: GroupItem | null; // null = crear
}

// Crear o editar un grupo: nombre + selección de asociados (MessageGroupPolicy:
// solo admin). El servidor hace sync de la lista.
export default function GroupDialog({
    open,
    onOpenChange,
    associates,
    group,
}: Props) {
    const [q, setQ] = useState('');
    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm<{ name: string; associate_ids: number[] }>({
            name: '',
            associate_ids: [],
        });

    // Al abrir, precargar los datos del grupo (o limpiar si es nuevo).
    useEffect(() => {
        if (!open) return;
        setData({
            name: group?.name ?? '',
            associate_ids: group?.associate_ids ?? [],
        });
        clearErrors();
        setQ('');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, group]);

    const filtered = useMemo(() => {
        const needle = q.trim().toLowerCase();
        if (!needle) return associates;
        return associates.filter((a) => a.name.toLowerCase().includes(needle));
    }, [associates, q]);

    const toggle = (id: number) =>
        setData(
            'associate_ids',
            data.associate_ids.includes(id)
                ? data.associate_ids.filter((x) => x !== id)
                : [...data.associate_ids, id],
        );

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const opts = {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(group ? 'Grupo actualizado.' : 'Grupo creado.');
                reset();
                onOpenChange(false);
            },
        };
        if (group) {
            put(route('admin.message-groups.update', group.id), opts);
        } else {
            post(route('admin.message-groups.store'), opts);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {group ? 'Editar grupo' : 'Nuevo grupo'}
                    </DialogTitle>
                    <DialogDescription>
                        Un grupo es una lista con nombre para difundir mensajes.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="mt-4 space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="group-name">Nombre</Label>
                        <Input
                            id="group-name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            maxLength={120}
                            placeholder="p. ej. Empresas de hidrocarburos"
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label>Asociados</Label>
                            <span className="text-xs text-muted-foreground">
                                {data.associate_ids.length} seleccionado(s)
                            </span>
                        </div>
                        <div className="overflow-hidden rounded-lg border border-input">
                            <div className="flex items-center gap-2 border-b border-border px-3">
                                <Search className="size-4 shrink-0 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder="Buscar empresa…"
                                    className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                                    aria-label="Buscar empresa"
                                />
                            </div>
                            <ScrollArea className="h-56">
                                <div className="p-1">
                                    {filtered.length === 0 ? (
                                        <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                                            Sin resultados
                                        </p>
                                    ) : (
                                        filtered.map((a) => (
                                            <label
                                                key={a.id}
                                                className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
                                            >
                                                <Checkbox
                                                    checked={data.associate_ids.includes(
                                                        a.id,
                                                    )}
                                                    onCheckedChange={() =>
                                                        toggle(a.id)
                                                    }
                                                />
                                                <span className="min-w-0 flex-1 truncate">
                                                    {a.name}
                                                </span>
                                            </label>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                        {errors.associate_ids && (
                            <p className="text-sm text-destructive">
                                {errors.associate_ids}
                            </p>
                        )}
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            disabled={processing}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing
                                ? 'Guardando…'
                                : group
                                  ? 'Guardar cambios'
                                  : 'Crear grupo'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
