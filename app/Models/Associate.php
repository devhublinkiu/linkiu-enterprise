<?php

namespace App\Models;

use App\Services\SubscriptionService;
use Illuminate\Database\Eloquent\Model;

/**
 * El ENUM real de `status` se amplió por migraciones con `DB::statement` que el análisis
 * estático no lee (queda con la unión estrecha de la primera migración). Se declara aquí
 * como string para reflejar los valores vigentes (draft/verified/approved/…).
 *
 * @property string $status
 */
class Associate extends Model
{
    // Secciones que se revisan y que definen "perfil 100%". Incluye services (ADR-0007 / plan 0014):
    // es la única fuente para el gate de admisión y la barra de progreso.
    const REVIEWABLE_SECTIONS = ['basicinfo', 'characterization', 'contacts', 'documentation', 'services'];

    // Día del mes en que vence la suscripción (corte de facturación que se llevaba manualmente)
    const BILLING_DAY = 19;

    // Section status constants
    const SEC_DRAFT = 'draft';

    const SEC_PENDING = 'pending';

    const SEC_APPROVED = 'approved';

    const SEC_REJECTED = 'rejected';

    protected $fillable = [
        'company_name', 'initials', 'description', 'legal_status', 'constitution_date',
        'country_origin', 'nit', 'address', 'department', 'department_id', 'city', 'city_id', 'phone',
        'website', 'rep_name', 'rep_position', 'rep_doc', 'rep_doc_type', 'company_classification',
        'employees_direct_count', 'employees_tech', 'employees_prof',
        'employees_admin', 'employees_exec', 'employees_other',
        'employees_other_desc', 'hydrocarbons_participation',
        'hydrocarbons_level', 'private_income_pct', 'public_income_pct',
        'pep_declaration', 'pep_name', 'pep_doc_type', 'pep_entity',
        'other_guilds', 'funds_origin_declaration', 'main_ciiu',
        'secondary_ciiu', 'billing_email', 'company_type',
        'social_instagram', 'social_facebook', 'social_linkedin', 'social_other',
        'capacitation_plan', 'capacitation_level', 'capacitation_no_reason',
        'membership_interest', 'membership_interest_other', 'logo_path', 'cover_path', 'gallery_paths', 'files',
        'section_reviews', 'status', 'is_public', 'is_verified', 'plan_id', 'plan_expires_at',
        'billing_cycle', 'deactivated_at',
    ];

    protected $casts = [
        'constitution_date' => 'date',
        'hydrocarbons_participation' => 'boolean',
        'pep_declaration' => 'boolean',
        'funds_origin_declaration' => 'boolean',
        'capacitation_plan' => 'boolean',
        'company_type' => 'array',
        'membership_interest' => 'array',
        'gallery_paths' => 'array',
        'files' => 'array',
        'section_reviews' => 'array',
        'is_public' => 'boolean',
        'is_verified' => 'boolean',
        'plan_expires_at' => 'datetime',
        'deactivated_at' => 'datetime',
    ];

    // ─── Relationships ────────────────────────────────────────────────────────

    public function contacts()
    {
        return $this->hasMany(AssociateContact::class);
    }

    public function references()
    {
        return $this->hasMany(AssociateReference::class);
    }

    public function services()
    {
        return $this->belongsToMany(Service::class, 'associate_service');
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    // ─── Section reviews helpers ──────────────────────────────────────────────

    public function getSectionReview(string $section): array
    {
        return ($this->section_reviews ?? [])[$section] ?? ['status' => self::SEC_DRAFT];
    }

    public function getSectionStatus(string $section): string
    {
        return $this->getSectionReview($section)['status'] ?? self::SEC_DRAFT;
    }

    public function setSectionStatus(string $section, string $status, array $extra = []): void
    {
        $reviews = $this->section_reviews ?? [];
        $reviews[$section] = array_merge($reviews[$section] ?? [], ['status' => $status], $extra);
        $this->section_reviews = $reviews;
    }

    public function canEditSection(string $section): bool
    {
        return in_array($this->getSectionStatus($section), [
            self::SEC_DRAFT,
            self::SEC_REJECTED,
        ]);
    }

    public function canSubmitSection(string $section): bool
    {
        return $this->canEditSection($section);
    }

    // Reapertura de una sección aprobada por el propio asociado (botón "Editar").
    // Reemplaza al flujo de solicitud de cambio para las secciones ya migradas al
    // modelo de 4 estados. Ver ADR-0005 / plan 0007.
    public function canReopenSection(string $section): bool
    {
        return $this->getSectionStatus($section) === self::SEC_APPROVED;
    }

    // Perfil "100%": todas las secciones revisables están aprobadas. Gate de admisión (ADR-0007).
    public function allSectionsApproved(): bool
    {
        foreach (self::REVIEWABLE_SECTIONS as $section) {
            if ($this->getSectionStatus($section) !== self::SEC_APPROVED) {
                return false;
            }
        }

        return true;
    }

    // ─── Admin lifecycle state (derivado, no se guarda) ────────────────────────
    // Une ciclo de vida (status) + suscripción + desactivación manual en un solo estado
    // que "habla" en la lista/detalle admin. Ver ADR-0007 / plan 0014.
    //   pendiente | admitida_sin_pago | activa | en_gracia | vencida | desactivada

    public function adminState(): string
    {
        if ($this->deactivated_at !== null) {
            return 'desactivada';
        }

        // Cast a string: el ENUM real incluye verified/approved, pero el tipo inferido por
        // el análisis estático es más estrecho; el cast evita falsos "always false".
        $status = (string) $this->status;

        if ($status === 'verified') {
            return 'admitida_sin_pago';
        }

        if ($status === 'approved') {
            return match (SubscriptionService::statusOf($this)) {
                'active' => 'activa',
                'grace' => 'en_gracia',
                default => 'vencida', // expired | none
            };
        }

        // draft | pending | rejected | (active legacy sin uso)
        return 'pendiente';
    }

    // ─── Subscription ─────────────────────────────────────────────────────────

    public function isSubscriptionActive(): bool
    {
        if (! $this->plan_id || ! $this->plan_expires_at) {
            return false;
        }

        $graceDays = $this->plan->grace_days ?? 0;

        return now()->lessThanOrEqualTo($this->plan_expires_at->addDays($graceDays));
    }
}
