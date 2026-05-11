import AppLayout from '@/Layouts/AppLayout';
import { Head, usePage, Link } from '@inertiajs/react';
import {
    Clock,
    ArrowUpRight,
    BarChart3,
    ShieldCheck,
    Building2,
    CheckCircle2,
    XCircle,
    AlertCircle,
    MinusCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/Components/ui/Card';
import { PageProps } from '@/types';
import { cn } from '@/lib/utils';

const SECTIONS: { key: string; label: string; route: string }[] = [
    { key: 'basicinfo',       label: 'Información Básica',  route: 'associate.company.basic' },
    { key: 'characterization',label: 'Caracterización',     route: 'associate.company.characterization' },
    { key: 'contacts',        label: 'Contactos',           route: 'associate.company.contacts' },
    { key: 'documentation',   label: 'Documentación',       route: 'associate.company.documentation' },
    { key: 'services',        label: 'Servicios',           route: 'associate.company.services' },
];

function SectionStatusRow({ section, review }: { section: typeof SECTIONS[0]; review: { status: string } | undefined }) {
    const status = review?.status || 'draft';

    const config: Record<string, { icon: React.ElementType; cls: string; label: string }> = {
        approved:      { icon: CheckCircle2, cls: 'text-emerald-500', label: 'Aprobada' },
        pending:       { icon: Clock,        cls: 'text-amber-500',   label: 'En revisión' },
        change_pending:{ icon: AlertCircle,  cls: 'text-amber-500',   label: 'Cambio pendiente' },
        rejected:      { icon: XCircle,      cls: 'text-red-500',     label: 'Observada' },
        draft:         { icon: MinusCircle,  cls: 'text-slate-300',   label: 'Sin enviar' },
    };

    const cfg = config[status] ?? config.draft;
    const Icon = cfg.icon;

    return (
        <Link href={route(section.route)} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 -mx-4 px-4 rounded-lg transition-colors group">
            <div className="flex items-center gap-2.5">
                <Icon size={15} className={cfg.cls} />
                <span className="text-sm font-medium text-slate-700">{section.label}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className={cn("text-[10px] font-black uppercase tracking-widest", cfg.cls)}>{cfg.label}</span>
                <ArrowUpRight size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </Link>
    );
}

export default function Dashboard() {
    const { tenant, associateProfile } = usePage<PageProps & { associateProfile: any }>().props;
    const sectionReviews: Record<string, { status: string }> = associateProfile?.section_reviews || {};

    const approvedCount = SECTIONS.filter(s => sectionReviews[s.key]?.status === 'approved').length;

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Bienvenido al panel de gestión de {tenant?.company_name ?? associateProfile?.company_name ?? 'tu empresa'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-md border border-slate-200">
                        <ShieldCheck size={12} />
                        Sistema Operativo
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {associateProfile && (
                    <Card className="border-slate-200 shadow-sm rounded-xl p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <Building2 className="text-slate-400" size={16} />
                                Estado de mi Perfil
                            </h3>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {approvedCount}/{SECTIONS.length} secciones
                            </span>
                        </div>

                        <div className="mb-4">
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                                    style={{ width: `${Math.round((approvedCount / SECTIONS.length) * 100)}%` }}
                                />
                            </div>
                        </div>

                        <div>
                            {SECTIONS.map(section => (
                                <SectionStatusRow
                                    key={section.key}
                                    section={section}
                                    review={sectionReviews[section.key]}
                                />
                            ))}
                        </div>
                    </Card>
                )}

                <Card className="border-slate-200 shadow-sm rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <BarChart3 className="text-slate-400" size={16} />
                            Resumen Operativo
                        </h3>
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
