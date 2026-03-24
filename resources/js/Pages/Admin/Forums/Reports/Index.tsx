import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader } from '@/Components/ui/Card';
import { Button } from '@/Components/ui/Button';
import { 
    Flag, 
    Trash2, 
    Check, 
    X,
    ExternalLink,
    User,
    MessageSquare,
    Lock
} from 'lucide-react';
import { Badge } from '@/Components/ui/Badge';
import { toast } from 'sonner';

interface Report {
    id: number;
    user: { name: string };
    topic: { id: number; title: string, content: string } | null;
    reply: { id: number; content: string } | null;
    reason: string;
    status: 'pending' | 'reviewed' | 'dismissed';
    created_at: string;
}

interface Props {
    reports: Report[];
}

export default function ReportsIndex({ reports }: Props) {
    const handleDismiss = (id: number) => {
        router.post(route('admin.forums.reports.dismiss', id), {}, {
            onSuccess: () => toast.success('Reporte desestimado'),
        });
    };

    const handleAction = (id: number, action: 'delete' | 'lock') => {
        if (!confirm('¿Estás seguro de realizar esta acción de moderación?')) return;
        
        router.delete(route('admin.forums.reports.take-action', id), {
            data: { action },
            onSuccess: () => toast.success('Acción realizada'),
        });
    };

    return (
        <AppLayout>
            <Head title="Reportes de Comunidad - Admin" />
            
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight">Centro de Moderación</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Revisa y gestiona los reportes de contenido de la Red CAMEP.</p>
                </div>

                <div className="grid gap-6">
                    {reports.length === 0 ? (
                        <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 p-20 text-center rounded-xl">
                            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No hay reportes pendientes</p>
                        </Card>
                    ) : (
                        reports.map((report) => (
                            <Card key={report.id} className="overflow-hidden border-slate-200 rounded-xl shadow-lg shadow-slate-200/50">
                                <CardHeader className="bg-white py-4 px-6 border-b border-slate-100 flex flex-row items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 shadow-sm text-red-500">
                                            <Flag size={18} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={report.status === 'pending' ? 'destructive' : 'outline'} className="uppercase text-[9px] font-black tracking-widest px-2 py-0.5 rounded-md">
                                                {report.status}
                                            </Badge>
                                            <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-2">
                                                CASO #{report.id}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-slate-100 opacity-60">
                                            {new Date(report.created_at).toLocaleDateString()}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                                        <div className="w-full lg:w-1/3 p-6 bg-slate-50/30 space-y-6">
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Reportado por</p>
                                                <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                                    <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center text-white text-[10px] font-black">
                                                        {report.user.name.charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{report.user.name}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Motivo de la Denuncia</p>
                                                <div className="bg-red-50/50 p-5 rounded-xl border border-red-100 relative">
                                                    <p className="text-sm font-bold text-red-900 leading-relaxed italic pr-4">
                                                        "{report.reason}"
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex-1 p-6 space-y-6">
                                            <div className="space-y-3">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Contenido Bajo Revisión</p>
                                                {report.topic ? (
                                                    <div className="space-y-4">
                                                        <Badge variant="secondary" className="gap-2 px-3 py-1 rounded-md bg-indigo-50 text-indigo-700 border-indigo-100 text-[9px] font-black">
                                                            <ExternalLink size={12} /> DEBATE ORIGINAL
                                                        </Badge>
                                                        <h3 className="text-base md:text-lg font-black text-slate-900 uppercase tracking-tight leading-tight">{report.topic.title}</h3>
                                                        <div className="text-sm text-slate-600 bg-slate-50 p-6 rounded-xl border border-slate-100 italic relative overflow-hidden">
                                                            <div className="absolute top-0 left-0 w-1 h-full bg-slate-200" />
                                                            {report.topic.content}
                                                        </div>
                                                    </div>
                                                ) : report.reply ? (
                                                    <div className="space-y-4">
                                                        <Badge variant="secondary" className="gap-2 px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 border-emerald-100 text-[9px] font-black">
                                                            <MessageSquare size={12} /> RESPUESTA DEL SOCIO
                                                        </Badge>
                                                        <div className="text-sm text-slate-600 bg-slate-50 p-6 rounded-xl border border-slate-100 italic relative overflow-hidden">
                                                            <div className="absolute top-0 left-0 w-1 h-full bg-slate-200" />
                                                            {report.reply.content}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="py-12 flex flex-col items-center justify-center text-slate-300">
                                                        < Trash2 size={32} className="mb-2 opacity-20" />
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contenido ya eliminado</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="w-full lg:w-72 p-6 bg-slate-50/50 flex flex-col justify-center gap-3">
                                            {report.status === 'pending' && (
                                                <>
                                                    <Button 
                                                        onClick={() => handleAction(report.id, 'delete')}
                                                        variant="destructive" 
                                                        className="w-full h-11 rounded-lg uppercase font-black text-[9px] tracking-widest gap-2 shadow-lg shadow-red-500/10 active:scale-95 transition-all"
                                                    >
                                                        <Trash2 size={14} /> Eliminar Permanente
                                                    </Button>
                                                    {report.topic && (
                                                        <Button 
                                                            onClick={() => handleAction(report.id, 'lock')}
                                                            variant="outline" 
                                                            className="w-full h-11 rounded-lg uppercase font-black text-[9px] tracking-widest gap-2 border-slate-200 bg-white hover:bg-slate-950 hover:text-white active:scale-95 transition-all"
                                                        >
                                                            <Lock size={14} /> Bloquear Debate
                                                        </Button>
                                                    )}
                                                    <Button 
                                                        onClick={() => handleDismiss(report.id)}
                                                        variant="ghost" 
                                                        className="w-full h-11 rounded-lg uppercase font-black text-[9px] tracking-widest gap-2 text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-100 active:scale-95 transition-all"
                                                    >
                                                        <Check size={14} /> Desestimar
                                                    </Button>
                                                </>
                                            )}
                                            {report.status !== 'pending' && (
                                                <div className="text-center py-8">
                                                    <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-lg border border-slate-100 mx-auto mb-4">
                                                        <Check className="text-emerald-500" size={32} />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Moderación Finalizada</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
