import { AuthLogo } from '@/Components/AuthLogo';
import { Head, Link } from '@inertiajs/react';
import * as React from 'react';
import { DetailsStep } from './register/DetailsStep';
import { EmailStep } from './register/EmailStep';
import { OtpStep } from './register/OtpStep';

type Step = 'email' | 'otp' | 'details';

export default function Register() {
    const [step, setStep] = React.useState<Step>('email');
    const [email, setEmail] = React.useState('');

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted p-6 font-sans antialiased">
            <Head title="Registrarse" />

            <div className="w-full max-w-sm space-y-6">
                <div className="flex flex-col items-center gap-3 text-center">
                    <AuthLogo />
                    <p className="text-small text-muted-foreground">
                        Crea tu cuenta corporativa para empezar.
                    </p>
                </div>

                {step === 'email' && (
                    <EmailStep
                        onSent={(value) => {
                            setEmail(value);
                            setStep('otp');
                        }}
                    />
                )}

                {step === 'otp' && (
                    <OtpStep
                        email={email}
                        onVerified={() => setStep('details')}
                        onBack={() => setStep('email')}
                    />
                )}

                {step === 'details' && <DetailsStep email={email} />}

                <div className="text-center text-small text-muted-foreground">
                    ¿Ya tienes una cuenta?{' '}
                    <Link
                        href={route('login')}
                        className="font-medium text-foreground underline underline-offset-4"
                    >
                        Inicia sesión
                    </Link>
                </div>
            </div>
        </div>
    );
}
