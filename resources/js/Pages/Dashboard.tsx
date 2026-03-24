import AppLayout from '@/Layouts/AppLayout';
import { Head, usePage } from '@inertiajs/react';
import { 
    Users, 
    Zap, 
    Clock, 
    ArrowUpRight,
    TrendingUp,
    BarChart3,
    ShieldCheck
} from 'lucide-react';
import { Card, CardContent } from '@/Components/ui/Card';
import { PageProps } from '@/types';

export default function Dashboard() {
    const { tenant } = usePage<PageProps>().props;

    const stats = [
        { name: 'Usuarios Activos', value: '12', icon: Users, change: '+2.5%', type: 'increase' },
        { name: 'Tareas Pendientes', value: '45', icon: Clock, change: '-4', type: 'decrease' },
        { name: 'Consumo Mensual', value: '85%', icon: Zap, change: '+12%', type: 'increase' },
    ];

    return (
        <AppLayout>
            <Head title="Dashboard" />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Bienvenido al panel de gestión de {tenant?.company_name}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-md border border-slate-200">
                        <ShieldCheck size={12} />
                        Sistema Operativo
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {stats.map((stat) => (
                    <Card key={stat.name} className="border-slate-200 shadow-sm rounded-xl overflow-hidden hover:border-slate-300 transition-colors">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="h-10 w-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-900">
                                    <stat.icon size={20} />
                                </div>
                                <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                    stat.type === 'increase' 
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                        : 'bg-amber-50 text-amber-700 border-amber-100'
                                }`}>
                                    <TrendingUp size={10} className={stat.type === 'decrease' ? 'rotate-180' : ''} />
                                    {stat.change}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-0.5">{stat.name}</h3>
                                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-slate-200 shadow-sm rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <BarChart3 className="text-slate-400" size={16} />
                            Resumen Operativo
                        </h3>
                        <button className="text-slate-400 hover:text-slate-900 transition-colors">
                            <ArrowUpRight size={16} />
                        </button>
                    </div>
                    <div className="h-64 bg-slate-50 border border-slate-200 border-dashed rounded-lg flex items-center justify-center">
                        <p className="text-slate-400 text-xs font-medium italic">Módulo de analíticas en desarrollo...</p>
                    </div>
                </Card>

                <Card className="border-slate-200 shadow-sm rounded-xl p-6">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-6">
                        <Clock className="text-slate-400" size={16} />
                        Actividad Reciente
                    </h3>
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-start gap-3 group cursor-pointer border-b border-slate-50 last:border-0 pb-3 last:pb-0">
                                <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-slate-900 transition-colors shrink-0">
                                    <ShieldCheck size={14} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 truncate">Actualización de Sistema</p>
                                    <p className="text-[10px] text-slate-400 font-medium tracking-tight">Hace {i} horas • Registro automático</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
