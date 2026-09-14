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
}));

import AssociateInvoicesIndex from '@/Pages/Associate/Invoices/Index';

beforeEach(() => {
    vi.stubGlobal('route', () => '/x');
});

const invoice = (over = {}) => ({
    id: 1,
    type: 'cuenta_cobro',
    period: 'Cuota inicial - Oro',
    amount: 250000,
    status: 'pendiente',
    external_link: null,
    notes: null,
    document_url: null,
    created_at: '14/09/2026',
    is_unread: true,
    ...over,
});

describe('Associate/Invoices Index', () => {
    it('lista las facturas con acción de pago para las pendientes', () => {
        render(
            <AssociateInvoicesIndex
                invoices={[
                    invoice(),
                    invoice({ id: 2, status: 'pagada', is_unread: false }),
                ]}
            />,
        );

        expect(screen.getAllByText('Cuota inicial - Oro').length).toBe(2);
        // Solo la pendiente ofrece pagar.
        expect(screen.getAllByRole('link', { name: /pagar/i })).toHaveLength(1);
    });

    it('muestra el estado vacío sin facturas', () => {
        render(<AssociateInvoicesIndex invoices={[]} />);
        expect(screen.getByText(/sin facturas por ahora/i)).toBeInTheDocument();
    });
});
