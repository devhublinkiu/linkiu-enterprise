import { describe, expect, it } from 'vitest';

import {
    hydrateContacts,
    hydrateReferences,
    toContactRow,
    toReferenceRow,
} from '@/Pages/Associate/Company/Contacts/types';

describe('hidratación de Contactos', () => {
    it('sanea los campos null de un contacto a cadena vacía', () => {
        // Fila tal como llega de la BD: campos nullable en null + llaves extra.
        const raw = {
            id: 7,
            associate_id: 3,
            area: null,
            name: 'Juan Pérez',
            position: null,
            email: null,
            phone: '3001234567',
        } as never;
        expect(toContactRow(raw)).toEqual({
            area: '',
            name: 'Juan Pérez',
            position: '',
            email: '',
            phone: '3001234567',
        });
    });

    it('sanea una referencia y normaliza el tipo', () => {
        const raw = {
            type: 'bank',
            name: 'Banco de Bogotá',
            contact_person: null,
            position: null,
            email: null,
            phone: '6017439000',
        } as never;
        expect(toReferenceRow(raw)).toEqual({
            type: 'bank',
            name: 'Banco de Bogotá',
            contact_person: '',
            position: '',
            email: '',
            phone: '6017439000',
        });
    });

    it('un tipo de referencia desconocido cae en commercial', () => {
        expect(toReferenceRow({ type: 'otro' as never }).type).toBe(
            'commercial',
        );
    });

    it('lista vacía o ausente devuelve una fila vacía por defecto', () => {
        expect(hydrateContacts([])).toHaveLength(1);
        expect(hydrateContacts(undefined)).toHaveLength(1);
        expect(hydrateContacts(null)).toHaveLength(1);
        expect(hydrateReferences([])).toHaveLength(1);
        expect(hydrateReferences(undefined)[0].type).toBe('commercial');

        // La fila por defecto no contiene ningún null (no rompe inputs ni .trim()).
        const [c] = hydrateContacts(null);
        expect(Object.values(c).every((v) => v === '')).toBe(true);
    });

    it('preserva las filas con datos y las hidrata todas', () => {
        const rows = [
            {
                name: 'Uno',
                area: null,
                position: null,
                email: null,
                phone: null,
            },
            { name: 'Dos', area: 'Comercial' },
        ] as never;
        const out = hydrateContacts(rows);
        expect(out).toHaveLength(2);
        expect(out[0].phone).toBe('');
        expect(out[1].area).toBe('Comercial');
    });
});
