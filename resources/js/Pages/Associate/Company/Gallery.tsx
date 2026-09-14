import { Head } from '@inertiajs/react';
import { Image as ImageIcon } from 'lucide-react';

import AppLayout from '@/Layouts/AppLayout';
import { LogoCard } from '@/Pages/Associate/Company/Gallery/Parts/LogoCard';
import { PhotoGrid } from '@/Pages/Associate/Company/Gallery/Parts/PhotoGrid';

interface Props {
    auth: unknown;
    initialAssociate?: {
        gallery_urls?: { url: string; path: string }[];
        plan?: { limit_gallery?: number };
        document_urls?: { logo?: string | null };
        cover_path?: string | null;
    };
}

export default function Gallery({ initialAssociate }: Props) {
    const images = initialAssociate?.gallery_urls || [];
    const limit = initialAssociate?.plan?.limit_gallery || 0;
    const logoUrl = initialAssociate?.document_urls?.logo || null;
    const coverPath = initialAssociate?.cover_path || null;

    return (
        <AppLayout>
            <Head title="Galería de fotos" />

            <div className="mx-auto max-w-5xl space-y-6">
                <div>
                    <h1 className="flex items-center gap-2 font-display text-h3">
                        <ImageIcon className="size-6 text-muted-foreground" />
                        Galería de fotos
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Tu logo y tus fotos son el primer punto de confianza en
                        el directorio público.
                    </p>
                </div>

                <LogoCard logoUrl={logoUrl} />
                <PhotoGrid
                    images={images}
                    limit={limit}
                    coverPath={coverPath}
                />
            </div>
        </AppLayout>
    );
}
