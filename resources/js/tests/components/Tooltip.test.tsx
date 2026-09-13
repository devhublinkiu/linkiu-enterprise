import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/Components/base/Tooltip';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('Tooltip (base)', () => {
    it('renderiza el trigger con data-slot', () => {
        render(
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>Ayuda</TooltipTrigger>
                    <TooltipContent>Texto de ayuda</TooltipContent>
                </Tooltip>
            </TooltipProvider>,
        );
        expect(screen.getByText('Ayuda')).toHaveAttribute(
            'data-slot',
            'tooltip-trigger',
        );
    });

    it('muestra el contenido cuando está abierto', () => {
        render(
            <TooltipProvider>
                <Tooltip defaultOpen>
                    <TooltipTrigger>Ayuda</TooltipTrigger>
                    <TooltipContent>Texto de ayuda</TooltipContent>
                </Tooltip>
            </TooltipProvider>,
        );
        expect(screen.getAllByText('Texto de ayuda').length).toBeGreaterThan(0);
    });
});
