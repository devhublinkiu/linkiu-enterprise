import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/Layouts/AppLayout', () => ({
    default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    usePage: () => ({ props: { flash: {} } }),
    useForm: (initial: Record<string, unknown>) => ({
        data: initial,
        setData: vi.fn(),
        post: vi.fn(),
        processing: false,
        errors: {},
    }),
}));

import Portada from '@/Pages/Associate/Microsite/Portada';

beforeEach(() => {
    vi.stubGlobal('route', (n: string) => `/${n}`);
});

describe('Associate/Microsite Portada', () => {
    it('ofrece elegir gradiente o imagen', () => {
        render(
            <Portada
                micrositeUrl="https://camepg.test/empresas/1"
                coverType="gradient"
                coverUrl={null}
            />,
        );

        expect(screen.getByText('Gradiente de marca')).toBeInTheDocument();
        expect(screen.getByText('Imagen')).toBeInTheDocument();
        expect(screen.getByText('Guardar portada')).toBeInTheDocument();
    });

    it('con tipo imagen muestra el selector de portada', () => {
        render(
            <Portada
                micrositeUrl="https://camepg.test/empresas/1"
                coverType="image"
                coverUrl="/portada.jpg"
            />,
        );

        expect(screen.getByText(/1600x600/)).toBeInTheDocument();
    });
});
