import { useForm } from '@inertiajs/react';
import { FileText, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/Components/base/Button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/base/Dialog';
import { Field, FieldContent, FieldLabel } from '@/Components/base/Field';
import { Input } from '@/Components/base/Input';
import { Switch } from '@/Components/base/Switch';
import { getDocumentIcon } from '@/lib/documentIcons';
import { cn } from '@/lib/utils';

import FormField from '../../../Associate/Company/BasicInfo/Parts/FormField';
import { DocumentRequirement, MIME_LABELS, toKeySlug } from '../types';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    document: DocumentRequirement | null;
    allowedIcons: string[];
    allowedMimes: string[];
}

export default function DocumentDialog({
    open,
    onOpenChange,
    document,
    allowedIcons,
    allowedMimes,
}: Props) {
    const isEdit = !!document;
    const [autoKey, setAutoKey] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, clearErrors } = useForm({
        key: '',
        label: '',
        icon: 'FileText',
        accepts: ['pdf'] as string[],
        is_required: true,
        is_active: true,
        legend: '',
        template_file: null as File | null,
        remove_template: false,
    });

    // Sincroniza el form al abrir (crear vacío / editar con los datos del documento).
    useEffect(() => {
        if (!open) return;
        clearErrors();
        setAutoKey(!document);
        setData({
            key: document?.key ?? '',
            label: document?.label ?? '',
            icon: document?.icon ?? 'FileText',
            accepts: document?.accepts?.length ? document.accepts : ['pdf'],
            is_required: document?.is_required ?? true,
            is_active: document?.is_active ?? true,
            legend: document?.legend ?? '',
            template_file: null,
            remove_template: false,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, document]);

    const handleLabel = (value: string) => {
        setData((prev) => ({
            ...prev,
            label: value,
            key: autoKey && !isEdit ? toKeySlug(value) : prev.key,
        }));
    };

    const toggleMime = (mime: string) => {
        const next = data.accepts.includes(mime)
            ? data.accepts.filter((m) => m !== mime)
            : [...data.accepts, mime];
        // Siempre debe quedar al menos un formato.
        setData('accepts', next.length ? next : data.accepts);
    };

    const submit = () => {
        const url =
            isEdit && document
                ? route('admin.document-requirements.update', document.id)
                : route('admin.document-requirements.store');

        post(url, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        });
    };

    const hasExistingTemplate =
        isEdit &&
        !!document?.template_url &&
        !data.template_file &&
        !data.remove_template;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? 'Editar documento' : 'Nuevo documento'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-5">
                    <FormField
                        id="doc-label"
                        label="Nombre visible"
                        required
                        error={errors.label}
                        hint="Lo que ve el asociado como título del documento."
                    >
                        <Input
                            id="doc-label"
                            value={data.label}
                            onChange={(e) => handleLabel(e.target.value)}
                            aria-invalid={!!errors.label}
                            placeholder="Ej. Certificado de tradición y libertad"
                            autoFocus
                        />
                    </FormField>

                    <FormField
                        id="doc-key"
                        label="Clave interna (slug)"
                        error={errors.key}
                        hint={
                            isEdit
                                ? 'No se puede editar después de creado.'
                                : 'Solo minúsculas, números y guion bajo.'
                        }
                    >
                        {!isEdit && (
                            <label className="mb-1 flex w-fit items-center gap-2 text-sm text-muted-foreground">
                                <Switch
                                    size="sm"
                                    checked={autoKey}
                                    onCheckedChange={(v) => setAutoKey(v)}
                                    aria-label="Generar la clave automáticamente"
                                />
                                Generar automáticamente
                            </label>
                        )}
                        <Input
                            id="doc-key"
                            value={data.key}
                            onChange={(e) => {
                                setData('key', e.target.value);
                                setAutoKey(false);
                            }}
                            aria-invalid={!!errors.key}
                            disabled={isEdit}
                            placeholder="certificado_tradicion_libertad"
                        />
                    </FormField>

                    {/* Selector de ícono */}
                    <Field>
                        <FieldLabel htmlFor="doc-icon-grid">Ícono</FieldLabel>
                        <div
                            id="doc-icon-grid"
                            className="grid grid-cols-8 gap-2 rounded-lg border border-input bg-muted/30 p-3"
                        >
                            {allowedIcons.map((name) => {
                                const Icon = getDocumentIcon(name);
                                const selected = data.icon === name;
                                return (
                                    <button
                                        key={name}
                                        type="button"
                                        title={name}
                                        aria-label={`Ícono ${name}`}
                                        aria-pressed={selected}
                                        onClick={() => setData('icon', name)}
                                        className={cn(
                                            'flex size-9 items-center justify-center rounded-md border transition-colors',
                                            selected
                                                ? 'border-primary bg-primary text-primary-foreground'
                                                : 'border-input bg-background text-muted-foreground hover:border-foreground/30',
                                        )}
                                    >
                                        <Icon className="size-4" />
                                    </button>
                                );
                            })}
                        </div>
                    </Field>

                    {/* Tipos de archivo permitidos */}
                    <Field data-invalid={errors.accepts ? 'true' : undefined}>
                        <FieldLabel htmlFor="doc-accepts">
                            Tipos de archivo permitidos
                            <span className="text-destructive"> *</span>
                        </FieldLabel>
                        <div id="doc-accepts" className="flex flex-wrap gap-2">
                            {allowedMimes.map((mime) => {
                                const selected = data.accepts.includes(mime);
                                return (
                                    <button
                                        key={mime}
                                        type="button"
                                        aria-pressed={selected}
                                        onClick={() => toggleMime(mime)}
                                        className={cn(
                                            'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                                            selected
                                                ? 'border-primary bg-primary text-primary-foreground'
                                                : 'border-input bg-background text-muted-foreground hover:border-foreground/30',
                                        )}
                                    >
                                        {MIME_LABELS[mime] ??
                                            mime.toUpperCase()}
                                    </button>
                                );
                            })}
                        </div>
                        {errors.accepts && (
                            <p
                                role="alert"
                                className="text-sm text-destructive"
                            >
                                {errors.accepts}
                            </p>
                        )}
                    </Field>

                    <FormField
                        id="doc-legend"
                        label="Leyenda corta"
                        error={errors.legend}
                        hint="Aclaración opcional. Ej. «Del año más reciente»."
                    >
                        <Input
                            id="doc-legend"
                            value={data.legend}
                            onChange={(e) => setData('legend', e.target.value)}
                            aria-invalid={!!errors.legend}
                            maxLength={255}
                            placeholder="Ej. Del año más reciente"
                        />
                    </FormField>

                    {/* Plantilla descargable */}
                    <Field>
                        <FieldLabel htmlFor="doc-template">
                            Plantilla descargable (opcional)
                        </FieldLabel>
                        {hasExistingTemplate && (
                            <div className="flex items-center gap-2 rounded-lg border border-input bg-muted/30 p-2.5">
                                <FileText className="size-4 shrink-0 text-muted-foreground" />
                                <a
                                    href={document?.template_url ?? undefined}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 truncate text-sm text-foreground hover:underline"
                                >
                                    {document?.template_path}
                                </a>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() =>
                                        setData('remove_template', true)
                                    }
                                >
                                    Quitar
                                </Button>
                            </div>
                        )}
                        {data.remove_template && (
                            <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                La plantilla actual se eliminará al guardar.
                                <button
                                    type="button"
                                    className="underline"
                                    onClick={() =>
                                        setData('remove_template', false)
                                    }
                                >
                                    Deshacer
                                </button>
                            </p>
                        )}
                        <input
                            id="doc-template"
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0] ?? null;
                                if (file) {
                                    setData((prev) => ({
                                        ...prev,
                                        template_file: file,
                                        remove_template: false,
                                    }));
                                }
                            }}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-center"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {data.template_file ? (
                                <>
                                    <FileText className="size-4" />
                                    {data.template_file.name}
                                </>
                            ) : (
                                <>
                                    <Upload className="size-4" />
                                    Subir plantilla (PDF/DOCX/XLSX)
                                </>
                            )}
                        </Button>
                        {data.template_file && (
                            <button
                                type="button"
                                className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                                onClick={() => setData('template_file', null)}
                            >
                                <X className="size-3.5" /> Quitar archivo
                            </button>
                        )}
                        {errors.template_file && (
                            <p
                                role="alert"
                                className="text-sm text-destructive"
                            >
                                {errors.template_file}
                            </p>
                        )}
                    </Field>

                    {/* Interruptores */}
                    <Field orientation="horizontal">
                        <FieldContent>
                            <FieldLabel htmlFor="doc-required">
                                Obligatorio
                            </FieldLabel>
                            <p className="text-sm text-muted-foreground">
                                El asociado no puede enviar a revisión sin este
                                documento.
                            </p>
                        </FieldContent>
                        <Switch
                            id="doc-required"
                            checked={data.is_required}
                            onCheckedChange={(v) => setData('is_required', v)}
                        />
                    </Field>

                    <Field orientation="horizontal">
                        <FieldContent>
                            <FieldLabel htmlFor="doc-active">
                                Activo en el catálogo
                            </FieldLabel>
                            <p className="text-sm text-muted-foreground">
                                Si se desactiva, el asociado no lo ve.
                            </p>
                        </FieldContent>
                        <Switch
                            id="doc-active"
                            checked={data.is_active}
                            onCheckedChange={(v) => setData('is_active', v)}
                        />
                    </Field>
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">
                            Cancelar
                        </Button>
                    </DialogClose>
                    <Button
                        type="button"
                        onClick={submit}
                        disabled={processing}
                    >
                        {isEdit ? 'Guardar cambios' : 'Crear documento'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
