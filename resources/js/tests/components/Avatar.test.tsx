import { Avatar, AvatarFallback, AvatarImage } from '@/Components/base/Avatar';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('Avatar (base)', () => {
    it('renderiza el root con data-slot y size por defecto', () => {
        const { container } = render(
            <Avatar>
                <AvatarFallback>CN</AvatarFallback>
            </Avatar>,
        );
        const root = container.querySelector('[data-slot="avatar"]');
        expect(root).not.toBeNull();
        expect(root).toHaveAttribute('data-size', 'default');
    });

    it('propaga el tamaño al atributo data-size', () => {
        const { container } = render(
            <Avatar size="lg">
                <AvatarFallback>CN</AvatarFallback>
            </Avatar>,
        );
        expect(container.querySelector('[data-slot="avatar"]')).toHaveAttribute(
            'data-size',
            'lg',
        );
    });

    it('muestra el fallback cuando la imagen no carga (jsdom)', () => {
        render(
            <Avatar>
                <AvatarImage src="/no-existe.png" alt="Usuario" />
                <AvatarFallback>CN</AvatarFallback>
            </Avatar>,
        );
        expect(screen.getByText('CN')).toBeInTheDocument();
    });
});
