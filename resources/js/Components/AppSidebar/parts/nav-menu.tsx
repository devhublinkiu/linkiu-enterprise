import {
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from '@/Components/base/Sidebar';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, Lock } from 'lucide-react';
import * as React from 'react';

import type { NavChild, NavItem } from './nav-items';

// Devuelve un predicado de "ruta activa" comparando la URL actual de Inertia con el href del ítem.
// Si el href trae query (p. ej. ?status=approved) se exige coincidencia exacta de pathname+query;
// si no, coincide el pathname o cualquier sub-ruta.
export function useIsActive() {
    const { url } = usePage();
    return React.useCallback(
        (href?: string) => {
            if (!href || href === '#') return false;
            try {
                const origin = window.location.origin;
                const target = new URL(href, origin);
                const current = new URL(url, origin);
                if (target.search) {
                    return (
                        current.pathname === target.pathname &&
                        current.search === target.search
                    );
                }
                return (
                    current.pathname === target.pathname ||
                    current.pathname.startsWith(target.pathname + '/')
                );
            } catch {
                return false;
            }
        },
        [url],
    );
}

function ChildLink({
    child,
    isActive,
}: {
    child: NavChild;
    isActive: boolean;
}) {
    if (child.locked) {
        return (
            <SidebarMenuSubItem>
                <SidebarMenuSubButton
                    aria-disabled
                    className="pointer-events-none opacity-60"
                >
                    <span className="truncate">{child.name}</span>
                    <Lock className="ml-auto size-3 shrink-0" />
                </SidebarMenuSubButton>
            </SidebarMenuSubItem>
        );
    }

    return (
        <SidebarMenuSubItem>
            <SidebarMenuSubButton asChild isActive={isActive}>
                <Link href={child.href}>
                    <span className="truncate">{child.name}</span>
                    {child.count != null && (
                        <span className="ml-auto text-xs tabular-nums text-muted-foreground">
                            {child.count}
                        </span>
                    )}
                </Link>
            </SidebarMenuSubButton>
        </SidebarMenuSubItem>
    );
}

export function NavMenu({ items }: { items: NavItem[] }) {
    const { state, setOpen } = useSidebar();
    const isActive = useIsActive();
    const { url } = usePage();
    const [openMenus, setOpenMenus] = React.useState<string[]>([]);

    // Abre automáticamente el submenú cuyo hijo esté activo.
    React.useEffect(() => {
        items.forEach((item) => {
            if (!item.children) return;
            const hasActiveChild = item.children.some((c) => isActive(c.href));
            if (hasActiveChild) {
                setOpenMenus((prev) =>
                    prev.includes(item.name) ? prev : [...prev, item.name],
                );
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url]);

    const toggleMenu = (name: string) => {
        // Si el sidebar está colapsado, primero lo expande y abre solo ese submenú.
        if (state === 'collapsed') {
            setOpen(true);
            setOpenMenus([name]);
            return;
        }
        setOpenMenus((prev) =>
            prev.includes(name)
                ? prev.filter((m) => m !== name)
                : [...prev, name],
        );
    };

    return (
        <SidebarMenu>
            {items.map((item) => {
                const Icon = item.icon;

                // Ítem "próximamente" (anunciado, sin navegación). Badge en vez de candado.
                if (item.soon) {
                    return (
                        <SidebarMenuItem key={item.name}>
                            <SidebarMenuButton
                                disabled
                                tooltip={`${item.name} · Próximamente`}
                                className="opacity-70"
                            >
                                <Icon />
                                <span className="truncate">{item.name}</span>
                                <span className="ml-auto shrink-0 whitespace-nowrap rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground group-data-[collapsible=icon]:hidden">
                                    Próximamente
                                </span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                }

                // Ítem bloqueado (sin navegación).
                if (item.locked) {
                    return (
                        <SidebarMenuItem key={item.name}>
                            <SidebarMenuButton
                                disabled
                                tooltip={item.name}
                                className="opacity-60"
                            >
                                <Icon />
                                <span>{item.name}</span>
                                <Lock className="ml-auto size-3.5 shrink-0" />
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                }

                // Ítem con submenú.
                if (item.children && item.children.length > 0) {
                    const open = openMenus.includes(item.name);
                    return (
                        <SidebarMenuItem key={item.name}>
                            <SidebarMenuButton
                                tooltip={item.name}
                                onClick={() => toggleMenu(item.name)}
                                aria-expanded={open}
                            >
                                <Icon />
                                <span>{item.name}</span>
                                <ChevronDown
                                    className={cn(
                                        'ml-auto shrink-0 transition-transform duration-200',
                                        open && 'rotate-180',
                                    )}
                                />
                            </SidebarMenuButton>
                            {open && (
                                <SidebarMenuSub>
                                    {item.children.map((child) => (
                                        <ChildLink
                                            key={child.name}
                                            child={child}
                                            isActive={isActive(child.href)}
                                        />
                                    ))}
                                </SidebarMenuSub>
                            )}
                        </SidebarMenuItem>
                    );
                }

                // Ítem simple (enlace).
                return (
                    <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton
                            asChild
                            tooltip={item.name}
                            isActive={item.href ? isActive(item.href) : false}
                        >
                            <Link href={item.href ?? '#'}>
                                <Icon />
                                <span>{item.name}</span>
                            </Link>
                        </SidebarMenuButton>
                        {item.count != null && (
                            <SidebarMenuBadge>{item.count}</SidebarMenuBadge>
                        )}
                    </SidebarMenuItem>
                );
            })}
        </SidebarMenu>
    );
}
