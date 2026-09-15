import { Head, usePage } from '@inertiajs/react';
import {
    Award,
    Building2,
    CheckCircle2,
    FileText,
    Globe,
    Users,
} from 'lucide-react';

import { Alert, AlertTitle } from '@/Components/base/Alert';
import { Button } from '@/Components/base/Button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/Components/base/Card';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/Components/base/Tabs';
import AppLayout from '@/Layouts/AppLayout';

import CertificationsTab, { type Cert } from './Parts/CertificationsTab';
import ClientsTab, { type Client } from './Parts/ClientsTab';
import HistoriaTab from './Parts/HistoriaTab';
import SlugCard from './Parts/SlugCard';
import TeamTab, { type Member } from './Parts/TeamTab';

interface Props {
    slug: string | null;
    micrositeUrl: string;
    about: { story: string | null; image_url: string | null };
    certifications: Cert[];
    team: Member[];
    clients: Client[];
}

export default function QuienesSomos({
    slug,
    micrositeUrl,
    about,
    certifications,
    team,
    clients,
}: Props) {
    const flash = (usePage().props.flash ?? {}) as { success?: string };

    return (
        <AppLayout>
            <Head title="Mi Página · Quiénes somos" />
            <div className="mx-auto max-w-3xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="flex items-center gap-2 font-display text-h3">
                            <Globe className="size-6 text-muted-foreground" />
                            Quiénes somos
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Lo que verá el público en la pestaña «Quiénes somos»
                            de tu micrositio.
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <a href={micrositeUrl} target="_blank" rel="noreferrer">
                            <Globe />
                            Ver mi página
                        </a>
                    </Button>
                </div>

                {flash.success && (
                    <Alert>
                        <CheckCircle2 />
                        <AlertTitle>{flash.success}</AlertTitle>
                    </Alert>
                )}

                <SlugCard slug={slug} micrositeUrl={micrositeUrl} />

                <Card>
                    <CardHeader className="border-b">
                        <CardTitle>Contenido de la sección</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="historia">
                            <TabsList className="mb-6 w-full">
                                <TabsTrigger value="historia">
                                    <FileText />
                                    Historia
                                </TabsTrigger>
                                <TabsTrigger value="certificaciones">
                                    <Award />
                                    Certificaciones ({certifications.length})
                                </TabsTrigger>
                                <TabsTrigger value="equipo">
                                    <Users />
                                    Equipo ({team.length})
                                </TabsTrigger>
                                <TabsTrigger value="clientes">
                                    <Building2 />
                                    Clientes ({clients.length})
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="historia">
                                <HistoriaTab about={about} />
                            </TabsContent>
                            <TabsContent value="certificaciones">
                                <CertificationsTab items={certifications} />
                            </TabsContent>
                            <TabsContent value="equipo">
                                <TeamTab items={team} />
                            </TabsContent>
                            <TabsContent value="clientes">
                                <ClientsTab items={clients} />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
