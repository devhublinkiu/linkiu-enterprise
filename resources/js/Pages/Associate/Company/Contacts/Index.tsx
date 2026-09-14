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
import CommerceBilling from './Parts/CommerceBilling';
import DigitalChannels from './Parts/DigitalChannels';
import Directory from './Parts/Directory';
import SupportReferences from './Parts/SupportReferences';
import {
    ContactsForm,
    hydrateContacts,
    hydrateReferences,
    isEmail,
} from './types';

type InitialAssociate =
    | (Partial<ContactsForm> & {
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

export default function Contacts({ initialAssociate, flash }: Props) {
    const review = initialAssociate?.section_reviews?.contacts ?? {
        status: 'draft' as SectionStatus,
    };
    const status = review.status;
    const canEdit = status === 'draft' || status === 'rejected';

    const { data, setData, post, processing, errors, setError, clearErrors } =
        useForm<ContactsForm>({
            // Las filas de la BD traen campos null; se hidratan a '' (ver types.ts).
            contacts: hydrateContacts(initialAssociate?.contacts),
            main_ciiu: initialAssociate?.main_ciiu || '',
            secondary_ciiu: initialAssociate?.secondary_ciiu || '',
            billing_email: initialAssociate?.billing_email || '',
            company_type: initialAssociate?.company_type || [],
            references: hydrateReferences(initialAssociate?.references),
            social_instagram: initialAssociate?.social_instagram || '',
            social_facebook: initialAssociate?.social_facebook || '',
            social_linkedin: initialAssociate?.social_linkedin || '',
            social_other: initialAssociate?.social_other || '',
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

    // Avance: cinco compuertas significativas.
    const gates = [
        data.contacts.some((c) => c.name.trim()),
        data.main_ciiu.trim() !== '',
        data.billing_email.trim() !== '',
        data.company_type.length > 0,
        data.references.some((r) => r.name.trim()),
    ];
    const filled = gates.filter(Boolean).length;
    const pct = Math.round((filled / gates.length) * 100);

    const handleSaveDraft = () =>
        post(route('associate.company.save.contacts.draft'), {
            preserveScroll: true,
        });

    const handleSubmit = () => {
        clearErrors();
        const errs: Record<string, string> = {};
        const NEEDED = 'Completa este dato.';
        const BAD_EMAIL = 'Escribe un correo válido.';
        const NO_MEDIUM =
            'Agrega teléfono o email para poder verificar la referencia.';

        // Directorio de contactos: todos los campos obligatorios.
        if (data.contacts.length === 0)
            errs.contacts = 'Agrega al menos un contacto.';
        data.contacts.forEach((c, i) => {
            (['area', 'name', 'position', 'phone'] as const).forEach((f) => {
                if (!c[f].trim()) errs[`contacts.${i}.${f}`] = NEEDED;
            });
            if (!c.email.trim()) errs[`contacts.${i}.email`] = NEEDED;
            else if (!isEmail(c.email)) errs[`contacts.${i}.email`] = BAD_EMAIL;
        });

        // Comercial y facturación.
        if (!data.main_ciiu.trim()) errs.main_ciiu = NEEDED;
        if (!data.billing_email.trim()) errs.billing_email = NEEDED;
        else if (!isEmail(data.billing_email)) errs.billing_email = BAD_EMAIL;
        if (data.company_type.length === 0)
            errs.company_type = 'Marca al menos una opción.';

        // Referencias: nombre + contactabilidad (teléfono o email).
        if (data.references.length === 0)
            errs.references = 'Agrega al menos una referencia.';
        data.references.forEach((r, i) => {
            if (!r.name.trim()) errs[`references.${i}.name`] = NEEDED;
            const hasPhone = r.phone.trim() !== '';
            const hasEmail = r.email.trim() !== '';
            if (!hasPhone && !hasEmail) {
                errs[`references.${i}.phone`] = NO_MEDIUM;
                errs[`references.${i}.email`] = NO_MEDIUM;
            } else if (hasEmail && !isEmail(r.email)) {
                errs[`references.${i}.email`] = BAD_EMAIL;
            }
        });

        if (Object.keys(errs).length > 0) {
            Object.entries(errs).forEach(([k, v]) =>
                setError(k as keyof ContactsForm, v),
            );
            setNotice({
                variant: 'destructive',
                msg: 'Revisa los campos marcados antes de enviar.',
            });
            return;
        }

        post(route('associate.company.update.contacts'), {
            preserveScroll: true,
        });
    };

    const handleReopen = () =>
        router.post(
            route('associate.company.reopen.contacts'),
            {},
            { preserveScroll: true },
        );

    return (
        <AppLayout>
            <Head title="Contactos y Referencias" />
            <div className="mx-auto max-w-4xl space-y-6">
                <div>
                    <h1 className="font-display text-h3">
                        Contactos y Referencias
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Directorio, facturación, referencias y canales
                        digitales.
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
                        <FieldLabel htmlFor="contacts-progress">
                            <span>Avance</span>
                            <span className="ml-auto text-muted-foreground">
                                {filled}/{gates.length} secciones
                            </span>
                        </FieldLabel>
                        <Progress id="contacts-progress" value={pct} />
                    </Field>
                )}

                <Directory
                    data={data}
                    setData={setData}
                    errors={errors}
                    disabled={!canEdit}
                />
                <CommerceBilling
                    data={data}
                    setData={setData}
                    errors={errors}
                    disabled={!canEdit}
                />
                <SupportReferences
                    data={data}
                    setData={setData}
                    errors={errors}
                    disabled={!canEdit}
                />
                <DigitalChannels
                    data={data}
                    setData={setData}
                    errors={errors}
                    disabled={!canEdit}
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
