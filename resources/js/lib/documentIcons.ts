import {
    FileText,
    Image as ImageIcon,
    FileSpreadsheet,
    FileDigit,
    Landmark,
    ShieldCheck,
    FileCheck,
    CheckCircle2,
    Check,
    Scale,
    Share2,
    Building2,
    Building,
    FileSignature,
    Briefcase,
    GraduationCap,
    Receipt,
    Lock,
    Award,
} from 'lucide-react';

/**
 * Icons the admin can choose from when creating/editing a required document.
 * MUST stay in sync with the ALLOWED_ICONS constant in
 * App\Http\Controllers\Admin\DocumentRequirementController.
 */
export const DOCUMENT_ICON_MAP: Record<string, any> = {
    FileText,
    Image: ImageIcon,
    FileSpreadsheet,
    FileDigit,
    Landmark,
    ShieldCheck,
    FileCheck,
    CheckCircle2,
    Check,
    Scale,
    Share2,
    Building2,
    Building,
    FileSignature,
    Briefcase,
    GraduationCap,
    Receipt,
    Lock,
    Award,
};

export function getDocumentIcon(name: string | undefined | null) {
    if (!name) return FileText;
    return DOCUMENT_ICON_MAP[name] || FileText;
}
