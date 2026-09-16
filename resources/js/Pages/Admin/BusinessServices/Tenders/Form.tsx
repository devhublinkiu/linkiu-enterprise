import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    ExternalLink,
    FileText,
    Globe,
    Save,
    ShieldAlert,
    Trash2,
    Upload,
    X,
} from 'lucide-react';
import { useRef, useState } from 'react';

import { Button } from '@/Components/base/Button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/Components/base/Card';
import { Field, FieldError, FieldLabel } from '@/Components/base/Field';
import { Input } from '@/Components/base/Input';
import { RadioGroup, RadioGroupItem } from '@/Components/base/RadioGroup';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/base/Select';
import { Textarea } from '@/Components/base/Textarea';
import TiptapEditor from '@/Components/TiptapEditor';
import AppLayout from '@/Layouts/AppLayout';
import { cn } from '@/lib/utils';

const AUDIENCE_OPTIONS = [
    {
        value: 'abierto' as const,
        icon: Globe,
        title: 'Abierto',
        desc: 'Visible para todos los visitantes del portal.',
    },
    {
        value: 'exclusivo_asociados' as const,
        icon: ShieldAlert,
        title: 'Asociados',
        desc: 'Exclusivo para asociados con suscripción activa.',
    },
];

interface Company {
    id: number;
    nombre: string;
}

interface Tender {
    id: number;
    empresa_id: number;
    titulo: string;
    enlace_externo: string | null;
    extracto: string | null;
    contenido: string | null;
    publico_objetivo: 'abierto' | 'exclusivo_asociados';
    estado: 'borrador' | 'publicado' | 'cerrado';
    fecha_publicacion: string | null;
    fecha_cierre: string | null;
    featured_image_url: string | null;
    documents: { id: number; name: string; url: string }[];
}

interface Props {
    tender?: Tender;
    companies: Company[];
}

