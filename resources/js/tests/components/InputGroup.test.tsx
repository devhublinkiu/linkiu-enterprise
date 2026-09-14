import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
    InputGroupText,
} from '@/Components/base/InputGroup';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('InputGroup (base)', () => {
    it('renderiza el grupo, el control y el addon', () => {
        render(
            <InputGroup>
                <InputGroupInput placeholder="Buscar" />
                <InputGroupAddon>
                    <InputGroupText>$</InputGroupText>
                </InputGroupAddon>
            </InputGroup>,
        );

        const input = screen.getByPlaceholderText('Buscar');
        expect(input).toHaveAttribute('data-slot', 'input-group-control');
        expect(screen.getByText('$')).toBeInTheDocument();

        const group = input.closest('[data-slot="input-group"]');
        expect(group).not.toBeNull();
        expect(group).toHaveAttribute('role', 'group');
    });

    it('el addon aplica el data-align indicado', () => {
        render(
            <InputGroup>
                <InputGroupInput placeholder="x" />
                <InputGroupAddon align="inline-end">
                    <InputGroupText>COP</InputGroupText>
                </InputGroupAddon>
            </InputGroup>,
        );
        const addon = screen
            .getByText('COP')
            .closest('[data-slot="input-group-addon"]');
        expect(addon).toHaveAttribute('data-align', 'inline-end');
    });
});
