import { router } from '@inertiajs/react';
import {
    Check,
    ChevronDown,
    ChevronUp,
    Pencil,
    Plus,
    Trash2,
    X,
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/Components/base/Badge';
import { Button } from '@/Components/base/Button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/Components/base/Dialog';
import { Input } from '@/Components/base/Input';

import { Category } from '../types';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categories: Category[];
    counts: Record<number, number>;
}

export default function CategoriesDialog({
    open,
    onOpenChange,
    categories,
    counts,
}: Props) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [newName, setNewName] = useState('');

    const opts = { preserveScroll: true };

    const add = () => {
        if (!newName.trim()) return;
        router.post(
            route('admin.service-categories.store'),
            { name: newName },
            { ...opts, onSuccess: () => setNewName('') },
        );
    };

    const saveEdit = (c: Category) => {
        if (!editName.trim()) return;
        router.patch(
            route('admin.service-categories.update', c.id),
            { name: editName },
            { ...opts, onSuccess: () => setEditingId(null) },
        );
    };

    const remove = (c: Category) => {
        router.delete(route('admin.service-categories.destroy', c.id), opts);
    };

    const move = (index: number, dir: -1 | 1) => {
        const ids = categories.map((c) => c.id);
        const j = index + dir;
        if (j < 0 || j >= ids.length) return;
        [ids[index], ids[j]] = [ids[j], ids[index]];
        router.post(route('admin.service-categories.order'), { ids }, opts);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Categorías de servicios</DialogTitle>
                    <DialogDescription>
                        Renombra, reordena o elimina categorías. Solo puedes
                        eliminar las que no tienen servicios.
                    </DialogDescription>
                </DialogHeader>

                {/* Crear nueva */}
                <div className="flex gap-2">
                    <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Nueva categoría"
                        onKeyDown={(e) => e.key === 'Enter' && add()}
                    />
                    <Button
                        type="button"
                        onClick={add}
                        disabled={!newName.trim()}
                    >
                        <Plus className="size-4" /> Agregar
                    </Button>
                </div>

                {/* Lista */}
                <div className="max-h-[50vh] space-y-2 overflow-y-auto">
                    {categories.map((c, i) => {
                        const count = counts[c.id] ?? 0;
                        const editing = editingId === c.id;
                        return (
                            <div
                                key={c.id}
                                className="flex items-center gap-2 rounded-lg border p-2"
                            >
                                <div className="flex flex-col">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-xs"
                                        aria-label="Subir"
                                        disabled={i === 0}
                                        onClick={() => move(i, -1)}
                                    >
                                        <ChevronUp className="size-3.5" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-xs"
                                        aria-label="Bajar"
                                        disabled={i === categories.length - 1}
                                        onClick={() => move(i, 1)}
                                    >
                                        <ChevronDown className="size-3.5" />
                                    </Button>
                                </div>

                                {editing ? (
                                    <Input
                                        value={editName}
                                        onChange={(e) =>
                                            setEditName(e.target.value)
                                        }
                                        onKeyDown={(e) =>
                                            e.key === 'Enter' && saveEdit(c)
                                        }
                                        autoFocus
                                        className="flex-1"
                                    />
                                ) : (
                                    <span className="flex-1 text-sm font-medium">
                                        {c.name}
                                    </span>
                                )}

                                <Badge variant="secondary">{count} serv.</Badge>

                                {editing ? (
                                    <>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon-sm"
                                            aria-label="Guardar"
                                            onClick={() => saveEdit(c)}
                                        >
                                            <Check className="size-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon-sm"
                                            aria-label="Cancelar"
                                            onClick={() => setEditingId(null)}
                                        >
                                            <X className="size-4" />
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon-sm"
                                            aria-label={`Renombrar ${c.name}`}
                                            onClick={() => {
                                                setEditingId(c.id);
                                                setEditName(c.name);
                                            }}
                                        >
                                            <Pencil className="size-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon-sm"
                                            aria-label={`Eliminar ${c.name}`}
                                            disabled={count > 0}
                                            title={
                                                count > 0
                                                    ? 'Tiene servicios; muévelos o elimínalos primero'
                                                    : undefined
                                            }
                                            className="text-muted-foreground hover:text-destructive"
                                            onClick={() => remove(c)}
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        );
                    })}
                    {categories.length === 0 && (
                        <p className="py-4 text-center text-sm text-muted-foreground">
                            Aún no hay categorías.
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
