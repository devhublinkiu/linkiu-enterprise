import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/Layouts/AppLayout', () => ({
    default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    usePage: () => ({ props: { flash: {} } }),
    router: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
    useForm: () => ({
        data: {
            name: '',
            category_id: '',
            new_category_name: '',
            is_active: true,
        },
        setData: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        processing: false,
        errors: {},
        clearErrors: vi.fn(),
    }),
}));

import Index from '@/Pages/Admin/Services/Index';

const props = {
    services: {
        data: [
            {
                id: 1,
                name: 'Consultoría ambiental',
                slug: 'consultoria-ambiental',
                category_id: 2,
                is_active: true,
                category: {
                    id: 2,
                    name: 'Medio ambiente',
                    slug: 'ma',
                    order: 0,
                },
                associates_count: 4,
            },
        ],
        from: 1,
        to: 1,
        total: 1,
        current_page: 1,
        last_page: 1,
        per_page: 10,
        links: [],
        prev_page_url: null,
        next_page_url: null,
        first_page_url: '/x',
        last_page_url: '/x',
    },
    categories: [{ id: 2, name: 'Medio ambiente', slug: 'ma', order: 0 }],
    categoryServiceCounts: { 2: 1 },
    filters: {},
};

beforeEach(() => {
    vi.stubGlobal('route', () => '/x');
});

describe('Admin/Services Index', () => {
    it('lista los servicios en la tabla con sus acciones', () => {
        render(<Index {...props} />);

        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getByText('Consultoría ambiental')).toBeInTheDocument();
        expect(screen.getByText('Medio ambiente')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /nuevo servicio/i }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /categorías/i }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('switch', {
                name: /activo: consultoría ambiental/i,
            }),
        ).toBeInTheDocument();
    });
});
