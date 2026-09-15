import { ImagePlus, Trash2 } from 'lucide-react';
import { useRef } from 'react';

import { Button } from '@/Components/base/Button';
import { cn } from '@/lib/utils';

// Selector de una imagen: muestra la existente o la nueva (preview) y permite
// reemplazar/quitar. El padre guarda el File y el path; aquí solo se dispara.
export default function ImagePicker({
    previewUrl,
    onPick,
    onRemove,
    shape = 'square',
    label = 'Imagen',
    hint,
}: {
    previewUrl: string | null;
    onPick: (file: File, previewUrl: string) => void;
    onRemove: () => void;
    shape?: 'square' | 'wide' | 'tall' | 'circle';
    label?: string;
    hint?: string;
}) {
    const ref = useRef<HTMLInputElement>(null);

    const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        onPick(file, URL.createObjectURL(file));
        if (ref.current) ref.current.value = '';
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => ref.current?.click()}
                    className={cn(
                        'flex shrink-0 items-center justify-center overflow-hidden border border-dashed border-border bg-muted text-muted-foreground transition-colors hover:border-primary hover:text-primary',
                        shape === 'circle' && 'size-20 rounded-full',
                        shape === 'square' && 'size-20 rounded-lg',
                        shape === 'wide' && 'h-16 w-28 rounded-lg',
                        shape === 'tall' && 'h-28 w-20 rounded-lg',
                    )}
                    aria-label={label}
                >
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt=""
                            className="size-full object-contain"
                        />
                    ) : (
                        <ImagePlus className="size-6" />
                    )}
                </button>
                <input
                    ref={ref}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handle}
                />
                <div className="flex flex-col gap-1">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => ref.current?.click()}
                    >
                        {previewUrl ? 'Cambiar' : label}
                    </Button>
                    {previewUrl && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onRemove}
                            className="text-destructive"
                        >
                            <Trash2 />
                            Quitar
                        </Button>
                    )}
                </div>
            </div>
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
    );
}
