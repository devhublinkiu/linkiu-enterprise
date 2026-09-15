import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/Layouts/AppLayout', () => ({
    default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    usePage: () => ({ props: { flash: {} } }),
    router: { post: vi.fn(), delete: vi.fn() },
    useForm: (initial: Record<string, unknown>) => ({
        data: initial,
        setData: vi.fn(),
        post: vi.fn(),
        processing: false,
        errors: {},
    }),
}));

import Proyectos from '@/Pages/Associate/Microsite/Proyectos';

beforeEach(() => {
    vi.stubGlobal('route', (n: string) => `/${n}`);
});

describe('Associate/Microsite Proyectos', () => {
    it('muestra el estado vacío y el botón de añadir', () => {
        render(
            <Proyectos
                micrositeUrl="https://camepg.test/empresas/1"
                projects={[]}
            />,
        );

        expect(
            screen.getByText('Aún no has añadido proyectos.'),
        ).toBeInTheDocument();
        expect(screen.getByText('Añadir proyecto')).toBeInTheDocument();
    });

    it('lista los proyectos con su conteo de imágenes', () => {
        render(
            <Proyectos
                micrositeUrl="https://camepg.test/empresas/1"
                projects={[
                    {
                        id: 1,
                        title: 'Planta Norte',
                        description: 'Montaje.',
                        client: 'Ecopetrol',
                        images: [{ id: 10, url: '/img/a.jpg' }],
                    },
                ]}
            />,
        );

        expect(screen.getByText('Planta Norte')).toBeInTheDocument();
        expect(screen.getByText('Cliente: Ecopetrol')).toBeInTheDocument();
        expect(screen.getByText('1 imagen')).toBeInTheDocument();
    });
});
