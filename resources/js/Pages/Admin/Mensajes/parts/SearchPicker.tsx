import { Check, Search } from 'lucide-react';
import { useState } from 'react';

import { ScrollArea } from '@/Components/base/ScrollArea';
import { cn } from '@/lib/utils';

// Selector buscable de una opción (asociado o grupo). Composición local de la
// bandeja a partir de primitivas (Input nativo + ScrollArea); solo tokens.
export interface PickerOption {
    id: number;
    name: string;
    count?: number;
}

interface Props {
    options: PickerOption[];
    value: number | null;
    onChange: (id: number) => void;
    placeholder?: string;
    emptyLabel?: string;
}

export default function SearchPicker({
    options,
    value,
    onChange,
    placeholder = 'Buscar…',
    emptyLabel = 'Sin resultados',
}: Props) {
    const [q, setQ] = useState('');
    const filtered = options.filter((o) =>
        o.name.toLowerCase().includes(q.trim().toLowerCase()),
    );

    return (
        <div className="overflow-hidden rounded-lg border border-input">
            <div className="flex items-center gap-2 border-b border-border px-3">
                <Search className="size-4 shrink-0 text-muted-foreground" />
                <input
                    type="text"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={placeholder}
                    className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    aria-label={placeholder}
                />
            </div>
            <ScrollArea className="h-48">
                <div className="p-1">
                    {filtered.length === 0 ? (
                        <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                            {emptyLabel}
                        </p>
                    ) : (
                        filtered.map((o) => (
                            <button
                                key={o.id}
                                type="button"
                                onClick={() => onChange(o.id)}
                                className={cn(
                                    'flex w-full items-center justify-between gap-2 rounded-md px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted',
                                    value === o.id &&
                                        'bg-muted font-medium text-foreground',
                                )}
                            >
                                <span className="min-w-0 flex-1 truncate">
                                    {o.name}
                                    {o.count !== undefined && (
                                        <span className="ml-1 text-muted-foreground">
                                            · {o.count}
                                        </span>
                                    )}
                                </span>
                                {value === o.id && (
                                    <Check className="size-4 shrink-0 text-primary" />
                                )}
                            </button>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
