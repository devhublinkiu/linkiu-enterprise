import React from 'react';
import { Briefcase, Layers, ShieldAlert } from 'lucide-react';
import { TabsContent } from '@/Components/ui/Tabs';
import { AuditSection } from './AuditSection';

interface TabCharacterizationProps {
    associate: any;
    auditState: any;
    getFieldStatus: (field: string) => string;
    getChangeRequest: (field: string) => any;
    handleAudit: (field: string, status: string, reason?: string) => void;
}

export function TabCharacterization({ associate, auditState, getFieldStatus, getChangeRequest, handleAudit }: TabCharacterizationProps) {
    return (
        <TabsContent value="characterization" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AuditSection 
                    title="Estructura de Empleados" 
                    icon={Briefcase}
                    onAudit={handleAudit}
                    items={[
                        { id: 'employees_direct_count', label: 'Total Empleados Directos', value: associate.employees_direct_count, status: getFieldStatus('employees_direct_count') as any, reason: auditState['employees_direct_count']?.reason, required: true, changeRequest: getChangeRequest('employees_direct_count') },
                        { id: 'employees_tech', label: 'Personal Técnico', value: associate.employees_tech, status: getFieldStatus('employees_tech') as any, reason: auditState['employees_tech']?.reason, changeRequest: getChangeRequest('employees_tech') },
                        { id: 'employees_prof', label: 'Personal Profesional', value: associate.employees_prof, status: getFieldStatus('employees_prof') as any, reason: auditState['employees_prof']?.reason, changeRequest: getChangeRequest('employees_prof') },
                        { id: 'employees_admin', label: 'Personal Administrativo', value: associate.employees_admin, status: getFieldStatus('employees_admin') as any, reason: auditState['employees_admin']?.reason, changeRequest: getChangeRequest('employees_admin') },
                        { id: 'employees_exec', label: 'Personal Directivo', value: associate.employees_exec, status: getFieldStatus('employees_exec') as any, reason: auditState['employees_exec']?.reason, changeRequest: getChangeRequest('employees_exec') },
                        { id: 'employees_other', label: 'Otros Perfiles', value: associate.employees_other || 0, status: getFieldStatus('employees_other') as any, reason: auditState['employees_other']?.reason, changeRequest: getChangeRequest('employees_other') },
                        { id: 'employees_other_desc', label: 'Descripción Otros Perfiles', value: associate.employees_other_desc, status: getFieldStatus('employees_other_desc') as any, reason: auditState['employees_other_desc']?.reason, changeRequest: getChangeRequest('employees_other_desc') },
                        { id: 'company_classification', label: 'Clasificación Empresa', value: associate.company_classification, status: getFieldStatus('company_classification') as any, reason: auditState['company_classification']?.reason, required: true, changeRequest: getChangeRequest('company_classification') },
                    ]}
                />

                <div className="space-y-6">
                    <AuditSection
                        title="Actividad e Ingresos"
                        icon={Layers}
                        onAudit={handleAudit}
                        items={[
                            { id: 'hydrocarbons_participation', label: 'Participación Hidrocarburos', value: associate.hydrocarbons_participation === null ? null : (associate.hydrocarbons_participation ? 'SÍ' : 'NO'), status: getFieldStatus('hydrocarbons_participation') as any, reason: auditState['hydrocarbons_participation']?.reason, changeRequest: getChangeRequest('hydrocarbons_participation') },
                            ...(associate.hydrocarbons_participation ? [
                                { id: 'hydrocarbons_level', label: 'Alcance Hidrocarburos', value: associate.hydrocarbons_level, status: getFieldStatus('hydrocarbons_level') as any, reason: auditState['hydrocarbons_level']?.reason, changeRequest: getChangeRequest('hydrocarbons_level') },
                            ] : []),
                            { id: 'private_income_pct', label: '% Ingresos Privados', value: associate.private_income_pct ? `${associate.private_income_pct}%` : null, status: getFieldStatus('private_income_pct') as any, reason: auditState['private_income_pct']?.reason, required: true, changeRequest: getChangeRequest('private_income_pct') },
                            { id: 'public_income_pct', label: '% Ingresos Públicos', value: associate.public_income_pct ? `${associate.public_income_pct}%` : null, status: getFieldStatus('public_income_pct') as any, reason: auditState['public_income_pct']?.reason, required: true, changeRequest: getChangeRequest('public_income_pct') },
                        ]}
                    />

                    <AuditSection
                        title="PEP y Transparencia"
                        icon={ShieldAlert}
                        onAudit={handleAudit}
                        items={[
                            { id: 'pep_declaration', label: 'Declaración PEP', value: associate.pep_declaration === null ? null : (associate.pep_declaration ? 'SÍ' : 'NO'), status: getFieldStatus('pep_declaration') as any, reason: auditState['pep_declaration']?.reason, changeRequest: getChangeRequest('pep_declaration') },
                            ...(associate.pep_declaration ? [
                                { id: 'pep_name', label: 'Nombre del PEP', value: associate.pep_name, status: getFieldStatus('pep_name') as any, reason: auditState['pep_name']?.reason, changeRequest: getChangeRequest('pep_name') },
                                { id: 'pep_doc_type', label: 'Tipo Documento PEP', value: associate.pep_doc_type, status: getFieldStatus('pep_doc_type') as any, reason: auditState['pep_doc_type']?.reason, changeRequest: getChangeRequest('pep_doc_type') },
                                { id: 'pep_entity', label: 'Entidad del PEP', value: associate.pep_entity, status: getFieldStatus('pep_entity') as any, reason: auditState['pep_entity']?.reason, changeRequest: getChangeRequest('pep_entity') },
                            ] : []),
                            { id: 'capacitation_plan', label: 'Plan de Capacitación', value: associate.capacitation_plan === null ? null : (associate.capacitation_plan ? 'SÍ' : 'NO'), status: getFieldStatus('capacitation_plan') as any, reason: auditState['capacitation_plan']?.reason, required: true, changeRequest: getChangeRequest('capacitation_plan') },
                            ...(associate.capacitation_plan === true ? [
                                { id: 'capacitation_level', label: 'Prioridad Capacitación', value: associate.capacitation_level, status: getFieldStatus('capacitation_level') as any, reason: auditState['capacitation_level']?.reason, changeRequest: getChangeRequest('capacitation_level') },
                            ] : []),
                            ...(associate.capacitation_plan === false ? [
                                { id: 'capacitation_no_reason', label: 'Motivo Sin Plan', value: associate.capacitation_no_reason, status: getFieldStatus('capacitation_no_reason') as any, reason: auditState['capacitation_no_reason']?.reason, changeRequest: getChangeRequest('capacitation_no_reason') },
                            ] : []),
                            { id: 'other_guilds', label: 'Otros Gremios', value: associate.other_guilds, status: getFieldStatus('other_guilds') as any, reason: auditState['other_guilds']?.reason, changeRequest: getChangeRequest('other_guilds') },
                        ]}
                    />
                </div>
            </div>
        </TabsContent>
    );
}
