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
        transform: () => ({ post: vi.fn() }),
        processing: false,
        errors: {},
    }),
}));

import QuienesSomos from '@/Pages/Associate/Microsite/QuienesSomos';

beforeEach(() => {
    vi.stubGlobal('route', (n: string) => `/${n}`);
});

const baseProps = {
    slug: null,
    micrositeUrl: 'https://camepg.test/empresas/1',
    about: { story: null, image_url: null },
    certifications: [],
    team: [],
    clients: [],
};

describe('Associate/Microsite Quiénes somos', () => {
    it('muestra la dirección, las pestañas y la historia por defecto', () => {
        render(<QuienesSomos {...baseProps} />);

        expect(
            screen.getAllByText('Quiénes somos').length,
        ).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('Dirección de mi página')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('mi-empresa')).toBeInTheDocument();

        // Pestañas.
        expect(
            screen.getByRole('tab', { name: /Historia/ }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('tab', { name: /Certificaciones/ }),
        ).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /Equipo/ })).toBeInTheDocument();
        expect(
            screen.getByRole('tab', { name: /Clientes/ }),
        ).toBeInTheDocument();

        // Pestaña Historia activa por defecto.
        expect(screen.getByText('Guardar historia')).toBeInTheDocument();
    });

    it('con slug definido muestra la dirección bloqueada', () => {
        render(
            <QuienesSomos
                {...baseProps}
                slug="mi-empresa"
                micrositeUrl="https://camepg.test/mi-empresa"
            />,
        );

        expect(
            screen.getByText('https://camepg.test/mi-empresa'),
        ).toBeInTheDocument();
        expect(screen.queryByPlaceholderText('mi-empresa')).toBeNull();
    });
});
