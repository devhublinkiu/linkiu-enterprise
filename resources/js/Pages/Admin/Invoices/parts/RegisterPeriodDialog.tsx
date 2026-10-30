import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

import { Button } from '@/Components/base/Button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/base/Dialog';
import { Field, FieldLabel } from '@/Components/base/Field';
import { Input } from '@/Components/base/Input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/base/Select';
import { Textarea } from '@/Components/base/Textarea';

interface Associate {
    id: number;
    company_name: string;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    associates: Associate[];
}

const METHODS: Record<string, string> = {
    efectivo: 'Efectivo',
    transferencia: 'Transferencia',
    consignacion: 'Consignación',
    otro: 'Otro',
};

const today = () => new Date().toISOString().slice(0, 10);

// 0.B — Registra la mensualidad del periodo en efectivo (u otro canal manual)
// generando la cuenta de cobro al vuelo si no existe.
export default function RegisterPeriodDialog({
    open,
    onOpenChange,
    associates,
}: Props) {
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            associate_id: '',
            payment_method: 'efectivo',
            paid_at: today(),
            payment_reference: '',
            payment_notes: '',
        });

    const close = () => {
        reset();
        clearErrors();
        onOpenChange(false);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.invoices.register-period-payment'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Mensualidad registrada.');
                close();
            },
        });
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(o) => (o ? onOpenChange(o) : close())}
        >
            <DialogContent className="max-h-[90svh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Registrar mensualidad (efectivo)</DialogTitle>
                    <DialogDescription>
                        Genera la cuenta de cobro del periodo actual (si no
                        existe) y la marca como pagada. Extiende la vigencia.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="mt-4 space-y-4">
                    <Field>
                        <FieldLabel htmlFor="rp-associate">Empresa</FieldLabel>
                        <Select
                            value={data.associate_id}
                            onValueChange={(v) => setData('associate_id', v)}
                        >
                            <SelectTrigger id="rp-associate">
                                <SelectValue placeholder="Selecciona la empresa" />
                            </SelectTrigger>
                            <SelectContent>
                                {associates.map((a) => (
                                    <SelectItem key={a.id} value={String(a.id)}>
                                        {a.company_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.associate_id && (
                            <p className="text-sm text-destructive">
                                {errors.associate_id}
                            </p>
                        )}
                    </Field>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field>
                            <FieldLabel htmlFor="rp-method">Medio</FieldLabel>
                            <Select
                                value={data.payment_method}
                                onValueChange={(v) =>
                                    setData('payment_method', v)
                                }
                            >
                                <SelectTrigger id="rp-method">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(METHODS).map(([v, l]) => (
                                        <SelectItem key={v} value={v}>
                                            {l}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="rp-date">
                                Fecha de pago
                            </FieldLabel>
                            <Input
                                id="rp-date"
                                type="date"
                                max={today()}
                                value={data.paid_at}
                                onChange={(e) =>
                                    setData('paid_at', e.target.value)
                                }
                            />
                            {errors.paid_at && (
                                <p className="text-sm text-destructive">
                                    {errors.paid_at}
                                </p>
                            )}
                        </Field>
                    </div>

                    <Field>
                        <FieldLabel htmlFor="rp-ref">
                            Referencia (opcional)
                        </FieldLabel>
                        <Input
                            id="rp-ref"
                            value={data.payment_reference}
                            onChange={(e) =>
                                setData('payment_reference', e.target.value)
                            }
                            maxLength={100}
                            placeholder="N.º de recibo, consignación…"
                        />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="rp-notes">
                            Notas (opcional)
                        </FieldLabel>
                        <Textarea
                            id="rp-notes"
                            value={data.payment_notes}
                            onChange={(e) =>
                                setData('payment_notes', e.target.value)
                            }
                            rows={3}
                            maxLength={1000}
                        />
                    </Field>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={close}
                            disabled={processing}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || !data.associate_id}
                        >
                            {processing ? 'Registrando…' : 'Registrar pago'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
