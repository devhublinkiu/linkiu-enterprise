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

        return Inertia::render('Associate/Company/BasicInfo', [
            'initialAssociate' => $associate
        ]);
    }

    public function updateBasicInfo(Request $request)
    {
        $user = auth()->user();
        
        // Si el usuario no tiene associate_id, creamos uno nuevo
        $associate = $user->associate_id 
            ? Associate::find($user->associate_id) 
            : new Associate();

        if (!$associate && $user->associate_id) {
            return abort(404, 'Associate not found');
        }

        $data = $request->validate([
            'company_name' => 'required|string|max:255',
            'initials' => 'nullable|string|max:20',
            'nit' => 'required|string|max:30|unique:associates,nit,' . ($associate->id ?? 'NULL'),
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

        // Manejo de 'Otro' en tipo de sociedad
        if (($data['legal_status'] ?? '') === 'Otro' && !empty($data['legal_status_other'])) {
            $data['legal_status'] = $data['legal_status_other'];
        }

        Log::info('Data array before filling: ' . json_encode($data));

        // Detectar cambios para auditoría si ya existe
        $auditLog = $associate->audit_log ?? [];
        if ($associate->exists) {
            foreach ($data as $key => $value) {
                // Si el valor cambió, siempre reiniciamos la auditoría para ese campo (vuelve a pendiente)
                if ($associate->$key != $value) {
                    if (isset($auditLog[$key])) {
                        unset($auditLog[$key]);
                    }
                } 
                // Si el valor NO cambió, pero estaba rechazado, también lo reiniciamos para que CAMEP lo vuelva a revisar
                else if (isset($auditLog[$key]) && $auditLog[$key]['status'] === 'rejected') {
                    unset($auditLog[$key]);
                }
            }
            
            // Caso especial para 'location' si existiera un rechazo general de ubicación
            if (isset($auditLog['location']) && $auditLog['location']['status'] === 'rejected') {
                unset($auditLog['location']);
            }
        }

        $associate->fill(array_merge($data, [
            'audit_log' => $auditLog,
            'status' => 'pending'
        ]));
        
        $associate->save();

        // Vincular al usuario si es nuevo
        if (!$user->associate_id) {
            $user->update(['associate_id' => $associate->id]);
        }

        return back()->with('success', 'Información básica actualizada y enviada a revisión.');
    }

    private function appendFileUrls(Associate $associate)
    {
        $urls = [];
        $disk = config('filesystems.default');
        
        if ($associate->logo_path) {
            $urls['logo'] = Storage::disk($disk)->url($associate->logo_path);
        }

        if ($associate->cover_path) {
            $urls['cover'] = Storage::disk($disk)->url($associate->cover_path);
        }

        if ($associate->files) {
            foreach ($associate->files as $name => $path) {
                $urls[$name] = Storage::disk($disk)->url($path);
            }
        }

        $associate->document_urls = $urls;

        if ($associate->cover_path) {
            $associate->cover_url = Storage::disk($disk)->url($associate->cover_path);
        }

        $gallery = [];
        if ($associate->gallery_paths) {
            foreach ($associate->gallery_paths as $path) {
                $gallery[] = [
                    'path' => $path,
                    'url' => Storage::disk($disk)->url($path)
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

        return Inertia::render('Associate/Company/Characterization', [
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

        // Detectar cambios para auditoría
        $auditLog = $associate->audit_log ?? [];
        foreach ($data as $key => $value) {
            if ($associate->$key != $value) {
                if (isset($auditLog[$key])) {
                    unset($auditLog[$key]);
                }
            }
        }

        $associate->fill(array_merge($data, [
            'audit_log' => $auditLog,
            'status' => 'pending'
        ]));
        
        $associate->save();

        return back()->with('success', 'Caracterización actualizada y enviada a revisión.');
    }

    public function editContacts()
    {
        $user = auth()->user();
        $associate = Associate::with(['contacts', 'references', 'services'])->where('id', $user->associate_id)->first();

        if ($associate) {
            $this->appendFileUrls($associate);
        }

        return Inertia::render('Associate/Company/Contacts', [
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

        // Detectar cambios para auditoría
        $auditLog = $associate->audit_log ?? [];
        $fieldsToReset = [
            'contacts', 'main_ciiu', 'secondary_ciiu', 'billing_email', 
            'company_type', 'references', 'social_instagram', 
            'social_facebook', 'social_linkedin', 'social_other'
        ];

        foreach ($fieldsToReset as $key) {
            if (isset($auditLog[$key])) {
                unset($auditLog[$key]);
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

        // Reset audit log for modified fields
        $auditLog = $associate->audit_log ?? [];
        $fieldsToReset = ['description', 'service_ids'];

        foreach ($fieldsToReset as $key) {
            if (isset($auditLog[$key])) {
                unset($auditLog[$key]);
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

        $storedFiles = $associate->files ?? [];
        $logoPath = $associate->logo_path;
        $auditLog = $associate->audit_log ?? [];

        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $docName => $file) {
                if (!$file) continue;
                
                $extension = $file->getClientOriginalExtension();
                $fileName = Str::slug($docName) . '_' . time() . '.' . $extension;
                $path = $file->storeAs("associates/{$associate->id}/docs", $fileName, config('filesystems.default'));
                
                if ($docName === 'Logo HD (JPG/PNG)') {
                    $logoPath = $path;
                    // Reset logo audit if present
                    if (isset($auditLog['logo_path'])) unset($auditLog['logo_path']);
                }
                
                $storedFiles[$docName] = $path;

                // Reset specific file audit if present
                $fileAuditKey = "files.{$docName}";
                if (isset($auditLog[$fileAuditKey])) {
                    unset($auditLog[$fileAuditKey]);
                }
            }
        }

        $associate->update([
            'files' => $storedFiles,
            'logo_path' => $logoPath,
            'rep_name' => $request->rep_name,
            'rep_doc' => $request->rep_doc,
            'membership_interest' => $request->membership_interest,
            'funds_origin_declaration' => true,
            'status' => 'pending'
        ]);

        try {
            \Illuminate\Support\Facades\Mail::to(config('mail.admin_recipient', env('ADMIN_EMAIL')))
                ->send(new \App\Mail\AssociateDocsSubmitted($associate));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error enviando alerta de documentos a admin: ' . $e->getMessage());
        }

        // Reset audit log for other modified fields
        $fieldsToReset = ['rep_name', 'rep_doc', 'membership_interest', 'funds_origin_declaration'];
        
        foreach ($fieldsToReset as $field) {
            if (isset($auditLog[$field])) {
                unset($auditLog[$field]);
            }
        }
        
        // Reset general 'files' rejection if any document is updated
        if ($request->hasFile('files') && isset($auditLog['files'])) {
            unset($auditLog['files']);
        }

        $associate->update(['audit_log' => $auditLog]);

        return back()->with('success', 'Documentación y declaraciones enviadas a revisión correctamente.');
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
            'status' => 'required|in:approved,rejected',
            'reason' => 'nullable|string'
        ]);

        $auditLog = $associate->audit_log ?? [];
        $auditLog[$request->field] = [
            'status' => $request->status,
            'reason' => $request->reason,
            'audited_at' => now(),
            'auditor' => auth()->user()->name
        ];

        $associate->update(['audit_log' => $auditLog]);

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
                \Illuminate\Support\Facades\Log::error('Error enviando notificación de auditoría: ' . $e->getMessage());
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
            \Illuminate\Support\Facades\Log::error('Error enviando correo de aprobación: ' . $e->getMessage());
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
