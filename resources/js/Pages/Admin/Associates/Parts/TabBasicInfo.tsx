import React from 'react';
import { Building2, Globe, User } from 'lucide-react';
import { TabsContent } from '@/Components/ui/Tabs';
import { AuditSection } from './AuditSection';

interface TabBasicInfoProps {
    associate: any;
    auditState: any;
    getFieldStatus: (field: string) => string;
    getChangeRequest: (field: string) => any;
    handleAudit: (field: string, status: string, reason?: string) => void;
}

export function TabBasicInfo({ associate, auditState, getFieldStatus, getChangeRequest, handleAudit }: TabBasicInfoProps) {
    return (
        <TabsContent value="basic" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AuditSection 
                    title="Identidad Corporativa" 
                    icon={Building2}
                    onAudit={handleAudit}
                    items={[
                        { id: 'company_name', label: 'Nombre Empresa', value: associate.company_name, required: true, status: getFieldStatus('company_name') as any, reason: auditState['company_name']?.reason, changeRequest: getChangeRequest('company_name') },
                        { id: 'nit', label: 'NIT', value: associate.nit, required: true, status: getFieldStatus('nit') as any, reason: auditState['nit']?.reason, changeRequest: getChangeRequest('nit') },
                        { id: 'initials', label: 'Sigla', value: associate.initials, status: getFieldStatus('initials') as any, reason: auditState['initials']?.reason, changeRequest: getChangeRequest('initials') },
                        { id: 'legal_status', label: 'Tipo Sociedad', value: associate.legal_status, required: true, status: getFieldStatus('legal_status') as any, reason: auditState['legal_status']?.reason, changeRequest: getChangeRequest('legal_status') },
                        { id: 'constitution_date', label: 'Fecha Constitución', value: associate.constitution_date ? associate.constitution_date.split('T')[0] : null, status: getFieldStatus('constitution_date') as any, reason: auditState['constitution_date']?.reason, changeRequest: getChangeRequest('constitution_date') },
                        { id: 'country_origin', label: 'País de Origen', value: associate.country_origin, status: getFieldStatus('country_origin') as any, reason: auditState['country_origin']?.reason, changeRequest: getChangeRequest('country_origin') },
                    ]}
                />

                <AuditSection 
                    title="Ubicación y Contacto" 
                    icon={Globe}
                    onAudit={handleAudit}
                    items={[
                        { id: 'department', label: 'Departamento', value: associate.department, required: true, status: getFieldStatus('department') as any, reason: auditState['department']?.reason, changeRequest: getChangeRequest('department') },
                        { id: 'city', label: 'Ciudad / Municipio', value: associate.city, required: true, status: getFieldStatus('city') as any, reason: auditState['city']?.reason, changeRequest: getChangeRequest('city') },
                        { id: 'address', label: 'Dirección Completa', value: associate.address, required: true, status: getFieldStatus('address') as any, reason: auditState['address']?.reason, changeRequest: getChangeRequest('address') },
                        { id: 'phone', label: 'Teléfono Principal', value: associate.phone, required: true, status: getFieldStatus('phone') as any, reason: auditState['phone']?.reason, changeRequest: getChangeRequest('phone') },
                        { id: 'website', label: 'Sitio Web', value: associate.website, status: getFieldStatus('website') as any, reason: auditState['website']?.reason, changeRequest: getChangeRequest('website') },
                    ]}
                />

                <AuditSection 
                    title="Representante Legal" 
                    icon={User}
                    onAudit={handleAudit}
                    items={[
                        { id: 'rep_name', label: 'Nombre Completo', value: associate.rep_name, required: true, status: getFieldStatus('rep_name') as any, reason: auditState['rep_name']?.reason, changeRequest: getChangeRequest('rep_name') },
                        { id: 'rep_doc_type', label: 'Tipo Documento', value: associate.rep_doc_type, required: true, status: getFieldStatus('rep_doc_type') as any, reason: auditState['rep_doc_type']?.reason, changeRequest: getChangeRequest('rep_doc_type') },
                        { id: 'rep_doc', label: 'Documento Identidad', value: associate.rep_doc, required: true, status: getFieldStatus('rep_doc') as any, reason: auditState['rep_doc']?.reason, changeRequest: getChangeRequest('rep_doc') },
                        { id: 'rep_position', label: 'Cargo', value: associate.rep_position, required: true, status: getFieldStatus('rep_position') as any, reason: auditState['rep_position']?.reason, changeRequest: getChangeRequest('rep_position') },
                    ]}
                />
            </div>
        </TabsContent>
    );
}
