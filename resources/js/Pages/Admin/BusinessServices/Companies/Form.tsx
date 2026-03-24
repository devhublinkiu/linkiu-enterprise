import { useState, useRef, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/Button';
import { Input } from '@/Components/ui/Input';
import { Label } from '@/Components/ui/Label';
import { Card } from '@/Components/ui/Card';
import { ArrowLeft, Save, Upload, X, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Company {
    id: number;
    nombre: string;
    departamento: string | null;
    ciudad: string | null;
    estado: 'activo' | 'inactivo';
    logo_url: string | null;
}

interface Props {
    company?: Company;
}

export default function Form({ company }: Props) {
    const isEditing = !!company;

    const { data, setData, post, processing, errors } = useForm({
        _method: isEditing ? 'put' : 'post',
        nombre: company?.nombre || '',
        departamento: company?.departamento || '',
        ciudad: company?.ciudad || '',
        estado: company?.estado || 'activo',
        logo: null as File | null,
    });

    const [logoPreview, setLogoPreview] = useState<string | null>(company?.logo_url || null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            // Use post with _method: put because of multipart/form-data limitations in some environments
            post(route('admin.bienes-servicios.companies.update', company.id));
        } else {
            post(route('admin.bienes-servicios.companies.store'));
        }
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('logo', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeLogo = () => {
        setData('logo', null);
        setLogoPreview(null);
        if (logoInputRef.current) logoInputRef.current.value = '';
    };

    return (
        <AppLayout
            header={
                <div className="flex items-center gap-4">
                    <Link href={route('admin.bienes-servicios.companies.index')}>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <h2 className="font-semibold text-xl text-slate-800 leading-tight">
                        {isEditing ? 'Editar Empresa' : 'Nueva Empresa'}
                    </h2>
                </div>
            }
        >
            <Head title={`${isEditing ? 'Editar' : 'Crear'} Empresa - Admin`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="space-y-6">
                        <Card className="p-6 border-slate-200 shadow-sm rounded-2xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Logo column */}
                                <div className="space-y-4">
                                    <Label className="text-sm font-bold text-slate-700 block">Logo de la Empresa</Label>
                                    <div className="flex flex-col items-center">
                                        {logoPreview ? (
                                            <div className="relative rounded-2xl overflow-hidden h-48 w-48 border border-slate-200 group bg-slate-50">
                                                <img src={logoPreview} alt="Preview" className="w-full h-full object-contain p-4" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Button type="button" variant="destructive" size="sm" onClick={removeLogo} className="gap-2 rounded-full font-bold">
                                                        <X size={16} /> Quitar
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div 
                                                onClick={() => logoInputRef.current?.click()}
                                                className="border-2 border-dashed border-slate-200 rounded-2xl h-48 w-48 flex flex-col items-center justify-center text-slate-400 hover:text-orange-500 hover:border-orange-500 hover:bg-orange-50 transition-all cursor-pointer bg-white"
                                            >
                                                <Upload className="mb-2" size={32} />
                                                <span className="text-sm font-bold">Subir Logo</span>
                                                <span className="text-[10px] font-medium mt-1">JPG, PNG o WebP</span>
                                            </div>
                                        )}
                                        <Input
                                            type="file"
                                            id="logo"
                                            ref={logoInputRef}
                                            className="hidden"
                                            onChange={handleLogoChange}
                                            accept="image/jpeg,image/png,image/gif,image/webp"
                                        />
                                        {errors.logo && <p className="text-red-500 text-xs mt-2">{errors.logo}</p>}
                                    </div>
                                </div>

                                {/* Fields column */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="nombre" className="text-sm font-bold text-slate-700">Nombre de la Empresa *</Label>
                                        <Input
                                            id="nombre"
                                            value={data.nombre}
                                            onChange={(e) => setData('nombre', e.target.value)}
                                            placeholder="Nombre comercial..."
                                            className="rounded-xl border-slate-200 focus-visible:ring-orange-500 h-11"
                                            required
                                        />
                                        {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="departamento" className="text-sm font-bold text-slate-700">Departamento</Label>
                                        <Input
                                            id="departamento"
                                            value={data.departamento}
                                            onChange={(e) => setData('departamento', e.target.value)}
                                            placeholder="Ej: Casanare..."
                                            className="rounded-xl border-slate-200 focus-visible:ring-orange-500 h-11"
                                        />
                                        {errors.departamento && <p className="text-red-500 text-xs mt-1">{errors.departamento}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="ciudad" className="text-sm font-bold text-slate-700">Ciudad</Label>
                                        <Input
                                            id="ciudad"
                                            value={data.ciudad}
                                            onChange={(e) => setData('ciudad', e.target.value)}
                                            placeholder="Ej: Yopal..."
                                            className="rounded-xl border-slate-200 focus-visible:ring-orange-500 h-11"
                                        />
                                        {errors.ciudad && <p className="text-red-500 text-xs mt-1">{errors.ciudad}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="estado" className="text-sm font-bold text-slate-700">Estado</Label>
                                        <select
                                            id="estado"
                                            value={data.estado}
                                            onChange={(e) => setData('estado', e.target.value as 'activo' | 'inactivo')}
                                            className="w-full rounded-xl border-slate-200 focus:border-orange-500 focus:ring-orange-500 shadow-sm text-sm font-bold text-slate-700 h-11"
                                        >
                                            <option value="activo">Activo</option>
                                            <option value="inactivo">Inactivo</option>
                                        </select>
                                        {errors.estado && <p className="text-red-500 text-xs mt-1">{errors.estado}</p>}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <div className="flex justify-end gap-4">
                            <Link href={route('admin.bienes-servicios.companies.index')}>
                                <Button type="button" variant="ghost" className="rounded-xl px-6 h-12 font-bold transition-all">
                                    Cancelar
                                </Button>
                            </Link>
                            <Button 
                                type="submit" 
                                disabled={processing}
                                className="bg-slate-900 hover:bg-orange-500 text-white rounded-xl px-10 h-12 font-bold shadow-xl shadow-slate-900/10 transition-all gap-2"
                            >
                                <Save size={18} />
                                {processing ? 'Guardando...' : 'Guardar Empresa'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
