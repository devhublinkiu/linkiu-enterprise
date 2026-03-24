import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout'; 
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/Table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/DropdownMenu";
import { Button } from "@/Components/ui/Button";
import { Badge } from "@/Components/ui/Badge";
import { 
    MoreHorizontal, 
    Mail, 
    Phone, 
    Calendar, 
    Eye, 
    Trash2, 
    CheckCircle, 
    Clock, 
    AlertCircle,
    Building2,
    User
} from "lucide-react";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Submission {
    id: number;
    company_name: string | null;
    full_name: string;
    email: string;
    phone: string;
    types: string[];
    service: string;
    status: 'pending' | 'reviewing' | 'resolved' | 'declined';
    created_at: string;
}

interface Props {
    submissions: {
        data: Submission[];
        links: any[];
    };
}

export default function Index({ submissions }: Props) {
    const getStatusBadge = (status: Submission['status']) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none px-3 font-bold uppercase text-[10px]"><Clock size={12} className="mr-1" /> Pendiente</Badge>;
            case 'reviewing':
                return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none px-3 font-bold uppercase text-[10px]"><AlertCircle size={12} className="mr-1" /> En Revisión</Badge>;
            case 'resolved':
                return <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 border-none px-3 font-bold uppercase text-[10px]"><CheckCircle size={12} className="mr-1" /> Resuelto</Badge>;
            case 'declined':
                return <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-200 border-none px-3 font-bold uppercase text-[10px]">Rechazado</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de eliminar esta solicitud?')) {
            router.delete(route('admin.contacts.destroy', id));
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <Head title="Solicitudes y PQRF | Admin" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 uppercase">SOLICITUDES Y PQRF</h1>
                    <p className="text-slate-500 font-bold text-xs uppercase mt-1">Gestión de contactos y solicitudes ciudadanas</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                        <Mail size={24} />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="hover:bg-transparent border-slate-100 h-16">
                            <TableHead className="font-black text-slate-400 uppercase text-[10px] pl-8 text-center">Fecha</TableHead>
                            <TableHead className="font-black text-slate-400 uppercase text-[10px]">Interesado</TableHead>
                            <TableHead className="font-black text-slate-400 uppercase text-[10px]">Tipo / Servicio</TableHead>
                            <TableHead className="font-black text-slate-400 uppercase text-[10px] text-center">Estado</TableHead>
                            <TableHead className="font-black text-slate-400 uppercase text-[10px] pr-8 text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {submissions.data.map((item) => (
                            <TableRow key={item.id} className="hover:bg-slate-50/50 border-slate-100 transition-colors h-24">
                                <TableCell className="pl-8 text-center">
                                    <div className="flex flex-col items-center">
                                        <span className="text-sm font-black text-slate-900 uppercase">
                                            {format(new Date(item.created_at), 'dd MMM', { locale: es })}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                                            {format(new Date(item.created_at), 'yyyy')}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                                            <User size={20} />
                                        </div>
                                        <div className="flex flex-col max-w-[200px]">
                                            <span className="text-sm font-black text-slate-900 uppercase truncate">
                                                {item.full_name}
                                            </span>
                                            {item.company_name && (
                                                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                                    <Building2 size={10} /> {item.company_name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex flex-wrap gap-1">
                                            {item.types.map((type, i) => (
                                                <span key={i} className="text-[9px] font-black bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full uppercase">
                                                    {type}
                                                </span>
                                            ))}
                                        </div>
                                        <span className="text-[10px] font-bold text-orange-500 uppercase">
                                            {item.service}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    {getStatusBadge(item.status)}
                                </TableCell>
                                <TableCell className="pr-8 text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-slate-100">
                                                <MoreHorizontal className="h-5 w-5 text-slate-400" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56 rounded-xl border-slate-100 shadow-2xl p-2">
                                            <DropdownMenuLabel className="text-[10px] font-black uppercase text-slate-400 px-3 py-2">
                                                Opciones
                                            </DropdownMenuLabel>
                                            <Link href={route('admin.contacts.show', item.id)}> 
                                                <DropdownMenuItem className="rounded-xl font-bold text-slate-600 uppercase text-xs p-3 cursor-pointer">
                                                    <Eye className="mr-2 h-4 w-4" /> Ver Detalles
                                                </DropdownMenuItem>
                                            </Link>
                                            <DropdownMenuSeparator className="bg-slate-50" />
                                            <DropdownMenuItem 
                                                onClick={() => handleDelete(item.id)}
                                                className="rounded-xl font-bold text-red-600 uppercase text-xs p-3 cursor-pointer focus:text-red-700 focus:bg-red-50"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}

                        {submissions.data.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-64 text-center">
                                    <div className="flex flex-col items-center gap-4 text-slate-300">
                                        <Mail size={48} strokeWidth={1} />
                                        <span className="text-xs font-black uppercase">No hay solicitudes pendientes</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

// Layout wrapper
Index.layout = (page: React.ReactNode) => <AppLayout children={page} />;
