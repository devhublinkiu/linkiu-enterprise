// Muestra la escala tipográfica codificada (design.md §3).
const ESCALA = [
    { u: 'text-display', label: 'Display', cls: 'font-display text-display' },
    { u: 'text-h1', label: 'Título 1', cls: 'font-display text-h1' },
    { u: 'text-h2', label: 'Título 2', cls: 'font-display text-h2' },
    { u: 'text-h3', label: 'Título 3', cls: 'text-h3' },
    { u: 'text-body', label: 'Cuerpo', cls: 'text-body' },
    { u: 'text-small', label: 'Pequeño', cls: 'text-small' },
    { u: 'text-caption', label: 'Leyenda', cls: 'text-caption' },
];

export default function Tipografia() {
    return (
        <section className="space-y-4">
            <h2 className="font-display text-h2">Tipografía</h2>
            <div className="space-y-3">
                {ESCALA.map((e) => (
                    <div
                        key={e.u}
                        className="flex items-baseline gap-4 border-b pb-3"
                    >
                        <code className="w-28 shrink-0 text-caption text-muted-foreground">
                            {e.u}
                        </code>
                        <span className={e.cls}>CAMEP — {e.label}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}
