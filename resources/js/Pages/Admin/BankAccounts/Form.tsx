import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/Card';
import { Button } from '@/Components/ui/Button';
import { Input } from '@/Components/ui/Input';
import { Label } from '@/Components/ui/Label';
import { Switch } from '@/Components/ui/Switch';
import { Separator } from '@/Components/ui/Separator';
import { ArrowLeft, CreditCard, Building2, Save, User } from 'lucide-react';
import InputError from '@/Components/InputError';

interface BankAccount {
    id?: number;
    bank_name: string;
    account_type: string;
    account_number: string;
    holder_name: string;
    holder_document: string;
    holder_document_type: string;
    color_hex: string;
    is_active: boolean;
    order: number;
}

export default function BankAccountForm({ account }: { account?: BankAccount }) {
    const isEditing = !!account;

    const { data, setData, post, patch, processing, errors } = useForm({
        bank_name:            account?.bank_name || '',
        account_type:         account?.account_type || 'ahorros',
        account_number:       account?.account_number || '',
        holder_name:          account?.holder_name || '',
        holder_document:      account?.holder_document || '',
        holder_document_type: account?.holder_document_type || 'NIT',
        color_hex:            account?.color_hex || '#64748b',
        is_active:            account?.is_active ?? true,
        order:                account?.order ?? 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            patch(route('admin.bank-accounts.update', account.id));
        } else {
            post(route('admin.bank-accounts.store'));
        }
    };

    return (
        <AppLayout>
            <Head title={isEditing ? `Editar Cuenta Bancaria` : 'Nueva Cuenta Bancaria'} />

            <div className="max-w-2xl mx-auto py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href={route('admin.bank-accounts.index')} className="h-10 w-10 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-sm">
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                            {isEditing ? 'Editar Cuenta' : 'Nueva Cuenta Bancaria'}
                        </h1>
                        <p className="text-slate-500 text-sm mt-1 font-medium italic">
                            {isEditing ? `Modificando ${account.bank_name}` : 'Agrega una cuenta para recibir pagos de membresía.'}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Bank Info Card */}
                    <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                        <div className="h-1.5 w-full transition-all" style={{ backgroundColor: data.color_hex }} />
                        <CardHeader className="bg-slate-50/50 pb-6 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <Building2 size={18} className="text-slate-400" />
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-700">Datos del Banco</CardTitle>
                            </div>
                            <CardDescription className="text-xs font-medium italic text-slate-400">Información de la entidad financiera.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-black uppercase tracking-wider text-slate-500">Nombre del Banco</Label>
                                    <Input
                                        value={data.bank_name}
                                        onChange={e => setData('bank_name', e.target.value)}
                                        placeholder="Ej: Bancolombia"
                                        className="h-12 border-slate-200 rounded-xl focus:ring-slate-900 font-bold"
                                    />
                                    <InputError message={errors.bank_name} />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[11px] font-black uppercase tracking-wider text-slate-500">Tipo de Cuenta</Label>
                                    <select
                                        value={data.account_type}
                                        onChange={e => setData('account_type', e.target.value)}
                                        className="h-12 w-full border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                                    >
                                        <option value="ahorros">Cuenta de Ahorros</option>
                                        <option value="corriente">Cuenta Corriente</option>
                                    </select>
                                    <InputError message={errors.account_type} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-black uppercase tracking-wider text-slate-500">Número de Cuenta</Label>
                                    <Input
                                        value={data.account_number}
                                        onChange={e => setData('account_number', e.target.value)}
                                        placeholder="000-000000-00"
                                        className="h-12 border-slate-200 rounded-xl focus:ring-slate-900 font-mono font-bold"
                                    />
                                    <InputError message={errors.account_number} />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[11px] font-black uppercase tracking-wider text-slate-500">Color Distintivo (HEX)</Label>
                                    <div className="flex gap-3">
                                        <div className="h-12 w-12 rounded-xl shadow-inner border border-slate-200 shrink-0" style={{ backgroundColor: data.color_hex }} />
                                        <Input
                                            value={data.color_hex}
                                            onChange={e => setData('color_hex', e.target.value)}
                                            placeholder="#1a56db"
                                            className="h-12 border-slate-200 rounded-xl focus:ring-slate-900 uppercase font-mono font-bold"
                                        />
                                    </div>
                                    <InputError message={errors.color_hex} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Holder Info Card */}
                    <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                        <CardHeader className="bg-slate-50/50 pb-6 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <User size={18} className="text-slate-400" />
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-700">Datos del Titular</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[11px] font-black uppercase tracking-wider text-slate-500">Nombre del Titular</Label>
                                <Input
                                    value={data.holder_name}
                                    onChange={e => setData('holder_name', e.target.value)}
                                    placeholder="Ej: CAMEP SAS"
                                    className="h-12 border-slate-200 rounded-xl focus:ring-slate-900 font-bold"
                                />
                                <InputError message={errors.holder_name} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-black uppercase tracking-wider text-slate-500">Tipo de Documento</Label>
                                    <select
                                        value={data.holder_document_type}
                                        onChange={e => setData('holder_document_type', e.target.value)}
                                        className="h-12 w-full border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                                    >
                                        <option value="NIT">NIT</option>
                                        <option value="CC">Cédula (CC)</option>
                                    </select>
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label className="text-[11px] font-black uppercase tracking-wider text-slate-500">Número de Documento</Label>
                                    <Input
                                        value={data.holder_document}
                                        onChange={e => setData('holder_document', e.target.value)}
                                        placeholder="900.123.456-7"
                                        className="h-12 border-slate-200 rounded-xl focus:ring-slate-900 font-mono font-bold"
                                    />
                                    <InputError message={errors.holder_document} />
                                </div>
                            </div>

                            <Separator className="bg-slate-100" />

                            <div className="flex flex-wrap gap-12">
                                <div className="flex items-center gap-4">
                                    <Switch checked={data.is_active} onCheckedChange={v => setData('is_active', v)} />
                                    <div>
                                        <Label className="text-[11px] font-black uppercase tracking-wider text-slate-900 block">Cuenta Activa</Label>
                                        <span className="text-[10px] text-slate-400 font-medium italic">Visible para los socios</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-black uppercase tracking-wider text-slate-500">Orden de aparición</Label>
                                    <Input
                                        type="number"
                                        value={data.order}
                                        onChange={e => setData('order', parseInt(e.target.value) || 0)}
                                        className="h-12 w-24 border-slate-200 rounded-xl focus:ring-slate-900 font-bold text-center"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4">
                        <Link href={route('admin.bank-accounts.index')}>
                            <Button type="button" variant="ghost" className="h-12 px-8 font-bold text-slate-500 hover:text-slate-900 uppercase tracking-widest text-xs">
                                Cancelar
                            </Button>
                        </Link>
                        <Button
                            disabled={processing}
                            className="h-12 px-10 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-slate-200 flex items-center gap-2"
                        >
                            <Save size={18} />
                            {processing ? 'Guardando...' : isEditing ? 'Actualizar Cuenta' : 'Guardar Cuenta'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
