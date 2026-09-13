import '@testing-library/jest-dom/vitest';

// jsdom no implementa ResizeObserver; Radix (Tooltip/Sheet/Sidebar…) lo usa para medir
// nodos. Polyfill mínimo para poder renderizar overlays abiertos en las pruebas.
if (typeof globalThis.ResizeObserver === 'undefined') {
    globalThis.ResizeObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
    };
}

// jsdom tampoco implementa matchMedia; useIsMobile (base/Sidebar) lo usa. Devuelve "no coincide".
if (typeof window !== 'undefined' && !window.matchMedia) {
    window.matchMedia = (query: string) =>
        ({
            matches: false,
            media: query,
            onchange: null,
            addEventListener: () => {},
            removeEventListener: () => {},
            addListener: () => {},
            removeListener: () => {},
            dispatchEvent: () => false,
        }) as unknown as MediaQueryList;
}
