import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent } from '@/Components/ui/Card';
import { Button } from '@/Components/ui/Button';
import { Badge } from '@/Components/ui/Badge';
import {
    Building2,
    Search,
    Filter,
    ArrowUpRight,
} from 'lucide-react';
import { Input } from '@/Components/ui/Input';
import { Tabs, TabsList, TabsTrigger } from '@/Components/ui/Tabs';
import StatusToggle from '@/Components/StatusToggle';
import { cn } from '@/lib/utils';

const SECTION_KEYS = ['basicinfo', 'characterization', 'contacts', 'documentation', 'services'] as const;

interface Associate {
    id: number;
    company_name: string;
    nit: string;
    city: string;
    status: 'pending' | 'verified' | 'approved' | 'rejected' | 'inactive';
    created_at: string;
    section_reviews: Record<string, { status: string }>;
    is_public: boolean;
    is_verified: boolean;
}

function SectionDots({ reviews }: { reviews: Record<string, { status: string }> }) {
    const statusColor: Record<string, string> = {
        approved:      'bg-emerald-500',
        pending:       'bg-amber-400',
        change_pending:'bg-amber-400',
        rejected:      'bg-red-500',
        draft:         'bg-slate-200',
    };

    return (
        <div className="flex gap-1 items-center">
            {SECTION_KEYS.map(key => {
                const status = reviews?.[key]?.status || 'draft';
                return (
                    <span
                        key={key}
                        title={`${key}: ${status}`}
                        className={cn("inline-block w-2 h-2 rounded-full", statusColor[status] ?? 'bg-slate-200')}
                    />
                );
            })}
        </div>
    );
}

export default function Index({ associates, currentStatus }: { associates: Associate[], currentStatus: string }) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 uppercase text-[10px] font-black tracking-widest px-2 py-0.5 shadow-none">Activo</Badge>;
            case 'verified':
                return <Badge className="bg-blue-50 text-blue-700 border-blue-100 uppercase text-[10px] font-black tracking-widest px-2 py-0.5 shadow-none">Admitido</Badge>;
            case 'rejected':
                return <Badge className="bg-red-50 text-red-700 border-red-100 uppercase text-[10px] font-black tracking-widest px-2 py-0.5 shadow-none">Rechazado</Badge>;
            case 'inactive':
                return <Badge className="bg-slate-50 text-slate-700 border-slate-100 uppercase text-[10px] font-black tracking-widest px-2 py-0.5 shadow-none">Inactivo</Badge>;
            default:
                return <Badge className="bg-amber-50 text-amber-700 border-amber-100 uppercase text-[10px] font-black tracking-widest px-2 py-0.5 shadow-none">Pendiente</Badge>;
        }
    };

    return (
        <AppLayout>
            <Head title="Gestión de Empresas - CAMEP" />

            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Empresas Asociadas</h1>
                        <p className="text-slate-500 text-sm mt-1">Gestiona y audita las solicitudes de afiliación de CAMEP.</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <Tabs defaultValue={currentStatus} className="w-full md:w-auto" onValueChange={(val) => {
                         window.location.href = route('admin.associates.index', { status: val });
                    }}>
                        <TabsList className="bg-slate-100/50 p-1 border border-slate-200">
                            <TabsTrigger value="approved" className="px-6 py-2 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                Activas
                            </TabsTrigger>
                            <TabsTrigger value="verified" className="px-6 py-2 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                Admitidas
                            </TabsTrigger>
                            <TabsTrigger value="pending" className="px-6 py-2 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                Pendientes
                            </TabsTrigger>
                            <TabsTrigger value="inactive" className="px-6 py-2 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                Inactivas
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="flex items-center gap-2">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <Input placeholder="Filtrar en esta lista..." className="pl-10 border-slate-200 rounded-lg bg-white h-10 text-sm" />
                        </div>
                        <Button variant="outline" className="border-slate-200 text-slate-600 rounded-lg h-10 px-4">
                            <Filter size={16} className="mr-2" />
                            Filtros
                        </Button>
                    </div>
                </div>

                <Card className="border-slate-200 shadow-sm overflow-hidden rounded-xl">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Empresa</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">NIT</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Ubicación</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Secciones</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Verificado</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Público</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">Estado</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {associates.map((associate) => (
                                        <tr key={associate.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 bg-slate-100 rounded flex items-center justify-center text-slate-500">
                                                        <Building2 size={16} />
                                                    </div>
                                                    <span className="font-semibold text-slate-900 text-sm">{associate.company_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 font-medium">{associate.nit}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{associate.city}</td>
                                            <td className="px-6 py-4">
                                                <SectionDots reviews={associate.section_reviews || {}} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusToggle
                                                    id={associate.id}
                                                    value={associate.is_verified}
                                                    route="admin.associates.toggle-verified"
                                                    label={associate.is_verified ? "SÍ" : "NO"}
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusToggle
                                                    id={associate.id}
                                                    value={associate.is_public}
                                                    route="admin.associates.toggle-public"
                                                    label={associate.is_public ? "ACTIVO" : "INACTIVO"}
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {getStatusBadge(associate.status)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link href={route('admin.associates.show', associate.id)}>
                                                    <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-bold group">
                                                        Auditar
                                                        <ArrowUpRight size={14} className="ml-1 opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0" />
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {associates.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                                                        <Building2 size={24} />
                                                    </div>
                                                    <p className="text-slate-500 font-medium">No hay solicitudes registradas aún.</p>
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
