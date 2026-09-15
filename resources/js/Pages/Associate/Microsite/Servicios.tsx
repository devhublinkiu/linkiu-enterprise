import { Head, useForm } from '@inertiajs/react';
import { Image as ImageIcon, Layers, Pencil } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/Components/base/Badge';
import { Button } from '@/Components/base/Button';
import { Card, CardContent } from '@/Components/base/Card';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/base/Dialog';
import { Label } from '@/Components/base/Label';
import { Textarea } from '@/Components/base/Textarea';
import AppLayout from '@/Layouts/AppLayout';

import ImagePicker from './Parts/ImagePicker';
import MicrositeHeader from './Parts/MicrositeHeader';

type MicrositeService = {
    id: number;
    name: string;
    category: string | null;
    description: string | null;
    cover_url: string | null;
};

interface Props {
    micrositeUrl: string;
    servicesUrl: string;
    services: MicrositeService[];
}

export default function Servicios({
    micrositeUrl,
    servicesUrl,
    services,
}: Props) {
    const [editing, setEditing] = useState<MicrositeService | null>(null);

    return (
        <AppLayout>
            <Head title="Mi Página · Servicios" />
            <div className="mx-auto max-w-3xl space-y-6">
                <MicrositeHeader
                    icon={Layers}
                    title="Servicios"
                    description="Enriquece con descripción e imagen los servicios que ya ofreces."
                    micrositeUrl={micrositeUrl}
                />

                {services.length === 0 ? (
                    <Card>
                        <CardContent className="space-y-3 py-10 text-center">
                            <p className="text-sm text-muted-foreground">
                                Aún no tienes servicios seleccionados. Primero
                                elígelos en «Mi empresa › Servicios»; aquí solo
                                se enriquecen los aprobados.
                            </p>
                            <Button asChild variant="outline" size="sm">
                                <a href={servicesUrl}>Ir a mis servicios</a>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <ul className="space-y-3">
                        {services.map((s) => (
                            <li key={s.id}>
                                <Card>
                                    <CardContent className="flex items-center gap-4 py-4">
                                        <span className="grid h-16 w-24 shrink-0 place-items-center overflow-hidden rounded-md border bg-muted text-muted-foreground">
                                            {s.cover_url ? (
                                                <img
                                                    src={s.cover_url}
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
                                                    {s.name}
                                                </p>
                                                {s.category && (
                                                    <Badge variant="secondary">
                                                        {s.category}
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                                {s.description || (
                                                    <span className="italic">
                                                        Sin descripción.
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setEditing(s)}
                                        >
                                            <Pencil />
                                            Editar
                                        </Button>
                                    </CardContent>
                                </Card>
                            </li>
                        ))}
                    </ul>
                )}

                <ServiceDialog
                    key={editing?.id ?? 'none'}
                    service={editing}
                    onClose={() => setEditing(null)}
                />
            </div>
        </AppLayout>
    );
}

function ServiceDialog({
    service,
    onClose,
}: {
    service: MicrositeService | null;
    onClose: () => void;
}) {
    const [preview, setPreview] = useState(service?.cover_url ?? null);
    const form = useForm({
        description: service?.description ?? '',
        cover: null as File | null,
        remove_cover: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!service) return;
        form.post(
            route('associate.company.microsite.services.update', service.id),
            {
                forceFormData: true,
                preserveScroll: true,
                preserveState: true,
                onSuccess: onClose,
            },
        );
    };

    return (
        <Dialog open={!!service} onOpenChange={(v) => !v && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{service?.name}</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-1.5">
                        <span className="text-sm font-medium">Imagen</span>
                        <ImagePicker
                            label="Imagen"
                            shape="wide"
                            hint="Formatos JPG, PNG o WEBP. Máximo 5 MB. Medida ideal 1200x800 px."
                            previewUrl={preview}
                            onPick={(f, u) => {
                                form.setData('cover', f);
                                form.setData('remove_cover', false);
                                setPreview(u);
                            }}
                            onRemove={() => {
                                form.setData('cover', null);
                                form.setData('remove_cover', true);
                                setPreview(null);
                            }}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="service-desc">Descripción</Label>
                        <Textarea
                            id="service-desc"
                            rows={5}
                            value={form.data.description}
                            onChange={(e) =>
                                form.setData('description', e.target.value)
                            }
                            placeholder="Describe en qué consiste este servicio…"
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
