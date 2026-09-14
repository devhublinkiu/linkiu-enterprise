import { router, useForm } from '@inertiajs/react';
import {
    Image as ImageIcon,
    Info,
    Loader2,
    Plus,
    Star,
    Trash2,
    Upload,
} from 'lucide-react';
import React, { useRef, useState } from 'react';

import { Alert, AlertDescription } from '@/Components/base/Alert';
import { Badge } from '@/Components/base/Badge';
import { Button } from '@/Components/base/Button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/Components/base/Card';
import { Progress } from '@/Components/base/Progress';
import { cn } from '@/lib/utils';

type GalleryImage = { url: string; path: string };

export function PhotoGrid({
    images,
    limit,
    coverPath,
}: {
    images: GalleryImage[];
    limit: number;
    coverPath: string | null;
}) {
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const { processing } = useForm({ path: '' });

    const used = images.length;
    const percentage = limit > 0 ? (used / limit) * 100 : 0;
    const atLimit = limit > 0 && used >= limit;

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const filesArray = Array.from(e.target.files);
            router.post(
                route('associate.company.update.gallery'),
                { images: filesArray },
                {
                    forceFormData: true,
                    onStart: () => setUploading(true),
                    onFinish: () => {
                        setUploading(false);
                        if (inputRef.current) inputRef.current.value = '';
                    },
                },
            );
        }
    };

    const setCover = (path: string) =>
        router.post(route('associate.company.set.cover.image'), { path });

    const remove = (path: string) => {
        if (confirm('¿Estás seguro de que deseas eliminar esta imagen?')) {
            router.delete(route('associate.company.delete.gallery.image'), {
                data: { path },
            });
        }
    };

    return (
        <Card>
            <CardHeader className="border-b">
                <CardTitle className="flex flex-wrap items-center gap-2">
                    <ImageIcon className="size-4 text-muted-foreground" />
                    Galería
                    <span className="ml-auto flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                            {used} / {limit > 0 ? limit : '∞'} fotos
                        </span>
                        <Button
                            size="sm"
                            onClick={() => inputRef.current?.click()}
                            disabled={uploading || processing || atLimit}
                        >
                            {uploading ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <Upload />
                            )}
                            Subir imágenes
                        </Button>
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                {limit > 0 && <Progress value={Math.min(percentage, 100)} />}

                <Alert>
                    <Info />
                    <AlertDescription>
                        Consejo: las empresas con 5 o más fotos de buena calidad
                        reciben notablemente más contactos. Sube proyectos,
                        obras u oficinas.
                    </AlertDescription>
                </Alert>

                <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    ref={inputRef}
                    onChange={handleUpload}
                />

                {used === 0 && !uploading ? (
                    <div className="flex flex-col items-center rounded-lg border border-dashed py-16 text-center">
                        <div className="mb-4 flex size-16 items-center justify-center rounded-xl bg-muted text-muted-foreground/50">
                            <ImageIcon className="size-8" strokeWidth={1.25} />
                        </div>
                        <h3 className="font-display text-base font-medium">
                            Aún no tienes fotos
                        </h3>
                        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                            Sube fotos de tus proyectos más importantes o de tus
                            oficinas para mejorar tu presencia en el directorio.
                        </p>
                        <Button
                            className="mt-4"
                            onClick={() => inputRef.current?.click()}
                        >
                            <Upload />
                            Subir mis primeras fotos
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {!atLimit && (
                            <button
                                type="button"
                                onClick={() => inputRef.current?.click()}
                                disabled={uploading || processing}
                                className="flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                            >
                                {uploading ? (
                                    <Loader2 className="size-6 animate-spin" />
                                ) : (
                                    <Plus className="size-6" />
                                )}
                                <span className="text-xs font-medium">
                                    Añadir imagen
                                </span>
                            </button>
                        )}

                        {images.map((img, idx) => {
                            const isCover = coverPath === img.path;
                            return (
                                <div
                                    key={img.path ?? idx}
                                    className={cn(
                                        'group relative aspect-square overflow-hidden rounded-lg border bg-muted',
                                        isCover &&
                                            'ring-2 ring-primary ring-offset-2',
                                    )}
                                >
                                    <img
                                        src={img.url}
                                        alt={`Foto ${idx + 1}`}
                                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />

                                    {isCover && (
                                        <Badge className="absolute left-2 top-2 gap-1">
                                            <Star className="fill-current" />
                                            Portada
                                        </Badge>
                                    )}

                                    <div className="absolute inset-0 flex items-end justify-between gap-2 bg-gradient-to-t from-foreground/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                                        {!isCover ? (
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    setCover(img.path)
                                                }
                                            >
                                                <Star />
                                                Usar portada
                                            </Button>
                                        ) : (
                                            <span />
                                        )}
                                        <Button
                                            size="icon-sm"
                                            variant="destructive"
                                            onClick={() => remove(img.path)}
                                            title="Eliminar"
                                        >
                                            <Trash2 />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
