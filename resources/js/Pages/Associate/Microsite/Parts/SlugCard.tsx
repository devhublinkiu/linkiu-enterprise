import { router } from '@inertiajs/react';
import axios from 'axios';
import { Check, ExternalLink, Globe, Loader2, Lock, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/Components/base/Button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/Components/base/Card';
import { Input } from '@/Components/base/Input';
import { Label } from '@/Components/base/Label';

type SlugCheck = {
    slug: string;
    available: boolean;
    reason: string | null;
    checking: boolean;
};

export default function SlugCard({
    slug,
    micrositeUrl,
}: {
    slug: string | null;
    micrositeUrl: string;
}) {
    const [value, setValue] = useState('');
    const [check, setCheck] = useState<SlugCheck | null>(null);
    const [saving, setSaving] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout>>();

    useEffect(() => {
        if (slug || value.trim() === '') {
            setCheck(null);
            return;
        }
        setCheck((c) => ({
            slug: c?.slug ?? '',
            available: false,
            reason: null,
            checking: true,
        }));
        clearTimeout(timer.current);
        timer.current = setTimeout(async () => {
            try {
                const { data } = await axios.post(
                    route('associate.company.microsite.slug.check'),
                    { value },
                );
                setCheck({ ...data, checking: false });
            } catch {
                setCheck(null);
            }
        }, 400);
        return () => clearTimeout(timer.current);
    }, [value, slug]);

    const save = () => {
        setSaving(true);
        router.post(
            route('associate.company.microsite.slug.update'),
            { slug: value },
            {
                preserveScroll: true,
                onFinish: () => setSaving(false),
            },
        );
    };

    const ViewButton = (
        <Button asChild variant="outline">
            <a href={micrositeUrl} target="_blank" rel="noreferrer">
                <Globe />
                Ver mi página
                <ExternalLink className="opacity-50" />
            </a>
        </Button>
    );

    return (
        <Card>
            <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                    <Globe className="size-4 text-muted-foreground" />
                    Dirección de mi página
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {slug ? (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="flex items-center gap-2 font-medium">
                                <Lock className="size-3.5 text-muted-foreground" />
                                {micrositeUrl}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                La dirección se define una sola vez y no se
                                puede cambiar.
                            </p>
                        </div>
                        {ViewButton}
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-muted-foreground">
                            Elige la dirección pública de tu micrositio. Solo se
                            puede definir una vez.
                        </p>
                        <div className="space-y-1.5">
                            <Label htmlFor="slug">Dirección</Label>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                    camep.org/
                                </span>
                                <Input
                                    id="slug"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    placeholder="mi-empresa"
                                    className="max-w-xs flex-1"
                                    autoComplete="off"
                                />
                                <Button
                                    onClick={save}
                                    disabled={
                                        saving ||
                                        !check ||
                                        check.checking ||
                                        !check.available
                                    }
                                >
                                    {saving ? (
                                        <Loader2 className="animate-spin" />
                                    ) : null}
                                    Guardar dirección
                                </Button>
                            </div>
                            {check && (
                                <p
                                    className={
                                        check.checking
                                            ? 'flex items-center gap-1.5 text-xs text-muted-foreground'
                                            : check.available
                                              ? 'flex items-center gap-1.5 text-xs text-success'
                                              : 'flex items-center gap-1.5 text-xs text-destructive'
                                    }
                                >
                                    {check.checking ? (
                                        <>
                                            <Loader2 className="size-3 animate-spin" />
                                            Comprobando…
                                        </>
                                    ) : check.available ? (
                                        <>
                                            <Check className="size-3" />
                                            camep.org/{check.slug} está
                                            disponible
                                        </>
                                    ) : (
                                        <>
                                            <X className="size-3" />
                                            {check.reason}
                                        </>
                                    )}
                                </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Mientras tanto, tu página vive en{' '}
                                <a
                                    href={micrositeUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="underline underline-offset-2"
                                >
                                    esta dirección temporal
                                </a>
                                .
                            </p>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
