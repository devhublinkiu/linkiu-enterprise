import { Head, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    ExternalLink,
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
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/base/Dialog';
import { Field, FieldLabel } from '@/Components/base/Field';
import { Progress } from '@/Components/base/Progress';
import AppLayout from '@/Layouts/AppLayout';

import { SectionStatus } from '../BasicInfo/types';
import DocumentsGrid from './Parts/DocumentsGrid';
import MembershipInterest from './Parts/MembershipInterest';
import SwornDeclaration from './Parts/SwornDeclaration';
import { DocumentationForm, DocumentCatalog, isImageUrl } from './types';

interface InitialAssociate {
    section_reviews?: Record<
        string,
        { status: SectionStatus; rejected_reason?: string }
    >;
    document_urls?: Record<string, string>;
    rep_name?: string | null;
    rep_doc?: string | null;
    membership_interest?: string[] | null;
    membership_interest_other?: string | null;
    funds_origin_declaration?: boolean | null;
}

interface Props {
    initialAssociate?: InitialAssociate | null;
    documentCatalog: DocumentCatalog;
    flash?: { success?: string; error?: string; draft_saved?: string };
}

export default function Documentation({
    initialAssociate,
    documentCatalog,
    flash,
}: Props) {
    const review = initialAssociate?.section_reviews?.documentation ?? {
        status: 'draft' as SectionStatus,
    };
    const status = review.status;
    const canEdit = status === 'draft' || status === 'rejected';

    const fileUrls = initialAssociate?.document_urls ?? {};

    const { data, setData, post, processing, errors, setError, clearErrors } =
        useForm<DocumentationForm>({
            files: {},
            rep_name: initialAssociate?.rep_name ?? '',
            rep_doc: initialAssociate?.rep_doc ?? '',
            membership_interest: initialAssociate?.membership_interest ?? [],
            membership_interest_other:
                initialAssociate?.membership_interest_other ?? '',
            funds_origin_declaration:
                initialAssociate?.funds_origin_declaration ?? false,
        });

    const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
    const [previewDoc, setPreviewDoc] = useState<{
        url: string;
        name: string;
    } | null>(null);
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
    const allMandatory = documentCatalog.mandatory.every(
        (d) => data.files[d.key] || fileUrls[d.key],
    );
    const gates = [
        documentCatalog.mandatory.length === 0 ? true : allMandatory,
        data.rep_name.trim() !== '',
        data.rep_doc.trim() !== '',
        data.funds_origin_declaration === true,
        data.membership_interest.length > 0,
    ];
    const filled = gates.filter(Boolean).length;
    const pct = Math.round((filled / gates.length) * 100);

    const handleSaveDraft = () =>
        post(route('associate.company.save.documentation.draft'), {
            preserveScroll: true,
            forceFormData: true,
        });

    const handleSubmit = () => {
        clearErrors();
        const errs: Record<string, string> = {};
        const NEEDED = 'Completa este dato.';

        documentCatalog.mandatory.forEach((d) => {
            if (!data.files[d.key] && !fileUrls[d.key]) {
                errs[`files.${d.key}`] = 'Falta este documento.';
            }
        });
        if (!data.rep_name.trim()) errs.rep_name = NEEDED;
        if (!data.rep_doc.trim()) errs.rep_doc = NEEDED;
        if (!data.funds_origin_declaration)
            errs.funds_origin_declaration = 'Debes aceptar la declaración.';
        if (data.membership_interest.length === 0)
            errs.membership_interest = 'Marca al menos una opción.';
        if (
            data.membership_interest.includes('Otro') &&
            !data.membership_interest_other.trim()
        )
            errs.membership_interest_other = NEEDED;

        if (Object.keys(errs).length > 0) {
            Object.entries(errs).forEach(([k, v]) =>
                setError(k as keyof DocumentationForm, v),
            );
            setNotice({
                variant: 'destructive',
                msg: 'Revisa los campos marcados antes de enviar.',
            });
            return;
        }

        post(route('associate.company.update.documentation'), {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    const handleDelete = (key: string) =>
        router.delete(
            route('associate.company.documentation.delete', { docKey: key }),
            { preserveScroll: true },
        );

    const handleReopen = () =>
        router.post(
            route('associate.company.reopen.documentation'),
            {},
            { preserveScroll: true },
        );

    return (
        <AppLayout>
            <Head title="Documentación" />
            <div className="mx-auto max-w-4xl space-y-6">
                <div>
                    <h1 className="font-display text-h3">Documentación</h1>
                    <p className="text-sm text-muted-foreground">
                        Requisitos legales, interés de afiliación y declaración
                        jurada.
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
                        <FieldLabel htmlFor="docs-progress">
                            <span>Avance</span>
                            <span className="ml-auto text-muted-foreground">
                                {filled}/{gates.length} secciones
                            </span>
                        </FieldLabel>
                        <Progress id="docs-progress" value={pct} />
                    </Field>
                )}

                <DocumentsGrid
                    catalog={documentCatalog}
                    data={data}
                    setData={setData}
                    fileUrls={fileUrls}
                    fileErrors={fileErrors}
                    setFileErrors={setFileErrors}
                    errors={errors}
                    disabled={!canEdit}
                    onPreview={(url, name) => setPreviewDoc({ url, name })}
                    onDelete={handleDelete}
                />
                <MembershipInterest
                    data={data}
                    setData={setData}
                    errors={errors}
                    disabled={!canEdit}
                />
                <SwornDeclaration
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

            <Dialog
                open={!!previewDoc}
                onOpenChange={(o) => !o && setPreviewDoc(null)}
            >
                <DialogContent className="sm:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>{previewDoc?.name}</DialogTitle>
                    </DialogHeader>
                    {previewDoc &&
                        (isImageUrl(previewDoc.url) ? (
                            <img
                                src={previewDoc.url}
                                alt={previewDoc.name}
                                className="max-h-[70vh] w-full rounded-lg object-contain"
                            />
                        ) : (
                            <iframe
                                src={previewDoc.url}
                                title={previewDoc.name}
                                className="h-[70vh] w-full rounded-lg border-0"
                            />
                        ))}
                    <DialogFooter>
                        {previewDoc && (
                            <Button asChild variant="outline">
                                <a
                                    href={previewDoc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <ExternalLink className="size-4" /> Abrir en
                                    pestaña
                                </a>
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
