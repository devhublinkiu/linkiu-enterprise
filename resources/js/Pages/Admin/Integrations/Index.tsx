import { Head, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Copy,
    Plug,
    Webhook,
    Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { Alert, AlertTitle } from '@/Components/base/Alert';
import { Badge } from '@/Components/base/Badge';
import { Button } from '@/Components/base/Button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/Components/base/Card';
import { Field, FieldLabel } from '@/Components/base/Field';
import { Input } from '@/Components/base/Input';
import { Switch } from '@/Components/base/Switch';
import AppLayout from '@/Layouts/AppLayout';
import { cn } from '@/lib/utils';

import FormField from '@/Pages/Associate/Company/BasicInfo/Parts/FormField';

type Env = 'test' | 'production';

interface BoldStatus {
    is_active: boolean;
    enabled: boolean;
    environment: Env;
    has: {
        test_api_key: boolean;
        test_secret_key: boolean;
        production_api_key: boolean;
        production_secret_key: boolean;
        webhook_secret: boolean;
    };
    webhook_url: string;
    currency: string;
}

const ENV_LABEL: Record<Env, string> = {
    test: 'Pruebas',
    production: 'Producción',
};

export default function IntegrationsIndex({ bold }: { bold: BoldStatus }) {
    const flash = (usePage().props.flash ?? {}) as {
        success?: string;
        error?: string;
    };
    const [notice, setNotice] = useState<{
        variant: 'success' | 'destructive';
        msg: string;
    } | null>(null);
    const [tab, setTab] = useState<Env>(bold.environment);
    const [copied, setCopied] = useState(false);

    const { data, setData, patch, processing } = useForm({
        is_active: bold.is_active,
        environment: bold.environment,
        test_api_key: '',
        test_secret_key: '',
        production_api_key: '',
        production_secret_key: '',
        webhook_secret: '',
    });

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('admin.integrations.bold.update'), {
            preserveScroll: true,
            onSuccess: () =>
                setData({
                    is_active: data.is_active,
                    environment: data.environment,
                    test_api_key: '',
                    test_secret_key: '',
                    production_api_key: '',
                    production_secret_key: '',
                    webhook_secret: '',
                }),
        });
    };

    const placeholder = (has: boolean) =>
        has
            ? 'Configurado · deja en blanco para conservarlo'
            : 'Sin configurar';

    const copyWebhook = async () => {
        try {
            await navigator.clipboard.writeText(bold.webhook_url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            /* clipboard no disponible */
        }
    };

    const apiField = `${tab}_api_key` as const;
    const secretField = `${tab}_secret_key` as const;

    return (
        <AppLayout>
            <Head title="Integraciones · Bold" />
            <div className="mx-auto max-w-3xl space-y-6">
                <div>
                    <h1 className="flex items-center gap-2 font-display text-h3">
                        <Plug className="size-6 text-muted-foreground" />
                        Integraciones · Bold
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Pasarela de pago en línea. Todo se configura desde aquí.
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

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="size-4 text-muted-foreground" />
                                Bold · Pago en línea
                                <span className="ml-auto flex items-center gap-2">
                                    <Badge variant="secondary">
                                        En uso: {ENV_LABEL[bold.environment]}
                                    </Badge>
                                    {bold.enabled ? (
                                        <Badge>Activo</Badge>
                                    ) : (
                                        <Badge variant="outline">
                                            Inactivo
                                        </Badge>
                                    )}
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <Field orientation="horizontal" className="w-auto">
                                <Switch
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(v) =>
                                        setData('is_active', v)
                                    }
                                />
                                <FieldLabel
                                    htmlFor="is_active"
                                    className="font-normal"
                                >
                                    Ofrecer pago en línea a los asociados
                                </FieldLabel>
                            </Field>

                            {/* Pestañas de entorno */}
                            <div className="inline-flex rounded-lg border border-border p-0.5">
                                {(['test', 'production'] as Env[]).map(
                                    (env) => (
                                        <button
                                            key={env}
                                            type="button"
                                            onClick={() => setTab(env)}
                                            className={cn(
                                                'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
                                                tab === env
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'text-muted-foreground hover:text-foreground',
                                            )}
                                        >
                                            {ENV_LABEL[env]}
                                        </button>
                                    ),
                                )}
                            </div>

                            <div className="space-y-4 rounded-lg border border-border p-4">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-sm font-medium text-foreground">
                                        Llaves de {ENV_LABEL[tab]}
                                    </p>
                                    {data.environment === tab ? (
                                        <Badge>Entorno en uso</Badge>
                                    ) : (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setData('environment', tab)
                                            }
                                        >
                                            Usar este entorno
                                        </Button>
                                    )}
                                </div>

                                <FormField id={apiField} label="API key">
                                    <Input
                                        id={apiField}
                                        autoComplete="off"
                                        value={data[apiField]}
                                        onChange={(e) =>
                                            setData(apiField, e.target.value)
                                        }
                                        placeholder={placeholder(
                                            bold.has[apiField],
                                        )}
                                    />
                                </FormField>

                                <FormField id={secretField} label="Secret key">
                                    <Input
                                        id={secretField}
                                        type="password"
                                        autoComplete="new-password"
                                        value={data[secretField]}
                                        onChange={(e) =>
                                            setData(secretField, e.target.value)
                                        }
                                        placeholder={placeholder(
                                            bold.has[secretField],
                                        )}
                                    />
                                </FormField>
                            </div>

                            <p className="text-xs text-muted-foreground">
                                Moneda: {bold.currency}. El pago en línea
                                aparece para los asociados solo cuando esté
                                activo y el entorno en uso tenga llaves.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Webhook */}
                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle className="flex items-center gap-2">
                                <Webhook className="size-4 text-muted-foreground" />
                                Webhook
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Field>
                                <FieldLabel htmlFor="webhook_url">
                                    URL del webhook
                                </FieldLabel>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="webhook_url"
                                        readOnly
                                        value={bold.webhook_url}
                                        className="font-mono"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={copyWebhook}
                                    >
                                        <Copy className="size-4" />
                                        {copied ? 'Copiado' : 'Copiar'}
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Pega esta URL en el panel de Bold para que
                                    nos avise de cada pago.
                                </p>
                            </Field>

                            <FormField
                                id="webhook_secret"
                                label="Secreto del webhook (opcional)"
                                hint="Si Bold entrega un secreto de firma aparte, va aquí; si no, se usa la secret key del entorno en uso."
                            >
                                <Input
                                    id="webhook_secret"
                                    type="password"
                                    autoComplete="new-password"
                                    value={data.webhook_secret}
                                    onChange={(e) =>
                                        setData(
                                            'webhook_secret',
                                            e.target.value,
                                        )
                                    }
                                    placeholder={placeholder(
                                        bold.has.webhook_secret,
                                    )}
                                />
                            </FormField>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Guardando…' : 'Guardar'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
