import { Head, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Info,
    Pencil,
    Save,
    Send,
    ShieldCheck,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import {
    Alert,
    AlertAction,
    AlertDescription,
    AlertTitle,
} from '@/Components/base/Alert';
import { Button } from '@/Components/base/Button';
import { Field, FieldLabel } from '@/Components/base/Field';
import { Progress } from '@/Components/base/Progress';
import AppLayout from '@/Layouts/AppLayout';

import { SectionStatus } from '../BasicInfo/types';
import ServicePicker from './Parts/ServicePicker';
import ValueProposition from './Parts/ValueProposition';
import { CategoryItem, ServiceItem, ServicesForm } from './types';

type InitialAssociate = {
    description?: string;
    services?: ServiceItem[];
    plan?: { limit_services?: number } | null;
    section_reviews?: Record<
        string,
        { status: SectionStatus; rejected_reason?: string }
    >;
} | null;

interface Props {
    initialAssociate?: InitialAssociate;
    availableServices?: ServiceItem[];
    serviceCategories?: CategoryItem[];
    flash?: { success?: string; error?: string; draft_saved?: string };
}

export default function Services({
    initialAssociate,
    availableServices = [],
    serviceCategories = [],
    flash,
}: Props) {
    const review = initialAssociate?.section_reviews?.services ?? {
        status: 'draft' as SectionStatus,
    };
    const status = review.status;
    const canEdit = status === 'draft' || status === 'rejected';
    const limit = initialAssociate?.plan?.limit_services || 0; // 0 = ilimitado

    const { data, setData, post, processing, errors, setError, clearErrors } =
        useForm<ServicesForm>({
            description: initialAssociate?.description || '',
            service_ids: initialAssociate?.services?.map((s) => s.id) ?? [],
        });

    const [notice, setNotice] = useState<{
        variant: 'success' | 'destructive';
        msg: string;
    } | null>(null);

    useEffect(() => {
        if (flash?.draft_saved)
            setNotice({
                variant: 'success',
                msg: `Borrador guardado · ${flash.draft_saved}`,
            });
        else if (flash?.success)
            setNotice({ variant: 'success', msg: flash.success });
        else if (flash?.error)
            setNotice({ variant: 'destructive', msg: flash.error });

        if (flash?.draft_saved || flash?.success || flash?.error) {
            const t = setTimeout(() => setNotice(null), 5000);
            return () => clearTimeout(t);
        }
    }, [flash]);

    const gates = [data.description.trim() !== '', data.service_ids.length > 0];
    const filled = gates.filter(Boolean).length;
    const pct = Math.round((filled / gates.length) * 100);

    const toggle = (svcId: number) => {
        if (!canEdit) return;
        const ids = data.service_ids;
        if (ids.includes(svcId)) {
            setData(
                'service_ids',
                ids.filter((x) => x !== svcId),
            );
        } else if (limit === 0 || ids.length < limit) {
            setData('service_ids', [...ids, svcId]);
        }
    };

    const handleSaveDraft = () =>
        post(route('associate.company.save.services.draft'), {
            preserveScroll: true,
        });

    const handleSubmit = () => {
        clearErrors();
        let bad = false;
        if (!data.description.trim()) {
            setError('description', 'Escribe tu propuesta de valor.');
            bad = true;
        }
        if (data.service_ids.length === 0) {
            setError('service_ids', 'Elige al menos un servicio.');
            bad = true;
        }
        if (bad) {
            setNotice({
                variant: 'destructive',
                msg: 'Revisa los campos marcados antes de enviar.',
            });
            return;
        }
        post(route('associate.company.update.services'), {
            preserveScroll: true,
        });
    };

    const handleReopen = () =>
        router.post(
            route('associate.company.reopen.services'),
            {},
            { preserveScroll: true },
        );

    return (
        <AppLayout>
            <Head title="Servicios" />
            <div className="mx-auto max-w-4xl space-y-6">
                <div>
                    <h1 className="font-display text-h3">Servicios</h1>
                    <p className="text-sm text-muted-foreground">
                        Propuesta de valor y portafolio de servicios de tu
                        empresa.
                    </p>
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

                {status === 'draft' && (
                    <Alert variant="warning">
                        <Info />
                        <AlertTitle>Borrador</AlertTitle>
                        <AlertDescription>
                            Completa la sección y envíala a revisión cuando esté
                            lista.
                        </AlertDescription>
                    </Alert>
                )}
                {status === 'pending' && (
                    <Alert>
                        <ShieldCheck />
                        <AlertTitle>En revisión</AlertTitle>
                        <AlertDescription>
                            CAMEP está validando esta sección. Te avisaremos por
                            correo cualquier novedad.
                        </AlertDescription>
                    </Alert>
                )}
                {status === 'approved' && (
                    <Alert variant="success">
                        <CheckCircle2 />
                        <AlertTitle>Sección aprobada</AlertTitle>
                        <AlertDescription>
                            Para actualizar estos datos, ábrela con “Editar” y
                            vuelve a enviarla a revisión.
                        </AlertDescription>
                        <AlertAction>
                            <Button size="sm" onClick={handleReopen}>
                                <Pencil className="size-4" /> Editar
                            </Button>
                        </AlertAction>
                    </Alert>
                )}
                {status === 'rejected' && (
                    <Alert variant="destructive">
                        <AlertCircle />
                        <AlertTitle>Sección rechazada</AlertTitle>
                        <AlertDescription>
                            {review.rejected_reason
                                ? `Motivo: ${review.rejected_reason}`
                                : 'Realiza las correcciones y vuelve a enviar a revisión.'}
                        </AlertDescription>
                    </Alert>
                )}

                {canEdit && (
                    <Field>
                        <FieldLabel htmlFor="svc-progress">
                            <span>Avance</span>
                            <span className="ml-auto text-muted-foreground">
                                {filled}/{gates.length} secciones
                            </span>
                        </FieldLabel>
                        <Progress id="svc-progress" value={pct} />
                    </Field>
                )}

                <ValueProposition
                    data={data}
                    setData={setData}
                    errors={errors}
                    disabled={!canEdit}
                />
                <ServicePicker
                    selectedIds={data.service_ids}
                    toggle={toggle}
                    clearAll={() => setData('service_ids', [])}
                    availableServices={availableServices}
                    serviceCategories={serviceCategories}
                    disabled={!canEdit}
                    limit={limit}
                    error={errors.service_ids}
                />

                {canEdit && (
                    <div className="sticky bottom-4 z-30 flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleSaveDraft}
                            disabled={processing}
                            className="shadow-sm"
                        >
                            <Save className="size-4" /> Guardar borrador
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={processing}
                            className="shadow-sm"
                        >
                            <Send className="size-4" />
                            {processing ? 'Enviando…' : 'Enviar a revisión'}
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
