import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    Building2,
    CheckCircle2,
    CreditCard,
    Hash,
    Pencil,
    Plus,
    Trash2,
    User,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { Alert, AlertTitle } from '@/Components/base/Alert';
import { Badge } from '@/Components/base/Badge';
import { Button } from '@/Components/base/Button';
import { Card, CardContent } from '@/Components/base/Card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/base/Dialog';
import AppLayout from '@/Layouts/AppLayout';

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

export default function BankAccountsIndex({
    accounts,
}: {
    accounts: BankAccount[];
}) {
    const flash = (usePage().props.flash ?? {}) as {
        success?: string;
        error?: string;
    };
    const [notice, setNotice] = useState<{
        variant: 'success' | 'destructive';
        msg: string;
    } | null>(null);
    const [deleting, setDeleting] = useState<BankAccount | null>(null);

    useEffect(() => {
        if (flash.success)
            setNotice({ variant: 'success', msg: flash.success });
        else if (flash.error)
            setNotice({ variant: 'destructive', msg: flash.error });
        if (flash.success || flash.error) {
            const t = setTimeout(() => setNotice(null), 5000);
            return () => clearTimeout(t);
        }
    }, [flash.success, flash.error]);

    const confirmDelete = () => {
        if (!deleting) return;
        router.delete(route('admin.bank-accounts.destroy', deleting.id), {
            preserveScroll: true,
            onFinish: () => setDeleting(null),
        });
    };

    return (
        <AppLayout>
            <Head title="Datos bancarios" />
            <div className="mx-auto max-w-5xl space-y-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="flex items-center gap-2 font-display text-h3">
                            <CreditCard className="size-6 text-muted-foreground" />
                            Datos bancarios
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Cuentas habilitadas para recibir pagos de membresía.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={route('admin.bank-accounts.create')}>
                            <Plus className="size-4" /> Agregar cuenta
                        </Link>
                    </Button>
                </div>

                {notice && (
                    <Alert variant={notice.variant}>
                        {notice.variant === 'success' ? (
                            <CheckCircle2 />
                        ) : (
                            <AlertCircle />
                        )}
                        <AlertTitle>{notice.msg}</AlertTitle>
                    </Alert>
                )}

                {accounts.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                            <CreditCard className="size-10 text-muted-foreground" />
                            <p className="font-medium text-foreground">
                                No hay cuentas bancarias configuradas.
                            </p>
                            <Button asChild className="mt-2">
                                <Link
                                    href={route('admin.bank-accounts.create')}
                                >
                                    Agregar la primera
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {accounts.map((account) => (
                            <Card key={account.id}>
                                <CardContent>
                                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                                        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                            <Building2 className="size-5" />
                                        </span>

                                        <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-3">
                                            <div>
                                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                                    Banco
                                                </p>
                                                <p className="font-medium text-foreground">
                                                    {account.bank_name}
                                                </p>
                                                <Badge
                                                    variant="secondary"
                                                    className="mt-1"
                                                >
                                                    {account.account_type}
                                                </Badge>
                                            </div>
                                            <div>
                                                <p className="flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground">
                                                    <Hash className="size-3" />{' '}
                                                    Cuenta
                                                </p>
                                                <p className="font-mono text-sm text-foreground">
                                                    {account.account_number}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground">
                                                    <User className="size-3" />{' '}
                                                    Titular
                                                </p>
                                                <p className="text-sm text-foreground">
                                                    {account.holder_name}
                                                </p>
                                                <p className="font-mono text-xs text-muted-foreground">
                                                    {
                                                        account.holder_document_type
                                                    }
                                                    : {account.holder_document}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 items-center gap-2">
                                            <Badge
                                                variant={
                                                    account.is_active
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                            >
                                                {account.is_active
                                                    ? 'Activa'
                                                    : 'Inactiva'}
                                            </Badge>
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                asChild
                                                aria-label={`Editar ${account.bank_name}`}
                                            >
                                                <Link
                                                    href={route(
                                                        'admin.bank-accounts.edit',
                                                        account.id,
                                                    )}
                                                >
                                                    <Pencil className="size-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                aria-label={`Eliminar ${account.bank_name}`}
                                                className="text-muted-foreground hover:text-destructive"
                                                onClick={() =>
                                                    setDeleting(account)
                                                }
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <Dialog
                open={!!deleting}
                onOpenChange={(o) => !o && setDeleting(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Eliminar cuenta bancaria</DialogTitle>
                        <DialogDescription>
                            {deleting &&
                                `¿Eliminar la cuenta de ${deleting.bank_name} (${deleting.account_number})? Esta acción no se puede deshacer.`}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancelar</Button>
                        </DialogClose>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
