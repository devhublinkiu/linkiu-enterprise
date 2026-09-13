import { Checkbox } from '@/Components/base/Checkbox';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('Checkbox (base)', () => {
    it('renderiza con rol checkbox y data-slot', () => {
        render(<Checkbox />);
        const chk = screen.getByRole('checkbox');
        expect(chk).toHaveAttribute('data-slot', 'checkbox');
    });

    it('dispara onCheckedChange al hacer clic', () => {
        const onChange = vi.fn();
        render(<Checkbox onCheckedChange={onChange} />);
        fireEvent.click(screen.getByRole('checkbox'));
        expect(onChange).toHaveBeenCalledWith(true);
    });

    it('respeta disabled', () => {
        render(<Checkbox disabled />);
        expect(screen.getByRole('checkbox')).toBeDisabled();
    });
});