export default function Form({ tender, companies }: Props) {
    const isEditing = !!tender;

    const { data, setData, post, processing, errors } = useForm({
        _method: isEditing ? 'put' : 'post',
        empresa_id: tender ? String(tender.empresa_id) : '',
        titulo: tender?.titulo ?? '',
        enlace_externo: tender?.enlace_externo ?? '',
        extracto: tender?.extracto ?? '',
        contenido: tender?.contenido ?? '',
        publico_objetivo: tender?.publico_objetivo ?? 'abierto',
        estado: tender?.estado ?? 'publicado',
        fecha_publicacion: tender?.fecha_publicacion ?? '',
        fecha_cierre: tender?.fecha_cierre ?? '',
        featured_image: null as File | null,
        documents: [] as File[],
    });

    const [imagePreview, setImagePreview] = useState<string | null>(
        tender?.featured_image_url ?? null,
    );
    const imageInputRef = useRef<HTMLInputElement>(null);
    const docsInputRef = useRef<HTMLInputElement>(null);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(
            isEditing
                ? route('admin.bienes-servicios.tenders.update', tender!.id)
                : route('admin.bienes-servicios.tenders.store'),
        );
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setData('featured_image', file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setData('featured_image', null);
        setImagePreview(null);
        if (imageInputRef.current) imageInputRef.current.value = '';
    };

    const handleDocsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (files.length) setData('documents', [...data.documents, ...files]);
        if (docsInputRef.current) docsInputRef.current.value = '';
    };

    const removeNewDoc = (index: number) =>
        setData(
            'documents',
            data.documents.filter((_, i) => i !== index),
        );

    const deleteExistingDoc = (mediaId: number) => {
        if (confirm('¿Eliminar este documento?')) {
            router.delete(
                route('admin.bienes-servicios.tenders.documents.destroy', [
                    tender!.id,
                    mediaId,
                ]),
                { preserveScroll: true },
            );
        }
    };

    return (
        <AppLayout>
            <Head
                title={`${isEditing ? 'Editar' : 'Nueva'} licitación · Admin`}
            />

            <div className="mx-auto max-w-6xl space-y-6">
                <div className="flex items-center gap-3">
                    <Button
                        asChild
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Volver"
                    >
                        <Link
                            href={route('admin.bienes-servicios.tenders.index')}
                        >
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <h1 className="font-display text-h3">
                        {isEditing ? 'Editar licitación' : 'Nueva licitación'}
                    </h1>
                </div>

                <form
                    onSubmit={submit}
                    className="flex flex-col gap-6 lg:flex-row"
                >
                    {/* Columna principal */}
                    <div className="flex w-full flex-col gap-6 lg:w-2/3">
                        <Card>
                            <CardContent className="flex flex-col gap-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <Field>
                                        <FieldLabel htmlFor="empresa_id">
                                            Empresa proveedora *
                                        </FieldLabel>
                                        <Select
                                            value={data.empresa_id}
                                            onValueChange={(v) =>
                                                setData('empresa_id', v)
                                            }
                                        >
                                            <SelectTrigger id="empresa_id">
                                                <SelectValue placeholder="Seleccionar empresa…" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {companies.map((c) => (
                                                    <SelectItem
                                                        key={c.id}
                                                        value={String(c.id)}
                                                    >
                                                        {c.nombre}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.empresa_id && (
                                            <FieldError>
                                                {errors.empresa_id}
                                            </FieldError>
                                        )}
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="enlace_externo">
                                            Enlace externo (opcional)
                                        </FieldLabel>
                                        <div className="relative">
                                            <ExternalLink className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="enlace_externo"
                                                className="pl-8"
                                                value={data.enlace_externo}
                                                onChange={(e) =>
                                                    setData(
                                                        'enlace_externo',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="https://…"
                                            />
                                        </div>
                                        {errors.enlace_externo && (
                                            <FieldError>
                                                {errors.enlace_externo}
                                            </FieldError>
                                        )}
                                    </Field>
                                </div>

                                <Field>
                                    <FieldLabel htmlFor="titulo">
                                        Título de la licitación *
                                    </FieldLabel>
                                    <Input
                                        id="titulo"
                                        value={data.titulo}
                                        onChange={(e) =>
                                            setData('titulo', e.target.value)
                                        }
                                        placeholder="Ej: Suministro de materiales eléctricos…"
                                        required
                                    />
                                    {errors.titulo && (
                                        <FieldError>{errors.titulo}</FieldError>
                                    )}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="extracto">
                                        Extracto o resumen breve
                                    </FieldLabel>
                                    <Textarea
                                        id="extracto"
                                        value={data.extracto}
                                        onChange={(e) =>
                                            setData('extracto', e.target.value)
                                        }
                                        placeholder="Breve descripción para los listados…"
                                    />
                                    {errors.extracto && (
                                        <FieldError>
                                            {errors.extracto}
                                        </FieldError>
                                    )}
                                </Field>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="border-b">
                                <CardTitle>Contenido detallado</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <TiptapEditor
                                    content={data.contenido}
                                    onChange={(html: string) =>
                                        setData('contenido', html)
                                    }
                                />
                                {errors.contenido && (
                                    <FieldError className="mt-2">
                                        {errors.contenido}
                                    </FieldError>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="size-4 text-muted-foreground" />
                                    Documentos adjuntos
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="self-start"
                                    onClick={() =>
                                        docsInputRef.current?.click()
                                    }
                                >
                                    <Upload className="size-3.5" /> Subir
                                    archivos
                                </Button>
                                <input
                                    ref={docsInputRef}
                                    type="file"
                                    className="hidden"
                                    multiple
                                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                                    onChange={handleDocsChange}
                                />

                                {isEditing && tender.documents.length > 0 && (
                                    <div className="flex flex-col gap-2">
                                        <p className="text-xs font-medium text-muted-foreground">
                                            Documentos actuales
                                        </p>
                                        {tender.documents.map((doc) => (
                                            <div
                                                key={doc.id}
                                                className="flex items-center justify-between gap-3 rounded-lg bg-muted/50 px-3 py-2 ring-1 ring-foreground/10"
                                            >
                                                <span className="flex items-center gap-2 overflow-hidden">
                                                    <FileText className="size-4 shrink-0 text-muted-foreground" />
                                                    <span className="truncate text-sm">
                                                        {doc.name}
                                                    </span>
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    aria-label={`Eliminar ${doc.name}`}
                                                    className="text-muted-foreground hover:text-destructive"
                                                    onClick={() =>
                                                        deleteExistingDoc(
                                                            doc.id,
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {data.documents.length > 0 && (
                                    <div className="flex flex-col gap-2">
                                        <p className="text-xs font-medium text-muted-foreground">
                                            Nuevos para subir
                                        </p>
                                        {data.documents.map((file, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between gap-3 rounded-lg bg-primary/5 px-3 py-2 ring-1 ring-primary/20"
                                            >
                                                <span className="flex items-center gap-2 overflow-hidden">
                                                    <FileText className="size-4 shrink-0 text-muted-foreground" />
                                                    <span className="truncate text-sm">
                                                        {file.name}
                                                    </span>
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    aria-label={`Quitar ${file.name}`}
                                                    onClick={() =>
                                                        removeNewDoc(idx)
                                                    }
                                                >
                                                    <X className="size-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {errors.documents && (
                                    <FieldError>{errors.documents}</FieldError>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Columna de configuración */}
                    <div className="flex w-full flex-col gap-6 lg:w-1/3">
                        <Card>
                            <CardHeader>
                                <CardTitle>Público objetivo</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <RadioGroup
                                    className="gap-3"
                                    value={data.publico_objetivo}
                                    onValueChange={(v) =>
                                        setData(
                                            'publico_objetivo',
                                            v as Tender['publico_objetivo'],
                                        )
                                    }
                                >
                                    {AUDIENCE_OPTIONS.map((opt) => {
                                        const selected =
                                            data.publico_objetivo === opt.value;
                                        const Icon = opt.icon;
                                        return (
                                            <label
                                                key={opt.value}
                                                htmlFor={`po-${opt.value}`}
                                                className={cn(
                                                    'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors',
                                                    selected
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-input hover:bg-muted/50',
                                                )}
                                            >
                                                <RadioGroupItem
                                                    value={opt.value}
                                                    id={`po-${opt.value}`}
                                                    className="mt-0.5"
                                                />
                                                <span className="grid gap-0.5">
                                                    <span className="flex items-center gap-2 text-sm font-medium">
                                                        <Icon className="size-4 text-muted-foreground" />
                                                        {opt.title}
                                                    </span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {opt.desc}
                                                    </span>
                                                </span>
                                            </label>
                                        );
                                    })}
                                </RadioGroup>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Estado y fechas</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4">
                                <Field>
                                    <FieldLabel htmlFor="estado">
                                        Estado *
                                    </FieldLabel>
                                    <Select
                                        value={data.estado}
                                        onValueChange={(v) =>
                                            setData(
                                                'estado',
                                                v as Tender['estado'],
                                            )
                                        }
                                    >
                                        <SelectTrigger id="estado">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="borrador">
                                                Borrador
                                            </SelectItem>
                                            <SelectItem value="publicado">
                                                Publicado
                                            </SelectItem>
                                            <SelectItem value="cerrado">
                                                Cerrado
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="fecha_publicacion">
                                        Publicación
                                    </FieldLabel>
                                    <Input
                                        id="fecha_publicacion"
                                        type="datetime-local"
                                        value={data.fecha_publicacion}
                                        onChange={(e) =>
                                            setData(
                                                'fecha_publicacion',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="fecha_cierre">
                                        Fecha de cierre
                                    </FieldLabel>
                                    <Input
                                        id="fecha_cierre"
                                        type="datetime-local"
                                        value={data.fecha_cierre}
                                        onChange={(e) =>
                                            setData(
                                                'fecha_cierre',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </Field>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Imagen destacada</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {imagePreview ? (
                                    <div className="group relative aspect-video overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/10">
                                        <img
                                            src={imagePreview}
                                            alt="Vista previa"
                                            className="size-full object-contain"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-foreground/40 opacity-0 transition-opacity group-hover:opacity-100">
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                onClick={removeImage}
                                            >
                                                <X className="size-4" /> Quitar
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            imageInputRef.current?.click()
                                        }
                                        className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-input text-muted-foreground transition-colors hover:border-ring hover:bg-muted/50"
                                    >
                                        <Upload className="size-7" />
                                        <span className="text-sm font-medium">
                                            Subir imagen
                                        </span>
                                    </button>
                                )}
                                <input
                                    ref={imageInputRef}
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                                {errors.featured_image && (
                                    <FieldError className="mt-2">
                                        {errors.featured_image}
                                    </FieldError>
                                )}
                            </CardContent>
                        </Card>

                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-full"
                        >
                            <Save className="size-4" />
                            {processing ? 'Guardando…' : 'Guardar licitación'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
