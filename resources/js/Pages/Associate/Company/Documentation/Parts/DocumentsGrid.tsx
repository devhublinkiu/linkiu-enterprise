import { Check, Download, Eye, FileText, Trash2, Upload } from 'lucide-react';
import { ChangeEvent } from 'react';

import { Badge } from '@/Components/base/Badge';
import { Button } from '@/Components/base/Button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/Components/base/Card';
import { getDocumentIcon } from '@/lib/documentIcons';
import { cn } from '@/lib/utils';

import {
    acceptAttr,
    DocSpec,
    DocumentationForm,
    DocumentCatalog,
    fileExtension,
    humanSize,
    MAX_FILE_BYTES,
    MAX_FILE_MB,
} from '../types';

interface Props {
    catalog: DocumentCatalog;
    data: DocumentationForm;
    setData: <K extends keyof DocumentationForm>(
        key: K,
        value: DocumentationForm[K],
    ) => void;
    fileUrls: Record<string, string>;
    fileErrors: Record<string, string>;
    setFileErrors: (errors: Record<string, string>) => void;
    errors: Partial<Record<string, string>>;
    disabled: boolean;
    onPreview: (url: string, name: string) => void;
    onDelete: (key: string, label: string) => void;
}

export default function DocumentsGrid({
    catalog,
    data,
    setData,
    fileUrls,
    fileErrors,
    setFileErrors,
    errors,
    disabled,
    onPreview,
    onDelete,
}: Props) {
    const uploadedMandatory = catalog.mandatory.filter(
        (d) => data.files[d.key] || fileUrls[d.key],
    ).length;

    const onPick = (spec: DocSpec, e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;

        const ext = fileExtension(file.name);
        const next = { ...fileErrors };

        if (spec.accepts.length && !spec.accepts.includes(ext)) {
            next[spec.key] =
                `Formato no permitido (.${ext}). Aceptado: ${spec.accepts
                    .map((a) => a.toUpperCase())
                    .join(', ')}.`;
            setFileErrors(next);
            return;
        }
        if (file.size > MAX_FILE_BYTES) {
            next[spec.key] =
                `El archivo pesa ${humanSize(file.size)}. El máximo es ${MAX_FILE_MB} MB.`;
            setFileErrors(next);
            return;
        }

        delete next[spec.key];
        setFileErrors(next);
        setData('files', { ...data.files, [spec.key]: file });
    };

    const renderDoc = (doc: DocSpec, required: boolean) => {
        const Icon = getDocumentIcon(doc.icon);
        const hasLocal = !!data.files[doc.key];
        const hasRemote = !!fileUrls[doc.key];
        const uploaded = hasLocal || hasRemote;
        const error = fileErrors[doc.key] || errors[`files.${doc.key}`];

        return (
            <div
                key={doc.key}
                className={cn(
                    'flex flex-col gap-3 rounded-lg border p-4',
                    error
                        ? 'border-destructive/40 bg-destructive/5'
                        : 'border-border bg-card',
                )}
            >
                <div className="flex items-start justify-between gap-3">
                    <span
                        className={cn(
                            'flex size-9 shrink-0 items-center justify-center rounded-lg',
                            uploaded
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground',
                        )}
                    >
                        {uploaded ? (
                            <Check className="size-4" />
                        ) : (
                            <Icon className="size-4" />
                        )}
                    </span>
                    {required ? (
                        <Badge variant="secondary">Obligatorio</Badge>
                    ) : (
                        <Badge variant="outline">Opcional</Badge>
                    )}
                </div>

                <div className="space-y-0.5">
                    <p className="text-sm font-medium text-foreground">
                        {doc.label}
                    </p>
                    {doc.legend && (
                        <p className="text-xs text-muted-foreground">
                            {doc.legend}
                        </p>
                    )}
                    <p className="truncate text-xs text-muted-foreground">
                        {hasLocal
                            ? data.files[doc.key].name
                            : hasRemote
                              ? 'Documento cargado'
                              : doc.accepts
                                    .map((a) => a.toUpperCase())
                                    .join(', ')}
                    </p>
                    {error && (
                        <p role="alert" className="text-xs text-destructive">
                            {error}
                        </p>
                    )}
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-2">
                    {hasRemote && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                onPreview(fileUrls[doc.key], doc.label)
                            }
                        >
                            <Eye className="size-4" /> Ver
                        </Button>
                    )}
                    {!disabled && (
                        <Button asChild variant="outline" size="sm">
                            <label className="cursor-pointer">
                                <Upload className="size-4" />
                                {hasLocal || hasRemote
                                    ? 'Reemplazar'
                                    : 'Cargar'}
                                <input
                                    type="file"
                                    accept={acceptAttr(doc.accepts)}
                                    className="hidden"
                                    onChange={(e) => onPick(doc, e)}
                                />
                            </label>
                        </Button>
                    )}
                    {!disabled && hasRemote && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Eliminar ${doc.label}`}
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => onDelete(doc.key, doc.label)}
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    )}
                    {doc.template && (
                        <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="ml-auto"
                        >
                            <a
                                href={doc.template}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Download className="size-4" /> Plantilla
                            </a>
                        </Button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="size-4 text-muted-foreground" />
                    Documentación
                </CardTitle>
                <span className="text-sm text-muted-foreground">
                    {uploadedMandatory}/{catalog.mandatory.length} obligatorios
                </span>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-3 sm:grid-cols-2">
                    {catalog.mandatory.map((doc) => renderDoc(doc, true))}
                </div>

                {catalog.optional.length > 0 && (
                    <div className="space-y-3">
                        <p className="text-sm font-medium text-muted-foreground">
                            Otros documentos y certificaciones
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {catalog.optional.map((doc) =>
                                renderDoc(doc, false),
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
