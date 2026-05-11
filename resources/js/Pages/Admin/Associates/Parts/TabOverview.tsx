import React from 'react';
import { Card } from '@/Components/ui/Card';
import { Button } from '@/Components/ui/Button';
import { Badge } from '@/Components/ui/Badge';
import { Building2, CheckCircle2 } from 'lucide-react';
import { TabsContent } from '@/Components/ui/Tabs';
import { cn } from '@/lib/utils';

interface SectionStats {
    approved: number;
    pending: number;
    rejected: number;
    draft: number;
}

interface TabOverviewProps {
    associate: any;
    sectionStats: SectionStats;
    handleApproveAll: () => void;
    processing: boolean;
}

export function TabOverview({ associate, sectionStats, handleApproveAll, processing }: TabOverviewProps) {
    const total = 4; // basicinfo, characterization, contacts, documentation
    const progressWidth = Math.min(100, (sectionStats.approved / total) * 100);

    return (
        <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-slate-900 border-none rounded-2xl p-6 text-white md:col-span-1 shadow-xl">
                    <h4 className="font-bold text-sm mb-4 uppercase tracking-widest text-slate-400">Progreso de Secciones</h4>
                    <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400 font-medium">Secciones Aprobadas</span>
                            <span className="font-black text-emerald-400">{sectionStats.approved}/{total}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400 font-medium">Pendientes</span>
                            <span className="font-black text-amber-400">{sectionStats.pending}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400 font-medium">Con Observaciones</span>
                            <span className="font-black text-red-400">{sectionStats.rejected}</span>
                        </div>
                        <div className="pt-2">
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                                    style={{ width: `${progressWidth}%` }}
                                />
                            </div>
                            <p className="text-[10px] mt-2 text-slate-500 font-bold uppercase">Secciones completadas</p>
                        </div>
                    </div>
                </Card>

                <Card className="md:col-span-2 border-slate-200 shadow-sm rounded-2xl flex flex-col justify-center items-center p-8 text-center bg-white">
                    <Building2 size={40} className="text-slate-200 mb-4" />
                    <h3 className="text-lg font-bold text-slate-900">
                        Estado de la Solicitud:
                        <Badge className={cn(
                            "ml-2 font-black uppercase tracking-widest text-[10px] px-3 py-1",
                            associate.status === 'approved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                            associate.status === 'verified' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                            associate.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                            'bg-amber-100 text-amber-700 border-amber-200'
                        )}>
                            {associate.status === 'pending'  ? 'Pendiente' :
                             associate.status === 'verified' ? 'Admitido / Pendiente Pago' :
                             associate.status === 'approved' ? 'Activo / Aprobado' :
                             'Rechazado'}
                        </Badge>
                    </h3>
                    <p className="text-slate-500 text-sm mt-2 max-w-md">
                        {associate.status === 'pending'  && "Revisa cada sección y aprueba o rechaza. Al admitir, el socio podrá elegir un plan y pagar la inscripción."}
                        {associate.status === 'verified' && "El socio ya fue admitido. Estamos esperando a que realice el pago de su membresía e inscripción."}
                        {associate.status === 'approved' && "El socio está activo y su perfil es público en el directorio."}
                    </p>
                    {associate.status === 'pending' && (
                        <Button
                            className="mt-6 bg-slate-900 text-white rounded-xl px-8 py-6 h-auto font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                            onClick={handleApproveAll}
                            disabled={processing}
                        >
                            <CheckCircle2 size={18} className="mr-2" />
                            Validar y Admitir como Socio
                        </Button>
                    )}
                </Card>
            </div>
        </TabsContent>
    );
}
