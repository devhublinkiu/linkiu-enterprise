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
    useForm: () => ({
        data: { proof: null, notes: '' },
        setData: vi.fn(),
        post: vi.fn(),
        processing: false,
        errors: {},
    }),
}));

import Pay from '@/Pages/Associate/Invoices/Pay';

beforeEach(() => {
    vi.stubGlobal('route', () => '/x');
});

const invoice = (over = {}) => ({
    id: 1,
    period: 'Cuota inicial - Oro',
    type: 'cuenta_cobro',
    cycle: 'signup',
    amount: '250000',
    currency: 'COP',
    due_date: '19/09/2026',
    is_overdue: false,
    status: 'pendiente',
    notes: null,
    document_url: null,
    ...over,
});

const bankAccounts = [
    {
        id: 1,
        bank_name: 'Bancolombia',
        account_type: 'Ahorros',
        account_number: '123456',
        holder_name: 'CAMEP',
        holder_document: '900123456',
        holder_document_type: 'NIT',
        color_hex: '#000000',
    },
];

describe('Associate/Invoices Pay', () => {
    it('ofrece pago en línea y transferencia cuando la cuenta está pendiente', () => {
        render(
            <Pay
                invoice={invoice()}
                bankAccounts={bankAccounts}
                onlineEnabled
                pendingReview={null}
                lastRejected={null}
            />,
        );

        expect(
            screen.getAllByText('Cuota inicial - Oro').length,
        ).toBeGreaterThanOrEqual(1);
        expect(
            screen.getByRole('link', { name: /pagar en línea/i }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /enviar comprobante/i }),
        ).toBeInTheDocument();
        expect(screen.getByText('Bancolombia')).toBeInTheDocument();
    });

    it('muestra el estado pagada sin opciones de pago', () => {
        render(
            <Pay
                invoice={invoice({ status: 'pagada' })}
                bankAccounts={bankAccounts}
                onlineEnabled
                pendingReview={null}
                lastRejected={null}
            />,
        );

        expect(screen.getByText(/ya está pagada/i)).toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: /enviar comprobante/i }),
        ).not.toBeInTheDocument();
    });
});
