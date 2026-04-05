import React from 'react';
import { Input } from '@/Components/ui/Input';
import { Globe, Instagram, Facebook, Linkedin, Link } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FieldWrapper } from '@/Components/FieldWrapper';

interface Props {
    data: any;
    setData: (key: string | any, value?: any) => void;
    errors: any;
    isEditing: boolean;
    isLocked: (field: string) => boolean;
    fieldStatus: (field: string) => any;
    auditLog: any;
    setChangeRequestField: (field: string) => void;
}

export default function DigitalChannels({
    data,
    setData,
    errors,
    isEditing,
    isLocked,
    fieldStatus,
    auditLog,
    setChangeRequestField
}: Props) {
    
    const socialPlatforms = [
        { key: 'social_instagram', label: 'Instagram', icon: Instagram, placeholder: '@usuario' },
        { key: 'social_facebook', label: 'Facebook', icon: Facebook, placeholder: 'fb.com/pagina' },
        { key: 'social_linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'linkedin.com/co/...' },
        { key: 'social_other', label: 'Portafolio / Web', icon: Link, placeholder: 'Otros sitios...' },
    ];

    return (
        <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="flex items-center gap-2.5 px-6 py-4 bg-slate-50 border-b border-slate-100">
                <div className="h-7 w-7 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
                    <Globe size={14} className="text-white" />
                </div>
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Canales Digitales</h2>
            </div>

            <div className="p-6 bg-white space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {socialPlatforms.map(platform => (
                        <FieldWrapper
                            key={platform.key}
                            label={platform.label}
                            fieldId={platform.key}
                            auditLog={auditLog}
                            status={fieldStatus(platform.key)}
                            error={errors[platform.key]}
                            onRequestChange={isEditing && fieldStatus(platform.key) === 'approved' ? () => setChangeRequestField(platform.key) : undefined}
                        >
                            <div className="relative group">
                                <platform.icon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-slate-900 transition-colors" />
                                <Input
                                    value={data[platform.key as keyof typeof data] as string}
                                    onChange={e => setData(platform.key as any, e.target.value)}
                                    disabled={isLocked(platform.key)}
                                    placeholder={platform.placeholder}
                                    className={cn(
                                        "pl-9 rounded-xl text-xs h-10 border-slate-200 transition-all focus:border-slate-400 focus:ring-slate-400", 
                                        isLocked(platform.key) && "bg-slate-50 text-slate-400 cursor-not-allowed opacity-80"
                                    )}
                                />
                            </div>
                        </FieldWrapper>
                    ))}
                </div>
            </div>
        </section>
    );
}
