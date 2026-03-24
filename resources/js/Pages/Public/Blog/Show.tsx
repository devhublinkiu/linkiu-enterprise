import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Button } from '@/Components/ui/Button';
import {
    Calendar,
    User,
    Tag,
    Share2,
    ArrowLeft,
    Facebook,
    Twitter,
    Linkedin,
    Link as LinkIcon,
    Newspaper
} from 'lucide-react';
import DOMPurify from 'dompurify';

interface Post {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    cover_url: string | null;
    category: {
        id: number;
        name: string;
        slug: string;
    } | null;
    tags: Array<{ id: number; name: string }>;
    published_at: string;
    author: {
        id: number;
        name: string;
    };
    meta_title: string | null;
    meta_description: string | null;
}

interface RelatedPost {
    id: number;
    title: string;
    slug: string;
    cover_url: string | null;
    published_at: string;
}

interface Props {
    post: Post;
    relatedPosts: RelatedPost[];
}

export default function Show({ post, relatedPosts }: Props) {
    const cleanContent = DOMPurify.sanitize(post.content, {
        ADD_TAGS: ['iframe'], // Allow iframes for youtube videos
        ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling']
    });

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

    const handleCopyLink = () => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(shareUrl);
            // Optionally add a toast notification here
        }
    };

    return (
        <PublicLayout>
            <Head>
                <title>{post.meta_title || post.title}</title>
                <meta name="description" content={post.meta_description || post.excerpt} />
            </Head>

            {/* Back to Blog */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Link href={route('blog.index')} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-orange-500 transition-colors group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Volver al Blog
                </Link>
            </div>

            {/* Hero Cover */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
                <div className="relative w-full aspect-video md:aspect-[21/9] rounded-[2rem] overflow-hidden shadow-2xl">
                    {post.cover_url ? (
                        <img src={post.cover_url} alt={post.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                            <Newspaper size={64} className="text-slate-300" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
                    
                    {/* Category Overlay */}
                    {post.category && (
                        <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 z-10">
                            <Link href={route('blog.index', { category_id: post.category.id })}>
                                <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-orange-500 text-white text-xs font-black uppercase tracking-widest shadow-lg hover:bg-orange-600 transition-colors">
                                    {(post.category as any).name}
                                </span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Article Content */}
            <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                {/* Header Info */}
                <header className="mb-12 text-center">
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-tight mb-8 tracking-tight">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-500 mb-8 pb-8 border-b border-slate-100">
                        <span className="flex items-center gap-1.5 border border-slate-200 px-4 py-2 rounded-full">
                            <Calendar size={14} className="text-orange-500" /> 
                            {post.published_at}
                        </span>
                        <span className="flex items-center gap-1.5 border border-slate-200 px-4 py-2 rounded-full">
                            <User size={14} className="text-orange-500" /> 
                            {post.author.name}
                        </span>
                    </div>
                </header>

                {/* Excerpt (if different from content start or used as intro) */}
                {post.excerpt && (
                    <div className="mb-10 p-6 bg-slate-50 border-l-4 border-orange-500 rounded-r-xl">
                        <p className="text-xl md:text-2xl text-slate-600 font-medium leading-relaxed italic">
                            {post.excerpt}
                        </p>
                    </div>
                )}

                {/* Main Content Styling (Tiptap base styles) */}
                <div 
                    className="prose prose-lg prose-slate max-w-none 
                               prose-headings:font-black prose-headings:tracking-tight prose-headings:text-slate-900
                               prose-p:text-slate-600 prose-p:leading-relaxed
                               prose-a:text-orange-600 prose-a:font-bold prose-a:no-underline hover:prose-a:text-orange-700
                               prose-blockquote:border-l-4 prose-blockquote:border-orange-500 prose-blockquote:bg-slate-50 prose-blockquote:p-4 prose-blockquote:rounded-r-lg prose-blockquote:italic
                               prose-img:rounded-3xl prose-img:shadow-xl prose-img:mx-auto
                               prose-strong:text-slate-900 prose-strong:font-black
                               marker:text-orange-500"
                    dangerouslySetInnerHTML={{ __html: cleanContent }}
                />

                {/* Footer / Tags / Share */}
                <footer className="mt-16 pt-8 border-t border-slate-100">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        {/* Tags */}
                        {post.tags.length > 0 ? (
                            <div className="flex flex-wrap items-center gap-2">
                                <Tag size={16} className="text-slate-400 mr-2" />
                                {post.tags.map(tag => (
                                    <span key={tag.id} className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl">
                                        {tag.name}
                                    </span>
                                ))}
                            </div>
                        ) : <div></div>}

                        {/* Social Share */}
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mr-2">Compartir:</span>
                            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-50 hover:bg-[#1877F2] hover:text-white text-slate-400 rounded-full transition-colors hidden sm:flex">
                                <Facebook size={18} />
                            </a>
                            <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-50 hover:bg-[#1DA1F2] hover:text-white text-slate-400 rounded-full transition-colors hidden sm:flex">
                                <Twitter size={18} />
                            </a>
                            <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-50 hover:bg-[#0A66C2] hover:text-white text-slate-400 rounded-full transition-colors hidden sm:flex">
                                <Linkedin size={18} />
                            </a>
                            <button onClick={handleCopyLink} className="p-2 bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-400 rounded-full transition-colors sm:hidden" aria-label="Copiar Enlace">
                                <LinkIcon size={18} />
                            </button>
                            <button onClick={handleCopyLink} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-600 text-xs font-bold uppercase tracking-widest rounded-full transition-all">
                                <LinkIcon size={14} /> Copiar
                            </button>
                        </div>
                    </div>
                </footer>
            </article>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
                <section className="py-16 bg-slate-50 border-t border-slate-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Lecturas Recomendadas</h2>
                            <p className="text-slate-500 font-medium mt-2">Otros artículos en esta categoría que te pueden interesar.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {relatedPosts.map(related => (
                                <Link key={related.id} href={route('blog.show', related.slug)} className="group block">
                                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                        <div className="aspect-[3/2] overflow-hidden relative">
                                            {related.cover_url ? (
                                                <img src={related.cover_url} alt={related.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                            ) : (
                                                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                                    <Newspaper size={32} className="text-slate-300" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                                        </div>
                                        <div className="p-6">
                                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                                                <Calendar size={12} /> {related.published_at}
                                            </div>
                                            <h3 className="text-lg font-black text-slate-900 leading-tight group-hover:text-orange-500 transition-colors line-clamp-2">
                                                {related.title}
                                            </h3>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </PublicLayout>
    );
}
