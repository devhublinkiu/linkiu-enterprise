import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import { Card, CardContent } from '@/Components/ui/Card';
import { Button } from '@/Components/ui/Button';
import { Badge } from '@/Components/ui/Badge';
import { 
    Check, 
    X, 
    Eye, 
    MessageSquare, 
    Building2, 
    FileText, 
    Clock,
    User,
    ShieldAlert,
    Download
} from 'lucide-react';

export default function VerificationDashboard() {
    return (
        <AppLayout>
            <Head title="Auditoría de Afiliaciones" />

            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Auditoría: Proyectos Industriales SAS</h1>
                        <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                            <Clock size={14} /> Solicitud recibida: 11 de Marzo, 2026
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="border-slate-200 text-slate-600 rounded-md">
                            Archivar
                        </Button>
                        <Button className="bg-emerald-600 text-white hover:bg-emerald-700 rounded-md">
                            Aprobar Afiliación Completa
                        </Button>
                    </div>
                </div>

                {/* Audit Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Form Data Audit */}
                    <div className="lg:col-span-2 space-y-6">
                        <AuditSection 
                            title="Información Básica" 
                            icon={Building2}
                            items={[
                                { label: 'Nombre Empresa', value: 'Proyectos Industriales SAS', status: 'approved' },
                                { label: 'NIT', value: '900.567.890-5', status: 'pending' },
                                { label: 'Tipo Sociedad', value: 'SAS', status: 'approved' },
                                { label: 'Ubicación', value: 'Puerto Gaitán, Meta', status: 'approved' },
                            ]}
                        />

                        <AuditSection 
                            title="Caracterización y PEP" 
                            icon={ShieldAlert}
                            items={[
                                { label: 'Clasificación', value: 'Mediana Empresa', status: 'approved' },
                                { label: 'Empleados Directos', value: '45', status: 'approved' },
                                { label: 'Declaración PEP', value: 'NO es PEP', status: 'approved' },
                                { label: 'Origen de Fondos', value: 'Declarado y Firmado', status: 'approved' },
                            ]}
                        />

                        <AuditSection 
                            title="Contactos y Referencias" 
                            icon={User}
                            items={[
                                { label: 'Gerente General', value: 'Carlos Mendoza', status: 'approved' },
                                { label: 'Email Facturación', value: 'contabilidad@proyectos.com', status: 'pending' },
                                { label: 'Ref. Comercial 1', value: 'Ecopetrol (Verificada)', status: 'approved' },
                            ]}
                        />
                    </div>

                    {/* Right Column: Files Audit */}
                    <div className="space-y-6">
                        <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
                            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                    <FileText size={14} />
                                    Documentos Adjuntos
                                </h3>
                            </div>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-50">
                                    <FileAuditItem name="RUT Actualizado" status="approved" />
                                    <FileAuditItem name="Cámara y Comercio" status="rejected" reason="Documento vencido hace 2 meses." />
                                    <FileAuditItem name="Logo Corporativo" status="pending" />
                                    <FileAuditItem name="Balance 2025" status="approved" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-indigo-900 border-none rounded-xl p-6 text-white">
                            <h4 className="font-bold text-sm mb-2">Resumen de Auditoría</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between text-xs">
                                    <span className="text-indigo-300">Campos Aprobados</span>
                                    <span className="font-bold">12</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-indigo-300">Pendientes</span>
                                    <span className="font-bold text-amber-400">3</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-indigo-300">Rechazados</span>
                                    <span className="font-bold text-red-400">1</span>
                                </div>
                                <div className="h-1 bg-white/10 rounded-full mt-4">
                                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: '75%' }}></div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

// --- Sub-components for Audit ---

function AuditSection({ title, icon: Icon, items }: { title: string, icon: any, items: any[] }) {
    return (
        <Card className="border-slate-200 shadow-sm rounded-xl">
            <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Icon size={16} className="text-slate-400" />
                    {title}
                </h3>
                <Badge variant="outline" className="text-[10px] font-bold uppercase border-slate-200 text-slate-500">
                    Sección Auditada
                </Badge>
            </div>
            <CardContent className="p-0">
                <div className="divide-y divide-slate-50">
                    {items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors group">
                            <div className="flex-1">
                                <p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">{item.label}</p>
                                <p className="text-sm font-semibold text-slate-800">{item.value}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {item.status === 'pending' ? (
                                    <div className="flex items-center gap-2">
                                        <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-full border-red-100 text-red-600 hover:bg-red-50">
                                            <X size={14} />
                                        </Button>
                                        <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-full border-emerald-100 text-emerald-600 hover:bg-emerald-50">
                                            <Check size={14} />
                                        </Button>
                                    </div>
                                ) : (
                                    <Badge className={`text-[10px] font-bold uppercase ${
                                        item.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
                                    }`}>
                                        {item.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                                    </Badge>
                                )}
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-300 hover:text-slate-900 ml-2">
                                    <MessageSquare size={14} />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function FileAuditItem({ name, status, reason }: { name: string, status: 'approved' | 'rejected' | 'pending', reason?: string }) {
    return (
        <div className="p-4 group">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                        <FileText size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-900 leading-tight">{name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">Archivo PDF • 2.4 MB</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-slate-200 text-slate-500 hover:text-slate-900">
                        <Download size={14} />
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-slate-200 text-slate-500 hover:text-slate-900">
                        <Eye size={14} />
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50">
                {status === 'pending' ? (
                    <>
                        <Button className="flex-1 h-8 text-[10px] font-bold uppercase bg-slate-900 hover:bg-slate-800">Aprobar</Button>
                        <Button variant="outline" className="flex-1 h-8 text-[10px] font-bold uppercase border-slate-200 text-red-600 hover:bg-red-50">Rechazar</Button>
                    </>
                ) : (
                    <div className="w-full">
                        <div className={`flex items-center gap-2 mb-2 ${status === 'approved' ? 'text-emerald-600' : 'text-red-600'}`}>
                            {status === 'approved' ? <Check size={14} /> : <X size={14} />}
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                                {status === 'approved' ? 'Documento Aprobado' : 'Documento Rechazado'}
                            </span>
                        </div>
                        {reason && (
                            <div className="bg-red-50 text-red-800 p-2 rounded text-[10px] font-medium border border-red-100 italic">
                                "{reason}"
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
