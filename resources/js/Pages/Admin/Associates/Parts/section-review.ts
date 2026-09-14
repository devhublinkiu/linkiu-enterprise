// Datos de la revisión de una sección (ADR-0005). El flujo `change_pending` se retiró
// (plan 0013), por eso el estado ya no lo incluye. Antes vivía en SectionAuditPanel (borrado).

export interface SectionReviewData {
    status: 'draft' | 'pending' | 'approved' | 'rejected';
    rejected_reason?: string;
    reviewed_by?: string;
    reviewed_at?: string;
    submitted_at?: string;
}
