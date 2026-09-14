import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/Layouts/AppLayout', () => ({
    default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    usePage: () => ({ props: { flash: {} } }),
    router: { patch: vi.fn(), delete: vi.fn() },
    useForm: () => ({
        data: {
            associate_id: '',
            type: 'factura',
            period: '',
            cycle: 'monthly',
            amount: '',
            document: null,
            external_link: '',
            notes: '',
            payment_method: 'efectivo',
            paid_at: '2026-09-14',
            payment_reference: '',
            payment_notes: '',
        },
        setData: vi.fn(),
        post: vi.fn(),
        reset: vi.fn(),
        clearErrors: vi.fn(),
        processing: false,
        errors: {},
    }),
}));

import InvoicesIndex from '@/Pages/Admin/Invoices/Index';

beforeEach(() => {
    vi.stubGlobal('route', () => '/x');
});

const invoice = (over = {}) => ({
    id: 1,
    associate_name: 'Acme SAS',
    type: 'cuenta_cobro',
    period: 'Marzo 2026',
    cycle: 'monthly',
    amount: 100000,
    due_date: '19/03/2026',
    status: 'pendiente',
    has_document: false,
    external_link: null,
    creator_name: 'Sistema',
    payment_method: null,
    payment_reference: null,
    paid_at: null,
    payer_name: null,
    created_at: '01/03/2026',
    read_at: null,
    ...over,
});

const associates = [{ id: 1, company_name: 'Acme SAS' }];

describe('Admin/Invoices Index', () => {
    it('lista las facturas y ofrece crear una nueva', () => {
        render(
            <InvoicesIndex invoices={[invoice()]} associates={associates} />,
        );

        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getByText('Acme SAS')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /nueva factura/i }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /acciones de acme sas/i }),
        ).toBeInTheDocument();
    });

    it('muestra el estado vacío sin facturas', () => {
        render(<InvoicesIndex invoices={[]} associates={associates} />);
        expect(screen.getByText(/no hay facturas aún/i)).toBeInTheDocument();
    });
});
