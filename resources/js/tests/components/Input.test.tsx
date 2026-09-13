import { Input } from '@/Components/base/Input';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('Input (base)', () => {
    it('renderiza y refleja placeholder y type', () => {
        render(<Input type="email" placeholder="nombre@ejemplo.com" />);
        const input = screen.getByPlaceholderText('nombre@ejemplo.com');
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('type', 'email');
        expect(input).toHaveAttribute('data-slot', 'input');
    });

    it('propaga aria-invalid y disabled', () => {
        render(<Input aria-invalid disabled placeholder="err" />);
        const input = screen.getByPlaceholderText('err');
        expect(input).toHaveAttribute('aria-invalid', 'true');
        expect(input).toBeDisabled();
    });
});
