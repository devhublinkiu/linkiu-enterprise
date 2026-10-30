import { useForm } from '@inertiajs/react';
import { Paperclip, Send, X } from 'lucide-react';

import { Button } from '@/Components/base/Button';
import { Textarea } from '@/Components/base/Textarea';

interface Props {
    // Ruta a la que se envía la respuesta (admin o asociado comparten este part).
    action: string;
    // Avisa al hilo cuándo hay un envío en curso, para pintar "Enviando…" dentro
    // del chat (no debajo del compositor).
    onSendingChange?: (sending: boolean) => void;
}

// Caja de redacción de un hilo: texto + adjuntos + enviar. El indicador
// "Enviando…" lo pinta el hilo dentro del chat. Ctrl/⌘+Enter envía.
export default function Composer({ action, onSendingChange }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm<{
        body: string;
        attachments: File[];
    }>({
        body: '',
        attachments: [],
    });

    const send = () => {
        if (!data.body.trim() && data.attachments.length === 0) return;
        onSendingChange?.(true);
        post(action, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => reset(),
            onFinish: () => onSendingChange?.(false),
        });
    };

    const removeFile = (idx: number) =>
        setData(
            'attachments',
            data.attachments.filter((_, i) => i !== idx),
        );

    return (
        <div className="border-t border-border bg-background p-3">
            {data.attachments.length > 0 && (
                <ul className="mb-2 flex flex-wrap gap-2">
                    {data.attachments.map((f, i) => (
                        <li
                            key={`${f.name}-${i}`}
                            className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-2.5 py-1.5 text-xs"
                        >
                            <span className="max-w-[160px] truncate">
                                {f.name}
                            </span>
                            <button
                                type="button"
                                onClick={() => removeFile(i)}
                                className="text-muted-foreground hover:text-foreground"
                                aria-label={`Quitar ${f.name}`}
                            >
                                <X className="size-3.5" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <div className="flex items-end gap-2">
                <input
                    id="reply-files"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) =>
                        setData(
                            'attachments',
                            [
                                ...data.attachments,
                                ...Array.from(e.target.files ?? []),
                            ].slice(0, 5),
                        )
                    }
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    asChild
                    aria-label="Adjuntar archivos"
                >
                    <label htmlFor="reply-files">
                        <Paperclip className="size-5" />
                    </label>
                </Button>

                <Textarea
                    value={data.body}
                    onChange={(e) => setData('body', e.target.value)}
                    onKeyDown={(e) => {
                        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                            e.preventDefault();
                            send();
                        }
                    }}
                    rows={1}
                    maxLength={5000}
                    placeholder="Escribe un mensaje…"
                    className="max-h-40 min-h-10 flex-1 resize-none"
                />

                <Button
                    type="button"
                    size="icon"
                    onClick={send}
                    disabled={processing}
                    aria-label="Enviar"
                >
                    <Send className="size-5" />
                </Button>
            </div>

            {errors.body && (
                <p className="mt-1 text-sm text-destructive">{errors.body}</p>
            )}
            {errors.attachments && (
                <p className="mt-1 text-sm text-destructive">
                    {errors.attachments}
                </p>
            )}
        </div>
    );
}
