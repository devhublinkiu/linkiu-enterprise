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
    useForm: () => ({ post: vi.fn(), processing: false }),
}));

import Checkout from '@/Pages/Associate/Billing/Checkout';

beforeEach(() => {
    vi.stubGlobal('route', () => '/x');
});

const plan = {
    id: 1,
    name: 'Oro',
    color_hex: '#f59e0b',
    price_monthly: '100000',
    price_semiannual: '540000',
    price_annual: '1000000',
    currency: 'COP',
    description: 'Plan premium',
    signup_fee: '250000',
};

describe('Associate/Billing Checkout', () => {
    it('primera vez: cobra solo la cuota inicial y no muestra selector de ciclo', () => {
        render(<Checkout plan={plan} bankAccounts={[]} isSignupOnly />);

        expect(screen.getByText('Cuota inicial')).toBeInTheDocument();
        expect(screen.getByText(/exonera tu primer mes/i)).toBeInTheDocument();
        // El alta no ofrece elegir ciclo.
        expect(screen.queryByText('Semestral')).not.toBeInTheDocument();
        expect(screen.queryByText(/anual/i)).not.toBeInTheDocument();
    });

    it('renovación: cobra la mensualidad', () => {
        render(<Checkout plan={plan} bankAccounts={[]} isSignupOnly={false} />);

        expect(screen.getByText('Mensualidad')).toBeInTheDocument();
        expect(
            screen.queryByText(/exonera tu primer mes/i),
        ).not.toBeInTheDocument();
    });
});
