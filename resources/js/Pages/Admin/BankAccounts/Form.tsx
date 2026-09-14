import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Building2, Loader2, User } from 'lucide-react';

import { Button } from '@/Components/base/Button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/Components/base/Card';
import { Field, FieldLabel } from '@/Components/base/Field';
import { Input } from '@/Components/base/Input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/base/Select';
import { Switch } from '@/Components/base/Switch';
import AppLayout from '@/Layouts/AppLayout';

import FormField from '@/Pages/Associate/Company/BasicInfo/Parts/FormField';

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

export default function BankAccountForm({
    account,
}: {
    account?: BankAccount;
}) {
    const isEditing = !!account;

    const { data, setData, post, patch, processing, errors } = useForm({
        bank_name: account?.bank_name || '',
        account_type: account?.account_type || 'ahorros',
        account_number: account?.account_number || '',
        holder_name: account?.holder_name || '',
        holder_document: account?.holder_document || '',
        holder_document_type: account?.holder_document_type || 'NIT',
        is_active: account?.is_active ?? true,
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
            <Head
                title={
                    isEditing
                        ? 'Editar cuenta bancaria'
                        : 'Nueva cuenta bancaria'
                }
            />

            <form
                onSubmit={handleSubmit}
                className="mx-auto max-w-2xl space-y-6 pb-20"
            >
                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        asChild
                        aria-label="Volver a datos bancarios"
                    >
                        <Link href={route('admin.bank-accounts.index')}>
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="font-display text-h3">
                            {isEditing
                                ? 'Editar cuenta'
                                : 'Nueva cuenta bancaria'}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Cuenta para recibir pagos de membresía por
                            transferencia.
                        </p>
                    </div>
                </div>

                {/* Datos del banco */}
                <Card>
                    <CardHeader className="border-b">
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="size-4 text-muted-foreground" />
                            Datos del banco
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <FormField
                                id="bank_name"
                                label="Nombre del banco"
                                required
                                error={errors.bank_name}
                            >
                                <Input
                                    id="bank_name"
                                    value={data.bank_name}
                                    onChange={(e) =>
                                        setData('bank_name', e.target.value)
                                    }
                                    placeholder="Ej. Bancolombia"
                                />
                            </FormField>

                            <Field
                                data-invalid={
                                    errors.account_type ? 'true' : undefined
                                }
                            >
                                <FieldLabel htmlFor="account_type">
                                    Tipo de cuenta
                                </FieldLabel>
                                <Select
                                    value={data.account_type}
                                    onValueChange={(v) =>
                                        setData('account_type', v)
                                    }
                                >
                                    <SelectTrigger id="account_type">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ahorros">
                                            Cuenta de ahorros
                                        </SelectItem>
                                        <SelectItem value="corriente">
                                            Cuenta corriente
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>

                            <FormField
                                id="account_number"
                                label="Número de cuenta"
                                required
                                error={errors.account_number}
                            >
                                <Input
                                    id="account_number"
                                    value={data.account_number}
                                    onChange={(e) =>
                                        setData(
                                            'account_number',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="000-000000-00"
                                    className="font-mono"
                                />
                            </FormField>
                        </div>
                    </CardContent>
                </Card>

                {/* Datos del titular */}
                <Card>
                    <CardHeader className="border-b">
                        <CardTitle className="flex items-center gap-2">
                            <User className="size-4 text-muted-foreground" />
                            Datos del titular
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <FormField
                            id="holder_name"
                            label="Nombre del titular"
                            required
                            error={errors.holder_name}
                        >
                            <Input
                                id="holder_name"
                                value={data.holder_name}
                                onChange={(e) =>
                                    setData('holder_name', e.target.value)
                                }
                                placeholder="Ej. CAMEP SAS"
                            />
                        </FormField>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                            <Field>
                                <FieldLabel htmlFor="holder_document_type">
                                    Tipo de documento
                                </FieldLabel>
                                <Select
                                    value={data.holder_document_type}
                                    onValueChange={(v) =>
                                        setData('holder_document_type', v)
                                    }
                                >
                                    <SelectTrigger id="holder_document_type">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="NIT">NIT</SelectItem>
                                        <SelectItem value="CC">
                                            Cédula (CC)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>
                            <FormField
                                id="holder_document"
                                label="Número de documento"
                                required
                                error={errors.holder_document}
                                className="md:col-span-2"
                            >
                                <Input
                                    id="holder_document"
                                    value={data.holder_document}
                                    onChange={(e) =>
                                        setData(
                                            'holder_document',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="900.123.456-7"
                                    className="font-mono"
                                />
                            </FormField>
                        </div>

                        <Field orientation="horizontal" className="w-auto pt-1">
                            <Switch
                                id="is_active"
                                checked={data.is_active}
                                onCheckedChange={(v) => setData('is_active', v)}
                            />
                            <FieldLabel
                                htmlFor="is_active"
                                className="font-normal"
                            >
                                Cuenta activa (visible para los asociados)
                            </FieldLabel>
                        </Field>
                    </CardContent>
                </Card>

                <div className="flex items-center justify-end gap-3">
                    <Button type="button" variant="outline" asChild>
                        <Link href={route('admin.bank-accounts.index')}>
                            Cancelar
                        </Link>
                    </Button>
                    <Button type="submit" disabled={processing}>
                        {processing && (
                            <Loader2 className="size-4 animate-spin" />
                        )}
                        {isEditing ? 'Guardar cambios' : 'Guardar cuenta'}
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}
