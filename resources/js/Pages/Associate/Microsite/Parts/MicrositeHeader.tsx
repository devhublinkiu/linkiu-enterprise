import { usePage } from '@inertiajs/react';
import { CheckCircle2, Globe, type LucideIcon } from 'lucide-react';

import { Alert, AlertTitle } from '@/Components/base/Alert';
import { Button } from '@/Components/base/Button';

// Encabezado común de las pantallas de "Mi Página": título + descripción, botón
// "Ver mi página" y el flash de éxito. El slug se gestiona en «Quiénes somos».
export default function MicrositeHeader({
    icon: Icon,
    title,
    description,
    micrositeUrl,
}: {
    icon: LucideIcon;
    title: string;
    description: string;
    micrositeUrl: string;
}) {
    const flash = (usePage().props.flash ?? {}) as { success?: string };

    return (
        <>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="flex items-center gap-2 font-display text-h3">
                        <Icon className="size-6 text-muted-foreground" />
                        {title}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                </div>
                <Button asChild variant="outline">
                    <a href={micrositeUrl} target="_blank" rel="noreferrer">
                        <Globe />
                        Ver mi página
                    </a>
                </Button>
            </div>

            {flash.success && (
                <Alert>
                    <CheckCircle2 />
                    <AlertTitle>{flash.success}</AlertTitle>
                </Alert>
            )}
        </>
    );
}
