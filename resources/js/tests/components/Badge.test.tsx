import { Badge } from '@/Components/base/Badge';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('Badge (base)', () => {
    it('renderiza con data-slot y variante por defecto', () => {
        render(<Badge>Nuevo</Badge>);
        const badge = screen.getByText('Nuevo');
        expect(badge).toHaveAttribute('data-slot', 'badge');
        expect(badge).toHaveAttribute('data-variant', 'default');
    });

    it('aplica la variante indicada', () => {
        render(<Badge variant="destructive">3</Badge>);
        expect(screen.getByText('3')).toHaveAttribute(
            'data-variant',
            'destructive',
        );
    });

    it('con asChild renderiza el elemento hijo (enlace)', () => {
        render(
            <Badge asChild>
                <a href="#link">Abrir</a>
            </Badge>,
        );
        const link = screen.getByRole('link', { name: 'Abrir' });
        expect(link).toHaveAttribute('data-slot', 'badge');
    });
});
