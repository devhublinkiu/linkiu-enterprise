import { router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2, User } from 'lucide-react';
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

export type Member = {
    id: number;
    name: string;
    position: string | null;
    email: string | null;
    phone: string | null;
    photo_url: string | null;
};

export default function TeamTab({ items }: { items: Member[] }) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Member | null>(null);
    // Fuerza montar el modal desde cero en cada apertura (si no, "Añadir" tras
    // guardar arrastraría los datos del ítem anterior).
    const [formKey, setFormKey] = useState(0);

    const openAdd = () => {
        setEditing(null);
        setFormKey((k) => k + 1);
        setOpen(true);
    };
    const openEdit = (m: Member) => {
        setEditing(m);
        setFormKey((k) => k + 1);
        setOpen(true);
    };

    const remove = (m: Member) => {
        if (!confirm(`¿Eliminar a "${m.name}" del equipo?`)) return;
        router.delete(route('associate.company.microsite.team.destroy', m.id), {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {items.length}{' '}
                    {items.length === 1 ? 'integrante' : 'integrantes'}.
                </p>
                <Button size="sm" onClick={openAdd}>
                    <Plus />
                    Añadir
                </Button>
            </div>

            {items.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    Aún no has añadido integrantes.
                </p>
            ) : (
                <ul className="space-y-2">
                    {items.map((m) => (
                        <li
                            key={m.id}
                            className="flex items-center gap-3 rounded-lg border border-border p-3"
                        >
                            <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full border bg-muted text-muted-foreground">
                                {m.photo_url ? (
                                    <img
                                        src={m.photo_url}
                                        alt=""
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <User className="size-5" />
                                )}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">
                                    {m.name}
                                </p>
                                {m.position && (
                                    <p className="truncate text-xs text-muted-foreground">
                                        {m.position}
                                    </p>
                                )}
                            </div>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => openEdit(m)}
                                aria-label="Editar"
                            >
                                <Pencil />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                className="text-destructive"
                                onClick={() => remove(m)}
                                aria-label="Eliminar"
                            >
                                <Trash2 />
                            </Button>
                        </li>
                    ))}
                </ul>
            )}

            <MemberDialog
                key={formKey}
                open={open}
                onOpenChange={setOpen}
                editing={editing}
            />
        </div>
    );
}

function MemberDialog({
    open,
    onOpenChange,
    editing,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    editing: Member | null;
}) {
    const isEdit = !!editing;
    const [preview, setPreview] = useState(editing?.photo_url ?? null);
    const form = useForm({
        name: editing?.name ?? '',
        position: editing?.position ?? '',
        email: editing?.email ?? '',
        phone: editing?.phone ?? '',
        photo: null as File | null,
        remove_image: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = isEdit
            ? route('associate.company.microsite.team.update', editing!.id)
            : route('associate.company.microsite.team.store');
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
                        {isEdit ? 'Editar' : 'Añadir'} integrante
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <ImagePicker
                        label="Foto"
                        shape="circle"
                        hint="Formatos JPG, PNG o WEBP. Máximo 5 MB. Medida ideal 600x600 px."
                        previewUrl={preview}
                        onPick={(f, u) => {
                            form.setData('photo', f);
                            form.setData('remove_image', false);
                            setPreview(u);
                        }}
                        onRemove={() => {
                            form.setData('photo', null);
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
                            aria-invalid={!!form.errors.name}
                        />
                        {form.errors.name && (
                            <p className="text-xs text-destructive">
                                {form.errors.name}
                            </p>
                        )}
                    </div>
                    <div className="space-y-1">
                        <Label>Cargo</Label>
                        <Input
                            value={form.data.position}
                            onChange={(e) =>
                                form.setData('position', e.target.value)
                            }
                        />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                            <Label>Correo (opcional)</Label>
                            <Input
                                type="email"
                                value={form.data.email}
                                onChange={(e) =>
                                    form.setData('email', e.target.value)
                                }
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Teléfono (opcional)</Label>
                            <Input
                                value={form.data.phone}
                                onChange={(e) =>
                                    form.setData('phone', e.target.value)
                                }
                            />
                        </div>
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
