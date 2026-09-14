import { router } from '@inertiajs/react';

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/Components/base/Pagination';

import { Paginator } from '../types';

// Mapea el paginator de Laravel a base/Pagination con navegación Inertia (SPA).
// Los `url` ya traen la query (estado/q) por withQueryString().
export default function TablePagination<T>({ page }: { page: Paginator<T> }) {
    if (page.last_page <= 1) {
        return null;
    }

    const go = (url: string | null) => (e: React.MouseEvent) => {
        e.preventDefault();
        if (url) {
            router.get(url, {}, { preserveState: true, preserveScroll: true });
        }
    };

    const numbers = page.links.slice(1, -1);

    return (
        <Pagination className="mx-0 w-auto justify-end">
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href={page.prev_page_url ?? '#'}
                        onClick={go(page.prev_page_url)}
                        aria-disabled={!page.prev_page_url}
                        className={
                            page.prev_page_url
                                ? undefined
                                : 'pointer-events-none opacity-50'
                        }
                    />
                </PaginationItem>

                {numbers.map((link, i) =>
                    link.url === null ? (
                        <PaginationItem key={`e-${i}`}>
                            <PaginationEllipsis />
                        </PaginationItem>
                    ) : (
                        <PaginationItem key={link.label}>
                            <PaginationLink
                                href={link.url}
                                isActive={link.active}
                                onClick={go(link.url)}
                            >
                                {link.label}
                            </PaginationLink>
                        </PaginationItem>
                    ),
                )}

                <PaginationItem>
                    <PaginationNext
                        href={page.next_page_url ?? '#'}
                        onClick={go(page.next_page_url)}
                        aria-disabled={!page.next_page_url}
                        className={
                            page.next_page_url
                                ? undefined
                                : 'pointer-events-none opacity-50'
                        }
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}
