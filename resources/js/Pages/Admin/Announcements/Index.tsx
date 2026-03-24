import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/Button';
import { Badge } from "@/Components/ui/Badge";
import { Card, CardContent } from '@/Components/ui/Card';
import { Input } from '@/Components/ui/Input';
import { 
    Plus, 
    MoreHorizontal, 
    Pencil, 
    Trash2, 
    Eye, 
    FileText, 
    Megaphone, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    Globe, 
    ShieldAlert,
    Search,
    Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Announcement {
    id: number;
    title: string;
    slug: string;
    status: 'draft' | 'published' | 'archived';
    visibility: 'public' | 'members_only';
    published_at: string | null;
    expires_at: string | null;
    author: { name: string } | null;
    documents_count: number;
}

interface Props {
    announcements: {
        data: Announcement[];
        links: any[];
    };
}

export default function Index({ announcements }: Props) {
    const [search, setSearch] = useState('');

    const deleteAnnouncement = (id: number) => {
        if (confirm('¿Estás seguro de que quieres eliminar este anuncio? Esta acción no se puede deshacer.')) {
            router.delete(route('admin.announcements.destroy', id));
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'published':
                return (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 font-bold uppercase text-[10px]">
                        <CheckCircle2 size={10} /> Publicado
                    </Badge>
                );
            case 'archived':
                return (
                    <Badge className="bg-slate-100 text-slate-600 border-slate-200 gap-1 font-bold uppercase text-[10px]">
                        <XCircle size={10} /> Archivado
                    </Badge>
                );
            default:
                return (
                    <Badge className="bg-amber-50 text-amber-700 border-amber-200 gap-1 font-bold uppercase text-[10px]">
                        <Clock size={10} /> Borrador
                    </Badge>
                );
        }
    };

    const getVisibilityBadge = (visibility: string) => {
        if (visibility === 'public') {
            return (
                <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50/50 gap-1 font-bold uppercase text-[10px]">
                    <Globe size={10} /> Público
                </Badge>
            );
        }
        return (
            <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50/50 gap-1 font-bold uppercase text-[10px]">
                <ShieldAlert size={10} /> Asociados
            </Badge>
        );
    };

    return (
        <AppLayout>
            <Head title="Anuncios y Licitaciones - Admin" />

            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-900/20">
                                <Megaphone size={20} />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Anuncios y Licitaciones</h1>
                        </div>
                        <p className="text-slate-500 text-sm pl-1">Gestiona las convocatorias, noticias y documentos técnicos de CAMEP.</p>
                    </div>
                    
                    <Link href={route('admin.announcements.create')}>
                        <Button className="bg-slate-900 hover:bg-orange-500 text-white rounded-xl px-6 h-12 font-bold shadow-xl shadow-slate-900/10 transition-all gap-2">
                            <Plus size={20} />
                            Nuevo Anuncio
                        </Button>
                    </Link>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input 
                            placeholder="Buscar por título o contenido..." 
                            className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-orange-500 focus:border-orange-500 bg-white"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="h-12 rounded-xl border-slate-200 text-slate-600 font-bold px-5 bg-white">
                            Filtrar
                        </Button>
                    </div>
                </div>

                {/* Table Content */}
                <Card className="border-slate-200 shadow-sm overflow-hidden rounded-2xl bg-white">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Anuncio</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Público</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Estado</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Adjuntos</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Fechas</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {announcements.data.map((item) => (
                                        <tr key={item.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col max-w-md">
                                                    <span className="font-bold text-slate-800 text-sm line-clamp-1">
                                                        {item.title}
                                                    </span>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] text-slate-400 font-medium">Por {item.author?.name || 'Sistema'}</span>
                                                        <div className="h-1 w-1 rounded-full bg-slate-300" />
                                                        <span className="text-[10px] text-slate-400 font-mono uppercase">{item.slug}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getVisibilityBadge(item.visibility)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(item.status)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={cn(
                                                    "flex items-center gap-1.5 px-2 py-1 rounded-lg w-fit",
                                                    item.documents_count > 0 ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-400"
                                                )}>
                                                    <FileText size={14} />
                                                    <span className="text-xs font-black">{item.documents_count}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
                                                        <Calendar size={12} className="text-slate-400" />
                                                        Pub: {item.published_at ? new Date(item.published_at).toLocaleDateString() : 'Inmediato'}
                                                    </div>
                                                    {item.expires_at && (
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-500">
                                                            <Clock size={12} />
                                                            Cierre: {new Date(item.expires_at).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link href={route('admin.announcements.edit', item.id)}>
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-blue-600 hover:bg-blue-50 rounded-lg">
                                                            <Pencil size={16} />
                                                        </Button>
                                                    </Link>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-9 w-9 text-red-600 hover:bg-red-50 rounded-lg"
                                                        onClick={() => deleteAnnouncement(item.id)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {announcements.data.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4 border border-slate-100">
                                                        <Megaphone size={32} />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-slate-800">No hay anuncios registrados</h3>
                                                    <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">Comienza creando tu primera convocatoria o noticia para los asociados pulsando el botón superior.</p>
                                                    <Link href={route('admin.announcements.create')} className="mt-6">
                                                        <Button variant="outline" className="rounded-xl border-dashed border-2 hover:bg-slate-50">
                                                            Crear Anuncio Ahora
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
