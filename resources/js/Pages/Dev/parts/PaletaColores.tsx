// Tokens de color de marca (design.md §2). Los cromáticos en 3 pasos: subtle · DEFAULT · strong.
// Nota: las clases van literales (Tailwind no genera clases construidas con plantillas).

type Step = { label: string; bg: string; text: string };
type Cromatico = { name: string; hex: string; steps: Step[] };

const CROMATICOS: Cromatico[] = [
    {
        name: 'accent',
        hex: '#FBDC1D',
        steps: [
            {
                label: 'subtle',
                bg: 'bg-accent-subtle',
                text: 'text-accent-strong',
            },
            {
                label: 'DEFAULT',
                bg: 'bg-accent',
                text: 'text-accent-foreground',
            },
            {
                label: 'strong',
                bg: 'bg-accent-strong',
                text: 'text-background',
            },
        ],
    },
    {
        name: 'destructive',
        hex: '#D9141B',
        steps: [
            {
                label: 'subtle',
                bg: 'bg-destructive-subtle',
                text: 'text-destructive-strong',
            },
            {
                label: 'DEFAULT',
                bg: 'bg-destructive',
                text: 'text-destructive-foreground',
            },
            {
                label: 'strong',
                bg: 'bg-destructive-strong',
                text: 'text-background',
            },
        ],
    },
    {
        name: 'success',
        hex: '#00B53C',
        steps: [
            {
                label: 'subtle',
                bg: 'bg-success-subtle',
                text: 'text-success-strong',
            },
            {
                label: 'DEFAULT',
                bg: 'bg-success',
                text: 'text-success-foreground',
            },
            {
                label: 'strong',
                bg: 'bg-success-strong',
                text: 'text-background',
            },
        ],
    },
];

const NEUTROS: Step[] = [
    { label: 'primary', bg: 'bg-primary', text: 'text-primary-foreground' },
    {
        label: 'secondary',
        bg: 'bg-secondary',
        text: 'text-secondary-foreground',
    },
    { label: 'muted', bg: 'bg-muted', text: 'text-muted-foreground' },
];

function Muestra({ step }: { step: Step }) {
    return (
        <div className="overflow-hidden rounded-lg border">
            <div
                className={`flex h-16 items-center justify-center ${step.bg} ${step.text}`}
            >
                <span className="text-small font-medium">Aa</span>
            </div>
            <div className="px-3 py-2">
                <p className="text-caption text-muted-foreground">{step.bg}</p>
            </div>
        </div>
    );
}

export default function PaletaColores() {
    return (
        <section className="space-y-6">
            <h2 className="font-display text-h2">Colores (tokens)</h2>

            <div className="space-y-5">
                {CROMATICOS.map((c) => (
                    <div key={c.name} className="space-y-2">
                        <p className="text-small font-medium">
                            {c.name}{' '}
                            <span className="text-caption text-muted-foreground">
                                {c.hex}
                            </span>
                        </p>
                        <div className="grid grid-cols-3 gap-4">
                            {c.steps.map((s) => (
                                <Muestra key={s.bg} step={s} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-2">
                <p className="text-small font-medium">Neutros</p>
                <div className="grid grid-cols-3 gap-4">
                    {NEUTROS.map((s) => (
                        <Muestra key={s.bg} step={s} />
                    ))}
                </div>
            </div>
        </section>
    );
}
