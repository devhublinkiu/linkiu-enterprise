import { Head, useForm } from '@inertiajs/react';
import { CalendarClock } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/Components/base/Button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/base/Card';
import { Input } from '@/Components/base/Input';
import { Label } from '@/Components/base/Label';
import AppLayout from '@/Layouts/AppLayout';

interface Props {
    settings: {
        cutoff_day: number;
        grace_days: number;
    };
}

export default function Edit({ settings }: Props) {
    const { data, setData, patch, processing, errors } = useForm({
        cutoff_day: settings.cutoff_day,
        grace_days: settings.grace_days,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('admin.billing-settings.update'), {
            preserveScroll: true,
            onSuccess: () => toast.success('Ajustes de cobro actualizados.'),
        });
    };

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <Head title="Ajustes de cobro | Admin" />

            <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-xl bg-muted text-muted-foreground">
                    <CalendarClock className="size-5" />
                </div>
                <div>
                    <h1 className="text-2xl font-semibold text-foreground">
                        Ajustes de cobro
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Aplican a todas las empresas asociadas.
                    </p>
                </div>
            </div>

            <form onSubmit={submit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Calendario de cobro</CardTitle>
                        <CardDescription>
                            El día de corte es cuando vence la mensualidad y se
                            genera la nueva cuenta de cobro. La prórroga son los
                            días de gracia para pagar después del corte sin
                            perder el acceso.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="space-y-1.5">
                            <Label htmlFor="cutoff_day">Día de corte</Label>
                            <Input
                                id="cutoff_day"
                                type="number"
                                min={1}
                                max={28}
                                value={data.cutoff_day}
                                onChange={(e) =>
                                    setData(
                                        'cutoff_day',
                                        Number(e.target.value),
                                    )
                                }
                                className="max-w-[140px]"
                            />
                            <p className="text-xs text-muted-foreground">
                                Día del mes (1 a 28). La vigencia cubre todo ese
                                día.
                            </p>
                            {errors.cutoff_day && (
                                <p className="text-sm text-destructive">
                                    {errors.cutoff_day}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="grace_days">
                                Prórroga (días de gracia)
                            </Label>
                            <Input
                                id="grace_days"
                                type="number"
                                min={0}
                                max={60}
                                value={data.grace_days}
                                onChange={(e) =>
                                    setData(
                                        'grace_days',
                                        Number(e.target.value),
                                    )
                                }
                                className="max-w-[140px]"
                            />
                            <p className="text-xs text-muted-foreground">
                                Días después del corte en los que aún puede
                                pagar sin que se oculte el perfil.
                            </p>
                            {errors.grace_days && (
                                <p className="text-sm text-destructive">
                                    {errors.grace_days}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Guardando…' : 'Guardar cambios'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}

Edit.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
