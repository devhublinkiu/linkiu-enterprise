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
    router: { delete: vi.fn() },
    useForm: () => ({
        data: {
            bank_name: '',
            account_type: 'ahorros',
            account_number: '',
            holder_name: '',
            holder_document: '',
            holder_document_type: 'NIT',
            color_hex: '#64748b',
            is_active: true,
            order: 0,
        },
        setData: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        processing: false,
        errors: {},
    }),
}));

import BankAccountForm from '@/Pages/Admin/BankAccounts/Form';
import BankAccountsIndex from '@/Pages/Admin/BankAccounts/Index';

beforeEach(() => {
    vi.stubGlobal('route', () => '/x');
});

const account = (over = {}) => ({
    id: 1,
    bank_name: 'Bancolombia',
    account_type: 'ahorros',
    account_number: '123-456-789',
    holder_name: 'CAMEP SAS',
    holder_document: '900123456',
    holder_document_type: 'NIT',
    color_hex: '#1a56db',
    is_active: true,
    order: 0,
    ...over,
});

describe('Admin/BankAccounts Index', () => {
    it('lista las cuentas con sus acciones', () => {
        render(<BankAccountsIndex accounts={[account()]} />);

        expect(screen.getByText('Bancolombia')).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: /agregar cuenta/i }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /eliminar bancolombia/i }),
        ).toBeInTheDocument();
    });

    it('muestra el estado vacío sin cuentas', () => {
        render(<BankAccountsIndex accounts={[]} />);
        expect(
            screen.getByText(/no hay cuentas bancarias configuradas/i),
        ).toBeInTheDocument();
    });
});

describe('Admin/BankAccounts Form', () => {
    it('renderiza el formulario de nueva cuenta en base/', () => {
        render(<BankAccountForm />);

        expect(
            screen.getByRole('heading', { name: /nueva cuenta bancaria/i }),
        ).toBeInTheDocument();
        expect(screen.getByText('Nombre del banco')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /guardar cuenta/i }),
        ).toBeInTheDocument();
    });
});
