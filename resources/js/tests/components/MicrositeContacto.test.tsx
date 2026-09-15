import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/Layouts/AppLayout', () => ({
    default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    usePage: () => ({ props: { flash: {} } }),
    router: { post: vi.fn() },
    useForm: (initial: Record<string, unknown>) => ({
        data: initial,
        setData: vi.fn(),
        post: vi.fn(),
        processing: false,
        errors: {},
    }),
}));

import Contacto from '@/Pages/Associate/Microsite/Contacto';

beforeEach(() => {
    vi.stubGlobal('route', (n: string) => `/${n}`);
});

const baseProps = {
    micrositeUrl: 'https://camepg.test/empresas/1',
    published: true,
    contactsUrl: '/contactos',
    contact: { whatsapp: null, contact_email: null },
    reused: {
        phone: '3001234567',
        email: null,
        website: null,
        address: null,
        city: null,
        department: null,
        facebook: null,
        instagram: null,
        linkedin: null,
    },
    facades: [],
};

describe('Associate/Microsite Contacto', () => {
    it('muestra el estado publicado y los campos editables', () => {
        render(<Contacto {...baseProps} />);

        expect(screen.getByText('Micrositio publicado')).toBeInTheDocument();
        expect(screen.getByLabelText('WhatsApp')).toBeInTheDocument();
        expect(screen.getByLabelText('Correo de contacto')).toBeInTheDocument();
        expect(screen.getByText('Guardar contacto')).toBeInTheDocument();
    });

    it('en borrador avisa que solo lo ve el dueño', () => {
        render(<Contacto {...baseProps} published={false} />);

        expect(screen.getByText('Micrositio en borrador')).toBeInTheDocument();
    });
});
