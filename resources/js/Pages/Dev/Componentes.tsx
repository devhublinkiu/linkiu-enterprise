import { Head } from '@inertiajs/react';
import ComponentesBase from './parts/ComponentesBase';
import PaletaColores from './parts/PaletaColores';
import Tipografia from './parts/Tipografia';

// Galería de componentes — SOLO local, temporal. Regla 9 (design.md §6).
// Muestra el sistema de diseño: tokens de color, tipografía y componentes de base/.
export default function Componentes() {
    return (
        <div className="min-h-screen bg-background font-sans text-foreground">
            <Head title="Galería de componentes" />
            <div className="mx-auto max-w-4xl space-y-12 px-6 py-10">
                <header className="space-y-1">
                    <h1 className="font-display text-h1">
                        Galería de componentes
                    </h1>
                    <p className="text-body text-muted-foreground">
                        Vista temporal (solo en local) del sistema de diseño:
                        tokens de color, tipografía y los componentes de{' '}
                        <code>@/Components/base/</code>.
                    </p>
                </header>

                <PaletaColores />
                <Tipografia />
                <ComponentesBase />
            </div>
        </div>
    );
}
