import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/Layouts/AppLayout', () => ({
    default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    Link: ({ children, ...props }: { children: ReactNode }) => (
        <a {...props}>{children}</a>
    ),
    usePage: () => ({ props: { flash: {} } }),
    router: { delete: vi.fn(), post: vi.fn(), patch: vi.fn() },
    useForm: () => ({
        data: {
            name: '',
            description: '',
            price_monthly: 0,
            price_semiannual: 0,
            price_annual: 0,
            currency: 'COP',
            color_hex: '#64748b',
            grace_days: 0,
            is_active: true,
            is_popular: false,
            signup_fee: 0,
            features: {
                galeria: { enabled: true, limit_value: 10 },
                ranking: { enabled: false, limit_value: null },
            },
        },
        setData: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        processing: false,
        errors: {},
    }),
}));

import PlansForm from '@/Pages/Admin/Plans/Form';
import PlansIndex from '@/Pages/Admin/Plans/Index';

beforeEach(() => {
    vi.stubGlobal('route', () => '/x');
});

const modules = (over = {}) => [
    {
        key: 'galeria',
        name: 'Galería de fotos',
        type: 'limit' as const,
        group: 'contenido',
        coming_soon: false,
        enabled: true,
        limit_value: 10,
        ...over,
    },
    {
        key: 'ranking',
        name: 'Ranking de mi perfil',
        type: 'boolean' as const,
        group: 'visibilidad',
        coming_soon: true,
        enabled: true,
        limit_value: null,
    },
];

const plan = (over = {}) => ({
    id: 1,
    name: 'Oro',
    slug: 'oro',
    description: 'Plan premium',
    price_monthly: '100000',
    price_semiannual: '540000',
    price_annual: '1000000',
    color_hex: '#f59e0b',
    grace_days: 5,
    is_active: true,
    is_popular: true,
    signup_fee: '250000',
    associates_count: 0,
    modules: modules(),
    ...over,
});

describe('Admin/Plans Index', () => {
    it('muestra las membresías con sus módulos reales y la cuota inicial', () => {
        render(
            <PlansIndex
                plans={[
                    plan(),
                    plan({ id: 2, name: 'Plata', is_popular: false }),
                ]}
            />,
        );

        expect(screen.getByText('Oro')).toBeInTheDocument();
        expect(screen.getByText('Plata')).toBeInTheDocument();
        // Cuota inicial visible como fila de precio.
        expect(
            screen.getAllByText('Cuota inicial').length,
        ).toBeGreaterThanOrEqual(1);
        // Módulo real del catálogo.
        expect(
            screen.getAllByText('Galería de fotos').length,
        ).toBeGreaterThanOrEqual(1);
        // Módulo Próximamente marcado.
        expect(screen.getAllByText('Pronto').length).toBeGreaterThanOrEqual(1);
    });

    it('no permite eliminar una membresía con asociados: oculta el botón Eliminar', () => {
        render(
            <PlansIndex
                plans={[plan({ id: 3, name: 'ConUso', associates_count: 4 })]}
            />,
        );

        fireEvent.click(
            screen.getByRole('button', { name: /eliminar conuso/i }),
        );

        expect(screen.getByText(/no puedes eliminar/i)).toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: /^eliminar$/i }),
        ).not.toBeInTheDocument();
    });
});

describe('Admin/Plans Form', () => {
    it('edita módulos por catálogo y ya no muestra el toggle de "solo inscripción"', () => {
        render(
            <PlansForm
                features={[
                    {
                        id: 1,
                        key: 'galeria',
                        name: 'Galería de fotos',
                        description: null,
                        type: 'limit',
                        group: 'contenido',
                        is_enabled: true,
                    },
                    {
                        id: 2,
                        key: 'ranking',
                        name: 'Ranking de mi perfil',
                        description: null,
                        type: 'boolean',
                        group: 'visibilidad',
                        is_enabled: false,
                    },
                ]}
                planFeatures={{}}
            />,
        );

        expect(screen.getByText('Cuota inicial')).toBeInTheDocument();
        expect(screen.getByText('Galería de fotos')).toBeInTheDocument();
        // El módulo apagado globalmente sale como Próximamente.
        expect(screen.getByText('Próximamente')).toBeInTheDocument();
        // El toggle del modelo doble se retiró.
        expect(
            screen.queryByText(/solo cobrar inscripción/i),
        ).not.toBeInTheDocument();
    });
});
