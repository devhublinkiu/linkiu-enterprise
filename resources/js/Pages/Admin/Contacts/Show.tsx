import React from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/Button';
import { Label } from '@/Components/ui/Label';
import { Badge } from "@/Components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/Card';
import { Textarea } from '@/Components/ui/Textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/Select";
import {
    ArrowLeft,
    Mail,
    Phone,
    User,
    Building2,
    IdCard,
    Calendar,
    Clock,
    CheckCircle2,
    AlertCircle,
    MessageSquare,
    Globe,
    Monitor,
    ShieldCheck,
    Activity,
    Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

interface Submission {
    id: number;
    company_name: string | null;
    nit: string | null;
    full_name: string;
    id_number: string;
    email: string;
    phone: string;
    types: string[];
    service: string;
    message: string;
    status: 'pending' | 'reviewing' | 'resolved' | 'declined';
    admin_notes: string | null;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
    resolved_at: string | null;
}

interface Props {
    contact: Submission;
}

export default function Show({ contact }: Props) {
    const { data, setData, patch, processing } = useForm({
        status: contact.status,
        admin_notes: contact.admin_notes || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('admin.contacts.update-status', contact.id), {
            onSuccess: () => toast.success('Estado actualizado correctamente'),
        });
    };

    const handleDelete = () => {
        if (confirm('¿Estás seguro de eliminar esta solicitud permanentemente?')) {
            router.delete(route('admin.contacts.destroy', contact.id));
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-none px-4 py-1 font-black uppercase text-[10px] leading-none"><Clock size={12} className="mr-2" /> Pendiente</Badge>;
            case 'reviewing':
                return <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-none px-4 py-1 font-black uppercase text-[10px] leading-none"><AlertCircle size={12} className="mr-2" /> En Revisión</Badge>;
            case 'resolved':
                return <Badge variant="secondary" className="bg-green-100 text-green-700 border-none px-4 py-1 font-black uppercase text-[10px] leading-none"><CheckCircle2 size={12} className="mr-2" /> Resuelto</Badge>;
            case 'declined':
                return <Badge variant="secondary" className="bg-red-100 text-red-700 border-none px-4 py-1 font-black uppercase text-[10px] leading-none">Rechazado</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <Head title={`Solicitud #${contact.id} | Admin`} />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-xl shadow-sm border border-slate-100 mb-8">
                <div className="flex items-center gap-6">
                    <Link href={route('admin.contacts.index')}>
                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-all">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-black text-slate-900 uppercase">Detalle de Solicitud</h1>
                            {getStatusBadge(contact.status)}
                        </div>
                        <p className="text-slate-500 font-bold text-xs uppercase flex items-center gap-2">
                            <Calendar size={14} /> Recibido el {format(new Date(contact.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Información del Ciudadano/Interesado */}
                    <Card className="rounded-xl border-slate-100 shadow-xl overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-600">
                                    <User size={20} />
                                </div>
                                <div>
                                    <CardTitle className="text-sm font-black text-slate-900 uppercase">Información del Interesado</CardTitle>
                                    <CardDescription className="text-[10px] font-bold uppercase text-slate-400">Datos de contacto proporcionados</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Nombre Completo</p>
                                <p className="text-sm font-black text-slate-900 uppercase">{contact.full_name}</p>
                            </div>
                            {contact.company_name && (
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Empresa / Organización</p>
                                    <p className="text-sm font-black text-slate-900 uppercase">{contact.company_name}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Correo Electrónico</p>
                                <p className="text-sm font-black text-slate-900 uppercase">{contact.email}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Teléfono</p>
                                <p className="text-sm font-black text-slate-900 uppercase">{contact.phone || 'No proporcionado'}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Tipos de Solicitud</p>
                            <div className="flex flex-wrap gap-2">
                                {contact.types.map((type, i) => (
                                    <Badge key={i} variant="outline" className="bg-white text-slate-700 border-slate-200 font-bold uppercase text-[9px]">
                                        {type}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100">
                            <p className="text-[10px] font-black text-orange-400 uppercase mb-1">Servicio de Interés</p>
                            <p className="text-sm font-black text-orange-600 uppercase">{contact.service}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Mensaje / Requerimiento</p>
                            <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                                {contact.message}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Actions & Notes */}
                <div className="space-y-8">
                    <Card className="rounded-xl border-slate-100 shadow-xl overflow-hidden sticky top-8">
                        <CardHeader className="p-8 border-b border-slate-100">
                            <CardTitle className="text-lg font-black text-slate-900 uppercase">Gestión Interna</CardTitle>
                            <CardDescription className="text-slate-400 font-bold uppercase text-[10px] underline underline-offset-4 decoration-green-400 decoration-2">Actualizar estado y notas</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block px-1">Cambiar Estado</label>
                                    <Select
                                        value={data.status}
                                        onValueChange={value => setData('status', value as any)}
                                    >
                                        <SelectTrigger className="h-12 bg-white rounded-xl border-slate-200">
                                            <SelectValue placeholder="Seleccionar estado" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-slate-100 shadow-2xl p-2 bg-white ring-1 ring-slate-100">
                                            <SelectItem value="pending" className="rounded-xl p-3 font-black text-[10px] uppercase text-amber-600 focus:bg-amber-50">Pendiente</SelectItem>
                                            <SelectItem value="reviewing" className="rounded-xl p-3 font-black text-[10px] uppercase text-blue-600 focus:bg-blue-50">En Revisión</SelectItem>
                                            <SelectItem value="resolved" className="rounded-xl p-3 font-black text-[10px] uppercase text-green-600 focus:bg-green-50">Resuelto</SelectItem>
                                            <SelectItem value="declined" className="rounded-xl p-3 font-black text-[10px] uppercase text-red-600 focus:bg-red-50">Rechazado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block px-1">Notas Internas / Respuesta</label>
                                    <textarea
                                        className="w-full min-h-[120px] p-4 bg-white rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                                        placeholder="Escribe aquí las observaciones o respuesta interna..."
                                        value={data.admin_notes}
                                        onChange={(e) => setData('admin_notes', e.target.value)}
                                    />
                                </div>

                                {contact.resolved_at && (
                                    <div className="bg-green-50/50 border border-green-100 p-4 rounded-2xl flex items-center gap-3">
                                        <CheckCircle2 className="text-green-500 shrink-0" size={18} />
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] font-black text-green-800 uppercase leading-none">Cerrado el</p>
                                            <p className="text-[11px] font-bold text-green-600 uppercase">{format(new Date(contact.resolved_at), "dd MMM yyyy, p", { locale: es })}</p>
                                        </div>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-[10px] uppercase shadow-lg shadow-orange-500/10 active:scale-95 transition-all"
                                >
                                    Guardar Cambios
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                    <Card className="rounded-xl border-red-100 bg-red-50/10 overflow-hidden mt-8">
                        <div className="p-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-black text-red-900 uppercase">Zona de Peligro</h3>
                                <p className="text-[10px] font-bold text-red-500 uppercase mt-1">Eliminar permanentemente</p>
                            </div>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                className="h-10 px-6 rounded-xl font-black uppercase text-[10px] shadow-lg shadow-red-200"
                            >
                                <Trash2 size={14} className="mr-2" /> Eliminar
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// Layout wrapper
Show.layout = (page: React.ReactNode) => <AppLayout children={page} />;
