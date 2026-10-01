import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Building2 } from 'lucide-react';

import PublicLayout from '@/Layouts/PublicLayout';

interface Props {
    companyName: string;
}

// Página amigable cuando una empresa existe pero su micrositio aún no está
// publicado (plan 0025). Reemplaza al 404 crudo. No se indexa.
export default function Unpublished({ companyName }: Props) {
    return (
        <PublicLayout>
            <Head title="Página no disponible">
                <meta name="robots" content="noindex" />
            </Head>

            <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 py-20 text-center">
                <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <Building2 size={32} strokeWidth={1.5} />
                </div>

                <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                    {companyName}
                </h1>
                <p className="mt-3 text-base font-medium text-slate-500">
                    Esta empresa aún no ha publicado su página pública.
                </p>
                <p className="mt-1 text-sm text-slate-400">
                    Vuelve pronto o explora el resto de empresas aliadas.
                </p>

                <Link
                    href={route('companies.index')}
                    className="mt-8 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-slate-800"
                >
                    Ver directorio de empresas
                    <ArrowRight size={16} />
                </Link>
            </div>
        </PublicLayout>
    );
}
