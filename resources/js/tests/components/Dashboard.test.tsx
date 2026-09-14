import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/Layouts/AppLayout', () => ({
    default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

const props: Record<string, unknown> = {};

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    Link: ({ children, ...rest }: { children: ReactNode }) => (
        <a {...rest}>{children}</a>
    ),
    usePage: () => ({ props }),
}));

import Dashboard from '@/Pages/Dashboard';

beforeEach(() => {
    vi.stubGlobal('route', (name: string) => `/${name}`);
});

function setProps(over: Record<string, unknown>) {
    for (const k of Object.keys(props)) delete props[k];
    Object.assign(
        props,
        {
            auth: {
                user: { name: 'Ana', is_superadmin: false, role: 'associate' },
                associate: { is_public: false, company_name: 'Minera SAS' },
            },
            associateProfile: {
                company_name: 'Minera SAS',
                section_reviews: { basicinfo: { status: 'approved' } },
            },
            subscription: {
                status: 'active',
                plan_name: 'Oro',
                days_remaining: 20,
                expires_at: '19/10/2026',
            },
            unread_invoices: 2,
        },
        over,
    );
}

describe('Dashboard (asociado)', () => {
    it('saluda con la empresa y muestra membresía, perfil y accesos', () => {
        setProps({});
        render(<Dashboard />);

        expect(screen.getByText('Hola, Minera SAS')).toBeInTheDocument();
        expect(screen.getByText('Mi membresía')).toBeInTheDocument();
        expect(screen.getByText('Al día')).toBeInTheDocument();
        expect(screen.getByText('Estado de mi perfil')).toBeInTheDocument();
        expect(screen.getByText('1/5 secciones')).toBeInTheDocument();
        // Accesos rápidos con módulos próximamente.
        expect(
            screen.getAllByText('Próximamente').length,
        ).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('2 sin leer')).toBeInTheDocument();
    });

    it('un vencido ve el botón de pagar', () => {
        setProps({
            subscription: {
                status: 'expired',
                plan_name: 'Oro',
                days_remaining: 0,
                expires_at: '19/09/2026',
            },
        });
        render(<Dashboard />);

        expect(screen.getByText('Vencido')).toBeInTheDocument();
        expect(screen.getByText('Pagar y renovar')).toBeInTheDocument();
    });
});
