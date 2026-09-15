import { router, useForm } from '@inertiajs/react';
import { Building2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/Components/base/Button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/base/Dialog';
import { Input } from '@/Components/base/Input';
import { Label } from '@/Components/base/Label';

import ImagePicker from './ImagePicker';

export type Client = {
    id: number;
    name: string;
    logo_url: string | null;
};

export default function ClientsTab({ items }: { items: Client[] }) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Client | null>(null);
    // Fuerza montar el modal desde cero en cada apertura (si no, "Añadir" tras
    // guardar arrastraría los datos del ítem anterior).
    const [formKey, setFormKey] = useState(0);

    const openAdd = () => {
        setEditing(null);
        setFormKey((k) => k + 1);
        setOpen(true);
    };
    const openEdit = (c: Client) => {
        setEditing(c);
        setFormKey((k) => k + 1);
        setOpen(true);
    };

    const remove = (c: Client) => {
        if (!confirm(`¿Eliminar el cliente "${c.name}"?`)) return;
        router.delete(
            route('associate.company.microsite.clients.destroy', c.id),
            { preserveScroll: true, preserveState: true },
        );
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {items.length} {items.length === 1 ? 'cliente' : 'clientes'}
                    .
                </p>
                <Button size="sm" onClick={openAdd}>
                    <Plus />
                    Añadir
                </Button>
            </div>

            {items.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    Aún no has añadido clientes.
                </p>
            ) : (
                <ul className="space-y-2">
                    {items.map((c) => (
                        <li
                            key={c.id}
                            className="flex items-center gap-3 rounded-lg border border-border p-3"
                        >
                            <span className="grid h-11 w-16 shrink-0 place-items-center overflow-hidden rounded-md border bg-muted p-1 text-muted-foreground">
                                {c.logo_url ? (
                                    <img
                                        src={c.logo_url}
                                        alt=""
                                        className="max-h-full max-w-full object-contain"
                                    />
                                ) : (
                                    <Building2 className="size-5" />
                                )}
                            </span>
                            <p className="min-w-0 flex-1 truncate text-sm font-medium">
                                {c.name}
                            </p>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => openEdit(c)}
                                aria-label="Editar"
                            >
                                <Pencil />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                className="text-destructive"
                                onClick={() => remove(c)}
                                aria-label="Eliminar"
                            >
                                <Trash2 />
                            </Button>
                        </li>
                    ))}
                </ul>
            )}

            <ClientDialog
                key={formKey}
                open={open}
                onOpenChange={setOpen}
                editing={editing}
            />
        </div>
    );
}

function ClientDialog({
    open,
    onOpenChange,
    editing,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    editing: Client | null;
}) {
    const isEdit = !!editing;
    const [preview, setPreview] = useState(editing?.logo_url ?? null);
    const form = useForm({
        name: editing?.name ?? '',
        logo: null as File | null,
        remove_image: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = isEdit
            ? route('associate.company.microsite.clients.update', editing!.id)
            : route('associate.company.microsite.clients.store');
        form.post(url, {
            forceFormData: true,
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => onOpenChange(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? 'Editar' : 'Añadir'} cliente
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <ImagePicker
                        label="Logo"
                        shape="wide"
                        hint="Formatos JPG, PNG o WEBP. Máximo 5 MB. Medida ideal 320x160 px, fondo transparente."
                        previewUrl={preview}
                        onPick={(f, u) => {
                            form.setData('logo', f);
                            form.setData('remove_image', false);
                            setPreview(u);
                        }}
                        onRemove={() => {
                            form.setData('logo', null);
                            form.setData('remove_image', true);
                            setPreview(null);
                        }}
                    />
                    <div className="space-y-1">
                        <Label>Nombre</Label>
                        <Input
                            value={form.data.name}
                            onChange={(e) =>
                                form.setData('name', e.target.value)
                            }
                            placeholder="Ecopetrol"
                            aria-invalid={!!form.errors.name}
                        />
                        {form.errors.name && (
                            <p className="text-xs text-destructive">
                                {form.errors.name}
                            </p>
                        )}
                    </div>
                    <DialogFooter showCloseButton>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? 'Guardando…' : 'Guardar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
