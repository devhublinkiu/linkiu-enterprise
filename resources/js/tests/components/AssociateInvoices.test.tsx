import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/Layouts/AppLayout', () => ({
    default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    Link: ({ children, ...rest }: { children: ReactNode }) => (
        <a {...rest}>{children}</a>
    ),
}));

import AssociateInvoicesIndex from '@/Pages/Associate/Invoices/Index';

beforeEach(() => {
    vi.stubGlobal(
        'route',
        (name: string, id?: number) => `/${name}/${id ?? ''}`,
    );
});

const invoice = (over: Record<string, unknown> = {}) => ({
    id: 1,
    type: 'cuenta_cobro',
    invoice_number: 'CC-2026-0007',
    period: 'Mensualidad noviembre 2026',
    amount: 150000,
    status: 'pendiente',
    display_status: 'vencida',
    external_link: null,
    notes: null,
    document_url: null,
    due_date: '19/11/2026',
    is_overdue: true,
    created_at: '01/11/2026',
    is_unread: false,
    ...over,
});

describe('Associate/Invoices/Index (Mis Facturas)', () => {
    it('muestra el estado derivado, el vencimiento y el número', () => {
        render(<AssociateInvoicesIndex invoices={[invoice()]} />);

        expect(screen.getByText('Vencida')).toBeInTheDocument();
        expect(screen.getByText(/Venció el 19\/11\/2026/)).toBeInTheDocument();
        expect(screen.getByText(/N\.º CC-2026-0007/)).toBeInTheDocument();
    });

    it('una factura pagada no ofrece el botón de pagar', () => {
        render(
            <AssociateInvoicesIndex
                invoices={[
                    invoice({
                        display_status: 'pagada',
                        status: 'pagada',
                        is_overdue: false,
                    }),
                ]}
            />,
        );

        expect(screen.getByText('Pagada')).toBeInTheDocument();
        expect(screen.queryByText('Pagar')).toBeNull();
    });
});
