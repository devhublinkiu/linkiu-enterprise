<?php

namespace App\Models;

use App\Services\SubscriptionService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

/**
 * El ENUM real de `status` se amplió por migraciones con `DB::statement` que el análisis
 * estático no lee (queda con la unión estrecha de la primera migración). Se declara aquí
 * como string para reflejar los valores vigentes (draft/verified/approved/…).
 *
 * @property string $status
 * @property-read Collection<int, AssociateContact> $contacts
 * @property-read Collection<int, AssociateReference> $references
 * @property-read Collection<int, Service> $services
 * @property-read Collection<int, AssociateProject> $projects
 * @property-read Collection<int, AssociateCertification> $certifications
 * @property-read Collection<int, AssociateTeamMember> $teamMembers
 * @property-read Collection<int, AssociateClient> $clients
 * @property-read Collection<int, User> $users
 * @property-read Plan|null $plan
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

    /** Nombre de cara al asociado de cada sección revisable. */
    const SECTION_LABELS = [
        'basicinfo' => 'Información Básica',
        'characterization' => 'Caracterización',
        'contacts' => 'Contactos',
        'documentation' => 'Documentación',
        'services' => 'Servicios',
    ];

    /** Ruta del panel donde el asociado edita cada sección. */
    const SECTION_ROUTES = [
        'basicinfo' => 'associate.company.basic',
        'characterization' => 'associate.company.characterization',
        'contacts' => 'associate.company.contacts',
        'documentation' => 'associate.company.documentation',
        'services' => 'associate.company.services',
    ];

    /** Etiqueta visible de una sección (fallback: la propia clave). */
    public static function sectionLabel(string $key): string
    {
        return self::SECTION_LABELS[$key] ?? $key;
    }

    /** URL de edición de una sección (fallback: Información Básica). */
    public static function sectionUrl(string $key): string
    {
        return route(self::SECTION_ROUTES[$key] ?? 'associate.company.basic');
    }

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
        // Micrositio (plan 0021)
        'slug', 'microsite_published', 'whatsapp', 'contact_email', 'about_story',
        'about_image_path', 'facade_paths', 'cover_type', 'microsite_cover_path',
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
        'facade_paths' => 'array',
        'files' => 'array',
        'section_reviews' => 'array',
        'is_public' => 'boolean',
        'is_verified' => 'boolean',
        'plan_expires_at' => 'datetime',
        'deactivated_at' => 'datetime',
        'microsite_published' => 'boolean',
    ];

    // ─── Relationships ────────────────────────────────────────────────────────

    public function contacts(): HasMany
    {
        return $this->hasMany(AssociateContact::class);
    }

    public function references(): HasMany
    {
        return $this->hasMany(AssociateReference::class);
    }

    public function services(): BelongsToMany
    {
        // Pivot enriquecido para el micrositio (plan 0021): descripción y cover por
        // servicio, opcionales. La SELECCIÓN de servicios sigue siendo la sección
        // revisada; aquí solo se adorna lo ya aprobado.
        return $this->belongsToMany(Service::class, 'associate_service')
            ->withPivot(['description', 'cover_path']);
    }

    // ─── Micrositio (plan 0021) ───────────────────────────────────────────────

    public function projects(): HasMany
    {
        return $this->hasMany(AssociateProject::class)->orderBy('sort');
    }

    public function certifications(): HasMany
    {
        return $this->hasMany(AssociateCertification::class)->orderBy('sort');
    }

    public function teamMembers(): HasMany
    {
        return $this->hasMany(AssociateTeamMember::class)->orderBy('sort');
    }

    public function clients(): HasMany
    {
        return $this->hasMany(AssociateClient::class)->orderBy('sort');
    }

    /**
     * Normaliza un texto a slug de micrositio (fuente de verdad, server-side).
     * "Empresa X" → "empresa-x"; "Construcción Ñandú" → "construccion-nandu".
     */
    public static function normalizeSlug(?string $value): string
    {
        return Str::slug((string) $value);
    }

    /**
     * ¿El slug (ya normalizado) está reservado por una ruta del sistema?
     */
    public static function isReservedSlug(string $slug): bool
    {
        return in_array($slug, config('microsite.reserved_slugs', []), true);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function plan(): BelongsTo
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

        $graceDays = BillingSetting::graceDays();

        return now()->lessThanOrEqualTo($this->plan_expires_at->copy()->addDays($graceDays));
    }

    /**
     * Filtra por estado del ciclo de vida DERIVADO (ADR-0007), calcado de
     * adminState()/statusOf pero en SQL para la lista y los contadores. Usa la
     * prórroga GLOBAL. Comparaciones columna-vs-constante (sirven en MySQL y
     * SQLite): activa = vigente hoy; en_gracia = vencida pero dentro de la
     * prórroga; vencida = pasada la prórroga o sin plan. `desactivada` manda
     * sobre el resto (igual que adminState, que la revisa primero).
     *
     * Estados: todas | pendiente | admitida | activa | en_gracia | vencida | desactivada
     */
    public function scopeState($query, string $state)
    {
        $now = now();
        $graceStart = now()->subDays(BillingSetting::graceDays());

        return match ($state) {
            'pendiente' => $query->whereNull('deactivated_at')
                ->whereIn('status', ['draft', 'pending', 'rejected']),
            'admitida' => $query->whereNull('deactivated_at')->where('status', 'verified'),
            'activa' => $query->whereNull('deactivated_at')->where('status', 'approved')
                ->whereNotNull('plan_expires_at')->where('plan_expires_at', '>=', $now),
            'en_gracia' => $query->whereNull('deactivated_at')->where('status', 'approved')
                ->whereNotNull('plan_expires_at')
                ->where('plan_expires_at', '<', $now)
                ->where('plan_expires_at', '>=', $graceStart),
            'vencida' => $query->whereNull('deactivated_at')->where('status', 'approved')
                ->where(fn ($w) => $w->whereNull('plan_id')
                    ->orWhereNull('plan_expires_at')
                    ->orWhere('plan_expires_at', '<', $graceStart)),
            'desactivada' => $query->whereNotNull('deactivated_at'),
            default => $query, // 'todas' o desconocido
        };
    }
}
