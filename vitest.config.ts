import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./resources/js', import.meta.url)),
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./resources/js/tests/setup.ts'],
        include: ['resources/js/**/*.{test,spec}.{ts,tsx}'],
        css: false,
        // El pool 'threads' (por defecto) rompe al correr varios archivos en
        // paralelo en Windows ("Cannot read properties of undefined (reading
        // 'config')"). 'forks' es estable y más rápido aquí.
        pool: 'forks',
    },
});
