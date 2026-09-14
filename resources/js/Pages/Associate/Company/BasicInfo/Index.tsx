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

import IdentityCorporate from './Parts/IdentityCorporate';
import LegalRepresentative from './Parts/LegalRepresentative';
import LocationContact from './Parts/LocationContact';
import { BasicInfoForm, LocationOption, SectionStatus } from './types';

const KNOWN_LEGAL = ['SAS', 'Ltda.', 'Anónima', 'ESAL', 'Cooperativa'];

// Campos obligatorios al enviar (nombres; los *_id se validan aparte). Ver ADR-0005-a.
const REQUIRED: (keyof BasicInfoForm)[] = [
    'company_name',
    'nit',
    'legal_status',
    'country_origin',
    'department',
    'city',
    'address',
    'phone',
    'rep_name',
    'rep_position',
    'rep_doc_type',
    'rep_doc',
];

type InitialAssociate =
    | (Partial<BasicInfoForm> & {
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

export default function BasicInfo({ initialAssociate, flash }: Props) {
    const review = initialAssociate?.section_reviews?.basicinfo ?? {
        status: 'draft' as SectionStatus,
    };
    const status = review.status;
    const isNew = !initialAssociate;
    const canEdit = status === 'draft' || status === 'rejected';

    // Normaliza "Otro": si el valor guardado no es uno de los conocidos, es un tipo libre.
    const rawLegal = initialAssociate?.legal_status || '';
    const legalIsOtro = !!rawLegal && !KNOWN_LEGAL.includes(rawLegal);

    const { data, setData, post, processing, errors, setError, clearErrors } =
        useForm<BasicInfoForm>({
            company_name: initialAssociate?.company_name || '',
            initials: initialAssociate?.initials || '',
            nit: initialAssociate?.nit || '',
            legal_status: legalIsOtro ? 'Otro' : rawLegal,
            legal_status_other: legalIsOtro ? rawLegal : '',
            constitution_date: initialAssociate?.constitution_date
                ? String(initialAssociate.constitution_date).split('T')[0]
                : '',
            country_origin: initialAssociate?.country_origin || 'Colombia',
            phone: initialAssociate?.phone || '',
            website: initialAssociate?.website || '',
            department: initialAssociate?.department || '',
            department_id: initialAssociate?.department_id ?? null,
            city: initialAssociate?.city || '',
            city_id: initialAssociate?.city_id ?? null,
            address: initialAssociate?.address || '',
            rep_name: initialAssociate?.rep_name || '',
            rep_position: initialAssociate?.rep_position || '',
            rep_doc_type: initialAssociate?.rep_doc_type || '',
            rep_doc: initialAssociate?.rep_doc || '',
        });

    const [departments, setDepartments] = useState<LocationOption[]>([]);
    const [cities, setCities] = useState<LocationOption[]>([]);
    const [loadingCities, setLoadingCities] = useState(false);
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

    // Catálogo propio de departamentos (reemplaza api-colombia). Ver ADR-0005-a.
    useEffect(() => {
        let active = true;
        fetch(route('locations.departments'), {
            headers: { Accept: 'application/json' },
        })
            .then((r) => r.json())
            .then((d: LocationOption[]) => {
                if (active) setDepartments(d);
            })
            .catch(() => {});
        return () => {
            active = false;
        };
    }, []);

    // Ciudades del departamento elegido (y reconcilia el id con nuestro catálogo).
    useEffect(() => {
        const dept = departments.find((d) => d.name === data.department);
        if (!dept) {
            setCities([]);
            return;
        }
        if (data.department_id !== dept.id) setData('department_id', dept.id);

        let active = true;
        setLoadingCities(true);
        fetch(route('locations.cities', dept.id), {
            headers: { Accept: 'application/json' },
        })
            .then((r) => r.json())
            .then((c: LocationOption[]) => {
                if (active) setCities(c);
            })
            .catch(() => {})
            .finally(() => {
                if (active) setLoadingCities(false);
            });
        return () => {
            active = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.department, departments]);

    // Reconcilia el id de ciudad con el catálogo cuando cargan las ciudades.
    useEffect(() => {
        const c = cities.find((x) => x.name === data.city);
        if (c && data.city_id !== c.id) setData('city_id', c.id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cities]);

    const handleDepartment = (name: string) => {
        const dept = departments.find((d) => d.name === name);
        setData('department', name);
        setData('department_id', dept ? dept.id : null);
        setData('city', '');
        setData('city_id', null);
    };

    const handleCity = (name: string) => {
        const c = cities.find((x) => x.name === name);
        setData('city', name);
        setData('city_id', c ? c.id : null);
    };

    const handleSaveDraft = () =>
        post(route('associate.company.save.draft'), { preserveScroll: true });

    const handleSubmit = () => {
        clearErrors();
        const missing: (keyof BasicInfoForm)[] = [];
        REQUIRED.forEach((f) => {
            const v = data[f];
            if (v === null || v === undefined || String(v).trim() === '')
                missing.push(f);
        });
        if (!data.department_id && !missing.includes('department'))
            missing.push('department');
        if (!data.city_id && !missing.includes('city')) missing.push('city');
        if (data.legal_status === 'Otro' && !data.legal_status_other.trim())
            missing.push('legal_status_other');

        if (missing.length > 0) {
            missing.forEach((f) => setError(f, 'Campo obligatorio'));
            setNotice({
                variant: 'destructive',
                msg: 'Faltan campos obligatorios por completar.',
            });
            return;
        }
        post(route('associate.company.update.basic'), { preserveScroll: true });
    };

    const handleReopen = () =>
        router.post(
            route('associate.company.reopen.basic'),
            {},
            { preserveScroll: true },
        );

    const filled = REQUIRED.filter((f) => {
        const v = data[f];
        return v !== null && v !== undefined && String(v).trim() !== '';
    }).length;
    const pct = Math.round((filled / REQUIRED.length) * 100);

    return (
        <AppLayout>
            <Head title="Información Básica" />
            <div className="mx-auto max-w-4xl space-y-6">
                <div>
                    <h1 className="font-display text-h3">Información básica</h1>
                    <p className="text-sm text-muted-foreground">
                        Datos principales de tu organización.
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
                {isNew && (
                    <Alert>
                        <Info />
                        <AlertTitle>¡Bienvenido a la red CAMEP!</AlertTitle>
                        <AlertDescription>
                            Completa la información de tu organización para
                            iniciar el proceso de verificación.
                        </AlertDescription>
                    </Alert>
                )}
                {!isNew && status === 'draft' && (
                    <Alert variant="warning">
                        <Info />
                        <AlertTitle>Borrador</AlertTitle>
                        <AlertDescription>
                            Guardaste cambios, pero aún no los has enviado a
                            revisión.
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
                        <FieldLabel htmlFor="basic-progress">
                            <span>Avance</span>
                            <span className="ml-auto text-muted-foreground">
                                {filled}/{REQUIRED.length} campos
                            </span>
                        </FieldLabel>
                        <Progress id="basic-progress" value={pct} />
                    </Field>
                )}

                {/* Bloques */}
                <IdentityCorporate
                    data={data}
                    setData={setData}
                    errors={errors}
                    disabled={!canEdit}
                />
                <LegalRepresentative
                    data={data}
                    setData={setData}
                    errors={errors}
                    disabled={!canEdit}
                />
                <LocationContact
                    data={data}
                    setData={setData}
                    errors={errors}
                    disabled={!canEdit}
                    departments={departments}
                    cities={cities}
                    loadingCities={loadingCities}
                    onDepartment={handleDepartment}
                    onCity={handleCity}
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
