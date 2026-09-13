import { Button } from '@/Components/base/Button';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('Button (base)', () => {
    it('renderiza un <button> con los data-* por defecto', () => {
        render(<Button>Guardar</Button>);
        const btn = screen.getByRole('button', { name: 'Guardar' });
        expect(btn).toHaveAttribute('data-slot', 'button');
        expect(btn).toHaveAttribute('data-variant', 'default');
        expect(btn).toHaveAttribute('data-size', 'default');
    });

    it('refleja variant y size en los data-*', () => {
        render(
            <Button variant="destructive" size="sm">
                Eliminar
            </Button>,
        );
        const btn = screen.getByRole('button', { name: 'Eliminar' });
        expect(btn).toHaveAttribute('data-variant', 'destructive');
        expect(btn).toHaveAttribute('data-size', 'sm');
    });

    it('con asChild delega en el hijo (renderiza <a>, no <button>)', () => {
        render(
            <Button asChild>
                <a href="/entrar">Entrar</a>
            </Button>,
        );
        const link = screen.getByRole('link', { name: 'Entrar' });
        expect(link).toHaveAttribute('href', '/entrar');
        expect(link).toHaveAttribute('data-slot', 'button');
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
});
