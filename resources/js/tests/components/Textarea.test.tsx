import { Textarea } from '@/Components/base/Textarea';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('Textarea (base)', () => {
    it('renderiza con data-slot y respeta placeholder/valor', () => {
        render(<Textarea placeholder="Escribe aquí" defaultValue="Hola" />);
        const ta = screen.getByPlaceholderText('Escribe aquí');
        expect(ta).toHaveAttribute('data-slot', 'textarea');
        expect(ta.tagName).toBe('TEXTAREA');
        expect(ta).toHaveValue('Hola');
    });

    it('propaga disabled y aria-invalid', () => {
        render(<Textarea placeholder="x" disabled aria-invalid />);
        const ta = screen.getByPlaceholderText('x');
        expect(ta).toBeDisabled();
        expect(ta).toHaveAttribute('aria-invalid', 'true');
    });
});
