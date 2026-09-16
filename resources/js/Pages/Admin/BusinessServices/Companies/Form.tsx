import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';

import { Button } from '@/Components/base/Button';
import { Card, CardContent } from '@/Components/base/Card';
import { Field, FieldError, FieldLabel } from '@/Components/base/Field';
import { Input } from '@/Components/base/Input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/base/Select';
import AppLayout from '@/Layouts/AppLayout';

interface Company {
    id: number;
    nombre: string;
    departamento: string | null;
    ciudad: string | null;
    estado: 'activo' | 'inactivo';
    logo_url: string | null;
}

interface Props {
    company?: Company;
}

export default function Form({ company }: Props) {
    const isEditing = !!company;

    const { data, setData, post, processing, errors } = useForm({
        _method: isEditing ? 'put' : 'post',
        nombre: company?.nombre ?? '',
        departamento: company?.departamento ?? '',
        ciudad: company?.ciudad ?? '',
        estado: company?.estado ?? 'activo',
        logo: null as File | null,
    });

    const [logoPreview, setLogoPreview] = useState<string | null>(
        company?.logo_url ?? null,
    );
    const logoInputRef = useRef<HTMLInputElement>(null);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(
            isEditing
                ? route('admin.bienes-servicios.companies.update', company!.id)
                : route('admin.bienes-servicios.companies.store'),
        );
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setData('logo', file);
        const reader = new FileReader();
        reader.onloadend = () => setLogoPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const removeLogo = () => {
        setData('logo', null);
        setLogoPreview(null);
        if (logoInputRef.current) logoInputRef.current.value = '';
    };

    return (
        <AppLayout>
            <Head title={`${isEditing ? 'Editar' : 'Nueva'} empresa · Admin`} />

            <div className="mx-auto max-w-3xl space-y-6">
                <div className="flex items-center gap-3">
                    <Button
                        asChild
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Volver"
                    >
                        <Link
                            href={route(
                                'admin.bienes-servicios.companies.index',
                            )}
                        >
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <h1 className="font-display text-h3">
                        {isEditing ? 'Editar empresa' : 'Nueva empresa'}
                    </h1>
                </div>

                <form onSubmit={submit}>
                    <Card>
                        <CardContent className="grid gap-6 md:grid-cols-[220px_1fr]">
                            {/* Logo */}
                            <Field>
                                <FieldLabel htmlFor="logo">Logo</FieldLabel>
                                {logoPreview ? (
                                    <div className="group relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-muted ring-1 ring-foreground/10">
                                        <img
                                            src={logoPreview}
                                            alt="Vista previa del logo"
                                            className="size-full object-contain p-4"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-foreground/40 opacity-0 transition-opacity group-hover:opacity-100">
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                onClick={removeLogo}
                                            >
                                                <X className="size-4" /> Quitar
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            logoInputRef.current?.click()
                                        }
                                        className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-input text-muted-foreground transition-colors hover:border-ring hover:bg-muted/50"
                                    >
                                        <Upload className="size-7" />
                                        <span className="text-sm font-medium">
                                            Subir logo
                                        </span>
                                        <span className="text-xs">
                                            JPG, PNG o WebP
                                        </span>
                                    </button>
                                )}
                                <input
                                    ref={logoInputRef}
                                    type="file"
                                    id="logo"
                                    className="hidden"
                                    onChange={handleLogoChange}
                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                />
                                {errors.logo && (
                                    <FieldError>{errors.logo}</FieldError>
                                )}
                            </Field>

                            {/* Fields */}
                            <div className="flex flex-col gap-4">
                                <Field>
                                    <FieldLabel htmlFor="nombre">
                                        Nombre de la empresa *
                                    </FieldLabel>
                                    <Input
                                        id="nombre"
                                        value={data.nombre}
                                        onChange={(e) =>
                                            setData('nombre', e.target.value)
                                        }
                                        placeholder="Nombre comercial…"
                                        required
                                    />
                                    {errors.nombre && (
                                        <FieldError>{errors.nombre}</FieldError>
                                    )}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="departamento">
                                        Departamento
                                    </FieldLabel>
                                    <Input
                                        id="departamento"
                                        value={data.departamento}
                                        onChange={(e) =>
                                            setData(
                                                'departamento',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Ej: Casanare"
                                    />
                                    {errors.departamento && (
                                        <FieldError>
                                            {errors.departamento}
                                        </FieldError>
                                    )}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="ciudad">
                                        Ciudad
                                    </FieldLabel>
                                    <Input
                                        id="ciudad"
                                        value={data.ciudad}
                                        onChange={(e) =>
                                            setData('ciudad', e.target.value)
                                        }
                                        placeholder="Ej: Yopal"
                                    />
                                    {errors.ciudad && (
                                        <FieldError>{errors.ciudad}</FieldError>
                                    )}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="estado">
                                        Estado
                                    </FieldLabel>
                                    <Select
                                        value={data.estado}
                                        onValueChange={(v) =>
                                            setData(
                                                'estado',
                                                v as 'activo' | 'inactivo',
                                            )
                                        }
                                    >
                                        <SelectTrigger id="estado">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="activo">
                                                Activo
                                            </SelectItem>
                                            <SelectItem value="inactivo">
                                                Inactivo
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.estado && (
                                        <FieldError>{errors.estado}</FieldError>
                                    )}
                                </Field>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="mt-6 flex justify-end gap-2">
                        <Button asChild variant="ghost" type="button">
                            <Link
                                href={route(
                                    'admin.bienes-servicios.companies.index',
                                )}
                            >
                                Cancelar
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="size-4" />
                            {processing ? 'Guardando…' : 'Guardar empresa'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
