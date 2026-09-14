import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '@/Components/base/Combobox';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

const items = ['Antioquia', 'Boyacá', 'Meta'];

describe('Combobox (base)', () => {
    it('renderiza el input de búsqueda y, cerrado, oculta los ítems', () => {
        render(
            <Combobox items={items}>
                <ComboboxInput placeholder="Departamento" />
                <ComboboxContent>
                    <ComboboxEmpty>Sin resultados.</ComboboxEmpty>
                    <ComboboxList>
                        {(item: string) => (
                            <ComboboxItem key={item} value={item}>
                                {item}
                            </ComboboxItem>
                        )}
                    </ComboboxList>
                </ComboboxContent>
            </Combobox>,
        );

        const input = screen.getByPlaceholderText('Departamento');
        expect(input).toHaveAttribute('data-slot', 'input-group-control');
        // Cerrado: la lista está en un portal y no muestra los ítems.
        expect(screen.queryByText('Antioquia')).not.toBeInTheDocument();
    });
});
