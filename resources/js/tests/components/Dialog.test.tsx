import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/Components/base/Dialog';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('Dialog (base)', () => {
    it('cerrado muestra el trigger y oculta el contenido', () => {
        render(
            <Dialog>
                <DialogTrigger>Abrir</DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Título</DialogTitle>
                        <DialogDescription>Descripción.</DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>,
        );
        expect(screen.getByText('Abrir')).toBeInTheDocument();
        expect(screen.queryByText('Título')).not.toBeInTheDocument();
    });

    it('con defaultOpen muestra título, descripción y botón de cierre', () => {
        render(
            <Dialog defaultOpen>
                <DialogTrigger>Abrir</DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Título</DialogTitle>
                        <DialogDescription>Descripción.</DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>,
        );
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Título')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /cerrar/i }),
        ).toBeInTheDocument();
    });

    it('con showCloseButton=false no renderiza el botón de cierre', () => {
        render(
            <Dialog defaultOpen>
                <DialogContent showCloseButton={false}>
                    <DialogHeader>
                        <DialogTitle>Sin cierre</DialogTitle>
                        <DialogDescription>x</DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>,
        );
        expect(
            screen.queryByRole('button', { name: /cerrar/i }),
        ).not.toBeInTheDocument();
    });
});
