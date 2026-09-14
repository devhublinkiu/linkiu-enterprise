import { NavItem } from './nav-items';

export type Crumb = { label: string; href?: string };

// href de Ziggy (URL absoluta) o path → pathname sin query ni barra final.
export function hrefToPath(href: string): string {
    let p = href;
    try {
        p = new URL(href, 'http://x').pathname;
    } catch {
        p = href.split('?')[0];
    }
    return p.replace(/\/+$/, '') || '/';
}

// Deriva el tramo de sección de las migas para la ruta actual, a partir de la navegación
// del sidebar (grupo → página). NO incluye "Inicio": lo antepone el shell. Empareja por path
// exacto o por prefijo (páginas de detalle); gana el prefijo más largo. El dashboard ('/') no
// participa aquí. Ver design.md §6.
export function matchBreadcrumbs(
    currentPath: string,
    items: NavItem[],
    homeHref = '/',
): Crumb[] {
    const path = hrefToPath(currentPath);
    const home = hrefToPath(homeHref);
    const matches: { crumbs: Crumb[]; len: number }[] = [];

    const consider = (crumbs: Crumb[], matchHref: string) => {
        const mp = hrefToPath(matchHref);
        if (mp === home) return; // el destino "Inicio" no se repite como sección
        if (path === mp || path.startsWith(mp + '/')) {
            matches.push({ crumbs, len: mp.length });
        }
    };

    for (const item of items) {
        if (item.children) {
            for (const child of item.children) {
                if (child.href && child.href !== '#') {
                    consider(
                        [{ label: item.name }, { label: child.name }],
                        child.href,
                    );
                }
            }
        } else if (item.href && item.href !== '#') {
            consider([{ label: item.name }], item.href);
        }
    }

    if (matches.length === 0) return [];
    // Gana el prefijo más largo (la coincidencia más específica).
    return matches.reduce((a, b) => (b.len > a.len ? b : a)).crumbs;
}
