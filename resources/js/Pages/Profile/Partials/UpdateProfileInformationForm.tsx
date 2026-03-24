import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';
import { Camera, User as UserIcon } from 'lucide-react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}: {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
}) {
    const user = usePage().props.auth.user as any;
    const isAdmin = user.is_superadmin || user.role === 'admin';
    const photoInput = useRef<HTMLInputElement>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const { data, setData, post, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            profile_photo: null as File | null,
            _method: 'patch',
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // Use post with _method: 'patch' for file uploads
        post(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => {
                setPhotoPreview(null);
                if (photoInput.current) {
                    photoInput.current.value = '';
                }
            },
        });
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('profile_photo', file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setPhotoPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const selectNewPhoto = () => {
        photoInput.current?.click();
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-bold text-slate-900">
                    Información de la Cuenta
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    Actualiza tu nombre, correo electrónico y foto de perfil.
                </p>
            </header>

            <form onSubmit={submit} className="mt-8 space-y-8">
                {/* Profile Photo Section (Admins Only) */}
                {isAdmin && (
                    <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
                        <div className="relative group">
                            <div className="h-24 w-24 rounded-2xl bg-slate-100 border-2 border-slate-200 overflow-hidden shadow-inner flex items-center justify-center">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                                ) : user.profile_photo_url ? (
                                    <img src={user.profile_photo_url} alt={user.name} className="h-full w-full object-cover" />
                                ) : (
                                    <UserIcon className="h-10 w-10 text-slate-300" />
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={selectNewPhoto}
                                className="absolute -bottom-2 -right-2 p-2 bg-slate-900 text-white rounded-lg shadow-lg hover:bg-orange-500 transition-colors"
                            >
                                <Camera size={16} />
                            </button>
                        </div>

                        <div className="flex-1 text-center sm:text-left">
                            <h4 className="text-sm font-bold text-slate-900 mb-1">Foto de Perfil</h4>
                            <p className="text-xs text-slate-500 mb-3">Sube una imagen cuadrada (JPG, PNG). Máximo 1MB.</p>
                            <input
                                type="file"
                                className="hidden"
                                ref={photoInput}
                                onChange={handlePhotoChange}
                                accept="image/*"
                            />
                            <button
                                type="button"
                                onClick={selectNewPhoto}
                                className="text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors underline underline-offset-4"
                            >
                                Seleccionar nueva imagen
                            </button>
                            <InputError className="mt-2" message={errors.profile_photo} />
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <InputLabel htmlFor="name" value="Nombre Completo" className="text-slate-700 font-semibold mb-1.5" />
                        <TextInput
                            id="name"
                            className="mt-1 block w-full border-slate-200 focus:border-orange-500 focus:ring-orange-500 h-11 rounded-lg"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            isFocused
                            autoComplete="name"
                        />
                        <InputError className="mt-2" message={errors.name} />
                    </div>

                    <div>
                        <InputLabel htmlFor="email" value="Correo Electrónico" className="text-slate-700 font-semibold mb-1.5" />
                        <TextInput
                            id="email"
                            type="email"
                            className="mt-1 block w-full border-slate-200 focus:border-orange-500 focus:ring-orange-500 h-11 rounded-lg"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                        />
                        <InputError className="mt-2" message={errors.email} />
                    </div>
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
                        <p className="text-sm text-amber-800">
                            Tu dirección de correo no ha sido verificada.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="ml-2 font-bold underline hover:text-amber-900 transition-colors"
                            >
                                Haz clic aquí para reenviar el enlace de verificación.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-bold text-emerald-600">
                                Se ha enviado un nuevo enlace de verificación a tu correo.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4 pt-4">
                    <PrimaryButton 
                        disabled={processing}
                        className="bg-slate-900 hover:bg-slate-800 h-11 px-8 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl active:scale-95"
                    >
                        Guardar Cambios
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm font-medium text-emerald-600">
                            Cambios guardados con éxito.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
