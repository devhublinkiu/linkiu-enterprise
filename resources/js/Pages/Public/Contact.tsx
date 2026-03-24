import { Head, useForm, usePage } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Button } from '@/Components/ui/Button';
import { Input } from '@/Components/ui/Input';
import { Label } from '@/Components/ui/Label';
import { Textarea } from '@/Components/ui/Textarea';
import { Checkbox } from '@/Components/ui/Checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/Select";
import {
    Mail,
    Phone,
    User,
    Building2,
    IdCard,
    Send,
    Info,
    CheckCircle2,
    ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageProps } from '@/types';
import { toast } from 'sonner';

export default function Contact() {
    const { tenant } = usePage<PageProps>().props;

    const { data, setData, post, processing, errors, reset, wasSuccessful } = useForm({
        company_name: '',
        nit: '',
        full_name: '',
        id_number: '',
        email: '',
        phone: '',
        types: [] as string[],
        service: '',
        message: '',
        accepted_terms: false,
    });

    const pqrfTypes = [
        { id: 'Sugerencias', label: 'Sugerencias' },
        { id: 'Petición / Consulta', label: 'Petición / Consulta' },
        { id: 'Quejas', label: 'Quejas' },
        { id: 'Reclamos', label: 'Reclamos' },
        { id: 'Felicitaciones', label: 'Felicitaciones' },
    ];

    const handleTypeChange = (typeId: string, checked: boolean) => {
        if (checked) {
            setData('types', [...data.types, typeId]);
        } else {
            setData('types', data.types.filter(id => id !== typeId));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('contact.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                toast.success('¡Solicitud enviada con éxito!');
            },
        });
    };

    return (
        <PublicLayout>
            <Head title="Contacto y PQRF" />

            {/* Hero Section */}
            <div className="bg-white border-b border-slate-100 py-16 md:py-24">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full mb-6 border border-green-100/50">
                        <Info size={14} strokeWidth={2.5} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Atención al Ciudadano</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight uppercase mb-6">
                        CONTACTO
                    </h1>
                    <div className="space-y-4 max-w-2xl mx-auto">
                        <p className="text-slate-500 font-bold text-sm md:text-base leading-relaxed uppercase tracking-tight">
                            Aquí puede registrar las Peticiones, Quejas, Reclamos y Felicitaciones (PQR´s).
                            También solicitar el retiro, actualización, corrección y/o supresión de sus datos o al correo
                            <span className="text-green-700 block mt-2 lowercase">info@camepg.org – protecciondedatos@camepg.org</span>
                        </p>
                        <div className="pt-4">
                            <span className="inline-block px-4 py-2 bg-slate-100 rounded-xl text-xs font-black text-slate-600 uppercase tracking-widest">
                                Horario de Atención: Lunes a viernes 8 AM a 5 PM
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Section */}
            <div className="max-w-4xl mx-auto px-4 py-16 md:py-24">
                {wasSuccessful ? (
                    <div className="bg-white rounded-xl p-12 md:p-20 text-center shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-500">
                        <div className="h-24 w-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                            <CheckCircle2 size={48} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tight">¡Mensaje Recibido!</h2>
                        <p className="text-slate-500 font-medium mb-10 max-w-md mx-auto uppercase tracking-tight text-sm">
                            Tu solicitud ha sido registrada correctamente. Nuestro equipo revisará la información y se pondrá en contacto contigo a la brevedad posible.
                        </p>
                        <Button
                            onClick={() => window.location.reload()}
                            className="bg-slate-900 hover:bg-green-600 text-white h-14 px-10 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                        >
                            Enviar otra solicitud
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 md:p-16 shadow-2xl border border-slate-100 space-y-12">
                        {/* Personal/Company Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <Label htmlFor="company_name" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Razón Social de la Empresa o Entidad</Label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <Input
                                        id="company_name"
                                        placeholder="Ej: Linkiu Enterprise"
                                        className="h-14 pl-12 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-medium"
                                        value={data.company_name}
                                        onChange={e => setData('company_name', e.target.value)}
                                    />
                                </div>
                                {errors.company_name && <p className="text-xs text-red-500 font-bold uppercase tracking-tight ml-1">{errors.company_name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nit" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">NIT entidad</Label>
                                <div className="relative">
                                    <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <Input
                                        id="nit"
                                        placeholder="NIT sin puntos ni guiones"
                                        className="h-14 pl-12 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-medium"
                                        value={data.nit}
                                        onChange={e => setData('nit', e.target.value)}
                                    />
                                </div>
                                {errors.nit && <p className="text-xs text-red-500 font-bold uppercase tracking-tight ml-1">{errors.nit}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="full_name" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nombres y Apellidos</Label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <Input
                                        id="full_name"
                                        required
                                        placeholder="Tu nombre completo"
                                        className="h-14 pl-12 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-medium"
                                        value={data.full_name}
                                        onChange={e => setData('full_name', e.target.value)}
                                    />
                                </div>
                                {errors.full_name && <p className="text-xs text-red-500 font-bold uppercase tracking-tight ml-1">{errors.full_name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="id_number" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Número de Identificación</Label>
                                <div className="relative">
                                    <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <Input
                                        id="id_number"
                                        required
                                        placeholder="C.C. o equivalente"
                                        className="h-14 pl-12 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-medium"
                                        value={data.id_number}
                                        onChange={e => setData('id_number', e.target.value)}
                                    />
                                </div>
                                {errors.id_number && <p className="text-xs text-red-500 font-bold uppercase tracking-tight ml-1">{errors.id_number}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Correo electrónico</Label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        placeholder="ejemplo@correo.com"
                                        className="h-14 pl-12 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-medium"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                    />
                                </div>
                                {errors.email && <p className="text-xs text-red-500 font-bold uppercase tracking-tight ml-1">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Teléfono / Celular</Label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <Input
                                        id="phone"
                                        required
                                        placeholder="300 000 0000"
                                        className="h-14 pl-12 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-medium"
                                        value={data.phone}
                                        onChange={e => setData('phone', e.target.value)}
                                    />
                                </div>
                                {errors.phone && <p className="text-xs text-red-500 font-bold uppercase tracking-tight ml-1">{errors.phone}</p>}
                            </div>
                        </div>

                        {/* Request Type Checkboxes */}
                        <div className="space-y-6 bg-green-50/30 p-8 rounded-xl border border-green-100/50">
                            <Label className="text-[11px] font-black uppercase tracking-widest text-green-700">Seleccionar Tipo de Solicitud</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {pqrfTypes.map((type) => (
                                    <div key={type.id} className="flex items-center space-x-3 group">
                                        <Checkbox
                                            id={type.id}
                                            checked={data.types.includes(type.id)}
                                            onCheckedChange={(checked) => handleTypeChange(type.id, !!checked)}
                                            className="h-5 w-5 rounded-md border-green-200 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                        />
                                        <label
                                            htmlFor={type.id}
                                            className="text-xs font-bold text-slate-600 uppercase tracking-tight cursor-pointer group-hover:text-green-700 transition-colors"
                                        >
                                            {type.label}
                                        </label>
                                    </div>
                                ))}
                            </div>
                            {errors.types && <p className="text-xs text-red-500 font-bold uppercase tracking-tight">{errors.types}</p>}
                        </div>

                        {/* Associated Service Select */}
                        <div className="space-y-2">
                            <Label htmlFor="service" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Servicio asociado</Label>
                            <Select
                                value={data.service}
                                onValueChange={value => setData('service', value)}
                            >
                                <SelectTrigger className="h-14 rounded-xl border-slate-100 bg-slate-50/50 focus:ring-green-600 font-medium">
                                    <SelectValue placeholder="Seleccione un servicio" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                                    <SelectItem value="Asesoría" className="font-bold text-slate-600 uppercase tracking-tight p-3">Asesoría</SelectItem>
                                    <SelectItem value="Afiliación" className="font-bold text-slate-600 uppercase tracking-tight p-3">Afiliación</SelectItem>
                                    <SelectItem value="Capacitación" className="font-bold text-slate-600 uppercase tracking-tight p-3">Capacitación</SelectItem>
                                    <SelectItem value="Otros" className="font-bold text-slate-600 uppercase tracking-tight p-3">Otros</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.service && <p className="text-xs text-red-500 font-bold uppercase tracking-tight ml-1">{errors.service}</p>}
                        </div>

                        {/* Message Description */}
                        <div className="space-y-2">
                            <Label htmlFor="message" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Descripción de la Solicitud</Label>
                            <Textarea
                                id="message"
                                required
                                placeholder="Escriba aquí los detalles de su solicitud..."
                                className="min-h-[200px] rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-medium p-6 resize-none"
                                value={data.message}
                                onChange={e => setData('message', e.target.value)}
                            />
                            {errors.message && <p className="text-xs text-red-500 font-bold uppercase tracking-tight ml-1">{errors.message}</p>}
                        </div>

                        {/* Terms and Submit */}
                        <div className="space-y-8 pt-4">
                            <div className="space-y-4">
                                <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-widest text-justify">
                                    Al enviar, acepta que CAMEP use sus datos personales de acuerdo con la <span className="text-green-600 underline cursor-pointer">política de tratamiento de datos personales</span> para fines gremiales. Consulte la <span className="text-green-600 underline cursor-pointer">política de tratamiento de datos personales de la CAMEP</span>. En cualquier momento podrá realizar consultas y solicitar el retiro, actualización, corrección y/o supresión de sus datos escribiendo al correo protecciondedatos@andi.com.co (Referencia Andi mantenida como ejemplo institucional).
                                </p>
                                <div className="flex items-center space-x-3">
                                    <Checkbox
                                        id="accepted_terms"
                                        checked={data.accepted_terms}
                                        onCheckedChange={(checked) => setData('accepted_terms', !!checked)}
                                        className="h-6 w-6 rounded-lg border-slate-200 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                    />
                                    <label
                                        htmlFor="accepted_terms"
                                        className="text-xs font-black text-slate-900 uppercase tracking-widest cursor-pointer"
                                    >
                                        Si acepto
                                    </label>
                                </div>
                                {errors.accepted_terms && <p className="text-xs text-red-500 font-bold uppercase tracking-tight">{errors.accepted_terms}</p>}
                            </div>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full h-16 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-orange-500/20 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50"
                            >
                                Enviar contacto <Send size={20} className={cn(processing && "animate-pulse")} />
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </PublicLayout>
    );
}
