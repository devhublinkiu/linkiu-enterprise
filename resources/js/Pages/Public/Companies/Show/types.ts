// Tipos del micrositio público (plan 0021). El payload lo arma
// PublicCompanyController@renderProfile.

export interface CompanyService {
    id: number;
    name: string;
    category: string | null;
    description: string | null;
    cover: string | null;
}

export interface CompanyProject {
    id: number;
    title: string;
    description: string | null;
    client: string | null;
    images: string[];
}

export interface CompanyCertification {
    id: number;
    name: string;
    year: number | null;
    image: string | null;
}

export interface CompanyTeamMember {
    id: number;
    name: string;
    position: string | null;
    photo: string | null;
    email: string | null;
    phone: string | null;
}

export interface CompanyClient {
    id: number;
    name: string;
    logo: string | null;
}

export interface Company {
    id: number;
    name: string;
    slug: string | null;
    nit: string | null;
    is_verified: boolean;
    logo: string | null;
    cover: string | null;
    portada: { type: 'gradient' | 'image'; image: string | null };
    facades: string[];
    about_story: string | null;
    about_image: string | null;
    description: string | null;
    legal: {
        rep_name: string | null;
        main_ciiu: string | null;
        constitution_date: string | null;
        company_type: string[] | string | null;
        address: string | null;
        department: string | null;
        city: string | null;
    };
    contact: {
        phone: string | null;
        whatsapp: string | null;
        email: string | null;
        website: string | null;
        address: string | null;
        facebook: string | null;
        instagram: string | null;
        linkedin: string | null;
    };
    services: CompanyService[];
    projects: CompanyProject[];
    gallery: string[];
    certifications: CompanyCertification[];
    team: CompanyTeamMember[];
    clients: CompanyClient[];
}
