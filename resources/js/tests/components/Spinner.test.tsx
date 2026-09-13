import { Spinner } from '@/Components/base/Spinner';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('Spinner (base)', () => {
    it('expone rol status y etiqueta accesible en español', () => {
        render(<Spinner />);
        const spinner = screen.getByRole('status');
        expect(spinner).toBeInTheDocument();
        expect(spinner).toHaveAttribute('aria-label', 'Cargando');
        expect(spinner).toHaveAttribute('data-slot', 'spinner');
    });

    it('permite ajustar el tamaño por className', () => {
        render(<Spinner className="size-8" />);
        expect(screen.getByRole('status')).toHaveClass('size-8');
    });
});
