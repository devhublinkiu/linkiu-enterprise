import { Paperclip, X } from 'lucide-react';

import { Button } from '@/Components/base/Button';

interface Props {
    // id del input (único por formulario, para el htmlFor del label).
    id: string;
    files: File[];
    onChange: (files: File[]) => void;
    error?: string;
    max?: number;
}

// Campo de adjuntos: botón "Adjuntar archivos" + lista con quitar. Tope de
// archivos en cliente (el servidor valida de nuevo). Compartido por los
// compositores de admin y asociado.
export default function AttachmentField({
    id,
    files,
    onChange,
    error,
    max = 5,
}: Props) {
    const add = (list: FileList | null) =>
        onChange([...files, ...Array.from(list ?? [])].slice(0, max));
    const remove = (idx: number) => onChange(files.filter((_, i) => i !== idx));

    return (
        <div className="space-y-2">
            <div>
                <input
                    id={id}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => add(e.target.files)}
                />
                <Button type="button" variant="outline" size="sm" asChild>
                    <label htmlFor={id}>
                        <Paperclip className="size-4" />
                        Adjuntar archivos
                    </label>
                </Button>
                <span className="ml-2 text-xs text-muted-foreground">
                    Hasta {max} · 10 MB c/u
                </span>
            </div>
            {files.length > 0 && (
                <ul className="space-y-1">
                    {files.map((f, i) => (
                        <li
                            key={`${f.name}-${i}`}
                            className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/40 px-2.5 py-1.5 text-xs"
                        >
                            <span className="truncate">{f.name}</span>
                            <button
                                type="button"
                                onClick={() => remove(i)}
                                className="shrink-0 text-muted-foreground hover:text-foreground"
                                aria-label={`Quitar ${f.name}`}
                            >
                                <X className="size-4" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    );
}
