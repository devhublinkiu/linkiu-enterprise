import { useForm } from '@inertiajs/react';
import { ImagePlus, RotateCcw, X } from 'lucide-react';
import { useRef, useState } from 'react';

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
import { Textarea } from '@/Components/base/Textarea';

export type Project = {
    id: number;
    title: string;
    description: string | null;
    client: string | null;
    images: { id: number; url: string }[];
};

const MAX_IMAGES = 6;

export default function ProjectDialog({
    open,
    onOpenChange,
    editing,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    editing: Project | null;
}) {
    const isEdit = !!editing;
    const fileRef = useRef<HTMLInputElement>(null);
    const [newFiles, setNewFiles] = useState<{ file: File; url: string }[]>([]);
    const form = useForm({
        title: editing?.title ?? '',
        description: editing?.description ?? '',
        client: editing?.client ?? '',
        images: [] as File[],
        remove_image_ids: [] as number[],
    });

    const existing = editing?.images ?? [];
    const removed = form.data.remove_image_ids;
    const remainingCount = existing.length - removed.length + newFiles.length;

    const toggleRemove = (id: number) => {
        form.setData(
            'remove_image_ids',
            removed.includes(id)
                ? removed.filter((x) => x !== id)
                : [...removed, id],
        );
    };

    const pickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        const picked = Array.from(e.target.files ?? []);
        if (!picked.length) return;
        const room = MAX_IMAGES - remainingCount;
        const added = picked
            .slice(0, Math.max(0, room))
            .map((file) => ({ file, url: URL.createObjectURL(file) }));
        const next = [...newFiles, ...added];
        setNewFiles(next);
        form.setData(
            'images',
            next.map((n) => n.file),
        );
        if (fileRef.current) fileRef.current.value = '';
    };

    const dropNew = (idx: number) => {
        const next = newFiles.filter((_, i) => i !== idx);
        setNewFiles(next);
        form.setData(
            'images',
            next.map((n) => n.file),
        );
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = isEdit
            ? route('associate.company.microsite.projects.update', editing!.id)
            : route('associate.company.microsite.projects.store');
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
                        {isEdit ? 'Editar' : 'Añadir'} proyecto
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label>Título</Label>
                        <Input
                            value={form.data.title}
                            onChange={(e) =>
                                form.setData('title', e.target.value)
                            }
                            placeholder="Planta de tratamiento…"
                            aria-invalid={!!form.errors.title}
                        />
                        {form.errors.title && (
                            <p className="text-xs text-destructive">
                                {form.errors.title}
                            </p>
                        )}
                    </div>
                    <div className="space-y-1.5">
                        <Label>Cliente (opcional)</Label>
                        <Input
                            value={form.data.client}
                            onChange={(e) =>
                                form.setData('client', e.target.value)
                            }
                            placeholder="Ecopetrol"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Descripción</Label>
                        <Textarea
                            rows={4}
                            value={form.data.description}
                            onChange={(e) =>
                                form.setData('description', e.target.value)
                            }
                            placeholder="Alcance, resultados, tu rol…"
                        />
                    </div>

                    <div className="space-y-2">
                        <span className="text-sm font-medium">
                            Imágenes ({remainingCount}/{MAX_IMAGES})
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {existing.map((img) => {
                                const isRemoved = removed.includes(img.id);
                                return (
                                    <div
                                        key={img.id}
                                        className="relative size-20 overflow-hidden rounded-md border"
                                    >
                                        <img
                                            src={img.url}
                                            alt=""
                                            className={
                                                'size-full object-cover' +
                                                (isRemoved ? ' opacity-30' : '')
                                            }
                                        />
                                        <button
                                            type="button"
                                            onClick={() => toggleRemove(img.id)}
                                            aria-label={
                                                isRemoved
                                                    ? 'Restaurar'
                                                    : 'Quitar'
                                            }
                                            className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/60 text-white"
                                        >
                                            {isRemoved ? (
                                                <RotateCcw className="size-3.5" />
                                            ) : (
                                                <X className="size-3.5" />
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                            {newFiles.map((n, i) => (
                                <div
                                    key={n.url}
                                    className="relative size-20 overflow-hidden rounded-md border border-primary"
                                >
                                    <img
                                        src={n.url}
                                        alt=""
                                        className="size-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => dropNew(i)}
                                        aria-label="Quitar"
                                        className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/60 text-white"
                                    >
                                        <X className="size-3.5" />
                                    </button>
                                </div>
                            ))}
                            {remainingCount < MAX_IMAGES && (
                                <button
                                    type="button"
                                    onClick={() => fileRef.current?.click()}
                                    className="grid size-20 place-items-center rounded-md border border-dashed border-border bg-muted text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                                    aria-label="Añadir imágenes"
                                >
                                    <ImagePlus className="size-5" />
                                </button>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Formatos JPG, PNG o WEBP. Máximo 5 MB. Medida ideal
                            1200x800 px.
                        </p>
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                            className="hidden"
                            onChange={pickFiles}
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
