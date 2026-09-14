import { render, screen } from '@testing-library/react';
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
    router: { get: vi.fn(), patch: vi.fn() },
    useForm: () => ({
        data: { admin_notes: '' },
        setData: vi.fn(),
        patch: vi.fn(),
        reset: vi.fn(),
        clearErrors: vi.fn(),
        processing: false,
        errors: {},
    }),
}));

import PaymentsIndex from '@/Pages/Admin/Payments/Index';

beforeEach(() => {
    vi.stubGlobal('route', () => '/x');
});

const payment = (over = {}) => ({
    id: 1,
    associate_name: 'Acme SAS',
    invoice_period: 'Cuota inicial - Oro',
    invoice_id: 1,
    method: 'transferencia',
    method_label: 'Transferencia bancaria',
    status: 'pendiente',
    amount: '250000',
    reference: null,
    proof_url: '/x',
    notes: null,
    admin_notes: null,
    paid_at: null,
    created_at: '14/09/2026',
    reviewed_at: null,
    reviewer_name: null,
    applied: false,
    can_review: true,
    ...over,
});

const counts = { pendiente: 1, aprobado: 0, rechazado: 0 };

describe('Admin/Payments Index', () => {
    it('lista los pagos en una tabla con acciones por fila', () => {
        render(
            <PaymentsIndex
                filter="pendiente"
                counts={counts}
                payments={[payment()]}
            />,
        );

        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getByText('Acme SAS')).toBeInTheDocument();
        expect(screen.getByText('Transferencia bancaria')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /acciones de acme sas/i }),
        ).toBeInTheDocument();
    });

    it('muestra el vacío cuando no hay pagos por revisar', () => {
        render(
            <PaymentsIndex
                filter="pendiente"
                counts={{ pendiente: 0, aprobado: 0, rechazado: 0 }}
                payments={[]}
            />,
        );
        expect(screen.getByText(/todo al día/i)).toBeInTheDocument();
    });
});
