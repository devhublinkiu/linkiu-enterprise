import { Head, router } from '@inertiajs/react';
import {
    FolderKanban,
    Image as ImageIcon,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/Components/base/Badge';
import { Button } from '@/Components/base/Button';
import { Card, CardContent } from '@/Components/base/Card';
import AppLayout from '@/Layouts/AppLayout';

import MicrositeHeader from './Parts/MicrositeHeader';
import ProjectDialog, { type Project } from './Parts/ProjectDialog';

interface Props {
    micrositeUrl: string;
    projects: Project[];
}

export default function Proyectos({ micrositeUrl, projects }: Props) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Project | null>(null);
    // Fuerza montar el modal desde cero en cada apertura (si no, "Añadir" tras
    // guardar arrastraría los datos del proyecto anterior).
    const [formKey, setFormKey] = useState(0);

    const openAdd = () => {
        setEditing(null);
        setFormKey((k) => k + 1);
        setOpen(true);
    };
    const openEdit = (p: Project) => {
        setEditing(p);
        setFormKey((k) => k + 1);
        setOpen(true);
    };
    const remove = (p: Project) => {
        if (!confirm(`¿Eliminar el proyecto "${p.title}"?`)) return;
        router.delete(
            route('associate.company.microsite.projects.destroy', p.id),
            { preserveScroll: true, preserveState: true },
        );
    };

    return (
        <AppLayout>
            <Head title="Mi Página · Proyectos" />
            <div className="mx-auto max-w-3xl space-y-6">
                <MicrositeHeader
                    icon={FolderKanban}
                    title="Proyectos"
                    description="Muestra los trabajos realizados con su galería de imágenes."
                    micrositeUrl={micrositeUrl}
                />

                <div className="flex justify-end">
                    <Button size="sm" onClick={openAdd}>
                        <Plus />
                        Añadir proyecto
                    </Button>
                </div>

                {projects.length === 0 ? (
                    <Card>
                        <CardContent className="py-10 text-center text-sm text-muted-foreground">
                            Aún no has añadido proyectos.
                        </CardContent>
                    </Card>
                ) : (
                    <ul className="space-y-3">
                        {projects.map((p) => (
                            <li key={p.id}>
                                <Card>
                                    <CardContent className="flex items-center gap-4 py-4">
                                        <span className="grid h-16 w-24 shrink-0 place-items-center overflow-hidden rounded-md border bg-muted text-muted-foreground">
                                            {p.images[0] ? (
                                                <img
                                                    src={p.images[0].url}
                                                    alt=""
                                                    className="size-full object-cover"
                                                />
                                            ) : (
                                                <ImageIcon className="size-5" />
                                            )}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="font-medium">
                                                    {p.title}
                                                </p>
                                                {p.images.length > 0 && (
                                                    <Badge variant="secondary">
                                                        {p.images.length}{' '}
                                                        {p.images.length === 1
                                                            ? 'imagen'
                                                            : 'imágenes'}
                                                    </Badge>
                                                )}
                                            </div>
                                            {p.client && (
                                                <p className="text-xs text-muted-foreground">
                                                    Cliente: {p.client}
                                                </p>
                                            )}
                                            {p.description && (
                                                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                                    {p.description}
                                                </p>
                                            )}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={() => openEdit(p)}
                                            aria-label="Editar"
                                        >
                                            <Pencil />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            className="text-destructive"
                                            onClick={() => remove(p)}
                                            aria-label="Eliminar"
                                        >
                                            <Trash2 />
                                        </Button>
                                    </CardContent>
                                </Card>
                            </li>
                        ))}
                    </ul>
                )}

                <ProjectDialog
                    key={formKey}
                    open={open}
                    onOpenChange={setOpen}
                    editing={editing}
                />
            </div>
        </AppLayout>
    );
}
