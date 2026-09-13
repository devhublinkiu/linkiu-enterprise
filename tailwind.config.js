import containerQueries from '@tailwindcss/container-queries';
import forms from '@tailwindcss/forms';
import animate from 'tailwindcss-animate';
import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                // App: Inter. Títulos web: font-display (Google Sans Flex). Ver design.md.
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
                display: [
                    '"Google Sans Flex"',
                    'Inter',
                    ...defaultTheme.fontFamily.sans,
                ],
            },
            // Escala tipográfica: tamaño + interlínea + peso por rol. Ver design.md §3.
            // La familia se combina aparte (font-display en títulos web, font-sans en la app).
            fontSize: {
                display: ['2.25rem', { lineHeight: '1.15', fontWeight: '600' }],
                h1: ['1.875rem', { lineHeight: '1.2', fontWeight: '600' }],
                h2: ['1.5rem', { lineHeight: '1.25', fontWeight: '600' }],
                h3: ['1.25rem', { lineHeight: '1.3', fontWeight: '600' }],
                body: ['1rem', { lineHeight: '1.5', fontWeight: '400' }],
                small: ['0.875rem', { lineHeight: '1.45', fontWeight: '400' }],
                caption: ['0.75rem', { lineHeight: '1.4', fontWeight: '500' }],
            },
            // Tokens semánticos shadcn mapeados a los colores de marca. Ver design.md.
            colors: {
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                    subtle: 'hsl(var(--destructive-subtle))',
                    strong: 'hsl(var(--destructive-strong))',
                },
                success: {
                    DEFAULT: 'hsl(var(--success))',
                    foreground: 'hsl(var(--success-foreground))',
                    subtle: 'hsl(var(--success-subtle))',
                    strong: 'hsl(var(--success-strong))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                    subtle: 'hsl(var(--accent-subtle))',
                    strong: 'hsl(var(--accent-strong))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                },
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },
                sidebar: {
                    DEFAULT: 'hsl(var(--sidebar))',
                    foreground: 'hsl(var(--sidebar-foreground))',
                    primary: 'hsl(var(--sidebar-primary))',
                    'primary-foreground':
                        'hsl(var(--sidebar-primary-foreground))',
                    accent: 'hsl(var(--sidebar-accent))',
                    'accent-foreground':
                        'hsl(var(--sidebar-accent-foreground))',
                    border: 'hsl(var(--sidebar-border))',
                    ring: 'hsl(var(--sidebar-ring))',
                },
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            // Compatibilidad con specs shadcn escritas para Tailwind v4 (estamos en v3):
            // permite que los componentes de base/ se copien "tal cual" (solo cambiamos
            // color/tipografía). `ring-3` = 3px; `aria-invalid:` como variante nombrada.
            ringWidth: {
                3: '3px',
            },
            aria: {
                invalid: 'invalid="true"',
            },
            // Radix expone el estado como `data-state`; las specs v4 usan `data-checked:`.
            // Este alias deja que se copien "tal cual" (sirve para Checkbox, Switch, Radio…).
            data: {
                checked: 'state=checked',
                unchecked: 'state=unchecked',
                horizontal: 'orientation=horizontal',
                vertical: 'orientation=vertical',
            },
        },
    },

    plugins: [forms, animate, containerQueries],
};
