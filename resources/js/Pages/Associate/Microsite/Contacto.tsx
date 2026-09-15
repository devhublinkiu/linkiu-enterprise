import { Head, router, useForm } from '@inertiajs/react';
import { Eye, EyeOff, Phone } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/Components/base/Button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/Components/base/Card';
import { Input } from '@/Components/base/Input';
import { Label } from '@/Components/base/Label';
import { Switch } from '@/Components/base/Switch';
import AppLayout from '@/Layouts/AppLayout';

import type { Facade } from './Parts/FacadeManager';
import FacadeManager from './Parts/FacadeManager';
import MicrositeHeader from './Parts/MicrositeHeader';

const MAX_FACADES = 3;

interface Props {
    micrositeUrl: string;
    published: boolean;
    contactsUrl: string;
    contact: { whatsapp: string | null; contact_email: string | null };
    reused: {
        phone: string | null;
        email: string | null;
        website: string | null;
        address: string | null;
        city: string | null;
        department: string | null;
        facebook: string | null;
        instagram: string | null;
        linkedin: string | null;
    };
    facades: Facade[];
}

export default function Contacto({
    micrositeUrl,
    published,
    contactsUrl,
    contact,
    reused,
    facades,
}: Props) {
    const [pub, setPub] = useState(published);
    const [newFiles, setNewFiles] = useState<{ file: File; url: string }[]>([]);
    const form = useForm({
        whatsapp: contact.whatsapp ?? '',
        contact_email: contact.contact_email ?? '',
        facades: [] as File[],
        remove_facades: [] as string[],
    });

    const togglePublish = (v: boolean) => {
        setPub(v);
        router.post(
            route('associate.company.microsite.published.toggle'),
            { published: v },
            { preserveScroll: true, preserveState: true },
        );
    };

    const pickFacades = (picked: File[]) => {
        const remaining =
            facades.length - form.data.remove_facades.length + newFiles.length;
        const added = picked
            .slice(0, Math.max(0, MAX_FACADES - remaining))
            .map((file) => ({ file, url: URL.createObjectURL(file) }));
        const next = [...newFiles, ...added];
        setNewFiles(next);
        form.setData(
            'facades',
            next.map((n) => n.file),
        );
    };

    const dropFacade = (i: number) => {
        const next = newFiles.filter((_, idx) => idx !== i);
        setNewFiles(next);
        form.setData(
            'facades',
            next.map((n) => n.file),
        );
    };

    const toggleRemove = (path: string) => {
        const list = form.data.remove_facades;
        form.setData(
            'remove_facades',
            list.includes(path)
                ? list.filter((p) => p !== path)
                : [...list, path],
        );
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('associate.company.microsite.contact.update'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const reference = [
        { label: 'Teléfono', value: reused.phone },
        {
            label: 'Dirección',
            value: [reused.address, reused.city, reused.department]
                .filter(Boolean)
                .join(', '),
        },
        { label: 'Sitio web', value: reused.website },
        { label: 'Facebook', value: reused.facebook },
        { label: 'Instagram', value: reused.instagram },
        { label: 'LinkedIn', value: reused.linkedin },
    ].filter((r) => r.value);

    return (
        <AppLayout>
            <Head title="Mi Página · Contacto" />
            <div className="mx-auto max-w-3xl space-y-6">
                <MicrositeHeader
                    icon={Phone}
                    title="Contacto"
                    description="Datos de contacto públicos y estado de publicación de tu micrositio."
                    micrositeUrl={micrositeUrl}
                />

                <Card>
                    <CardContent className="flex flex-wrap items-center justify-between gap-4 py-5">
                        <div className="flex items-start gap-3">
                            <span className="mt-0.5 text-muted-foreground">
                                {pub ? (
                                    <Eye className="size-5" />
                                ) : (
                                    <EyeOff className="size-5" />
                                )}
                            </span>
                            <div>
                                <p className="font-medium">
                                    {pub
                                        ? 'Micrositio publicado'
                                        : 'Micrositio en borrador'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {pub
                                        ? 'Es visible al público en tu dirección.'
                                        : 'Solo tú lo ves (vista previa) hasta que lo publiques.'}
                                </p>
                            </div>
                        </div>
                        <Switch checked={pub} onCheckedChange={togglePublish} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="border-b">
                        <CardTitle>Datos de contacto</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-5">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="whatsapp">WhatsApp</Label>
                                    <Input
                                        id="whatsapp"
                                        value={form.data.whatsapp}
                                        onChange={(e) =>
                                            form.setData(
                                                'whatsapp',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="+57 300 000 0000"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="contact_email">
                                        Correo de contacto
                                    </Label>
                                    <Input
                                        id="contact_email"
                                        type="email"
                                        value={form.data.contact_email}
                                        onChange={(e) =>
                                            form.setData(
                                                'contact_email',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="contacto@empresa.co"
                                        aria-invalid={
                                            !!form.errors.contact_email
                                        }
                                    />
                                    {form.errors.contact_email && (
                                        <p className="text-xs text-destructive">
                                            {form.errors.contact_email}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <span className="text-sm font-medium">
                                    Fotos de la fachada
                                </span>
                                <FacadeManager
                                    existing={facades}
                                    removed={form.data.remove_facades}
                                    newFiles={newFiles}
                                    max={MAX_FACADES}
                                    onToggleRemove={toggleRemove}
                                    onPick={pickFacades}
                                    onDropNew={dropFacade}
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                >
                                    {form.processing
                                        ? 'Guardando…'
                                        : 'Guardar contacto'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {reference.length > 0 && (
                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle>Datos de tu perfil</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                El micrositio también muestra estos datos. Se
                                editan en{' '}
                                <a
                                    href={contactsUrl}
                                    className="font-medium text-primary underline-offset-2 hover:underline"
                                >
                                    Mi empresa › Contactos
                                </a>
                                .
                            </p>
                            <dl className="divide-y divide-border rounded-lg border border-border">
                                {reference.map((r) => (
                                    <div
                                        key={r.label}
                                        className="flex items-center justify-between gap-4 px-4 py-2.5"
                                    >
                                        <dt className="text-sm text-muted-foreground">
                                            {r.label}
                                        </dt>
                                        <dd className="truncate text-sm font-medium">
                                            {r.value}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
