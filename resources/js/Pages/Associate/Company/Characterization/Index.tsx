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
import ClassificationIncome from './Parts/ClassificationIncome';
import HumanTalent from './Parts/HumanTalent';
import SectorPEP from './Parts/SectorPEP';
import TrainingGuilds from './Parts/TrainingGuilds';
import { CharacterizationForm } from './types';

type InitialAssociate =
    | (Partial<CharacterizationForm> & {
          section_reviews?: Record<
              string,
              { status: SectionStatus; rejected_reason?: string }
          >;
      })
    | null;

interface Props {
    initialAssociate?: InitialAssociate;
    flash?: { success?: string; error?: string; draft_saved?: string };
}

export default function Characterization({ initialAssociate, flash }: Props) {
    const review = initialAssociate?.section_reviews?.characterization ?? {
        status: 'draft' as SectionStatus,
    };
    const status = review.status;
    const canEdit = status === 'draft' || status === 'rejected';

    const { data, setData, post, processing, errors, setError, clearErrors } =
        useForm<CharacterizationForm>({
            employees_tech: initialAssociate?.employees_tech ?? 0,
            employees_prof: initialAssociate?.employees_prof ?? 0,
            employees_admin: initialAssociate?.employees_admin ?? 0,
            employees_exec: initialAssociate?.employees_exec ?? 0,
            employees_other: initialAssociate?.employees_other ?? 0,
            employees_other_desc: initialAssociate?.employees_other_desc || '',
            employees_direct_count:
                initialAssociate?.employees_direct_count ?? 0,
            hydrocarbons_participation:
                initialAssociate?.hydrocarbons_participation ?? null,
            hydrocarbons_level: initialAssociate?.hydrocarbons_level || '',
            pep_declaration: initialAssociate?.pep_declaration ?? null,
            pep_name: initialAssociate?.pep_name || '',
            pep_doc_type: initialAssociate?.pep_doc_type || '',
            pep_entity: initialAssociate?.pep_entity || '',
            capacitation_plan: initialAssociate?.capacitation_plan ?? null,
            capacitation_level: initialAssociate?.capacitation_level || '',
            capacitation_no_reason:
                initialAssociate?.capacitation_no_reason || '',
            company_classification:
                initialAssociate?.company_classification || '',
            public_income_pct: initialAssociate?.public_income_pct ?? 0,
            private_income_pct: initialAssociate?.private_income_pct ?? 0,
            other_guilds: initialAssociate?.other_guilds || '',
        });

    const [notice, setNotice] = useState<{
        variant: 'success' | 'destructive';
        msg: string;
    } | null>(null);

    // Mensajes flash (éxito / borrador / error) con auto-cierre.
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

    const incomeSum =
        (Number(data.public_income_pct) || 0) +
        (Number(data.private_income_pct) || 0);

    // Avance: cinco compuertas significativas (las que arrancan sin responder).
    const gates = [
        data.hydrocarbons_participation !== null,
        data.pep_declaration !== null,
        data.capacitation_plan !== null,
        data.company_classification !== '',
        incomeSum === 100,
    ];
    const filled = gates.filter(Boolean).length;
    const pct = Math.round((filled / gates.length) * 100);

    const handleSaveDraft = () =>
        post(route('associate.company.save.characterization.draft'), {
            preserveScroll: true,
        });

    const handleSubmit = () => {
        clearErrors();
        const missing: [keyof CharacterizationForm, string][] = [];
        const REQUIRED = 'Selecciona una opción.';
        const NEEDED = 'Completa este dato para continuar.';

        if (data.hydrocarbons_participation === null)
            missing.push(['hydrocarbons_participation', REQUIRED]);
        if (data.pep_declaration === null)
            missing.push(['pep_declaration', REQUIRED]);
        if (data.capacitation_plan === null)
            missing.push(['capacitation_plan', REQUIRED]);
        if (!data.company_classification)
            missing.push(['company_classification', 'Selecciona el tamaño.']);

        if (
            data.hydrocarbons_participation === true &&
            !data.hydrocarbons_level
        )
            missing.push(['hydrocarbons_level', NEEDED]);
        if (data.pep_declaration === true) {
            if (!data.pep_name) missing.push(['pep_name', NEEDED]);
            if (!data.pep_doc_type) missing.push(['pep_doc_type', NEEDED]);
            if (!data.pep_entity) missing.push(['pep_entity', NEEDED]);
        }
        if (data.capacitation_plan === true && !data.capacitation_level)
            missing.push(['capacitation_level', NEEDED]);
        if (data.capacitation_plan === false && !data.capacitation_no_reason)
            missing.push(['capacitation_no_reason', NEEDED]);

        const sumBad = incomeSum !== 100;

        if (missing.length > 0 || sumBad) {
            missing.forEach(([f, m]) => setError(f, m));
            if (sumBad) {
                const m = `Los ingresos deben sumar exactamente 100% (hoy: ${incomeSum}%).`;
                setError('public_income_pct', m);
                setError('private_income_pct', m);
            }
            setNotice({
                variant: 'destructive',
                msg: 'Revisa los campos marcados antes de enviar.',
            });
            return;
        }

        post(route('associate.company.update.characterization'), {
            preserveScroll: true,
        });
    };

    const handleReopen = () =>
        router.post(
            route('associate.company.reopen.characterization'),
            {},
            { preserveScroll: true },
        );

    return (
        <AppLayout>
            <Head title="Caracterización" />
            <div className="mx-auto max-w-4xl space-y-6">
                <div>
                    <h1 className="font-display text-h3">Caracterización</h1>
                    <p className="text-sm text-muted-foreground">
                        Talento humano, participación sectorial e ingresos.
                    </p>
                </div>

                {/* Mensaje flash */}
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

                {/* Banner de estado de la sección */}
                {status === 'draft' && (
                    <Alert variant="warning">
                        <Info />
                        <AlertTitle>Borrador</AlertTitle>
                        <AlertDescription>
                            Completa la caracterización y envíala a revisión
                            cuando esté lista.
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

                {/* Avance del formulario */}
                {canEdit && (
                    <Field>
                        <FieldLabel htmlFor="char-progress">
                            <span>Avance</span>
                            <span className="ml-auto text-muted-foreground">
                                {filled}/{gates.length} secciones
                            </span>
                        </FieldLabel>
                        <Progress id="char-progress" value={pct} />
                    </Field>
                )}

                {/* Bloques */}
                <HumanTalent
                    data={data}
                    setData={setData}
                    errors={errors}
                    disabled={!canEdit}
                />
                <SectorPEP
                    data={data}
                    setData={setData}
                    errors={errors}
                    disabled={!canEdit}
                />
                <ClassificationIncome
                    data={data}
                    setData={setData}
                    errors={errors}
                    disabled={!canEdit}
                />
                <TrainingGuilds
                    data={data}
                    setData={setData}
                    errors={errors}
                    disabled={!canEdit}
                />

                {/* Acciones */}
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
