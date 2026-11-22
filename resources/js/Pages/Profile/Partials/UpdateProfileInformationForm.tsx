import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Camera, User as UserIcon } from 'lucide-react';
import { FormEventHandler, useRef, useState } from 'react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}: {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
}) {
    const user = usePage().props.auth.user as {
        name: string;
        email: string;
        is_superadmin?: boolean;
        role?: string;
        profile_photo_url?: string;
        email_verified_at?: string | null;
    };
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
                    {isAdmin
                        ? 'Actualiza tu nombre, correo electrónico y foto de perfil.'
                        : 'Actualiza tu nombre y correo electrónico.'}
                </p>
            </header>

            <form onSubmit={submit} className="mt-8 space-y-8">
                {/* Profile Photo Section (Admins Only) */}
                {isAdmin && (
                    <div className="flex flex-col items-center gap-6 border-b border-slate-100 pb-6 sm:flex-row">
                        <div className="group relative">
                            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-100 shadow-inner">
                                {photoPreview ? (
                                    <img
                                        src={photoPreview}
                                        alt="Preview"
                                        className="h-full w-full object-cover"
                                    />
                                ) : user.profile_photo_url ? (
                                    <img
                                        src={user.profile_photo_url}
                                        alt={user.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <UserIcon className="h-10 w-10 text-slate-300" />
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={selectNewPhoto}
                                className="absolute -bottom-2 -right-2 rounded-lg bg-slate-900 p-2 text-white shadow-lg transition-colors hover:bg-orange-500"
                            >
                                <Camera size={16} />
                            </button>
                        </div>

                        <div className="flex-1 text-center sm:text-left">
                            <h4 className="mb-1 text-sm font-bold text-slate-900">
                                Foto de Perfil
                            </h4>
                            <p className="mb-3 text-xs text-slate-500">
                                Sube una imagen cuadrada (JPG, PNG). Máximo 1MB.
                            </p>
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
                                className="text-xs font-bold text-orange-500 underline underline-offset-4 transition-colors hover:text-orange-600"
                            >
                                Seleccionar nueva imagen
                            </button>
                            <InputError
                                className="mt-2"
                                message={errors.profile_photo}
                            />
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <InputLabel
                            htmlFor="name"
                            value="Nombre Completo"
                            className="mb-1.5 font-semibold text-slate-700"
                        />
                        <TextInput
                            id="name"
                            className="mt-1 block h-11 w-full rounded-lg border-slate-200 focus:border-orange-500 focus:ring-orange-500"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            isFocused
                            autoComplete="name"
                        />
                        <InputError className="mt-2" message={errors.name} />
                    </div>

                    <div>
                        <InputLabel
                            htmlFor="email"
                            value="Correo Electrónico"
                            className="mb-1.5 font-semibold text-slate-700"
                        />
                        <TextInput
                            id="email"
                            type="email"
                            className="mt-1 block h-11 w-full rounded-lg border-slate-200 focus:border-orange-500 focus:ring-orange-500"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                        />
                        <InputError className="mt-2" message={errors.email} />
                    </div>
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                        <p className="text-sm text-amber-800">
                            Tu dirección de correo no ha sido verificada.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="ml-2 font-bold underline transition-colors hover:text-amber-900"
                            >
                                Haz clic aquí para reenviar el enlace de
                                verificación.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-bold text-emerald-600">
                                Se ha enviado un nuevo enlace de verificación a
                                tu correo.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4 pt-4">
                    <PrimaryButton
                        disabled={processing}
                        className="h-11 rounded-xl bg-slate-900 px-8 font-bold shadow-lg transition-all hover:bg-slate-800 hover:shadow-xl active:scale-95"
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
