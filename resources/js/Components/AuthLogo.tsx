import { ShieldCheck } from 'lucide-react';
import * as React from 'react';

// Logo de las pantallas de autenticación. Si la imagen no carga, muestra un ícono
// de respaldo mediante estado React (sin manipular el DOM a mano).
export function AuthLogo() {
    const [failed, setFailed] = React.useState(false);

    if (failed) {
        return (
            <div className="flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <ShieldCheck className="size-6" />
            </div>
        );
    }

    return (
        <img
            src="/images/camep/logo_camep_vertical_auth.svg"
            alt="CAMEP"
            className="h-20 w-auto object-contain"
            onError={() => setFailed(true)}
        />
    );
}
