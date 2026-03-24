import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent } from '@/Components/ui/Card';
import { Button } from '@/Components/ui/Button';
import { Badge } from '@/Components/ui/Badge';
import { Plus, Building2, CreditCard, Edit2, Trash2, Hash, User, Check, X } from 'lucide-react';

interface BankAccount {
    id: number;
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

export default function BankAccountsIndex({ accounts }: { accounts: BankAccount[] }) {
    const { delete: destroy } = useForm();

    const handleDelete = (id: number) => {
        if (confirm('¿Eliminar esta cuenta bancaria?')) {
            destroy(route('admin.bank-accounts.destroy', id));
        }
    };

    return (
        <AppLayout>
            <Head title="Datos Bancarios - CAMEP" />

            <div className="space-y-6 max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Datos Bancarios</h1>
                        <p className="text-slate-500 text-sm mt-1 font-medium">Cuentas habilitadas para recibir pagos de membresía.</p>
                    </div>
                    <Link href={route('admin.bank-accounts.create')}>
                        <Button className="bg-slate-900 text-white hover:bg-slate-800 rounded-lg h-11 px-6 font-bold shadow-lg shadow-slate-200">
                            <Plus size={18} className="mr-2" />
                            Agregar Cuenta
                        </Button>
                    </Link>
                </div>

                {/* List of accounts */}
                <div className="space-y-4">
                    {accounts.map((account) => (
                        <Card key={account.id} className="border-slate-200 shadow-sm rounded-2xl overflow-hidden group hover:shadow-lg transition-all duration-300">
                            <div className="h-1.5 w-full" style={{ backgroundColor: account.color_hex }} />
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center gap-6">
                                    {/* Bank Icon */}
                                    <div
                                        className="h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                                        style={{ backgroundColor: `${account.color_hex}20`, border: `2px solid ${account.color_hex}40` }}
                                    >
                                        <Building2 size={24} style={{ color: account.color_hex }} />
                                    </div>

                                    {/* Main Info */}
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Banco</p>
                                            <p className="font-black text-slate-900 text-base">{account.bank_name}</p>
                                            <Badge className="mt-1 text-[9px] font-black uppercase bg-slate-100 text-slate-600 border-slate-200">
                                                {account.account_type}
                                            </Badge>
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                                <Hash size={10} /> Número de Cuenta
                                            </p>
                                            <p className="font-black text-slate-900 font-mono text-sm">{account.account_number}</p>
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                                <User size={10} /> Titular
                                            </p>
                                            <p className="font-bold text-slate-800 text-sm">{account.holder_name}</p>
                                            <p className="text-[10px] text-slate-400 font-mono">{account.holder_document_type}: {account.holder_document}</p>
                                        </div>
                                    </div>

                                    {/* Status + Actions */}
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${
                                            account.is_active
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                : 'bg-slate-100 text-slate-400 border-slate-200'
                                        }`}>
                                            {account.is_active ? <Check size={10} /> : <X size={10} />}
                                            {account.is_active ? 'Activa' : 'Inactiva'}
                                        </span>

                                        <Link href={route('admin.bank-accounts.edit', account.id)}>
                                            <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
                                                <Edit2 size={15} />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(account.id)}
                                            className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                        >
                                            <Trash2 size={15} />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {accounts.length === 0 && (
                        <div className="py-24 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center">
                            <CreditCard size={48} className="text-slate-200 mb-4" />
                            <p className="text-slate-500 font-bold text-lg">No hay cuentas bancarias configuradas.</p>
                            <Link href={route('admin.bank-accounts.create')} className="mt-4">
                                <Button variant="link" className="text-slate-900 font-black uppercase tracking-widest underline underline-offset-8">
                                    Agregar la primera cuenta
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
