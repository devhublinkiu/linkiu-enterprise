import { router } from '@inertiajs/react';
import { Building2, Loader2, Trash2, Upload } from 'lucide-react';
import React, { useRef, useState } from 'react';

import { Button } from '@/Components/base/Button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/Components/base/Card';

export function LogoCard({ logoUrl }: { logoUrl: string | null }) {
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        router.post(
            route('associate.company.upload.logo'),
            { logo: file },
            {
                forceFormData: true,
                preserveScroll: true,
                onStart: () => setUploading(true),
                onFinish: () => {
                    setUploading(false);
                    if (inputRef.current) inputRef.current.value = '';
                },
            },
        );
    };

    const handleDelete = () => {
        if (
            !confirm(
                '¿Eliminar el logo? Tu perfil público se mostrará sin imagen hasta que subas uno nuevo.',
            )
        )
            return;
        router.delete(route('associate.company.delete.logo'), {
            preserveScroll: true,
        });
    };

    return (
        <Card>
            <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                    <Building2 className="size-4 text-muted-foreground" />
                    Logo de la empresa
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-5 sm:flex-row">
                <div className="flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted">
                    {logoUrl ? (
                        <img
                            src={logoUrl}
                            alt="Logo"
                            className="size-full object-contain"
                        />
                    ) : (
                        <Building2
                            className="size-12 text-muted-foreground/40"
                            strokeWidth={1.5}
                        />
                    )}
                </div>

                <div className="flex-1 space-y-3 text-center sm:text-left">
                    <p className="text-sm text-muted-foreground">
                        Imagen cuadrada (JPG, PNG o WEBP), máximo 5 MB. Se
                        muestra en tu perfil público y en los listados de
                        empresas asociadas.
                    </p>
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        ref={inputRef}
                        onChange={handleChange}
                    />
                    <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                        <Button
                            onClick={() => inputRef.current?.click()}
                            disabled={uploading}
                        >
                            {uploading ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <Upload />
                            )}
                            {logoUrl ? 'Reemplazar logo' : 'Subir logo'}
                        </Button>
                        {logoUrl && (
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={uploading}
                            >
                                <Trash2 />
                                Eliminar
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
