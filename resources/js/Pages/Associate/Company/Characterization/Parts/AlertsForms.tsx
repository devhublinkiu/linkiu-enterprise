import React from 'react';
import {
    Clock,
    ShieldCheck,
    CheckCircle2,
    AlertCircle,
    X,
    Save,
    Building2,
    Info,
    MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
    isNew: boolean;
    associateStatus: string | null;
    notification: { type: 'success' | 'draft' | 'error'; msg: string } | null;
    onCloseNotification: () => void;
    hasRejectedFields: boolean;
}

export default function AlertsForms({
    isNew,
    associateStatus,
    notification,
    onCloseNotification,
    hasRejectedFields
}: Props) {
    return (
        <div className="space-y-4">
            {/* 1. Welcome Banner — Only for completely new profiles */}
            {isNew && (
                <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Building2 size={120} />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-xl font-bold mb-2">¡Bienvenido a la red CAMEP!</h2>
                        <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
                            Estamos emocionados de tenerte. Completa la información básica de tu organización para comenzar el proceso de verificación.
                        </p>
                    </div>
                </div>
            )}

            {/* 2. Global Status Banners */}
            {associateStatus === 'draft' && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                        <Info size={18} className="text-amber-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-black text-amber-900 uppercase tracking-tight">Información en Borrador</p>
                        <p className="text-xs text-amber-700 font-medium">Has guardado cambios, pero aún no los has enviado para revisión oficial. Cuando estés listo, haz clic en "Enviar a Revisión".</p>
                    </div>
                </div>
            )}

            {associateStatus === 'pending' && (
                <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                        <ShieldCheck size={18} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-black text-blue-900 uppercase tracking-tight">Perfil en Revisión</p>
                        <p className="text-xs text-blue-700 font-medium">CAMEP está validando tus datos. Te notificaremos por correo cualquier novedad.</p>
                    </div>
                </div>
            )}

            {associateStatus === 'rejected' && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                        <AlertCircle size={18} className="text-red-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-black text-red-900 uppercase tracking-tight">Perfil Rechazado</p>
                        <p className="text-xs text-red-700 font-medium">Tu solicitud ha sido rechazada. Por favor, revisa los motivos del rechazo en cada campo, realiza las correcciones y vuelve a enviar a revisión.</p>
                    </div>
                </div>
            )}

            {hasRejectedFields && associateStatus !== 'pending' && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 flex items-center gap-3 animate-pulse">
                    <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                        <MessageSquare size={18} className="text-red-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-black text-red-900 uppercase tracking-tight">Atención: Campos Rechazados</p>
                        <p className="text-xs text-red-700 font-medium">Algunos campos requieren correcciones. Revisa los mensajes en rojo abajo.</p>
                    </div>
                </div>
            )}

            {/* 3. Floating Notifications / Toasts */}
            {notification && (
                <div className={cn(
                    "rounded-2xl border px-4 py-3 flex items-center gap-3 shadow-lg animate-in zoom-in-95 duration-300",
                    notification.type === 'success' && "bg-emerald-50 border-emerald-200 text-emerald-800",
                    notification.type === 'draft' && "bg-emerald-50 border-emerald-200 text-emerald-800",
                    notification.type === 'error' && "bg-red-50 border-red-200 text-red-800",
                )}>
                    <div className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                        notification.type === 'success' && "bg-emerald-100 text-emerald-600",
                        notification.type === 'draft' && "bg-emerald-100 text-emerald-600",
                        notification.type === 'error' && "bg-red-100 text-red-600",
                    )}>
                        {notification.type === 'success' && <CheckCircle2 size={18} />}
                        {notification.type === 'draft' && <Save size={18} />}
                        {notification.type === 'error' && <AlertCircle size={18} />}
                    </div>

                    <p className="text-sm font-bold flex-1">{notification.msg}</p>

                    <button
                        onClick={onCloseNotification}
                        className="p-1.5 hover:bg-black/5 rounded-lg transition-colors"
                    >
                        <X size={16} className="text-slate-950" />
                    </button>
                </div>
            )}
        </div>
    );
}
