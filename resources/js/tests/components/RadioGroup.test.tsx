import { RadioGroup, RadioGroupItem } from '@/Components/base/RadioGroup';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('RadioGroup (base)', () => {
    it('renderiza el grupo y los ítems con data-slot y rol radio', () => {
        render(
            <RadioGroup aria-label="grupo">
                <RadioGroupItem value="a" />
                <RadioGroupItem value="b" />
            </RadioGroup>,
        );
        expect(screen.getByRole('radiogroup')).toHaveAttribute(
            'data-slot',
            'radio-group',
        );
        const radios = screen.getAllByRole('radio');
        expect(radios).toHaveLength(2);
        expect(radios[0]).toHaveAttribute('data-slot', 'radio-group-item');
    });

    it('selecciona y notifica el cambio de valor', () => {
        const onChange = vi.fn();
        render(
            <RadioGroup aria-label="grupo" onValueChange={onChange}>
                <RadioGroupItem value="a" />
                <RadioGroupItem value="b" />
            </RadioGroup>,
        );
        const [first, second] = screen.getAllByRole('radio');
        fireEvent.click(second);
        expect(onChange).toHaveBeenCalledWith('b');
        expect(second).toHaveAttribute('data-state', 'checked');
        expect(first).toHaveAttribute('data-state', 'unchecked');
    });

    it('respeta disabled en un ítem', () => {
        render(
            <RadioGroup aria-label="grupo">
                <RadioGroupItem value="a" disabled />
                <RadioGroupItem value="b" />
            </RadioGroup>,
        );
        expect(screen.getAllByRole('radio')[0]).toBeDisabled();
    });
});
