import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Switch } from '@/Components/base/Switch';

describe('Switch (base)', () => {
    it('alterna el estado y dispara onCheckedChange', () => {
        const onCheckedChange = vi.fn();
        render(
            <Switch aria-label="Activo" onCheckedChange={onCheckedChange} />,
        );

        const sw = screen.getByRole('switch', { name: 'Activo' });
        expect(sw).toHaveAttribute('data-state', 'unchecked');

        fireEvent.click(sw);
        expect(onCheckedChange).toHaveBeenCalledWith(true);
    });

    it('respeta disabled (no dispara el cambio)', () => {
        const onCheckedChange = vi.fn();
        render(
            <Switch
                aria-label="Bloqueado"
                disabled
                onCheckedChange={onCheckedChange}
            />,
        );

        fireEvent.click(screen.getByRole('switch', { name: 'Bloqueado' }));
        expect(onCheckedChange).not.toHaveBeenCalled();
    });
});
