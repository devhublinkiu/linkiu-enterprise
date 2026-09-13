import { Label } from '@/Components/base/Label';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('Label (base)', () => {
    it('muestra su texto y asocia htmlFor', () => {
        render(<Label htmlFor="correo">Correo electrónico</Label>);
        const label = screen.getByText('Correo electrónico');
        expect(label).toBeInTheDocument();
        expect(label).toHaveAttribute('for', 'correo');
    });
});
