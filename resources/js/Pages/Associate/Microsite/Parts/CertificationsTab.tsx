import { router, useForm } from '@inertiajs/react';
import { Award, Pencil, Plus, Trash2 } from 'lucide-react';
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

export type Cert = {
    id: number;
    name: string;
    year: number | null;
    image_url: string | null;
};

export default function CertificationsTab({ items }: { items: Cert[] }) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Cert | null>(null);
    // Fuerza montar el modal desde cero en cada apertura (si no, "Añadir" tras
    // guardar arrastraría los datos del ítem anterior).
    const [formKey, setFormKey] = useState(0);

    const openAdd = () => {
        setEditing(null);
        setFormKey((k) => k + 1);
        setOpen(true);
    };
    const openEdit = (c: Cert) => {
        setEditing(c);
        setFormKey((k) => k + 1);
        setOpen(true);
    };
    const remove = (c: Cert) => {
        if (!confirm(`¿Eliminar la certificación "${c.name}"?`)) return;
        router.delete(
            route('associate.company.microsite.certifications.destroy', c.id),
            { preserveScroll: true, preserveState: true },
        );
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Máximo 5. {items.length}/5 usadas.
                </p>
                <Button
                    size="sm"
                    onClick={openAdd}
                    disabled={items.length >= 5}
                >
                    <Plus />
                    Añadir
                </Button>
            </div>

            {items.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    Aún no has añadido certificaciones.
                </p>
            ) : (
                <ul className="space-y-2">
                    {items.map((c) => (
                        <li
                            key={c.id}
                            className="flex items-center gap-3 rounded-lg border border-border p-3"
                        >
                            <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-md border bg-muted text-muted-foreground">
                                {c.image_url ? (
                                    <img
                                        src={c.image_url}
                                        alt=""
                                        className="size-full object-contain"
                                    />
                                ) : (
                                    <Award className="size-5" />
                                )}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">
                                    {c.name}
                                </p>
                                {c.year && (
                                    <p className="text-xs text-muted-foreground">
                                        {c.year}
                                    </p>
                                )}
                            </div>
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

            <CertDialog
                key={formKey}
                open={open}
                onOpenChange={setOpen}
                editing={editing}
            />
        </div>
    );
}

function CertDialog({
    open,
    onOpenChange,
    editing,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    editing: Cert | null;
}) {
    const isEdit = !!editing;
    const [preview, setPreview] = useState(editing?.image_url ?? null);
    const form = useForm({
        name: editing?.name ?? '',
        year: editing?.year ? String(editing.year) : '',
        image: null as File | null,
        remove_image: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = isEdit
            ? route(
                  'associate.company.microsite.certifications.update',
                  editing!.id,
              )
            : route('associate.company.microsite.certifications.store');
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
                        {isEdit ? 'Editar' : 'Añadir'} certificación
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <ImagePicker
                        label="Logo"
                        shape="square"
                        hint="Formatos JPG, PNG o WEBP. Máximo 5 MB. Medida ideal 400x400 px."
                        previewUrl={preview}
                        onPick={(f, u) => {
                            form.setData('image', f);
                            form.setData('remove_image', false);
                            setPreview(u);
                        }}
                        onRemove={() => {
                            form.setData('image', null);
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
                            placeholder="ISO 9001"
                            aria-invalid={!!form.errors.name}
                        />
                        {form.errors.name && (
                            <p className="text-xs text-destructive">
                                {form.errors.name}
                            </p>
                        )}
                    </div>
                    <div className="space-y-1">
                        <Label>Año</Label>
                        <Input
                            value={form.data.year}
                            inputMode="numeric"
                            className="max-w-[8rem]"
                            onChange={(e) =>
                                form.setData(
                                    'year',
                                    e.target.value.replace(/\D/g, ''),
                                )
                            }
                            placeholder="2021"
                        />
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
