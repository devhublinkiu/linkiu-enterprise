<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Associate extends Model
{
    const REVIEWABLE_SECTIONS = ['basicinfo', 'characterization', 'contacts', 'documentation'];

    // Section status constants
    const SEC_DRAFT            = 'draft';
    const SEC_PENDING          = 'pending';
    const SEC_APPROVED         = 'approved';
    const SEC_REJECTED         = 'rejected';
    const SEC_CHANGE_PENDING   = 'change_pending';

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
    ];

    protected $casts = [
        'constitution_date'       => 'date',
        'hydrocarbons_participation' => 'boolean',
        'pep_declaration'         => 'boolean',
        'funds_origin_declaration'=> 'boolean',
        'capacitation_plan'       => 'boolean',
        'company_type'            => 'array',
        'membership_interest'     => 'array',
        'gallery_paths'           => 'array',
        'files'                   => 'array',
        'section_reviews'         => 'array',
        'is_public'               => 'boolean',
        'is_verified'             => 'boolean',
        'plan_expires_at'         => 'datetime',
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

    public function canRequestSectionChange(string $section): bool
    {
        return $this->getSectionStatus($section) === self::SEC_APPROVED;
    }

    // ─── Subscription ─────────────────────────────────────────────────────────

    public function isSubscriptionActive(): bool
    {
        if (!$this->plan_id || !$this->plan_expires_at) {
            return false;
        }

        $graceDays = $this->plan->grace_days ?? 0;
        return now()->lessThanOrEqualTo($this->plan_expires_at->addDays($graceDays));
    }
}
