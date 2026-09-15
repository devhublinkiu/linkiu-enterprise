import { ImagePlus, RotateCcw, X } from 'lucide-react';
import { useRef } from 'react';

export type Facade = { path: string; url: string };

// Gestor de las fotos de fachada (hasta 3, cuadradas). Presentacional: el estado
// (nuevas + marcadas para quitar) lo lleva la página de Contacto.
export default function FacadeManager({
    existing,
    removed,
    newFiles,
    max,
    onToggleRemove,
    onPick,
    onDropNew,
}: {
    existing: Facade[];
    removed: string[];
    newFiles: { file: File; url: string }[];
    max: number;
    onToggleRemove: (path: string) => void;
    onPick: (files: File[]) => void;
    onDropNew: (index: number) => void;
}) {
    const ref = useRef<HTMLInputElement>(null);
    const remaining = existing.length - removed.length + newFiles.length;

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
                {existing.map((f) => {
                    const isRemoved = removed.includes(f.path);
                    return (
                        <div
                            key={f.path}
                            className="relative size-24 overflow-hidden rounded-md border"
                        >
                            <img
                                src={f.url}
                                alt=""
                                className={
                                    'size-full object-cover' +
                                    (isRemoved ? ' opacity-30' : '')
                                }
                            />
                            <button
                                type="button"
                                onClick={() => onToggleRemove(f.path)}
                                aria-label={isRemoved ? 'Restaurar' : 'Quitar'}
                                className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/60 text-white"
                            >
                                {isRemoved ? (
                                    <RotateCcw className="size-3.5" />
                                ) : (
                                    <X className="size-3.5" />
                                )}
                            </button>
                        </div>
                    );
                })}
                {newFiles.map((n, i) => (
                    <div
                        key={n.url}
                        className="relative size-24 overflow-hidden rounded-md border border-primary"
                    >
                        <img
                            src={n.url}
                            alt=""
                            className="size-full object-cover"
                        />
                        <button
                            type="button"
                            onClick={() => onDropNew(i)}
                            aria-label="Quitar"
                            className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/60 text-white"
                        >
                            <X className="size-3.5" />
                        </button>
                    </div>
                ))}
                {remaining < max && (
                    <button
                        type="button"
                        onClick={() => ref.current?.click()}
                        className="grid size-24 place-items-center rounded-md border border-dashed border-border bg-muted text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                        aria-label="Añadir fachada"
                    >
                        <ImagePlus className="size-5" />
                    </button>
                )}
            </div>
            <p className="text-xs text-muted-foreground">
                Hasta {max} fotos cuadradas. Formatos JPG, PNG o WEBP. Máximo 5
                MB. Medida ideal 800x800 px.
            </p>
            <input
                ref={ref}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(e) => {
                    const picked = Array.from(e.target.files ?? []);
                    if (picked.length) onPick(picked);
                    if (ref.current) ref.current.value = '';
                }}
            />
        </div>
    );
}
