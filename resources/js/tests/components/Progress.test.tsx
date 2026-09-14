import { Progress } from '@/Components/base/Progress';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('Progress (base)', () => {
    it('renderiza un progressbar con data-slot y valuemax', () => {
        render(<Progress value={66} />);
        const bar = screen.getByRole('progressbar');
        expect(bar).toHaveAttribute('data-slot', 'progress');
        // La spec de shadcn no reenvía `value` al Root (solo lo usa en el indicador),
        // así que Radix no expone aria-valuenow; aria-valuemax sí está presente.
        expect(bar).toHaveAttribute('aria-valuemax', '100');
    });

    it('desplaza el indicador según el valor', () => {
        const { container } = render(<Progress value={66} />);
        const indicator = container.querySelector(
            '[data-slot="progress-indicator"]',
        );
        expect(indicator).not.toBeNull();
        expect(indicator).toHaveStyle({ transform: 'translateX(-34%)' });
    });

    it('sin valor no desplaza más allá del 100%', () => {
        const { container } = render(<Progress />);
        const indicator = container.querySelector(
            '[data-slot="progress-indicator"]',
        );
        expect(indicator).toHaveStyle({ transform: 'translateX(-100%)' });
    });
});
