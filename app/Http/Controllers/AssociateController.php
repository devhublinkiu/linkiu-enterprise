<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Associate;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class AssociateController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->query('status', 'approved');
        
        $associates = Associate::with('users')
            ->where('status', $status)
            ->select(['id', 'company_name', 'nit', 'city', 'status', 'created_at', 'is_public', 'is_verified'])
            ->latest()
            ->get();
        
        return Inertia::render('Admin/Associates/Index', [
            'associates' => $associates,
            'currentStatus' => $status
        ]);
    }

    public function editBasicInfo()
    {
        $user = auth()->user();
        $associate = Associate::with(['contacts', 'references', 'services'])->where('id', $user->associate_id)->first();

        if ($associate) {
            $this->appendFileUrls($associate);
        }

        return Inertia::render('Associate/Company/BasicInfo/Index', [
            'initialAssociate' => $associate
        ]);
    }

    public function updateBasicInfo(Request $request)
    {
        $user = auth()->user();
        $associate = $user->associate_id
            ? Associate::find($user->associate_id)
            : new Associate();

        if (!$associate && $user->associate_id) {
            return abort(404, 'Associate not found');
        }

        $data = $request->validate([
            'company_name'       => 'required|string|max:255',
            'initials'           => 'nullable|string|max:20',
            'nit'                => 'required|string|max:30|unique:associates,nit,' . ($associate->id ?? 'NULL'),
            'legal_status'       => 'required|string',
            'legal_status_other' => 'nullable|string',
            'constitution_date'  => 'nullable|date',
            'country_origin'     => 'nullable|string',
            'phone'              => 'required|string',
            'website'            => 'nullable|string',
            'department'         => 'required|string',
            'department_id'      => 'required|integer',
            'city'               => 'required|string',
            'city_id'            => 'required|integer',
            'address'            => 'required|string',
            'rep_name'           => 'required|string',
            'rep_position'       => 'required|string',
            'rep_doc_type'       => 'required|string|max:20',
            'rep_doc'            => 'required|string|max:50',
        ]);

        if (($data['legal_status'] ?? '') === 'Otro' && !empty($data['legal_status_other'])) {
            $data['legal_status'] = $data['legal_status_other'];
        }


        $auditLog = $associate->audit_log ?? [];
        if ($associate->exists) {
            foreach ($data as $key => $value) {
                // Normalización de valores para comparación justa
                $currentVal = $associate->$key;
                $newVal = $value;

                // Si es fecha, comparamos el formato Y-m-d
                if ($key === 'constitution_date' && $currentVal instanceof \Carbon\Carbon) {
                    $currentVal = $currentVal->format('Y-m-d');
                }

                // Normalización de nulos y vacíos
                if ($currentVal === null) $currentVal = '';
                if ($newVal === null) $newVal = '';

                // Solo reseteamos si DE VERDAD cambió el valor
                if ($currentVal != $newVal) {
                    if (isset($auditLog[$key])) {
                        unset($auditLog[$key]);
                    }
                }
            }
            if (isset($auditLog['location']) && ($auditLog['location']['status'] ?? '') === 'rejected') {
                unset($auditLog['location']);
            }

            // Al enviar a revisión, el permiso 'editable' del admin queda consumido
            foreach ($auditLog as $key => $entry) {
                if (($entry['status'] ?? '') === 'editable') {
                    unset($auditLog[$key]);
                }
            }
        }

        $associate->fill(array_merge($data, [
            'audit_log' => $auditLog,
            'status'    => 'pending',
        ]));
        $associate->save();

        if (!$user->associate_id) {
            $user->update(['associate_id' => $associate->id]);
        }

        return back()->with('success', 'Información enviada a revisión correctamente.');
    }

    public function saveBasicInfoDraft(Request $request)
    {
        $user = auth()->user();
        $associate = $user->associate_id
            ? Associate::find($user->associate_id)
            : new Associate();

        if (!$associate && $user->associate_id) {
            return abort(404, 'Associate not found');
        }

        $data = $request->validate([
            'company_name'       => 'nullable|string|max:255',
            'initials'           => 'nullable|string|max:20',
            'nit'                => 'nullable|string|max:30|unique:associates,nit,' . ($associate->id ?? 'NULL'),
            'legal_status'       => 'nullable|string',
            'legal_status_other' => 'nullable|string',
            'constitution_date'  => 'nullable|date',
            'country_origin'     => 'nullable|string',
            'phone'              => 'nullable|string',
            'website'            => 'nullable|string',
            'department'         => 'nullable|string',
            'department_id'      => 'nullable|integer',
            'city'               => 'nullable|string',
            'city_id'            => 'nullable|integer',
            'address'            => 'nullable|string',
            'rep_name'           => 'nullable|string',
            'rep_position'       => 'nullable|string',
            'rep_doc_type'       => 'nullable|string|max:20',
            'rep_doc'            => 'nullable|string|max:50',
        ]);

        if (($data['legal_status'] ?? '') === 'Otro' && !empty($data['legal_status_other'])) {
            $data['legal_status'] = $data['legal_status_other'];
        }

        // Solo cambiar a draft si no está en un estado más avanzado
        $currentStatus = $associate->exists ? $associate->status : null;
        $newStatus = in_array($currentStatus, ['pending', 'approved', 'verified', 'rejected'])
            ? $currentStatus  // No regresamos el status si ya está más avanzado
            : 'draft';

        $associate->fill(array_merge($data, ['status' => $newStatus]));
        $associate->save();

        if (!$user->associate_id) {
            $user->update(['associate_id' => $associate->id]);
        }

        return back()->with('draft_saved', now()->format('d/m/Y H:i:s'));
    }

    public function requestFieldChange(Request $request)
    {
        $user = auth()->user();
        $associate = Associate::findOrFail($user->associate_id);

        $request->validate([
            'field'  => 'required|string',
            'reason' => 'required|string|max:500',
        ]);

        $auditLog = $associate->audit_log ?? [];
        $field = $request->field;

        // Only allow if field is currently approved
        if (($auditLog[$field]['status'] ?? '') !== 'approved') {
            return back()->with('error', 'Este campo no está aprobado o ya fue modificado.');
        }

        $auditLog[$field]['change_request'] = [
            'reason'       => $request->reason,
            'requested_at' => now()->toIso8601String(),
            'requested_by' => $user->name,
        ];

        $associate->update(['audit_log' => $auditLog]);

        // Notify admin
        try {
            $adminEmail = config('mail.admin_recipient', env('ADMIN_EMAIL'));
            if ($adminEmail) {
                \Illuminate\Support\Facades\Mail::to($adminEmail)->send(
                    new \App\Mail\AssociateFieldChangeRequested($associate, $field, $request->reason)
                );
            }
        } catch (\Exception $e) {
            Log::error('Error notifying admin of field change request: ' . $e->getMessage());
        }

        return back()->with('success', 'Solicitud de cambio enviada. Te notificaremos cuando sea aprobada.');
    }

    private function appendFileUrls(Associate $associate)
    {
        $urls = [];
        
        if ($associate->logo_path) {
            $urls['logo'] = Storage::url($associate->logo_path);
        }

        if ($associate->cover_path) {
            $urls['cover'] = Storage::url($associate->cover_path);
        }

        if ($associate->files) {
            foreach ($associate->files as $name => $path) {
                $urls[$name] = Storage::url($path);
            }
        }

        $associate->document_urls = $urls;

        if ($associate->cover_path) {
            $associate->cover_url = Storage::url($associate->cover_path);
        }

        $gallery = [];
        if ($associate->gallery_paths) {
            foreach ($associate->gallery_paths as $path) {
                $gallery[] = [
                    'path' => $path,
                    'url' => Storage::url($path)
                ];
            }
        }
        $associate->gallery_urls = $gallery;
    }

    public function editCharacterization()
    {
        $user = auth()->user();
        $associate = Associate::with(['contacts', 'references', 'services'])->where('id', $user->associate_id)->first();

        if ($associate) {
            $this->appendFileUrls($associate);
        }

        return Inertia::render('Associate/Company/Characterization/Index', [
            'initialAssociate' => $associate
        ]);
    }

    public function updateCharacterization(Request $request)
    {
        $user = auth()->user();
        $associate = Associate::findOrFail($user->associate_id);

        $data = $request->validate([
            'employees_tech' => 'required|integer|min:0',
            'employees_prof' => 'required|integer|min:0',
            'employees_admin' => 'required|integer|min:0',
            'employees_exec' => 'required|integer|min:0',
            'employees_other' => 'required|integer|min:0',
            'employees_other_desc' => 'nullable|string|max:255',
            'employees_direct_count' => 'required|integer|min:0',
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

        // Detectar cambios reales para auditoría
        $auditLog = $associate->audit_log ?? [];
        foreach ($data as $key => $value) {
            $currentVal = $associate->$key;
            $newVal = $value;

            // Normalización de nulos y vacíos
            if ($currentVal === null) $currentVal = '';
            if ($newVal === null) $newVal = '';

            if ($currentVal != $newVal) {
                if (isset($auditLog[$key])) {
                    unset($auditLog[$key]);
                }
            }
        }

        // Limpia permisos 'editable' del admin (ya consumidos al re-enviar)
        foreach ($auditLog as $key => $entry) {
            if (($entry['status'] ?? '') === 'editable') {
                unset($auditLog[$key]);
            }
        }

        // Marca todos los campos enviados como 'pending' si no tienen estado definitivo
        // Esto permite al frontend saber que la sección fue enviada a revisión
        foreach (array_keys($data) as $field) {
            if (!isset($auditLog[$field])) {
                $auditLog[$field] = ['status' => 'pending'];
            }
        }

        $associate->fill(array_merge($data, [
            'audit_log' => $auditLog,
            'status' => 'pending'
        ]));

        $associate->save();

        return back()->with('success', 'Caracterización enviada a revisión con éxito.');
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

        // Evitar que el borrador resetee auditoría indiscriminadamente (podemos manejarlo después)
        // Por ahora, solo guardamos los datos
        
        $currentStatus = $associate->status;
        $newStatus = in_array($currentStatus, ['pending', 'approved', 'verified', 'rejected'])
            ? $currentStatus 
            : 'draft';

        $associate->fill(array_merge($data, ['status' => $newStatus]));
        $associate->save();

        return back()->with('draft_saved', now()->format('d/m/Y H:i:s'));
    }

    public function editContacts()
    {
        $user = auth()->user();
        $associate = Associate::with(['contacts', 'references', 'services'])->where('id', $user->associate_id)->first();

        if ($associate) {
            $this->appendFileUrls($associate);
        }

        return Inertia::render('Associate/Company/Contacts/Index', [
            'initialAssociate' => $associate
        ]);
    }

    public function updateContacts(Request $request)
    {
        $user = auth()->user();
        $associate = Associate::findOrFail($user->associate_id);

        $data = $request->validate([
            'contacts' => 'required|array|min:1',
            'contacts.*.area' => 'required|string',
            'contacts.*.name' => 'required|string',
            'contacts.*.position' => 'required|string',
            'contacts.*.email' => 'required|email',
            'contacts.*.phone' => 'required|string',
            'main_ciiu' => 'required|string',
            'secondary_ciiu' => 'nullable|string',
            'billing_email' => 'required|email',
            'company_type' => 'required|array',
            'references' => 'required|array|min:1',
            'references.*.type' => 'required|string',
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

        // Detectar cambios reales para auditoría
        $auditLog = $associate->audit_log ?? [];
        $fieldsToReset = [
            'contacts', 'main_ciiu', 'secondary_ciiu', 'billing_email', 
            'company_type', 'references', 'social_instagram', 
            'social_facebook', 'social_linkedin', 'social_other'
        ];
        
        foreach ($fieldsToReset as $key) {
            $currentVal = $associate->$key;
            $newVal = $data[$key] ?? null;

            // Normalización y comparación quirúrgica
            if (is_array($currentVal)) {
                if (json_encode($currentVal) !== json_encode($newVal)) {
                    if (isset($auditLog[$key])) unset($auditLog[$key]);
                }
            } else {
                if ($currentVal === null) $currentVal = '';
                if ($newVal === null) $newVal = '';
                
                if ($currentVal != $newVal) {
                    if (isset($auditLog[$key])) unset($auditLog[$key]);
                }
            }
        }

        // Limpia permisos 'editable' del admin (ya consumidos al re-enviar)
        foreach ($auditLog as $key => $entry) {
            if (($entry['status'] ?? '') === 'editable') {
                unset($auditLog[$key]);
            }
        }

        // Marca todos los campos enviados como 'pending' si no tienen estado definitivo
        foreach ($fieldsToReset as $field) {
            if (!isset($auditLog[$field])) {
                $auditLog[$field] = ['status' => 'pending'];
            }
        }

        $associate->fill(array_merge($data, [
            'audit_log' => $auditLog,
            'status' => 'pending'
        ]));

        $associate->save();

        if ($request->has('contacts')) {
            $associate->contacts()->delete();
            foreach ($request->contacts as $contact) {
                if (!empty($contact['name'])) {
                    $associate->contacts()->create($contact);
                }
            }
        }

        if ($request->has('references')) {
            $associate->references()->delete();
            foreach ($request->references as $reference) {
                if (!empty($reference['name'])) {
                    $associate->references()->create($reference);
                }
            }
        }

        return back()->with('success', 'Contactos y referencias actualizados y enviados a revisión.');
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

        $currentStatus = $associate->status;
        $newStatus = in_array($currentStatus, ['pending', 'approved', 'verified', 'rejected'])
            ? $currentStatus 
            : 'draft';

        $associate->fill(array_merge($data, ['status' => $newStatus]));
        $associate->save();

        if ($request->has('contacts')) {
            $associate->contacts()->delete();
            foreach ($request->contacts as $contact) {
                if (!empty($contact['name'])) {
                    $associate->contacts()->create($contact);
                }
            }
        }

        if ($request->has('references')) {
            $associate->references()->delete();
            foreach ($request->references as $reference) {
                if (!empty($reference['name'])) {
                    $associate->references()->create($reference);
                }
            }
        }

        return back()->with('draft_saved', now()->format('d/m/Y H:i:s'));
    }

    public function editServices()
    {
        $user = auth()->user();
        $associate = Associate::where('id', $user->associate_id)->with('services')->first();

        if ($associate) {
            $this->appendFileUrls($associate);
        }

        $availableServices = \App\Models\Service::with('category')->where('is_active', true)->get();
        $serviceCategories = \App\Models\ServiceCategory::all();

        return Inertia::render('Associate/Company/Services', [
            'initialAssociate' => $associate,
            'availableServices' => $availableServices,
            'serviceCategories' => $serviceCategories
        ]);
    }

    public function updateServices(Request $request)
    {
        $user = auth()->user();
        $associate = Associate::findOrFail($user->associate_id);

        $data = $request->validate([
            'description' => 'required|string',
            'service_ids' => 'required|array|min:1',
            'service_ids.*' => 'exists:services,id',
        ]);

        $associate->update([
            'description' => $data['description'],
            'status' => 'pending'
        ]);

        $plan = $associate->plan;
        $limit = $plan ? $plan->limit_services : 0; // 0 = Unlimited in this system
        
        if ($limit > 0 && count($data['service_ids']) > $limit) {
            return back()->with('error', "Tu plan actual ({$plan->name}) solo permite hasta {$limit} servicios. Por favor, reduce la selección o mejora tu plan.");
        }

        $associate->services()->sync($data['service_ids']);

        $auditLog = $associate->audit_log ?? [];
        $fieldsToReset = ['description', 'service_ids'];

        // Detectar cambios y limpiar entradas afectadas
        if ($associate->description !== $data['description']) {
            unset($auditLog['description']);
        }
        unset($auditLog['service_ids']); // Los servicios siempre se re-sincronizan

        // Limpia permisos 'editable' del admin (ya consumidos al re-enviar)
        foreach ($auditLog as $key => $entry) {
            if (($entry['status'] ?? '') === 'editable') {
                unset($auditLog[$key]);
            }
        }

        // Marca campos enviados como 'pending' si no tienen estado definitivo
        foreach ($fieldsToReset as $field) {
            if (!isset($auditLog[$field])) {
                $auditLog[$field] = ['status' => 'pending'];
            }
        }

        $associate->update(['audit_log' => $auditLog]);

        return back()->with('success', 'Servicios y descripción actualizados y enviados a revisión.');
    }

    public function editDocumentation()
    {
        $user = auth()->user();
        $associate = Associate::with(['contacts', 'references', 'services'])->where('id', $user->associate_id)->first();

        if ($associate) {
            $this->appendFileUrls($associate);
        }

        return Inertia::render('Associate/Company/Documentation', [
            'initialAssociate' => $associate
        ]);
    }

    public function updateDocumentation(Request $request)
    {
        $user = auth()->user();
        $associate = Associate::findOrFail($user->associate_id);

        $request->validate([
            'files' => 'nullable|array',
            'files.*' => 'nullable|file|mimes:pdf,jpg,jpeg,png,svg,doc,docx|max:10240',
            'funds_origin_declaration' => 'accepted',
            'rep_name' => 'required|string|max:255',
            'rep_doc' => 'required|string|max:255',
            'membership_interest' => 'required|array|min:1',
        ]);

        // Capture old values BEFORE update to detect changes correctly
        $oldRepName              = $associate->rep_name;
        $oldRepDoc               = $associate->rep_doc;
        $oldMembershipInterest   = $associate->membership_interest ?? [];
        $oldFundsOrigin          = $associate->funds_origin_declaration;

        $storedFiles      = $associate->files ?? [];
        $auditLog         = $associate->audit_log ?? [];
        $uploadedFileKeys = [];

        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $docName => $file) {
                if (!$file) continue;

                $extension = $file->getClientOriginalExtension();
                $fileName  = Str::slug($docName) . '_' . time() . '.' . $extension;
                $path      = $file->storeAs("associates/{$associate->id}/docs", $fileName, config('filesystems.default'));

                // logo_path se actualiza solo cuando el admin aprueba el documento
                $storedFiles[$docName]  = $path;
                $uploadedFileKeys[]     = "files.{$docName}";
            }
        }

        $associate->update([
            'files'                    => $storedFiles,
            'rep_name'                 => $request->rep_name,
            'rep_doc'                  => $request->rep_doc,
            'membership_interest'      => $request->membership_interest,
            'funds_origin_declaration' => true,
            'status'                   => 'pending',
        ]);

        try {
            \Illuminate\Support\Facades\Mail::to(config('mail.admin_recipient', env('ADMIN_EMAIL')))
                ->send(new \App\Mail\AssociateDocsSubmitted($associate));
        } catch (\Exception $e) {
            Log::error('Error enviando alerta de documentos a admin: ' . $e->getMessage());
        }

        // 1. Clean editable entries
        foreach ($auditLog as $key => $entry) {
            if (($entry['status'] ?? '') === 'editable') unset($auditLog[$key]);
        }

        // 2. Uploaded files: unset existing audit then mark pending
        foreach ($uploadedFileKeys as $fileKey) {
            unset($auditLog[$fileKey]);
            $auditLog[$fileKey] = ['status' => 'pending'];
        }

        // 3. Scalar fields: unset if changed, add pending if not set
        if ($oldRepName !== $request->rep_name)     unset($auditLog['rep_name']);
        if ($oldRepDoc  !== $request->rep_doc)      unset($auditLog['rep_doc']);
        if ((bool)$oldFundsOrigin !== true)         unset($auditLog['funds_origin_declaration']);

        if (!isset($auditLog['rep_name']))              $auditLog['rep_name']              = ['status' => 'pending'];
        if (!isset($auditLog['rep_doc']))               $auditLog['rep_doc']               = ['status' => 'pending'];
        if (!isset($auditLog['funds_origin_declaration'])) $auditLog['funds_origin_declaration'] = ['status' => 'pending'];

        // 4. membership_interest
        if (json_encode($oldMembershipInterest) !== json_encode($request->membership_interest)) {
            unset($auditLog['membership_interest']);
        }
        if (!isset($auditLog['membership_interest'])) {
            $auditLog['membership_interest'] = ['status' => 'pending'];
        }

        if (isset($auditLog['files'])) unset($auditLog['files']);

        $associate->update(['audit_log' => $auditLog]);

        return back()->with('success', 'Documentación y declaraciones enviadas a revisión correctamente.');
    }

    public function saveDocumentationDraft(Request $request)
    {
        $user      = auth()->user();
        $associate = Associate::findOrFail($user->associate_id);

        $request->validate([
            'files'               => 'nullable|array',
            'files.*'             => 'nullable|file|mimes:pdf,jpg,jpeg,png,svg,doc,docx|max:10240',
            'rep_name'            => 'nullable|string|max:255',
            'rep_doc'             => 'nullable|string|max:255',
            'membership_interest' => 'nullable|array',
        ]);

        $storedFiles = $associate->files ?? [];
        $auditLog    = $associate->audit_log ?? [];

        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $docName => $file) {
                if (!$file) continue;

                $extension = $file->getClientOriginalExtension();
                $fileName  = Str::slug($docName) . '_' . time() . '.' . $extension;
                $path      = $file->storeAs("associates/{$associate->id}/docs", $fileName, config('filesystems.default'));

                // logo_path se actualiza solo cuando el admin aprueba el documento
                $storedFiles[$docName] = $path;

                // Mark file as editable (uploaded but not yet submitted to review)
                $fileKey = "files.{$docName}";
                if (!isset($auditLog[$fileKey]) || in_array($auditLog[$fileKey]['status'] ?? '', ['approved', 'rejected'])) {
                    $auditLog[$fileKey] = ['status' => 'editable'];
                }
            }
        }

        $currentStatus = $associate->status;
        $newStatus     = in_array($currentStatus, ['pending', 'approved', 'verified', 'rejected'])
            ? $currentStatus
            : 'draft';

        $associate->update([
            'files'               => $storedFiles,
            'rep_name'            => $request->rep_name ?? $associate->rep_name,
            'rep_doc'             => $request->rep_doc  ?? $associate->rep_doc,
            'membership_interest' => $request->membership_interest ?? $associate->membership_interest,
            'status'              => $newStatus,
            'audit_log'           => $auditLog,
        ]);

        return back()->with('draft_saved', now()->format('d/m/Y H:i:s'));
    }

    public function show(Associate $associate)
    {
        $associate->load(['contacts', 'references', 'users', 'services']);
        $this->appendFileUrls($associate);
        
        return Inertia::render('Admin/Associates/Show', [
            'associate' => $associate,
            'availableServices' => \App\Models\ServiceCategory::with(['services' => function($q) {
                $q->where('is_active', true);
            }])->get()
        ]);
    }

    public function update(Request $request, Associate $associate)
    {
        $request->validate([
            'description' => 'nullable|string',
            'service_ids' => 'array',
            'service_ids.*' => 'exists:services,id'
        ]);

        $associate->update([
            'description' => $request->description
        ]);

        if ($request->has('service_ids')) {
            $associate->services()->sync($request->service_ids);
        }

        return back()->with('success', 'Información actualizada correctamente');
    }

    public function audit(Request $request, Associate $associate)
    {
        $request->validate([
            'field' => 'required|string',
            'status' => 'required|in:approved,rejected,reset',
            'reason' => 'nullable|string'
        ]);

        $auditLog = $associate->audit_log ?? [];

        if ($request->status === 'reset') {
            $auditLog[$request->field] = [
                'status' => 'editable',
                'reason' => 'Modificación permitida por el administrador',
                'reset_at' => now(),
                'auditor' => auth()->user()->name
            ];
            $associate->update([
                'audit_log' => $auditLog
                // No cambiamos el status global para mantener otros campos bloqueados si están "En revisión"
            ]);
            return back()->with('success', 'Campo habilitado para modificación');
        }

        $auditLog[$request->field] = [
            'status' => $request->status,
            'reason' => $request->reason,
            'audited_at' => now(),
            'auditor' => auth()->user()->name
        ];

        $updateData = ['audit_log' => $auditLog];

        // Cuando se aprueba el logo, promoverlo como imagen de perfil del asociado
        if ($request->field === 'files.Logo HD (JPG/PNG)' && $request->status === 'approved') {
            $logoDocPath = $associate->files['Logo HD (JPG/PNG)'] ?? null;
            if ($logoDocPath) {
                $updateData['logo_path'] = $logoDocPath;
            }
        }

        $associate->update($updateData);

        // Notificar al asociado si el campo fue rechazado
        if ($request->status === 'rejected') {
            try {
                // Obtener el correo del primer usuario asociado o el de facturación
                $recipientEmail = $associate->users->first()?->email ?? $associate->billing_email;
                
                if ($recipientEmail) {
                    \Illuminate\Support\Facades\Mail::to($recipientEmail)
                        ->send(new \App\Mail\AssociateAuditRejected($associate, $request->field, $request->reason));
                }
            } catch (\Exception $e) {
                Log::error('Error enviando notificación de auditoría: ' . $e->getMessage());
            }
        }

        return back()->with('success', 'Campo actualizado correctamente');
    }

    public function approve(Associate $associate)
    {
        $associate->update([
            'status' => 'verified',
            'is_verified' => true
        ]);
        
        try {
            $recipientEmail = $associate->users->first()?->email ?? $associate->billing_email;
            if ($recipientEmail) {
                \Illuminate\Support\Facades\Mail::to($recipientEmail)->send(new \App\Mail\AssociateApproved($associate));
            }
        } catch (\Exception $e) {
            Log::error('Error enviando correo de aprobación: ' . $e->getMessage());
        }

        // No activamos perfil público todavía, debe pagar primero
        
        return redirect()->route('admin.associates.index')->with('success', 'Empresa admitida en CAMEP. El socio ahora puede elegir un plan y realizar el pago.');
    }

    public function togglePublic(Associate $associate)
    {
        $associate->update(['is_public' => !$associate->is_public]);
        return back()->with('success', 'Visibilidad de la empresa actualizada.');
    }

    public function toggleVerified(Associate $associate)
    {
        $associate->update(['is_verified' => !$associate->is_verified]);
        return back()->with('success', 'Estado de verificación actualizado.');
    }

    public function editGallery()
    {
        $user = auth()->user();
        $associate = Associate::with('plan')->where('id', $user->associate_id)->first();

        if ($associate) {
            $this->appendFileUrls($associate);
        }

        return Inertia::render('Associate/Company/Gallery', [
            'initialAssociate' => $associate
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

        $plan = $associate->plan;
        $limit = $plan ? $plan->limit_gallery : 0;
        $currentImagesCount = count($associate->gallery_paths ?? []);
        $newImagesCount = count($request->file('images') ?? []);
        
        if ($limit > 0 && ($currentImagesCount + $newImagesCount) > $limit) {
            return back()->with('error', "Has alcanzado el límite de imágenes en galería para tu plan ({$limit} fotos).");
        }

        $disk = config('filesystems.default');
        $galleryPaths = $associate->gallery_paths ?? [];

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store("associates/{$associate->id}/gallery", $disk);
                $galleryPaths[] = $path;
            }
        }

        $associate->update(['gallery_paths' => $galleryPaths]);

        return back()->with('success', 'Imágenes subidas correctamente');
    }

    public function deleteGalleryImage(Request $request)
    {
        $user = auth()->user();
        $associate = Associate::findOrFail($user->associate_id);

        $request->validate([
            'path' => 'required|string',
        ]);

        $disk = config('filesystems.default');
        $galleryPaths = $associate->gallery_paths ?? [];

        if (($key = array_search($request->path, $galleryPaths)) !== false) {
            unset($galleryPaths[$key]);
            Storage::disk($disk)->delete($request->path);
            
            // Si la imagen borrada era la portada, la quitamos
            if ($associate->cover_path === $request->path) {
                $associate->update(['cover_path' => null]);
            }

            $associate->update(['gallery_paths' => array_values($galleryPaths)]);
            return back()->with('success', 'Imagen eliminada correctamente');
        }

        return back()->with('error', 'Imagen no encontrada');
    }

    public function setCoverImage(Request $request)
    {
        $user = auth()->user();
        $associate = Associate::findOrFail($user->associate_id);

        $request->validate([
            'path' => 'required|string',
        ]);

        // Verificar que la imagen esté en su galería
        $galleryPaths = $associate->gallery_paths ?? [];
        if (!in_array($request->path, $galleryPaths)) {
            return back()->with('error', 'La imagen debe pertenecer a tu galería.');
        }

        $associate->update(['cover_path' => $request->path]);

        return back()->with('success', 'Portada actualizada correctamente');
    }

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

                    if ($daysRemaining >= 0) {
                        $subscriptionStatus = 'active';
                    } else {
                        $subscriptionStatus = 'grace';
                        $daysRemaining = $graceDays + $daysRemaining;
                    }
                } else {
                    $subscriptionStatus = 'expired';
                    $daysRemaining = 0;
                }
            }
        }

        // Active payment request (pending or last rejected)
        $paymentRequestRaw = \App\Models\PaymentRequest::with('plan')
            ->where('user_id', $user->id)
            ->whereIn('status', ['pending', 'rejected'])
            ->latest()
            ->first();

        // Logic to hide "rejected" ghosts if the user ALREADY has an active plan for that same level
        $paymentRequest = null;
        /** @var \App\Models\PaymentRequest|null $paymentRequestRaw */
        if ($paymentRequestRaw) {
            $showRequest = true;
            
            if ($paymentRequestRaw->status === 'rejected' && $subscriptionStatus === 'active') {
                // If they are active on the SAME plan they were rejected for, it's a ghost or they already solved it
                if ($associate && $associate->plan_id == $paymentRequestRaw->plan_id) {
                    $showRequest = false;
                }
            }
            
            if ($showRequest) {
                $paymentRequest = [
                    'id'          => $paymentRequestRaw->id,
                    'status'      => $paymentRequestRaw->status,
                    'plan_name'   => $paymentRequestRaw->plan->name ?? 'Plan',
                    'plan_color'  => $paymentRequestRaw->plan->color_hex ?? '#000000',
                    'admin_notes' => $paymentRequestRaw->admin_notes,
                    'created_at'  => $paymentRequestRaw->created_at?->format('d/m/Y H:i') ?? '',
                ];
            }
        }

        $availablePlans = \App\Models\Plan::where('is_active', true)->orderBy('price_monthly')->get();

        return Inertia::render('Associate/Billing/Index', [
            'currentPlan'        => $associate?->plan,
            'subscriptionStatus' => $subscriptionStatus,
            'daysRemaining'      => $daysRemaining,
            'planExpiresAt'      => $associate?->plan_expires_at?->format('d/m/Y'),
            'usage'              => [
                'services' => $servicesCount,
                'gallery'  => $galleryCount,
            ],
            'availablePlans'  => $availablePlans,
            'paymentRequest'  => $paymentRequest,
        ]);
    }
}
