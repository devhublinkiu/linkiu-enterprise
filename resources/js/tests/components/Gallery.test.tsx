import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/Layouts/AppLayout', () => ({
    default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    router: { post: vi.fn(), delete: vi.fn() },
    useForm: () => ({ processing: false }),
}));

import Gallery from '@/Pages/Associate/Company/Gallery';

beforeEach(() => {
    vi.stubGlobal('route', (name: string) => `/${name}`);
});

describe('Associate/Company Gallery', () => {
    it('muestra el estado vacío cuando no hay fotos', () => {
        render(
            <Gallery
                auth={{}}
                initialAssociate={{
                    gallery_urls: [],
                    plan: { limit_gallery: 10 },
                    document_urls: { logo: null },
                }}
            />,
        );

        expect(screen.getByText('Logo de la empresa')).toBeInTheDocument();
        expect(screen.getByText('Aún no tienes fotos')).toBeInTheDocument();
        expect(screen.getByText('0 / 10 fotos')).toBeInTheDocument();
    });

    it('pinta el grid y marca la portada', () => {
        render(
            <Gallery
                auth={{}}
                initialAssociate={{
                    gallery_urls: [
                        { url: '/a.jpg', path: 'a.jpg' },
                        { url: '/b.jpg', path: 'b.jpg' },
                    ],
                    plan: { limit_gallery: 10 },
                    cover_path: 'a.jpg',
                }}
            />,
        );

        expect(screen.getByText('Portada')).toBeInTheDocument();
        expect(screen.getByText('2 / 10 fotos')).toBeInTheDocument();
        expect(screen.getByText('Añadir imagen')).toBeInTheDocument();
    });
});
