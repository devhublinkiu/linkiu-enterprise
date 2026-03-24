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
    Building2, 
    CheckCircle2, 
    XCircle, 
    Search,
    MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Company {
    id: number;
    nombre: string;
    departamento: string | null;
    ciudad: string | null;
    estado: 'activo' | 'inactivo';
    logo_url: string | null;
}

interface Props {
    companies: Company[];
}

export default function Index({ companies }: Props) {
    const [search, setSearch] = useState('');

    const deleteCompany = (id: number) => {
        if (confirm('¿Estás seguro de que quieres eliminar esta empresa? Esta acción eliminará también todas sus licitaciones.')) {
            router.delete(route('admin.bienes-servicios.companies.destroy', id));
        }
    };

    const getStatusBadge = (status: string) => {
        if (status === 'activo') {
            return (
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 font-bold uppercase text-[10px]">
                    <CheckCircle2 size={10} /> Activo
                </Badge>
            );
        }
        return (
            <Badge className="bg-slate-100 text-slate-600 border-slate-200 gap-1 font-bold uppercase text-[10px]">
                <XCircle size={10} /> Inactivo
            </Badge>
        );
    };

    const filteredCompanies = companies.filter(c => 
        c.nombre.toLowerCase().includes(search.toLowerCase()) ||
        (c.ciudad && c.ciudad.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <AppLayout>
            <Head title="Empresas de Bienes y Servicios - Admin" />

            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-900/20">
                                <Building2 size={20} />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Empresas (Bienes y Servicios)</h1>
                        </div>
                        <p className="text-slate-500 text-sm pl-1">Gestiona los proveedores de bienes y servicios para CAMEP.</p>
                    </div>
                    
                    <Link href={route('admin.bienes-servicios.companies.create')}>
                        <Button className="bg-slate-900 hover:bg-orange-500 text-white rounded-xl px-6 h-12 font-bold shadow-xl shadow-slate-900/10 transition-all gap-2">
                            <Plus size={20} />
                            Nueva Empresa
                        </Button>
                    </Link>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input 
                            placeholder="Buscar por nombre o ciudad..." 
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
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Logo</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Nombre</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Ubicación</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Estado</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredCompanies.map((item) => (
                                        <tr key={item.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30">
                                            <td className="px-6 py-4">
                                                <div className="h-12 w-12 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center p-1">
                                                    {item.logo_url ? (
                                                        <img src={item.logo_url} alt={item.nombre} className="h-full w-full object-contain" />
                                                    ) : (
                                                        <Building2 className="text-slate-300" size={20} />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-slate-800 text-sm">{item.nombre}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                                    <MapPin size={12} className="text-slate-400" />
                                                    {item.ciudad && item.departamento ? `${item.ciudad}, ${item.departamento}` : (item.ciudad || item.departamento || 'N/A')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(item.estado)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link href={route('admin.bienes-servicios.companies.edit', item.id)}>
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-blue-600 hover:bg-blue-50 rounded-lg">
                                                            <Pencil size={16} />
                                                        </Button>
                                                    </Link>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-9 w-9 text-red-600 hover:bg-red-50 rounded-lg"
                                                        onClick={() => deleteCompany(item.id)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredCompanies.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4 border border-slate-100">
                                                        <Building2 size={32} />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-slate-800">No hay empresas registradas</h3>
                                                    <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">Comienza registrando la primera empresa proveedora pulsando el botón superior.</p>
                                                    <Link href={route('admin.bienes-servicios.companies.create')} className="mt-6">
                                                        <Button variant="outline" className="rounded-xl border-dashed border-2 hover:bg-slate-50">
                                                            Registrar Empresa Ahora
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
