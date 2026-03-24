import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    Plus, 
    Trash2, 
    FileText,
    Tag,
    CheckCircle2,
    XCircle,
    Eye,
    Search,
    Edit2,
    Calendar,
    User as UserIcon,
    Archive
} from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Card, CardContent } from '@/Components/ui/Card';
import { Input } from '@/Components/ui/Input';
import { useState } from 'react';
import CategorySidebar from '@/Components/CategorySidebar';

interface Post {
    id: number;
    title: string;
    slug: string;
    status: 'draft' | 'published' | 'archived';
    is_featured: boolean;
    published_at: string | null;
    visits_count: number;
    author: { name: string };
    category: { name: string } | null;
}

interface Props {
    posts: {
        data: Post[];
        links: any[];
    };
    categories: any[];
}

export default function Index({ posts, categories }: Props) {
    const { delete: destroy } = useForm();
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

    const deletePost = (id: number) => {
        if (confirm('¿Estás seguro de que deseas eliminar esta entrada de blog?')) {
            destroy(route('admin.blog.destroy', id));
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'published':
                return <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Publicado</span>;
            case 'draft':
                return <span className="bg-amber-50 text-amber-600 border border-amber-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Borrador</span>;
            case 'archived':
                return <span className="bg-slate-100 text-slate-500 border border-slate-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Archivado</span>;
            default:
                return null;
        }
    };

    return (
        <AppLayout>
            <Head title="Gestión de Blog - Admin" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <FileText className="text-slate-400" size={24} />
                        Blog y Noticias
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Crea y gestiona los artículos de actualidad de CAMEP.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Button 
                        variant="outline" 
                        onClick={() => setIsCategoriesOpen(true)}
                        className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl px-6 font-bold shadow-sm"
                    >
                        <Tag size={18} className="mr-2" />
                        Categorías
                    </Button>
                    <Link href={route('admin.blog.create')}>
                        <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 font-bold shadow-lg transition-all">
                            <Plus size={18} className="mr-2" />
                            Nueva Entrada
                        </Button>
                    </Link>
                </div>
            </div>

            <CategorySidebar 
                isOpen={isCategoriesOpen} 
                onClose={() => setIsCategoriesOpen(false)} 
                categories={categories}
            />

            <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Artículo</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Detalles</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Estado</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Visitas</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {posts.data.length > 0 ? (
                                posts.data.map((post) => (
                                    <tr key={post.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 max-w-xs">
                                            <p className="text-sm font-bold text-slate-900 line-clamp-2">{post.title}</p>
                                            <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400 font-medium">
                                                <span className="flex items-center gap-1">
                                                    <UserIcon size={12} />
                                                    {post.author.name}
                                                </span>
                                                {post.is_featured && (
                                                    <span className="text-indigo-600 font-bold uppercase tracking-widest">★ Destacado</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Tag size={12} className="text-slate-300" />
                                                    <span className="text-xs font-medium text-slate-600">{post.category?.name || 'General'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={12} className="text-slate-300" />
                                                    <span className="text-[10px] font-medium text-slate-500">
                                                        {post.published_at ? new Date(post.published_at).toLocaleDateString() : 'No publicada'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(post.status)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-xs font-bold text-slate-700">{post.visits_count}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link 
                                                    href={route('admin.blog.edit', post.id)}
                                                    className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                                                >
                                                    <Edit2 size={18} />
                                                </Link>
                                                <button 
                                                    onClick={() => deletePost(post.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <FileText size={48} className="text-slate-100 mb-4" />
                                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No hay entradas registradas</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </AppLayout>
    );
}
