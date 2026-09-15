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

import Servicios from '@/Pages/Associate/Microsite/Servicios';

beforeEach(() => {
    vi.stubGlobal('route', (n: string) => `/${n}`);
});

describe('Associate/Microsite Servicios', () => {
    it('muestra el estado vacío cuando no hay servicios', () => {
        render(
            <Servicios
                micrositeUrl="https://camepg.test/empresas/1"
                servicesUrl="/mis-servicios"
                services={[]}
            />,
        );

        expect(screen.getByText('Ir a mis servicios')).toBeInTheDocument();
    });

    it('lista los servicios seleccionados con su categoría', () => {
        render(
            <Servicios
                micrositeUrl="https://camepg.test/empresas/1"
                servicesUrl="/mis-servicios"
                services={[
                    {
                        id: 1,
                        name: 'Perforación',
                        category: 'Minería',
                        description: 'Pozos profundos.',
                        cover_url: null,
                    },
                ]}
            />,
        );

        expect(screen.getByText('Perforación')).toBeInTheDocument();
        expect(screen.getByText('Minería')).toBeInTheDocument();
        expect(screen.getByText('Pozos profundos.')).toBeInTheDocument();
    });
});
