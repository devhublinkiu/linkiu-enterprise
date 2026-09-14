import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from '@/Components/base/Select';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('Select (base)', () => {
    it('cerrado muestra el placeholder y oculta los ítems', () => {
        render(
            <Select>
                <SelectTrigger>
                    <SelectValue placeholder="Selecciona una opción" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="SAS">SAS</SelectItem>
                    <SelectItem value="Ltda.">Ltda.</SelectItem>
                </SelectContent>
            </Select>,
        );
        expect(screen.getByText('Selecciona una opción')).toBeInTheDocument();
        expect(screen.queryByText('SAS')).not.toBeInTheDocument();
    });

    it('con defaultOpen muestra etiqueta, ítems y separador', () => {
        render(
            <Select defaultOpen>
                <SelectTrigger>
                    <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Tipos</SelectLabel>
                        <SelectItem value="SAS">SAS</SelectItem>
                        <SelectSeparator />
                        <SelectItem value="ESAL">ESAL</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>,
        );
        expect(screen.getByText('Tipos')).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'SAS' })).toBeInTheDocument();
        expect(
            screen.getByRole('option', { name: 'ESAL' }),
        ).toBeInTheDocument();
    });

    it('el trigger lleva data-slot, tamaño por defecto y propaga aria-invalid', () => {
        render(
            <Select>
                <SelectTrigger aria-invalid>
                    <SelectValue placeholder="País" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="co">Colombia</SelectItem>
                </SelectContent>
            </Select>,
        );
        const trigger = screen.getByRole('combobox');
        expect(trigger).toHaveAttribute('data-slot', 'select-trigger');
        expect(trigger).toHaveAttribute('data-size', 'default');
        expect(trigger).toHaveAttribute('aria-invalid', 'true');
    });
});
