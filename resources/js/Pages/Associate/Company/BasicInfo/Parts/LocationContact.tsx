import React from 'react';
import { Input } from '@/Components/ui/Input';
import { SearchableSelect } from '@/Components/ui/SearchableSelect';
import { FieldWrapper } from '@/Components/FieldWrapper';
import { MapPin, Phone, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
    data: any;
    setData: (key: string | any, value?: any) => void;
    errors: any;
    isEditing: boolean;
    isLocked: (field: string) => boolean;
    fieldStatus: (field: string) => any;
    isRequired: (field: string) => boolean;
    auditLog: any;
    setChangeRequestField: (field: string) => void;
    departments: any[];
    cities: any[];
    loadingDeps: boolean;
    loadingCities: boolean;
}

export default function LocationContact({
    data,
    setData,
    errors,
    isEditing,
    isLocked,
    fieldStatus,
    isRequired,
    auditLog,
    setChangeRequestField,
    departments,
    cities,
    loadingDeps,
    loadingCities
}: Props) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="flex items-center gap-2.5 px-6 py-4 bg-slate-50 border-b border-slate-100">
                <div className="h-7 w-7 rounded-lg bg-slate-900 flex items-center justify-center">
                    <MapPin size={14} className="text-white" />
                </div>
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Ubicación y Contacto</h2>
            </div>

            <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FieldWrapper
                        label="Departamento"
                        fieldId="department"
                        auditLog={auditLog}
                        required={isRequired('department')}
                        status={fieldStatus('department')}
                        error={errors.department}
                        onRequestChange={isEditing && fieldStatus('department') === 'approved' ? () => setChangeRequestField('department') : undefined}
                    >
                        <SearchableSelect
                            options={departments.map(d => ({ id: d.id, name: d.name }))}
                            value={data.department}
                            onChange={(opt: any) =>
                                setData((d: any) => ({
                                    ...d,
                                    department: opt.name,
                                    department_id: opt.id,
                                    city: '',
                                    city_id: ''
                                }))
                            }
                            placeholder="Buscar departamento..."
                            disabled={isLocked('department')}
                            loading={loadingDeps}
                        />
                    </FieldWrapper>

                    <FieldWrapper
                        label="Ciudad"
                        fieldId="city"
                        auditLog={auditLog}
                        required={isRequired('city')}
                        status={fieldStatus('city')}
                        error={errors.city}
                        onRequestChange={isEditing && fieldStatus('city') === 'approved' ? () => setChangeRequestField('city') : undefined}
                    >
                        <SearchableSelect
                            options={cities.map(c => ({ id: c.id, name: c.name }))}
                            value={data.city}
                            onChange={(opt: any) => setData((d: any) => ({ ...d, city: opt.name, city_id: opt.id }))}
                            placeholder={data.department_id ? "Buscar ciudad..." : "Primero elige departamento"}
                            disabled={isLocked('city') || !data.department_id}
                            loading={loadingCities}
                        />
                    </FieldWrapper>
                </div>

                <FieldWrapper label="Dirección" 
                    fieldId="address"
                    auditLog={auditLog}
                    status={fieldStatus('address')} 
                    error={errors.address}
                    required={isRequired('address')}
                    onRequestChange={isEditing && fieldStatus('address') === 'approved' ? () => setChangeRequestField('address') : undefined}
                >
                    <Input
                        value={data.address}
                        onChange={e => setData('address', e.target.value)}
                        disabled={isLocked('address')}
                        placeholder="Ej. Calle 15 # 8-42, Oficina 301"
                        className={cn("text-sm", isLocked('address') && "bg-slate-50 text-slate-500 cursor-not-allowed")}
                    />
                </FieldWrapper>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FieldWrapper
                        label="Teléfono"
                        fieldId="phone"
                        auditLog={auditLog}
                        required={isRequired('phone')}
                        status={fieldStatus('phone')}
                        error={errors.phone}
                        icon={Phone}
                        onRequestChange={isEditing && fieldStatus('phone') === 'approved' ? () => setChangeRequestField('phone') : undefined}
                    >
                        <Input
                            value={data.phone}
                            onChange={e => setData('phone', e.target.value)}
                            disabled={isLocked('phone')}
                            placeholder="Ej. +57 300 123 4567"
                            className={cn("text-sm", isLocked('phone') && "bg-slate-50 text-slate-500 cursor-not-allowed")}
                        />
                    </FieldWrapper>

                    <FieldWrapper
                        label="Página Web"
                        fieldId="website"
                        auditLog={auditLog}
                        status={fieldStatus('website')}
                        error={errors.website}
                        icon={Globe}
                        onRequestChange={isEditing && fieldStatus('website') === 'approved' ? () => setChangeRequestField('website') : undefined}
                    >
                        <Input
                            value={data.website}
                            onChange={e => setData('website', e.target.value)}
                            disabled={isLocked('website')}
                            placeholder="Ej. https://miempresa.com"
                            className={cn("text-sm", isLocked('website') && "bg-slate-50 text-slate-500 cursor-not-allowed")}
                        />
                    </FieldWrapper>
                </div>
            </div>
        </section>
    );
}
