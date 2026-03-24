import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/Button';
import { Badge } from "@/Components/ui/Badge";
import { Card, CardContent } from '@/Components/ui/Card';
import { Input } from '@/Components/ui/Input';
import { 
    Plus, 
    Pencil, 
    Trash2, 
    Briefcase, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    Globe, 
    ShieldAlert,
    Search,
    Calendar,
    Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Tender {
    id: number;
    titulo: string;
    empresa_nombre: string;
    publico_objetivo: 'abierto' | 'exclusivo_asociados';
    estado: 'borrador' | 'publicado' | 'cerrado';
    fecha_publicacion: string | null;
    fecha_cierre: string | null;
}

interface Props {
    tenders: Tender[];
}

export default function Index({ tenders }: Props) {
    const [search, setSearch] = useState('');

    const deleteTender = (id: number) => {
        if (confirm('¿Estás seguro de que quieres eliminar esta licitación?')) {
            router.delete(route('admin.bienes-servicios.tenders.destroy', id));
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'publicado':
                return (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 font-bold uppercase text-[10px]">
                        <CheckCircle2 size={10} /> Publicado
                    </Badge>
                );
            case 'cerrado':
                return (
                    <Badge className="bg-slate-100 text-slate-600 border-slate-200 gap-1 font-bold uppercase text-[10px]">
                        <XCircle size={10} /> Cerrado
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
        if (visibility === 'abierto') {
            return (
                <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50/50 gap-1 font-bold uppercase text-[10px]">
                    <Globe size={10} /> Abierto
                </Badge>
            );
        }
        return (
            <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50/50 gap-1 font-bold uppercase text-[10px]">
                <ShieldAlert size={10} /> Asociados
            </Badge>
        );
    };

    const filteredTenders = tenders.filter(t => 
        t.titulo.toLowerCase().includes(search.toLowerCase()) ||
        t.empresa_nombre.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AppLayout>
            <Head title="Licitaciones de Bienes y Servicios - Admin" />

            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-900/20">
                                <Briefcase size={20} />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Licitaciones (Bienes y Servicios)</h1>
                        </div>
                        <p className="text-slate-500 text-sm pl-1">Gestiona las convocatorias de bienes y servicios vinculadas a empresas proveedoras.</p>
                    </div>
                    
                    <Link href={route('admin.bienes-servicios.tenders.create')}>
                        <Button className="bg-slate-900 hover:bg-orange-500 text-white rounded-xl px-6 h-12 font-bold shadow-xl shadow-slate-900/10 transition-all gap-2">
                            <Plus size={20} />
                            Nueva Licitación
                        </Button>
                    </Link>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input 
                            placeholder="Buscar por título o empresa..." 
                            className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-orange-500 focus:border-orange-500 bg-white"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table Content */}
                <Card className="border-slate-200 shadow-sm overflow-hidden rounded-2xl bg-white">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Licitación</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Empresa</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Público</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Estado</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Vencimiento</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredTenders.map((item) => (
                                        <tr key={item.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col max-w-md">
                                                    <span className="font-bold text-slate-800 text-sm line-clamp-1">
                                                        {item.titulo}
                                                    </span>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Calendar size={10} className="text-slate-400" />
                                                        <span className="text-[10px] text-slate-400 font-medium">Publicado: {item.fecha_publicacion || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Building2 size={14} className="text-slate-400" />
                                                    <span className="text-sm font-medium text-slate-600">{item.empresa_nombre}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getVisibilityBadge(item.publico_objetivo)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(item.estado)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.fecha_cierre ? (
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 uppercase tracking-tighter">
                                                        <Clock size={12} />
                                                        {item.fecha_cierre}
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] text-slate-400 font-medium">Sin fecha</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link href={route('admin.bienes-servicios.tenders.edit', item.id)}>
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-blue-600 hover:bg-blue-50 rounded-lg">
                                                            <Pencil size={16} />
                                                        </Button>
                                                    </Link>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-9 w-9 text-red-600 hover:bg-red-50 rounded-lg"
                                                        onClick={() => deleteTender(item.id)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredTenders.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4 border border-slate-100">
                                                        <Briefcase size={32} />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-slate-800">No hay licitaciones registradas</h3>
                                                    <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">Comienza creando tu primera licitación de bienes y servicios pulsando el botón superior.</p>
                                                    <Link href={route('admin.bienes-servicios.tenders.create')} className="mt-6">
                                                        <Button variant="outline" className="rounded-xl border-dashed border-2 hover:bg-slate-50">
                                                            Crear Licitación Ahora
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
