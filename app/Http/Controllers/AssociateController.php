<?php

namespace App\Http\Controllers;

use App\Mail\AssociateApproved;
use App\Mail\AssociateAuditRejected;
use App\Mail\AssociateDocsSubmitted;
use App\Mail\SectionAuditApproved;
use App\Models\Associate;
use App\Models\DocumentRequirement;
use App\Models\PaymentRequest;
use App\Models\Plan;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Services\BillingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AssociateController extends Controller
{
    // ─── Admin: list ─────────────────────────────────────────────────────────

    public function index(Request $request)
    {
        $status = $request->query('status', 'approved');

        $associates = Associate::with('users')
            ->where('status', $status)
            ->select(['id', 'company_name', 'nit', 'city', 'status', 'created_at', 'is_public', 'is_verified', 'section_reviews'])
            ->latest()
            ->get();

        return Inertia::render('Admin/Associates/Index', [
            'associates' => $associates,
            'currentStatus' => $status,
        ]);
    }

    // ─── Shared: append file URLs ─────────────────────────────────────────────

    private function appendFileUrls(Associate $associate): void
    {
        $urls = [];

        if ($associate->logo_path) {
            $urls['logo'] = Storage::url($associate->logo_path);
        }
        if ($associate->cover_path) {
            $urls['cover'] = Storage::url($associate->cover_path);
        }
        if ($associate->files) {
            foreach ($associate->files as $key => $path) {
                $urls[$key] = route('associate.documents.show', ['associate' => $associate->id, 'docKey' => $key]);
            }
        }

        $associate->document_urls = $urls;

        if ($associate->cover_path) {
            $associate->cover_url = Storage::url($associate->cover_path);
        }

        $gallery = [];
        if ($associate->gallery_paths) {
            foreach ($associate->gallery_paths as $path) {
                $gallery[] = ['path' => $path, 'url' => Storage::url($path)];
            }
        }
        $associate->gallery_urls = $gallery;
    }

    // ─── Document catalog helpers ─────────────────────────────────────────────

    private function documentCatalog(): array
    {
        $docs = DocumentRequirement::active()->ordered()->get();

        return [
            'mandatory' => $docs->where('is_required', true)->values()
                ->map(fn ($d) => $d->toCatalogEntry())->all(),
            'optional' => $docs->where('is_required', false)->values()
                ->map(fn ($d) => $d->toCatalogEntry())->all(),
        ];
    }

    /**
     * Returns a flat map of key => spec for all ACTIVE docs.
     * Inactive docs return null and are rejected by validation.
     */
    private function documentSpecsByKey(): array
    {
        return DocumentRequirement::active()
            ->get()
            ->keyBy('key')
            ->map(fn ($d) => $d->toCatalogEntry())
            ->all();
    }

    // =========================================================================
    // BASIC INFO
    // =========================================================================

    public function editBasicInfo()
    {
        $user = auth()->user();
        $associate = Associate::with(['contacts', 'references', 'services'])
            ->where('id', $user->associate_id)->first();

        if ($associate) {
            $this->appendFileUrls($associate);
        }

        return Inertia::render('Associate/Company/BasicInfo/Index', [
            'initialAssociate' => $associate,
        ]);
    }

    /**
     * Marca de tiempo para mostrar al asociado (flashes "Borrador guardado · …").
     * La app persiste en UTC (config/app.php); aquí se convierte a hora de Colombia
     * SOLO para presentación, sin tocar el almacenamiento.
     */
    private function localTimestamp(): string
    {
        return now()->timezone('America/Bogota')->format('d/m/Y H:i:s');
    }

    public function saveBasicInfoDraft(Request $request)
    {
        $user = auth()->user();
        $associate = $user->associate_id
            ? Associate::find($user->associate_id)
            : new Associate;

        // Sección bloqueada salvo en draft/rejected (o nueva). El front oculta los botones,
        // pero el servidor es la autoridad. Ver ADR-0005.
        if ($associate->exists && ! $associate->canEditSection('basicinfo')) {
            return back()->with('error', 'Esta sección no puede editarse en su estado actual.');
        }

        $data = $request->validate([
            'company_name' => 'nullable|string|max:255',
            'initials' => 'nullable|string|max:20',
            'nit' => 'nullable|string|max:30|unique:associates,nit,'.($associate->id ?? 'NULL'),
            'legal_status' => 'nullable|string',
            'legal_status_other' => 'nullable|string',
            'constitution_date' => 'nullable|date',
            'country_origin' => 'nullable|string',
            'phone' => 'nullable|string',
            'website' => 'nullable|string',
            'department' => 'nullable|string',
            'department_id' => 'nullable|integer',
            'city' => 'nullable|string',
            'city_id' => 'nullable|integer',
            'address' => 'nullable|string',
            'rep_name' => 'nullable|string',
            'rep_position' => 'nullable|string',
            'rep_doc_type' => 'nullable|string|max:20',
            'rep_doc' => 'nullable|string|max:50',
        ]);

        if (($data['legal_status'] ?? '') === 'Otro' && ! empty($data['legal_status_other'])) {
            $data['legal_status'] = $data['legal_status_other'];
        }
        unset($data['legal_status_other']);

        $associate->fill($data);

        // Sección: mantener status actual o iniciar en draft
        $sectionStatus = $associate->getSectionStatus('basicinfo');
        if (! in_array($sectionStatus, [Associate::SEC_PENDING, Associate::SEC_APPROVED])) {
            $associate->setSectionStatus('basicinfo', Associate::SEC_DRAFT);
        }

        // Associate status global
        if (! $associate->exists) {
            $associate->status = 'draft';
        }

        $associate->save();

        if (! $user->associate_id) {
            $user->update(['associate_id' => $associate->id]);
        }

        return back()->with('draft_saved', $this->localTimestamp());
    }

    public function updateBasicInfo(Request $request)
    {
        $user = auth()->user();
        $associate = $user->associate_id
            ? Associate::find($user->associate_id)
            : new Associate;

        // Solo permitir enviar si la sección está en estado editable
        if ($associate->exists && ! $associate->canSubmitSection('basicinfo')) {
            return back()->with('error', 'Esta sección no puede enviarse en su estado actual.');
        }

        $data = $request->validate([
            'company_name' => 'required|string|max:255',
            'initials' => 'nullable|string|max:20',
            'nit' => 'required|string|max:30|unique:associates,nit,'.($associate->id ?? 'NULL'),
            'legal_status' => 'required|string',
            'legal_status_other' => 'nullable|string',
            'constitution_date' => 'nullable|date',
            'country_origin' => 'nullable|string',
            'phone' => 'required|string',
            'website' => 'nullable|string',
            'department' => 'required|string',
            'department_id' => 'required|integer',
            'city' => 'required|string',
            'city_id' => 'required|integer',
            'address' => 'required|string',
            'rep_name' => 'required|string',
            'rep_position' => 'required|string',
            'rep_doc_type' => 'required|string|max:20',
            'rep_doc' => 'required|string|max:50',
        ]);

        if (($data['legal_status'] ?? '') === 'Otro' && ! empty($data['legal_status_other'])) {
            $data['legal_status'] = $data['legal_status_other'];
        }
        unset($data['legal_status_other']);

        $associate->fill($data);
        $associate->setSectionStatus('basicinfo', Associate::SEC_PENDING, [
            'submitted_at' => now()->toIso8601String(),
        ]);

        if (! $associate->exists || $associate->status === 'draft') {
            $associate->status = 'pending';
        }

        $associate->save();

        if (! $user->associate_id) {
            $user->update(['associate_id' => $associate->id]);
        }

        return back()->with('success', 'Información básica enviada a revisión.');
    }

    // Reabre una sección aprobada para que el asociado la edite (botón "Editar").
    // approved → draft. El asociado decide cuándo volver a enviarla. Ver ADR-0005.
    public function reopenBasicInfo()
    {
        $user = auth()->user();
        $associate = Associate::findOrFail($user->associate_id);

        if (! $associate->canReopenSection('basicinfo')) {
            return back()->with('error', 'Solo puedes editar una sección que ya fue aprobada.');
        }

        $associate->setSectionStatus('basicinfo', Associate::SEC_DRAFT, [
            'reopened_at' => now()->toIso8601String(),
        ]);
        $associate->save();

        return back()->with('success', 'Sección reabierta para edición. Envíala a revisión cuando termines.');
    }

    // =========================================================================
    // CHARACTERIZATION
    // =========================================================================

    public function editCharacterization()
    {
        $user = auth()->user();
        $associate = Associate::with(['contacts', 'references', 'services'])
            ->where('id', $user->associate_id)->first();

        if ($associate) {
            $this->appendFileUrls($associate);
        }

        return Inertia::render('Associate/Company/Characterization/Index', [
            'initialAssociate' => $associate,
        ]);
    }

    public function saveCharacterizationDraft(Request $request)
    {
        $user = auth()->user();
        $associate = Associate::findOrFail($user->associate_id);

        $data = $request->validate([
            'employees_tech' => 'nullable|integer|min:0',
            'employees_prof' => 'nullable|integer|min:0',
            'employees_admin' => 'nullable|integer|min:0',
            'employees_exec' => 'nullable|integer|min:0',
            'employees_other' => 'nullable|integer|min:0',
            'employees_other_desc' => 'nullable|string',
            'employees_direct_count' => 'nullable|integer|min:0',
            'hydrocarbons_participation' => 'nullable|boolean',
            'hydrocarbons_level' => 'nullable|string',
            'pep_declaration' => 'nullable|boolean',
            'pep_name' => 'nullable|string',
            'pep_doc_type' => 'nullable|string',
            'pep_entity' => 'nullable|string',
            'other_guilds' => 'nullable|string',
            'capacitation_plan' => 'nullable|boolean',
            'capacitation_level' => 'nullable|string',
            'capacitation_no_reason' => 'nullable|string',
            'company_classification' => 'nullable|string',
            'public_income_pct' => 'nullable|integer|min:0|max:100',
            'private_income_pct' => 'nullable|integer|min:0|max:100',
        ]);

        // Sección bloqueada salvo en draft/rejected. El front oculta los botones, pero el
        // servidor es la autoridad. Ver ADR-0005.
        if (! $associate->canEditSection('characterization')) {
            return back()->with('error', 'Esta sección no puede editarse en su estado actual.');
        }

        // employees_direct_count es derivado y los condicionales se limpian al negativo (ADR-0005-b).
        $data = $this->normalizeCharacterization($data);
        $associate->fill($data);
        $associate->setSectionStatus('characterization', Associate::SEC_DRAFT);
        $associate->save();

        return back()->with('draft_saved', $this->localTimestamp());
    }

    public function updateCharacterization(Request $request)
    {
        $user = auth()->user();
        $associate = Associate::findOrFail($user->associate_id);

        if (! $associate->canSubmitSection('characterization')) {
            return back()->with('error', 'Esta sección no puede enviarse en su estado actual.');
        }

        $validator = Validator::make($request->all(), [
            'employees_tech' => 'required|integer|min:0',
            'employees_prof' => 'required|integer|min:0',
            'employees_admin' => 'required|integer|min:0',
            'employees_exec' => 'required|integer|min:0',
            'employees_other' => 'required|integer|min:0',
            'employees_other_desc' => 'nullable|string|max:255',
            // Derivado: se recalcula en el servidor (ADR-0005-b), no se exige del cliente.
            'employees_direct_count' => 'nullable|integer|min:0',
            'hydrocarbons_participation' => 'required|boolean',
            'hydrocarbons_level' => 'nullable|string',
            'pep_declaration' => 'required|boolean',
            'pep_name' => 'nullable|string',
            'pep_doc_type' => 'nullable|string',
            'pep_entity' => 'nullable|string',
            'other_guilds' => 'nullable|string',
            'capacitation_plan' => 'required|boolean',
            'capacitation_level' => 'nullable|string',
            'capacitation_no_reason' => 'nullable|string',
            'company_classification' => 'required|string',
            'public_income_pct' => 'required|integer|min:0|max:100',
            'private_income_pct' => 'required|integer|min:0|max:100',
        ]);

        // Reglas de negocio que la spec exige y el servidor blinda (ADR-0005-b):
        //   1) los ingresos suman exactamente 100%;
        //   2) condicionales obligatorios cuando su disparador es afirmativo.
        $validator->after(function ($v) use ($request) {
            $sum = (int) $request->input('public_income_pct')
                + (int) $request->input('private_income_pct');
            if ($sum !== 100) {
                $msg = "Los ingresos deben sumar exactamente 100% (hoy: {$sum}%).";
                $v->errors()->add('public_income_pct', $msg);
                $v->errors()->add('private_income_pct', $msg);
            }

            if ($request->boolean('hydrocarbons_participation') && ! filled($request->input('hydrocarbons_level'))) {
                $v->errors()->add('hydrocarbons_level', 'Completa este dato para continuar.');
            }

            if ($request->boolean('pep_declaration')) {
                foreach (['pep_name', 'pep_doc_type', 'pep_entity'] as $field) {
                    if (! filled($request->input($field))) {
                        $v->errors()->add($field, 'Completa este dato para continuar.');
                    }
                }
            }

            if ($request->has('capacitation_plan')) {
                if ($request->boolean('capacitation_plan')) {
                    if (! filled($request->input('capacitation_level'))) {
                        $v->errors()->add('capacitation_level', 'Completa este dato para continuar.');
                    }
                } elseif (! filled($request->input('capacitation_no_reason'))) {
                    $v->errors()->add('capacitation_no_reason', 'Completa este dato para continuar.');
                }
            }
        });

        $data = $validator->validate();

        $data = $this->normalizeCharacterization($data);
        $associate->fill($data);
        $associate->setSectionStatus('characterization', Associate::SEC_PENDING, [
            'submitted_at' => now()->toIso8601String(),
        ]);
        $associate->save();

        return back()->with('success', 'Caracterización enviada a revisión.');
    }

    public function reopenCharacterization()
    {
        $user = auth()->user();
        $associate = Associate::findOrFail($user->associate_id);

        if (! $associate->canReopenSection('characterization')) {
            return back()->with('error', 'Solo puedes editar una sección que ya fue aprobada.');
        }

        $associate->setSectionStatus('characterization', Associate::SEC_DRAFT, [
            'reopened_at' => now()->toIso8601String(),
        ]);
        $associate->save();

        return back()->with('success', 'Sección reabierta para edición. Envíala a revisión cuando termines.');
    }

    /**
     * Normaliza los datos de Caracterización antes de persistir (ADR-0005-b):
     *   · employees_direct_count es DERIVADO: se recalcula como la suma de las cinco
     *     categorías (el cliente nunca decide el total; blindaje ante manipulación).
     *   · Los campos condicionales se limpian cuando su disparador es negativo, para no
     *     arrastrar datos huérfanos.
     */
    private function normalizeCharacterization(array $data): array
    {
        $data['employees_direct_count'] =
            (int) ($data['employees_tech'] ?? 0)
            + (int) ($data['employees_prof'] ?? 0)
            + (int) ($data['employees_admin'] ?? 0)
            + (int) ($data['employees_exec'] ?? 0)
            + (int) ($data['employees_other'] ?? 0);

        if (($data['hydrocarbons_participation'] ?? null) === false) {
            $data['hydrocarbons_level'] = null;
        }

        if (($data['pep_declaration'] ?? null) === false) {
            $data['pep_name'] = null;
            $data['pep_doc_type'] = null;
            $data['pep_entity'] = null;
        }

        if (($data['capacitation_plan'] ?? null) === true) {
            $data['capacitation_no_reason'] = null;
        } elseif (($data['capacitation_plan'] ?? null) === false) {
            $data['capacitation_level'] = null;
        }

        return $data;
    }

    // =========================================================================
    // CONTACTS
    // =========================================================================

    public function editContacts()
    {
        $user = auth()->user();
        $associate = Associate::with(['contacts', 'references', 'services'])
            ->where('id', $user->associate_id)->first();

        if ($associate) {
            $this->appendFileUrls($associate);
        }

        return Inertia::render('Associate/Company/Contacts/Index', [
            'initialAssociate' => $associate,
        ]);
    }

    public function saveContactsDraft(Request $request)
    {
        $user = auth()->user();
        $associate = Associate::findOrFail($user->associate_id);

        $data = $request->validate([
            'contacts' => 'nullable|array',
            'contacts.*.area' => 'nullable|string',
            'contacts.*.name' => 'nullable|string',
            'contacts.*.position' => 'nullable|string',
            'contacts.*.email' => 'nullable|string',
            'contacts.*.phone' => 'nullable|string',
            'main_ciiu' => 'nullable|string',
            'secondary_ciiu' => 'nullable|string',
            'billing_email' => 'nullable|string',
            'company_type' => 'nullable|array',
            'references' => 'nullable|array',
            'references.*.type' => 'nullable|string',
            'references.*.name' => 'nullable|string',
            'references.*.contact_person' => 'nullable|string',
            'references.*.position' => 'nullable|string',
            'references.*.phone' => 'nullable|string',
            'references.*.email' => 'nullable|string',
            'social_instagram' => 'nullable|string',
            'social_facebook' => 'nullable|string',
            'social_linkedin' => 'nullable|string',
            'social_other' => 'nullable|string',
        ]);

        // Sección bloqueada salvo en draft/rejected. El front oculta los botones, pero el
        // servidor es la autoridad. Ver ADR-0005 / 0005-c.
        if (! $associate->canEditSection('contacts')) {
            return back()->with('error', 'Esta sección no puede editarse en su estado actual.');
        }

        // Se recortan los textos y se descartan las filas vacías (ADR-0005-c).
        $data = $this->normalizeContacts($data);

        $associate->fill(array_diff_key($data, array_flip(['contacts', 'references'])));
        $associate->setSectionStatus('contacts', Associate::SEC_DRAFT);
        $associate->save();

        if (array_key_exists('contacts', $data)) {
            $associate->contacts()->delete();
            foreach ($data['contacts'] as $contact) {
                $associate->contacts()->create($contact);
            }
        }

        if (array_key_exists('references', $data)) {
            $associate->references()->delete();
            foreach ($data['references'] as $reference) {
                $associate->references()->create($reference);
            }
        }

        return back()->with('draft_saved', $this->localTimestamp());
    }

    public function updateContacts(Request $request)
    {
        $user = auth()->user();
        $associate = Associate::findOrFail($user->associate_id);

        if (! $associate->canSubmitSection('contacts')) {
            return back()->with('error', 'Esta sección no puede enviarse en su estado actual.');
        }

        $validator = Validator::make($request->all(), [
            'contacts' => 'required|array|min:1',
            'contacts.*.area' => 'required|string',
            'contacts.*.name' => 'required|string',
            'contacts.*.position' => 'required|string',
            'contacts.*.email' => 'required|email',
            'contacts.*.phone' => 'required|string',
            'main_ciiu' => 'required|string',
            'secondary_ciiu' => 'nullable|string',
            'billing_email' => 'required|email',
            'company_type' => 'required|array|min:1',
            'references' => 'required|array|min:1',
            'references.*.type' => 'required|in:commercial,bank',
            'references.*.name' => 'required|string',
            'references.*.contact_person' => 'nullable|string',
            'references.*.position' => 'nullable|string',
            'references.*.phone' => 'nullable|string',
            'references.*.email' => 'nullable|email',
            'social_instagram' => 'nullable|string',
            'social_facebook' => 'nullable|string',
            'social_linkedin' => 'nullable|string',
            'social_other' => 'nullable|string',
        ]);

        // Regla propia (ADR-0005-c): una referencia externa sin forma de contacto es
        // inverificable. Cada referencia debe traer teléfono o email (al menos uno).
        $validator->after(function ($v) use ($request) {
            foreach ((array) $request->input('references', []) as $i => $ref) {
                $hasPhone = filled($ref['phone'] ?? null);
                $hasEmail = filled($ref['email'] ?? null);
                if (! $hasPhone && ! $hasEmail) {
                    $msg = 'Agrega teléfono o email para poder verificar la referencia.';
                    $v->errors()->add("references.{$i}.phone", $msg);
                    $v->errors()->add("references.{$i}.email", $msg);
                }
            }
        });

        $data = $this->normalizeContacts($validator->validate());

        $associate->fill(array_diff_key($data, array_flip(['contacts', 'references'])));
        $associate->setSectionStatus('contacts', Associate::SEC_PENDING, [
            'submitted_at' => now()->toIso8601String(),
        ]);
        $associate->save();

        $associate->contacts()->delete();
        foreach ($data['contacts'] as $contact) {
            $associate->contacts()->create($contact);
        }

        $associate->references()->delete();
        foreach ($data['references'] as $reference) {
            $associate->references()->create($reference);
        }

        return back()->with('success', 'Contactos y referencias enviados a revisión.');
    }

    public function reopenContacts()
    {
        $user = auth()->user();
        $associate = Associate::findOrFail($user->associate_id);

        if (! $associate->canReopenSection('contacts')) {
            return back()->with('error', 'Solo puedes editar una sección que ya fue aprobada.');
        }

        $associate->setSectionStatus('contacts', Associate::SEC_DRAFT, [
            'reopened_at' => now()->toIso8601String(),
        ]);
        $associate->save();

        return back()->with('success', 'Sección reabierta para edición. Envíala a revisión cuando termines.');
    }

    /**
     * Normaliza los datos de Contactos antes de persistir (ADR-0005-c):
     *   · recorta los textos de cada contacto/referencia;
     *   · descarta las filas sin nombre (no se guardan contactos ni referencias vacíos).
     */
    private function normalizeContacts(array $data): array
    {
        $clean = fn ($row) => array_map(fn ($v) => is_string($v) ? trim($v) : $v, $row);

        if (isset($data['contacts'])) {
            $data['contacts'] = collect($data['contacts'])
                ->map($clean)
                ->filter(fn ($c) => filled($c['name'] ?? null))
                ->values()
                ->all();
        }

        if (isset($data['references'])) {
            $data['references'] = collect($data['references'])
                ->map($clean)
                ->filter(fn ($r) => filled($r['name'] ?? null))
                ->values()
                ->all();
        }

        return $data;
    }

    // =========================================================================
    // DOCUMENTATION
    // =========================================================================

    public function editDocumentation()
    {
        $user = auth()->user();
        $associate = Associate::with(['contacts', 'references', 'services'])
            ->where('id', $user->associate_id)->first();

        if ($associate) {
            $this->appendFileUrls($associate);
        }

        return Inertia::render('Associate/Company/Documentation/Index', [
            'initialAssociate' => $associate,
            'documentCatalog' => $this->documentCatalog(),
        ]);
    }

    /**
     * Detect the case where PHP silently dropped the request body because it
     * exceeded post_max_size. When that happens, $_POST/$_FILES come back empty
     * even though the browser sent a payload (Content-Length > 0).
     */
    private function postMaxSizeExceeded(Request $request): bool
    {
        $contentLength = (int) $request->server('CONTENT_LENGTH', 0);

        return $request->isMethod('post')
            && $contentLength > 0
            && empty($request->all())
            && empty($_FILES);
    }

    private function maxUploadMb(): int
    {
        $toBytes = function (string $val): int {
            $val = trim($val);
            $num = (int) $val;
            $unit = strtolower(substr($val, -1));

            return match ($unit) {
                'g' => $num * 1024 * 1024 * 1024,
                'm' => $num * 1024 * 1024,
                'k' => $num * 1024,
                default => $num,
            };
        };

        $limits = array_filter([
            $toBytes((string) ini_get('upload_max_filesize')),
            $toBytes((string) ini_get('post_max_size')),
            10 * 1024 * 1024, // our app-level cap
        ]);

        return (int) floor(min($limits) / (1024 * 1024));
    }

    /**
     * Build per-key MIME validation rules for the documents being uploaded.
     */
    private function buildFileValidationRules(Request $request): array
    {
        $specs = $this->documentSpecsByKey();
        $rules = ['files' => 'nullable|array'];

        foreach ((array) $request->file('files', []) as $key => $file) {
            if (! $file) {
                continue;
            }
            if (! isset($specs[$key])) {
                $rules["files.$key"] = 'file|max:0';

                continue;
            }
            $mimes = implode(',', $specs[$key]['accepts']);
            $rules["files.$key"] = "file|mimes:$mimes|max:10240";
        }

        return $rules;
    }

    /**
     * Spanish validation messages for the file rules.
     */
    private function fileValidationMessages(): array
    {
        return [
            'files.*.mimes' => 'El formato del archivo ":input" no está permitido para este documento.',
            'files.*.max' => 'El archivo supera el tamaño máximo permitido (10 MB).',
            'files.*.file' => 'El archivo no es válido.',
        ];
    }

    /**
     * Store one uploaded document, removing the previous file (if any) so we
     * don't leak orphans in storage.
     */
    private function storeAssociateDocument(Associate $associate, string $key, $file, array &$storedFiles): void
    {
        if (! empty($storedFiles[$key])) {
            try {
                Storage::disk(config('filesystems.default'))->delete($storedFiles[$key]);
            } catch (\Throwable $e) {
                Log::warning("No se pudo eliminar archivo anterior de {$key}: ".$e->getMessage());
            }
        }

        $extension = $file->getClientOriginalExtension();
        $fileName = $key.'_'.now()->format('YmdHis').'_'.Str::random(6).'.'.$extension;
        $storedFiles[$key] = $file->storeAs(
            "associates/{$associate->id}/docs",
            $fileName,
            config('filesystems.default')
        );
    }

    public function saveDocumentationDraft(Request $request)
    {
        $user = auth()->user();
        $associate = Associate::findOrFail($user->associate_id);

        if ($this->postMaxSizeExceeded($request)) {
            $max = $this->maxUploadMb();

            return back()->with('error', "Los archivos superan el tamaño máximo que acepta el servidor ({$max} MB en total). Sube archivos más livianos o uno a la vez.");
        }

        $request->validate(array_merge($this->buildFileValidationRules($request), [
            'rep_name' => 'nullable|string|max:255',
            'rep_doc' => 'nullable|string|max:255',
            'membership_interest' => 'nullable|array',
            'membership_interest_other' => 'nullable|string|max:500',
            'funds_origin_declaration' => 'nullable|boolean',
        ], $this->fileValidationMessages()));

        $storedFiles = $associate->files ?? [];

        foreach ((array) $request->file('files', []) as $key => $file) {
            if (! $file) {
                continue;
            }
            $this->storeAssociateDocument($associate, $key, $file, $storedFiles);
        }

        $sectionStatus = $associate->getSectionStatus('documentation');
        if (! in_array($sectionStatus, [Associate::SEC_PENDING, Associate::SEC_APPROVED])) {
            $associate->setSectionStatus('documentation', Associate::SEC_DRAFT);
        }

        $associate->files = $storedFiles;
        $associate->rep_name = $request->rep_name ?? $associate->rep_name;
        $associate->rep_doc = $request->rep_doc ?? $associate->rep_doc;
        $associate->membership_interest = $request->membership_interest ?? $associate->membership_interest;
        $associate->membership_interest_other = $request->membership_interest_other ?? $associate->membership_interest_other;
        if ($request->has('funds_origin_declaration')) {
            $associate->funds_origin_declaration = (bool) $request->boolean('funds_origin_declaration');
        }
        $associate->save();

        return back()->with('draft_saved', $this->localTimestamp());
    }

    public function updateDocumentation(Request $request)
    {
        $user = auth()->user();
        $associate = Associate::findOrFail($user->associate_id);

        if (! $associate->canSubmitSection('documentation')) {
            return back()->with('error', 'Esta sección no puede enviarse en su estado actual.');
        }

        if ($this->postMaxSizeExceeded($request)) {
            $max = $this->maxUploadMb();

            return back()->with('error', "Los archivos superan el tamaño máximo que acepta el servidor ({$max} MB en total). Sube archivos más livianos o uno a la vez.");
        }

        $request->validate(array_merge($this->buildFileValidationRules($request), [
            'funds_origin_declaration' => 'accepted',
            'rep_name' => 'required|string|max:255',
            'rep_doc' => 'required|string|max:255',
            'membership_interest' => 'required|array|min:1',
            'membership_interest_other' => 'nullable|string|max:500|required_if:membership_interest.*,Otro',
        ], $this->fileValidationMessages()));

        $storedFiles = $associate->files ?? [];

        foreach ((array) $request->file('files', []) as $key => $file) {
            if (! $file) {
                continue;
            }
            $this->storeAssociateDocument($associate, $key, $file, $storedFiles);
        }

        // Mandatory docs must all be present (either freshly uploaded or already stored).
        $missing = [];
        foreach ($this->documentCatalog()['mandatory'] as $doc) {
            if (empty($storedFiles[$doc['key']])) {
                $missing[] = $doc['label'];
            }
        }
        if (! empty($missing)) {
            return back()->with('error', 'Faltan documentos obligatorios: '.implode(', ', $missing));
        }

        $associate->setSectionStatus('documentation', Associate::SEC_PENDING, [
            'submitted_at' => now()->toIso8601String(),
        ]);

        $associate->files = $storedFiles;
        $associate->rep_name = $request->rep_name;
        $associate->rep_doc = $request->rep_doc;
        $associate->membership_interest = $request->membership_interest;
        $associate->membership_interest_other = $request->membership_interest_other;
        $associate->funds_origin_declaration = true;
        $associate->save();

        try {
            Mail::to(config('mail.admin_recipient', env('ADMIN_EMAIL')))
                ->send(new AssociateDocsSubmitted($associate));
        } catch (\Exception $e) {
            Log::error('Error enviando alerta de documentos a admin: '.$e->getMessage());
        }

        return back()->with('success', 'Documentación enviada a revisión.');
    }

    public function deleteDocument(Request $request, string $docKey)
    {
        $user = auth()->user();
        $associate = Associate::findOrFail($user->associate_id);

        if (! $associate->canEditSection('documentation')) {
            return back()->with('error', 'No puedes modificar la documentación en su estado actual.');
        }

        $files = $associate->files ?? [];
        if (empty($files[$docKey])) {
            return back()->with('error', 'Documento no encontrado.');
        }

        try {
            Storage::disk(config('filesystems.default'))->delete($files[$docKey]);
        } catch (\Throwable $e) {
            Log::warning("No se pudo eliminar archivo {$docKey}: ".$e->getMessage());
        }

        unset($files[$docKey]);
        $associate->files = $files;
        $associate->save();

        return back()->with('success', 'Documento eliminado.');
    }

    /**
     * Serve an associate document with ownership / admin access control.
     * For S3-compatible drivers (e.g. Minio) we issue a short-lived signed
     * URL; for the local driver we stream the file from storage.
     */
    public function showDocument(Request $request, Associate $associate, string $docKey)
    {
        $user = auth()->user();
        if (! $user) {
            abort(403);
        }

        $isOwner = $user->associate_id === $associate->id;
        $isAdmin = $user->isAdmin();

        if (! $isOwner && ! $isAdmin) {
            abort(403);
        }

        $files = $associate->files ?? [];
        if (empty($files[$docKey])) {
            abort(404);
        }

        $disk = config('filesystems.default');
        $path = $files[$docKey];

        $storage = Storage::disk($disk);
        if (! $storage->exists($path)) {
            abort(404);
        }

        if (in_array($disk, ['s3', 'minio'], true)) {
            return redirect()->away($storage->temporaryUrl($path, now()->addMinutes(10)));
        }

        return $storage->response($path);
    }

    // Reapertura de la sección Documentación por el propio asociado (botón "Editar"),
    // como el resto de secciones ya migradas. Ver ADR-0005 / ADR-0005-e.
    public function reopenDocumentation()
    {
        $user = auth()->user();
        $associate = Associate::findOrFail($user->associate_id);

        if (! $associate->canReopenSection('documentation')) {
            return back()->with('error', 'Solo puedes editar una sección que ya fue aprobada.');
        }

        $associate->setSectionStatus('documentation', Associate::SEC_DRAFT, [
            'reopened_at' => now()->toIso8601String(),
        ]);
        $associate->save();

        return back()->with('success', 'Sección reabierta para edición. Envíala a revisión cuando termines.');
    }

    // =========================================================================
    // ADMIN: audit section
    // =========================================================================

    public function auditSection(Request $request, Associate $associate)
    {
        $request->validate([
            'section' => 'required|in:basicinfo,characterization,contacts,documentation,services',
            'action' => 'required|in:approve,reject',
            'reason' => 'required_if:action,reject|nullable|string|max:1000',
        ]);

        $section = $request->section;
        $action = $request->action;
        $recipientEmail = $associate->users->first()?->email ?? $associate->billing_email;

        if ($action === 'approve') {
            $associate->setSectionStatus($section, Associate::SEC_APPROVED, [
                'reviewed_by' => auth()->user()->name,
                'reviewed_at' => now()->toIso8601String(),
                'rejected_reason' => null,
            ]);

            try {
                if ($recipientEmail) {
                    Mail::to($recipientEmail)->send(
                        new SectionAuditApproved($associate, $section)
                    );
                }
            } catch (\Exception $e) {
                Log::error('Error enviando notificación de aprobación de sección: '.$e->getMessage());
            }
        } else {
            $associate->setSectionStatus($section, Associate::SEC_REJECTED, [
                'rejected_reason' => $request->reason,
                'reviewed_by' => auth()->user()->name,
                'reviewed_at' => now()->toIso8601String(),
            ]);

            try {
                if ($recipientEmail) {
                    Mail::to($recipientEmail)->send(
                        new AssociateAuditRejected($associate, $section, $request->reason)
                    );
                }
            } catch (\Exception $e) {
                Log::error('Error enviando notificación de rechazo de sección: '.$e->getMessage());
            }
        }

        $associate->save();

        return back()->with('success', $action === 'approve' ? 'Sección aprobada.' : 'Sección rechazada.');
    }

    // =========================================================================
    // SERVICES (sin flujo de auditoría por ahora)
    // =========================================================================

    public function editServices()
    {
        $user = auth()->user();
        $associate = Associate::where('id', $user->associate_id)->with('services')->first();

        if ($associate) {
            $this->appendFileUrls($associate);
        }

        $availableServices = Service::with('category')->where('is_active', true)->get();
        $serviceCategories = ServiceCategory::orderBy('order')->orderBy('name')->get();

        return Inertia::render('Associate/Company/Services/Index', [
            'initialAssociate' => $associate,
            'availableServices' => $availableServices,
            'serviceCategories' => $serviceCategories,
        ]);
    }

    public function saveServicesDraft(Request $request)
    {
        $user = auth()->user();
        $associate = Associate::findOrFail($user->associate_id);

        $data = $request->validate([
            'description' => 'nullable|string',
            'service_ids' => 'nullable|array',
            'service_ids.*' => 'exists:services,id',
        ]);

        // Sección bloqueada salvo en draft/rejected (el servidor es la autoridad; ADR-0005).
        if (! $associate->canEditSection('services')) {
            return back()->with('error', 'Esta sección no puede editarse en su estado actual.');
        }

        if (array_key_exists('description', $data)) {
            $associate->description = $data['description'];
        }
        $associate->setSectionStatus('services', Associate::SEC_DRAFT);
        $associate->save();

        if (array_key_exists('service_ids', $data)) {
            $associate->services()->sync($data['service_ids'] ?? []);
        }

        return back()->with('draft_saved', $this->localTimestamp());
    }

    public function updateServices(Request $request)
    {
        $user = auth()->user();
        $associate = Associate::findOrFail($user->associate_id);

        if (! $associate->canSubmitSection('services')) {
            return back()->with('error', 'Esta sección no puede enviarse en su estado actual.');
        }

        $data = $request->validate([
            'description' => 'required|string',
            'service_ids' => 'required|array|min:1',
            'service_ids.*' => 'exists:services,id',
        ]);

        // Límite vía el catálogo de módulos (cae a limit_services si el plan aún
        // no está migrado). null = ilimitado. Ver ADR-0002.
        $plan = $associate->plan;
        $limit = $plan?->limitFor('servicios');

        if ($limit !== null && count($data['service_ids']) > $limit) {
            return back()->with('error', "Tu plan ({$plan->name}) solo permite hasta {$limit} servicios.");
        }

        $associate->description = $data['description'];
        $associate->setSectionStatus('services', Associate::SEC_PENDING, [
            'submitted_at' => now()->toIso8601String(),
        ]);
        $associate->save();
        $associate->services()->sync($data['service_ids']);

        return back()->with('success', 'Servicios enviados a revisión.');
    }

    public function reopenServices()
    {
        $user = auth()->user();
        $associate = Associate::findOrFail($user->associate_id);

        if (! $associate->canReopenSection('services')) {
            return back()->with('error', 'Solo puedes editar una sección que ya fue aprobada.');
        }

        $associate->setSectionStatus('services', Associate::SEC_DRAFT, [
            'reopened_at' => now()->toIso8601String(),
        ]);
        $associate->save();

        return back()->with('success', 'Sección reabierta para edición. Envíala a revisión cuando termines.');
    }

    // =========================================================================
    // GALLERY
    // =========================================================================

    public function editGallery()
    {
        $user = auth()->user();
        $associate = Associate::with('plan')->where('id', $user->associate_id)->first();

        if ($associate) {
            $this->appendFileUrls($associate);
        }

        return Inertia::render('Associate/Company/Gallery', [
            'initialAssociate' => $associate,
        ]);
    }

    public function updateGallery(Request $request)
    {
        $user = auth()->user();
        $associate = Associate::findOrFail($user->associate_id);

        $request->validate([
            'images' => 'required|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,svg|max:5120',
        ]);

        // Límite vía el catálogo de módulos (cae a limit_gallery si el plan aún
        // no está migrado). null = ilimitado. Ver ADR-0002.
        $plan = $associate->plan;
        $limit = $plan?->limitFor('galeria');
        $currentImagesCount = count($associate->gallery_paths ?? []);
        $newImagesCount = count($request->file('images') ?? []);

        if ($limit !== null && ($currentImagesCount + $newImagesCount) > $limit) {
            return back()->with('error', "Has alcanzado el límite de imágenes para tu plan ({$limit} fotos).");
        }

        $disk = config('filesystems.default');
        $galleryPaths = $associate->gallery_paths ?? [];

        foreach ($request->file('images') as $file) {
            $path = $file->store("associates/{$associate->id}/gallery", $disk);
            $galleryPaths[] = $path;
        }

        $associate->update(['gallery_paths' => $galleryPaths]);

        return back()->with('success', 'Imágenes subidas correctamente.');
    }

    public function deleteGalleryImage(Request $request)
    {
        $user = auth()->user();
        $associate = Associate::findOrFail($user->associate_id);

        $request->validate(['path' => 'required|string']);

        $disk = config('filesystems.default');
        $galleryPaths = $associate->gallery_paths ?? [];

        if (($key = array_search($request->path, $galleryPaths)) !== false) {
            unset($galleryPaths[$key]);
            Storage::disk($disk)->delete($request->path);

            if ($associate->cover_path === $request->path) {
                $associate->cover_path = null;
            }

            $associate->update(['gallery_paths' => array_values($galleryPaths)]);

            return back()->with('success', 'Imagen eliminada correctamente.');
        }

        return back()->with('error', 'Imagen no encontrada.');
    }

    public function setCoverImage(Request $request)
    {
        $user = auth()->user();
        $associate = Associate::findOrFail($user->associate_id);

        $request->validate(['path' => 'required|string']);

        if (! in_array($request->path, $associate->gallery_paths ?? [])) {
            return back()->with('error', 'La imagen debe pertenecer a tu galería.');
        }

        $associate->update(['cover_path' => $request->path]);

        return back()->with('success', 'Portada actualizada correctamente.');
    }

    public function uploadLogo(Request $request)
    {
        $user = auth()->user();
        $associate = Associate::findOrFail($user->associate_id);

        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
        ], [
            'logo.image' => 'El archivo debe ser una imagen.',
            'logo.mimes' => 'Solo se aceptan JPG, PNG o WEBP.',
            'logo.max' => 'El logo no puede superar 5 MB.',
        ]);

        $disk = config('filesystems.default');

        if ($associate->logo_path) {
            try {
                Storage::disk($disk)->delete($associate->logo_path);
            } catch (\Throwable $e) {
                Log::warning("No se pudo borrar logo anterior {$associate->logo_path}: ".$e->getMessage());
            }
        }

        $path = $request->file('logo')->store("associates/{$associate->id}/branding", $disk);
        $associate->update(['logo_path' => $path]);

        return back()->with('success', 'Logo actualizado correctamente.');
    }

    public function deleteLogo()
    {
        $user = auth()->user();
        $associate = Associate::findOrFail($user->associate_id);

        if (! $associate->logo_path) {
            return back()->with('error', 'No hay logo para eliminar.');
        }

        $disk = config('filesystems.default');

        try {
            Storage::disk($disk)->delete($associate->logo_path);
        } catch (\Throwable $e) {
            Log::warning("No se pudo borrar logo {$associate->logo_path}: ".$e->getMessage());
        }

        $associate->update(['logo_path' => null]);

        return back()->with('success', 'Logo eliminado.');
    }

    // =========================================================================
    // ADMIN: show associate
    // =========================================================================

    public function show(Associate $associate)
    {
        $associate->load(['contacts', 'references', 'users', 'services.category']);
        $this->appendFileUrls($associate);

        return Inertia::render('Admin/Associates/Show', [
            'associate' => $associate,
            'documentCatalog' => $this->documentCatalog(),
        ]);
    }

    public function adminGalleryUpload(Request $request, Associate $associate)
    {
        $request->validate([
            'images' => 'required|array',
            'images.*' => 'file|image|max:5120',
        ]);

        $disk = config('filesystems.default');
        $paths = $associate->gallery_paths ?? [];
        foreach ($request->file('images') as $file) {
            $paths[] = $file->store('associates/'.$associate->id.'/gallery', $disk);
        }
        $associate->update(['gallery_paths' => $paths]);

        return back()->with('success', 'Imágenes cargadas correctamente.');
    }

    public function adminGalleryDelete(Request $request, Associate $associate)
    {
        $request->validate(['path' => 'required|string']);

        $paths = array_values(array_filter($associate->gallery_paths ?? [], fn ($p) => $p !== $request->path));
        Storage::disk(config('filesystems.default'))->delete($request->path);

        $associate->gallery_paths = $paths;
        if ($associate->cover_path === $request->path) {
            $associate->cover_path = null;
        }
        $associate->save();

        return back()->with('success', 'Imagen eliminada.');
    }

    public function adminGalleryCover(Request $request, Associate $associate)
    {
        $request->validate(['path' => 'required|string']);

        if (! in_array($request->path, $associate->gallery_paths ?? [])) {
            return back()->with('error', 'La imagen no pertenece a la galería.');
        }

        $associate->update(['cover_path' => $request->path]);

        return back()->with('success', 'Portada actualizada.');
    }

    public function approve(Associate $associate)
    {
        $associate->update(['status' => 'verified', 'is_verified' => true]);

        try {
            $recipientEmail = $associate->users->first()?->email ?? $associate->billing_email;
            if ($recipientEmail) {
                Mail::to($recipientEmail)->send(new AssociateApproved($associate));
            }
        } catch (\Exception $e) {
            Log::error('Error enviando correo de aprobación: '.$e->getMessage());
        }

        return redirect()->route('admin.associates.index')
            ->with('success', 'Empresa admitida. El socio puede elegir un plan y realizar el pago.');
    }

    public function togglePublic(Associate $associate)
    {
        $associate->update(['is_public' => ! $associate->is_public]);

        return back()->with('success', 'Visibilidad actualizada.');
    }

    public function toggleVerified(Associate $associate)
    {
        $associate->update(['is_verified' => ! $associate->is_verified]);

        return back()->with('success', 'Estado de verificación actualizado.');
    }

    // =========================================================================
    // BILLING
    // =========================================================================

    public function billing()
    {
        $user = auth()->user();
        $associate = $user->associate_id
            ? Associate::with('plan')->find($user->associate_id)
            : null;

        $subscriptionStatus = 'none';
        $daysRemaining = null;
        $servicesCount = 0;
        $galleryCount = 0;

        if ($associate) {
            $servicesCount = $associate->services()->count();
            $galleryCount = count($associate->gallery_paths ?? []);

            if ($associate->plan_id && $associate->plan_expires_at) {
                if ($associate->isSubscriptionActive()) {
                    $daysRemaining = (int) now()->diffInDays($associate->plan_expires_at, false);
                    $graceDays = $associate->plan->grace_days ?? 0;

                    $subscriptionStatus = $daysRemaining >= 0 ? 'active' : 'grace';
                    if ($subscriptionStatus === 'grace') {
                        $daysRemaining = $graceDays + $daysRemaining;
                    }
                } else {
                    $subscriptionStatus = 'expired';
                    $daysRemaining = 0;
                }
            }
        }

        $paymentRequestRaw = PaymentRequest::with('plan')
            ->where('user_id', $user->id)
            ->whereIn('status', ['pending', 'rejected'])
            ->latest()
            ->first();

        $paymentRequest = null;
        if ($paymentRequestRaw) {
            $showRequest = true;

            if ($paymentRequestRaw->status === 'rejected' && $subscriptionStatus === 'active') {
                if ($associate && $associate->plan_id == $paymentRequestRaw->plan_id) {
                    $showRequest = false;
                }
            }

            if ($showRequest) {
                $paymentRequest = [
                    'id' => $paymentRequestRaw->id,
                    'status' => $paymentRequestRaw->status,
                    'plan_name' => $paymentRequestRaw->plan->name ?? 'Plan',
                    'plan_color' => $paymentRequestRaw->plan->color_hex ?? '#000000',
                    'admin_notes' => $paymentRequestRaw->admin_notes,
                    'created_at' => $paymentRequestRaw->created_at?->format('d/m/Y H:i') ?? '',
                ];
            }
        }

        $availablePlans = Plan::where('is_active', true)->orderBy('price_monthly')->get();

        // Un asociado que venció y no tiene nada pendiente que pagar se queda
        // sin salida: el cron dejó de emitirle y no hay documento que saldar.
        // Se le emite la cuenta de reactivación en el acto.
        // Ver docs/adr/0001-motor-de-cobro-unificado.md
        $billing = app(BillingService::class);
        $pendingInvoices = $associate ? $billing->pendingInvoices($associate) : collect();

        if ($associate
            && in_array($subscriptionStatus, ['grace', 'expired'], true)
            && $pendingInvoices->isEmpty()
            && ! $paymentRequest
        ) {
            $reactivation = $billing->issueReactivationInvoice($associate);

            if ($reactivation) {
                $billing->notify($reactivation);
                $pendingInvoices = $billing->pendingInvoices($associate);
            }
        }

        return Inertia::render('Associate/Billing/Index', [
            'currentPlan' => $associate?->plan,
            'subscriptionStatus' => $subscriptionStatus,
            'daysRemaining' => $daysRemaining,
            'planExpiresAt' => $associate?->plan_expires_at?->format('d/m/Y'),
            'billingCycle' => $associate?->billing_cycle ?? 'monthly',
            'usage' => ['services' => $servicesCount, 'gallery' => $galleryCount],
            'availablePlans' => $availablePlans,
            'paymentRequest' => $paymentRequest,
            'pendingInvoices' => $pendingInvoices->map(fn ($inv) => [
                'id' => $inv->id,
                'period' => $inv->period,
                'amount' => $inv->amount,
                'due_date' => $inv->due_date?->format('d/m/Y'),
                'is_overdue' => $inv->due_date ? $inv->due_date->isPast() : false,
                'notes' => $inv->notes,
            ])->values(),
        ]);
    }
}
