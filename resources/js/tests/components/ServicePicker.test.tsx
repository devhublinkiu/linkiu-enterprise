import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ServicePicker from '@/Pages/Associate/Company/Services/Parts/ServicePicker';

const base = {
    selectedIds: [] as number[],
    toggle: () => {},
    clearAll: () => {},
    availableServices: [],
    serviceCategories: [],
    disabled: false,
};

describe('ServicePicker (límite del plan)', () => {
    it('límite 0 (módulo apagado): avisa que el plan no incluye servicios', () => {
        render(<ServicePicker {...base} limit={0} />);

        expect(
            screen.getByText('Tu plan no incluye servicios.'),
        ).toBeInTheDocument();
        expect(screen.getByText(/0 \/ 0/)).toBeInTheDocument();
    });

    it('límite null: ilimitado, sin tope ni aviso', () => {
        render(<ServicePicker {...base} limit={null} />);

        expect(screen.getByText(/elegidos/)).toBeInTheDocument();
        expect(screen.queryByText('Tu plan no incluye servicios.')).toBeNull();
    });

    it('límite 3: muestra el tope', () => {
        render(<ServicePicker {...base} limit={3} />);

        expect(screen.getByText(/0 \/ 3/)).toBeInTheDocument();
    });
});
