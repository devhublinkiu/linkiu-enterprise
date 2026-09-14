import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from '@/Components/base/Popover';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('Popover (base)', () => {
    it('cerrado muestra el trigger y oculta el contenido', () => {
        render(
            <Popover>
                <PopoverTrigger>Abrir</PopoverTrigger>
                <PopoverContent>
                    <PopoverHeader>
                        <PopoverTitle>Dimensiones</PopoverTitle>
                        <PopoverDescription>
                            Ajusta el tamaño.
                        </PopoverDescription>
                    </PopoverHeader>
                </PopoverContent>
            </Popover>,
        );
        expect(screen.getByText('Abrir')).toBeInTheDocument();
        expect(screen.queryByText('Dimensiones')).not.toBeInTheDocument();
    });

    it('con defaultOpen muestra título y descripción', () => {
        render(
            <Popover defaultOpen>
                <PopoverTrigger>Abrir</PopoverTrigger>
                <PopoverContent>
                    <PopoverHeader>
                        <PopoverTitle>Dimensiones</PopoverTitle>
                        <PopoverDescription>
                            Ajusta el tamaño.
                        </PopoverDescription>
                    </PopoverHeader>
                </PopoverContent>
            </Popover>,
        );
        expect(screen.getByText('Dimensiones')).toBeInTheDocument();
        expect(screen.getByText('Ajusta el tamaño.')).toBeInTheDocument();
    });
});
