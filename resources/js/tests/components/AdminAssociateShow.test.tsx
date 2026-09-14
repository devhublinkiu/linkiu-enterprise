import { render, screen } from '@testing-library/react';
import type { ComponentProps, ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/Layouts/AppLayout', () => ({
    default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

// Tabs de Radix necesitan contexto; para probar el shell basta un passthrough.
vi.mock('@/Components/ui/Tabs', () => ({
    Tabs: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

// Los tabs de contenido ya tienen su propia lógica; aquí solo probamos el shell.
vi.mock('@/Pages/Admin/Associates/Parts/TabOverview', () => ({
    TabOverview: () => null,
}));
vi.mock('@/Pages/Admin/Associates/Parts/TabBasicInfo', () => ({
    TabBasicInfo: () => null,
}));
vi.mock('@/Pages/Admin/Associates/Parts/TabCharacterization', () => ({
    TabCharacterization: () => null,
}));
vi.mock('@/Pages/Admin/Associates/Parts/TabContacts', () => ({
    TabContacts: () => null,
}));
vi.mock('@/Pages/Admin/Associates/Parts/TabServices', () => ({
    TabServices: () => null,
}));
vi.mock('@/Pages/Admin/Associates/Parts/TabDocumentation', () => ({
    TabDocumentation: () => null,
}));

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    Link: ({ children }: { children: ReactNode }) => <a>{children}</a>,
    router: { post: vi.fn() },
    useForm: () => ({ post: vi.fn(), processing: false }),
}));

import Show from '@/Pages/Admin/Associates/Show';

type ShowProps = ComponentProps<typeof Show>;

const associate = {
    id: 1,
    company_name: 'Minera Los Andes SAS',
    nit: '900123456-7',
    created_at: '2026-09-01T00:00:00Z',
    section_reviews: {
        basicinfo: { status: 'approved' },
        characterization: { status: 'approved' },
    },
} as unknown as ShowProps['associate'];

const documentCatalog = { mandatory: [], optional: [] };

beforeEach(() => {
    vi.stubGlobal('route', () => '/x');
});

describe('Admin/Associates Show (shell)', () => {
    it('muestra la empresa, el estado derivado y el gate de admisión', () => {
        render(
            <Show
                associate={associate}
                documentCatalog={documentCatalog}
                estado="pendiente"
            />,
        );

        expect(screen.getByText('Minera Los Andes SAS')).toBeInTheDocument();
        expect(screen.getByText('Pendiente')).toBeInTheDocument();
        // Con 2/5 aprobadas, admitir está deshabilitado y se explica.
        const admit = screen.getByRole('button', { name: /admitir socio/i });
        expect(admit).toBeDisabled();
        expect(
            screen.getByText(/faltan 3 secciones por aprobar/i),
        ).toBeInTheDocument();
    });
});
