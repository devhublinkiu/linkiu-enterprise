import { Button } from '@/Components/ui/Button';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('Button (humo)', () => {
    it('renderiza su contenido', () => {
        render(<Button>Guardar</Button>);
        expect(
            screen.getByRole('button', { name: 'Guardar' }),
        ).toBeInTheDocument();
    });
});
