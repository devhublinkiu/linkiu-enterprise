import AppLayout from '@/Layouts/AppLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { User, ShieldAlert, Trash2 } from 'lucide-react';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    return (
        <AppLayout>
            <Head title="Mi Perfil" />

            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Mi Perfil</h1>
                        <p className="text-slate-500 text-sm mt-1">
                            Gestiona tu información personal, contraseña y preferencias de la cuenta.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {/* Profile Info */}
                    <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                            <User size={18} className="text-slate-400" />
                            <h3 className="text-sm font-bold text-slate-900">Información del Perfil</h3>
                        </div>
                        <div className="p-6 md:p-8">
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                                className="max-w-4xl"
                            />
                        </div>
                    </div>

                    {/* Password Update */}
                    <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                            <ShieldAlert size={18} className="text-slate-400" />
                            <h3 className="text-sm font-bold text-slate-900">Actualizar Contraseña</h3>
                        </div>
                        <div className="p-6 md:p-8">
                            <UpdatePasswordForm className="max-w-4xl" />
                        </div>
                    </div>

                    {/* Delete Account */}
                    <div className="bg-white border border-red-100 shadow-sm rounded-xl overflow-hidden">
                        <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center gap-2">
                            <Trash2 size={18} className="text-red-400" />
                            <h3 className="text-sm font-bold text-red-900">Eliminar Cuenta</h3>
                        </div>
                        <div className="p-6 md:p-8">
                            <DeleteUserForm className="max-w-4xl" />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
