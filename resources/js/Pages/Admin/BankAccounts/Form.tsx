import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    KeyRound,
    Loader2,
    QrCode,
    User,
} from 'lucide-react';
import { useState } from 'react';

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
    type: 'cuenta' | 'bre_b' | 'qr';
    bank_name: string | null;
    account_type: string | null;
    account_number: string | null;
    payment_key: string | null;
    qr_url: string | null;
    holder_name: string | null;
    holder_document: string | null;
    holder_document_type: string | null;
    is_active: boolean;
}

const TYPE_LABELS: Record<string, string> = {
    cuenta: 'Cuenta bancaria',
    bre_b: 'Llave Bre-B',
    qr: 'Código QR',
};

export default function BankAccountForm({
    account,
}: {
    account?: BankAccount;
}) {
    const isEditing = !!account;
    const [qrPreview, setQrPreview] = useState<string | null>(
        account?.qr_url ?? null,
    );

    const { data, setData, post, transform, processing, errors } = useForm({
        type: account?.type || 'cuenta',
        bank_name: account?.bank_name || '',
        account_type: account?.account_type || 'ahorros',
        account_number: account?.account_number || '',
        payment_key: account?.payment_key || '',
        holder_name: account?.holder_name || '',
        holder_document: account?.holder_document || '',
        holder_document_type: account?.holder_document_type || 'NIT',
        is_active: account?.is_active ?? true,
        qr: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            transform((d) => ({ ...d, _method: 'patch' }));
            post(route('admin.bank-accounts.update', account.id), {
                forceFormData: true,
            });
        } else {
            post(route('admin.bank-accounts.store'), { forceFormData: true });
        }
    };

    const onQrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setData('qr', file);
        setQrPreview(
            file ? URL.createObjectURL(file) : (account?.qr_url ?? null),
        );
    };

    return (
        <AppLayout>
            <Head
                title={
                    isEditing ? 'Editar método de pago' : 'Nuevo método de pago'
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
                        aria-label="Volver a métodos de pago"
                    >
                        <Link href={route('admin.bank-accounts.index')}>
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="font-display text-h3">
                            {isEditing
                                ? 'Editar método de pago'
                                : 'Nuevo método de pago'}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Lo que el asociado ve para pagar su membresía.
                        </p>
                    </div>
                </div>

                {/* Tipo de método */}
                <Card>
                    <CardContent className="pt-6">
                        <Field>
                            <FieldLabel htmlFor="type">
                                Tipo de método
                            </FieldLabel>
                            <Select
                                value={data.type}
                                onValueChange={(v) =>
                                    setData('type', v as BankAccount['type'])
                                }
                            >
                                <SelectTrigger id="type">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(TYPE_LABELS).map(
                                        ([v, l]) => (
                                            <SelectItem key={v} value={v}>
                                                {l}
                                            </SelectItem>
                                        ),
                                    )}
                                </SelectContent>
                            </Select>
                        </Field>
                    </CardContent>
                </Card>

                {/* === CUENTA BANCARIA === */}
                {data.type === 'cuenta' && (
                    <>
                        <Card>
                            <CardHeader className="border-b">
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="size-4 text-muted-foreground" />
                                    Datos del banco
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
                                <Field>
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
                                    className="md:col-span-2"
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
                            </CardContent>
                        </Card>

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
                                            setData(
                                                'holder_name',
                                                e.target.value,
                                            )
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
                                                setData(
                                                    'holder_document_type',
                                                    v,
                                                )
                                            }
                                        >
                                            <SelectTrigger id="holder_document_type">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="NIT">
                                                    NIT
                                                </SelectItem>
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
                            </CardContent>
                        </Card>
                    </>
                )}

                {/* === LLAVE BRE-B === */}
                {data.type === 'bre_b' && (
                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle className="flex items-center gap-2">
                                <KeyRound className="size-4 text-muted-foreground" />
                                Llave Bre-B
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <FormField
                                id="payment_key"
                                label="Llave"
                                required
                                error={errors.payment_key}
                            >
                                <Input
                                    id="payment_key"
                                    value={data.payment_key}
                                    onChange={(e) =>
                                        setData('payment_key', e.target.value)
                                    }
                                    placeholder="Ej. @camep o un número/correo"
                                    className="font-mono"
                                />
                            </FormField>
                            <FormField
                                id="holder_name"
                                label="A nombre de"
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
                        </CardContent>
                    </Card>
                )}

                {/* === QR === */}
                {data.type === 'qr' && (
                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle className="flex items-center gap-2">
                                <QrCode className="size-4 text-muted-foreground" />
                                Código QR
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <FormField
                                id="bank_name"
                                label="Etiqueta (opcional)"
                                error={errors.bank_name}
                            >
                                <Input
                                    id="bank_name"
                                    value={data.bank_name}
                                    onChange={(e) =>
                                        setData('bank_name', e.target.value)
                                    }
                                    placeholder="Ej. Nequi, Daviplata…"
                                />
                            </FormField>
                            <Field
                                data-invalid={errors.qr ? 'true' : undefined}
                            >
                                <FieldLabel htmlFor="qr">
                                    Imagen del QR
                                </FieldLabel>
                                <input
                                    id="qr"
                                    type="file"
                                    accept="image/*"
                                    onChange={onQrChange}
                                    className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-muted file:px-3 file:py-1.5 file:text-sm file:text-foreground hover:file:bg-muted/70"
                                />
                                {errors.qr && (
                                    <p className="text-sm text-destructive">
                                        {errors.qr}
                                    </p>
                                )}
                                {qrPreview && (
                                    <img
                                        src={qrPreview}
                                        alt="Vista previa del QR"
                                        className="mt-2 size-40 rounded-lg border border-border object-contain p-2"
                                    />
                                )}
                            </Field>
                        </CardContent>
                    </Card>
                )}

                {/* Visibilidad (común) */}
                <Card>
                    <CardContent className="pt-6">
                        <Field orientation="horizontal" className="w-auto">
                            <Switch
                                id="is_active"
                                checked={data.is_active}
                                onCheckedChange={(v) => setData('is_active', v)}
                            />
                            <FieldLabel
                                htmlFor="is_active"
                                className="font-normal"
                            >
                                Visible para los asociados
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
                        {isEditing ? 'Guardar cambios' : 'Guardar método'}
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}
