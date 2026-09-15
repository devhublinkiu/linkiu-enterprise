import { Head, useForm } from '@inertiajs/react';
import { Check, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/Components/base/Button';
import { Card, CardContent } from '@/Components/base/Card';
import AppLayout from '@/Layouts/AppLayout';

import ImagePicker from './Parts/ImagePicker';
import MicrositeHeader from './Parts/MicrositeHeader';

// Mismo gradiente estático de marca que se ve en el hero público (Show/Parts/Hero).
const GRADIENT_PREVIEW =
    'radial-gradient(75% 130% at 12% 6%, #d9141b 0%, rgba(217,20,27,0.55) 20%, rgba(217,20,27,0.12) 42%, transparent 60%), radial-gradient(55% 85% at 90% 96%, rgba(217,20,27,0.12), transparent 55%), linear-gradient(150deg, #210d0e 0%, #151515 52%, #0f0e0e 100%)';

interface Props {
    micrositeUrl: string;
    coverType: 'gradient' | 'image';
    coverUrl: string | null;
}

export default function Portada({ micrositeUrl, coverType, coverUrl }: Props) {
    const [preview, setPreview] = useState(coverUrl);
    const form = useForm({
        cover_type: coverType,
        cover: null as File | null,
        remove_cover: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('associate.company.microsite.portada.update'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const isImage = form.data.cover_type === 'image';

    return (
        <AppLayout>
            <Head title="Mi Página · Portada" />
            <div className="mx-auto max-w-3xl space-y-6">
                <MicrositeHeader
                    icon={ImageIcon}
                    title="Portada"
                    description="El fondo del encabezado, donde va el nombre de tu empresa."
                    micrositeUrl={micrositeUrl}
                />

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <OptionCard
                            selected={!isImage}
                            onClick={() =>
                                form.setData('cover_type', 'gradient')
                            }
                            icon={<Sparkles className="size-5" />}
                            title="Gradiente de marca"
                            desc="Fondo con los colores de CAMEP (rojo sobre carbón)."
                            preview={
                                <div
                                    className="h-full w-full"
                                    style={{ background: GRADIENT_PREVIEW }}
                                />
                            }
                        />
                        <OptionCard
                            selected={isImage}
                            onClick={() => form.setData('cover_type', 'image')}
                            icon={<ImageIcon className="size-5" />}
                            title="Imagen"
                            desc="Sube tu propia portada con medida precisa."
                            preview={
                                preview ? (
                                    <img
                                        src={preview}
                                        alt=""
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <div className="grid size-full place-items-center bg-muted text-muted-foreground">
                                        <ImageIcon className="size-6" />
                                    </div>
                                )
                            }
                        />
                    </div>

                    {isImage && (
                        <Card>
                            <CardContent className="py-5">
                                <ImagePicker
                                    label="Imagen de portada"
                                    shape="wide"
                                    hint="Imagen apaisada. Formatos JPG, PNG o WEBP. Máximo 5 MB. Medida ideal 1600x600 px."
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
                            </CardContent>
                        </Card>
                    )}

                    <div className="flex justify-end">
                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? 'Guardando…' : 'Guardar portada'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

function OptionCard({
    selected,
    onClick,
    icon,
    title,
    desc,
    preview,
}: {
    selected: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    title: string;
    desc: string;
    preview: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={selected}
            className={`relative overflow-hidden rounded-xl border text-left transition-colors ${
                selected
                    ? 'border-primary ring-2 ring-primary/30'
                    : 'border-border hover:border-primary/50'
            }`}
        >
            <div className="aspect-[16/7] overflow-hidden">{preview}</div>
            {selected && (
                <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3.5" />
                </span>
            )}
            <div className="space-y-0.5 p-3">
                <p className="flex items-center gap-2 text-sm font-medium">
                    {icon}
                    {title}
                </p>
                <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
        </button>
    );
}
