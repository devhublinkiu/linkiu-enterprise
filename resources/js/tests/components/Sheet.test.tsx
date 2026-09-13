import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetTitle,
    SheetTrigger,
} from '@/Components/base/Sheet';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('Sheet (base)', () => {
    it('renderiza el trigger con data-slot', () => {
        render(
            <Sheet>
                <SheetTrigger>Abrir</SheetTrigger>
                <SheetContent>
                    <SheetTitle>Título</SheetTitle>
                    <SheetDescription>Descripción</SheetDescription>
                </SheetContent>
            </Sheet>,
        );
        expect(screen.getByText('Abrir')).toHaveAttribute(
            'data-slot',
            'sheet-trigger',
        );
    });

    it('muestra el contenido, el título y el botón cerrar cuando está abierto', () => {
        render(
            <Sheet defaultOpen>
                <SheetTrigger>Abrir</SheetTrigger>
                <SheetContent>
                    <SheetTitle>Título</SheetTitle>
                    <SheetDescription>Descripción</SheetDescription>
                </SheetContent>
            </Sheet>,
        );
        expect(screen.getByText('Título')).toBeInTheDocument();
        expect(screen.getByText('Cerrar')).toBeInTheDocument();
    });
});
