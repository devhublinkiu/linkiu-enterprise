import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Button } from '@/Components/ui/Button';
import {
    Search,
    Filter,
    ChevronRight,
    ChevronDown,
    Calendar,
    User,
    Eye,
    Tag,
    X,
    SearchX,
    Newspaper
} from 'lucide-react';
import { cn } from '@/lib/utils';
import DOMPurify from 'dompurify';

interface Post {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    cover_url: string | null;
    category: {
        id: number;
        name: string;
        slug: string;
    } | null;
    published_at: string;
    author: {
        id: number;
        name: string;
    };
    visits_count: number;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    posts_count: number;
}

interface Props {
    posts: {
        data: Post[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    categories: Category[];
    filters: {
        search?: string;
        category_id?: string;
    };
}

export default function Index({ posts, categories, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');

    const handleSearch = () => {
        router.get(route('blog.index'), {
            search,
            category_id: categoryId,
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    const clearFilters = () => {
        setSearch('');
        setCategoryId('');
        router.get(route('blog.index'), {}, { replace: true });
    };

    // Auto-search when filters change
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) handleSearch();
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        if (categoryId !== (filters.category_id || '')) {
            handleSearch();
        }
    }, [categoryId]);

    // Helper to strip HTML and limit text
    const extractText = (html: string, length: number = 150) => {
        const clean = DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
        return clean.length > length ? clean.substring(0, length) + '...' : clean;
    };

    return (
        <PublicLayout>
            <Head title="Blog y Novedades" />

            {/* Hero Section */}
            <section className="relative bg-slate-900 py-24 md:py-32 overflow-hidden border-b-8 border-orange-500">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-900/90 to-slate-900 opacity-90"></div>
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 text-center">
                    <Newspaper size={48} className="mx-auto text-orange-400 mb-6" />
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">
                        Blog & <span className="text-orange-400">Noticias</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
                        Entérate de las últimas novedades, eventos y artículos de interés de CAMEP y el sector de hidrocarburos.
                    </p>
                </div>
            </section>

            <section className="py-12 md:py-20 flex-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">

                    {/* Search and Filters Bar */}
                    <div className="bg-white rounded-xl p-8 mb-16 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 relative -mt-24 z-20">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                            {/* Search Input */}
                            <div className="space-y-2 md:col-span-1">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Buscar artículo</label>
                                <div className="flex items-center h-14 bg-slate-50 rounded-xl border border-transparent focus-within:bg-white focus-within:border-orange-200 focus-within:ring-4 focus-within:ring-orange-50/50 transition-all group">
                                    <div className="pl-4 pr-2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                                        <Search size={20} strokeWidth={2.5} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Palabras clave..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 placeholder:text-slate-300 h-full w-full"
                                    />
                                </div>
                            </div>

                            {/* Category Selector */}
                            <div className="space-y-2 md:col-span-1">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Categoría</label>
                                <div className="flex items-center h-14 bg-slate-50 rounded-xl border border-transparent focus-within:bg-white focus-within:border-orange-200 focus-within:ring-4 focus-within:ring-orange-50/50 transition-all group relative">
                                    <div className="pl-4 pr-2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                                        <Filter size={20} strokeWidth={2.5} />
                                    </div>
                                    <select
                                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 appearance-none h-full w-full pr-10 cursor-pointer !bg-none"
                                        value={categoryId}
                                        onChange={(e) => setCategoryId(e.target.value)}
                                    >
                                        <option value="">Todas las categorías</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name} ({cat.posts_count})</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 pointer-events-none text-slate-400">
                                        <ChevronDown size={18} />
                                    </div>
                                </div>
                            </div>

                            {/* Clear Filters Button */}
                            <div className="flex h-14 md:col-span-1 border-l-0 md:border-l border-slate-100 pl-0 md:pl-6">
                                <Button
                                    onClick={clearFilters}
                                    variant="ghost"
                                    className="w-full h-full rounded-xl hover:bg-red-50 hover:text-red-500 text-slate-400 transition-all gap-3 font-bold text-sm"
                                >
                                    <X size={18} />
                                    Limpiar Filtros
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Blog Posts Grid */}
                    {posts.data.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {posts.data.map((post, i) => (
                                    <article
                                        key={post.id}
                                        className="group flex flex-col bg-white rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-700 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-8 duration-700 h-full"
                                        style={{ animationDelay: `${i * 50}ms` }}
                                    >
                                        {/* Cover Image */}
                                        <Link href={route('blog.show', post.slug)} className="relative h-56 w-full overflow-hidden block shrink-0">
                                            {post.cover_url ? (
                                                <img
                                                    src={post.cover_url}
                                                    alt={post.title}
                                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-slate-100 flex items-center justify-center transition-transform duration-1000 group-hover:scale-110">
                                                    <Newspaper size={48} className="text-slate-200" />
                                                </div>
                                            )}
                                            
                                            {/* Gradient Overlay for Top Badges */}
                                            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent pointer-events-none"></div>

                                            {/* Category Badge */}
                                            {post.category && (
                                                <div className="absolute top-4 left-4 z-10">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-white text-orange-600 text-[10px] font-black uppercase tracking-widest shadow-lg">
                                                        {post.category.name}
                                                    </span>
                                                </div>
                                            )}
                                        </Link>

                                        {/* Content Area */}
                                        <div className="p-8 flex flex-col flex-1">
                                            {/* Metadata Row */}
                                            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">
                                                <span className="flex items-center gap-1.5"><Calendar size={12} /> {post.published_at}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                <span className="flex items-center gap-1.5"><User size={12} /> {post.author.name}</span>
                                            </div>

                                            {/* Title & Excerpt */}
                                            <Link href={route('blog.show', post.slug)} className="group-hover:text-orange-600 transition-colors outline-none focus:ring-2 focus:ring-orange-500 rounded-lg">
                                                <h3 className="text-2xl font-black text-slate-900 leading-tight mb-4 group-hover:text-orange-600 transition-colors line-clamp-2">
                                                    {post.title}
                                                </h3>
                                            </Link>

                                            <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-3 mb-6 flex-1">
                                                {post.excerpt || extractText(post.title, 150)}
                                            </p>

                                            {/* Footer Row */}
                                            <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-auto">
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                                                    <Eye size={14} />
                                                    <span>{post.visits_count}</span>
                                                </div>
                                                
                                                <Link href={route('blog.show', post.slug)}>
                                                    <Button variant="ghost" className="text-orange-500 hover:text-orange-600 hover:bg-orange-50 font-bold group/btn rounded-xl px-4">
                                                        Leer más
                                                        <ChevronRight size={16} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>

                            {/* Pagination (if applicable) */}
                            {posts.last_page > 1 && (
                                <div className="mt-16 flex justify-center">
                                    <div className="flex items-center gap-2 bg-white rounded-xl shadow-sm border border-slate-100 p-2">
                                        {posts.links.map((link, i) => {
                                            if (link.url === null) {
                                                return (
                                                    <span key={i} className="px-4 py-2 text-sm text-slate-300 font-bold" dangerouslySetInnerHTML={{ __html: link.label }} />
                                                );
                                            }

                                            return (
                                                <Link
                                                    key={i}
                                                    href={link.url}
                                                    className={cn(
                                                        "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                                                        link.active
                                                            ? "bg-slate-900 text-white"
                                                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                                    )}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        /* Empty State */
                        <div className="bg-white rounded-[3rem] p-20 text-center border border-dashed border-slate-200 shadow-sm animate-in fade-in duration-700 max-w-3xl mx-auto">
                            <div className="mx-auto w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-8">
                                <SearchX size={48} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-4">No se encontraron artículos</h3>
                            <p className="text-slate-500 font-medium mb-10">
                                Intenta ajustar tus palabras clave o filtra por otra categoría.
                            </p>
                            <Button
                                onClick={clearFilters}
                                className="bg-slate-900 hover:bg-slate-800 rounded-xl h-14 px-10 font-black uppercase tracking-widest shadow-xl"
                            >
                                Limpiar Búsqueda
                            </Button>
                        </div>
                    )}
                </div>
            </section>
        </PublicLayout>
    );
}
