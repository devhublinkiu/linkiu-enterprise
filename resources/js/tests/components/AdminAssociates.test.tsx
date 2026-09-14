import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/Layouts/AppLayout', () => ({
    default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    Link: ({ children }: { children: ReactNode }) => <a>{children}</a>,
    usePage: () => ({ props: { flash: {} } }),
    router: { get: vi.fn(), post: vi.fn() },
}));

import Index from '@/Pages/Admin/Associates/Index';
import type { AssociateRow, Paginator } from '@/Pages/Admin/Associates/types';

const associates: Paginator<AssociateRow> = {
    data: [
        {
            id: 1,
            company_name: 'Minera Los Andes SAS',
            nit: '900123456-7',
            city: 'Medellín',
            created_at: '2026-09-01T00:00:00Z',
            is_public: false,
            is_verified: true,
            section_reviews: {
                basicinfo: { status: 'approved' },
                services: { status: 'pending' },
            },
            estado: 'admitida_sin_pago',
            subscription_status: 'none',
            plan_expires_at: null,
        },
    ],
    from: 1,
    to: 1,
    total: 1,
    current_page: 1,
    last_page: 1,
    per_page: 25,
    links: [],
    prev_page_url: null,
    next_page_url: null,
};

beforeEach(() => {
    vi.stubGlobal('route', () => '/x');
});

describe('Admin/Associates Index', () => {
    it('lista en una sola tabla con el estado derivado y acciones', () => {
        render(<Index associates={associates} filters={{}} />);

        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getByText('Minera Los Andes SAS')).toBeInTheDocument();
        // El estado "habla": incluye el dato de pago.
        expect(screen.getByText('Admitida · sin pago')).toBeInTheDocument();
        expect(
            screen.getByRole('switch', {
                name: /verificada: minera los andes sas/i,
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: /acciones para minera los andes sas/i,
            }),
        ).toBeInTheDocument();
    });
});
