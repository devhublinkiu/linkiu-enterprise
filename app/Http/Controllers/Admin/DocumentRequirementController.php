<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Associate;
use App\Models\DocumentRequirement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class DocumentRequirementController extends Controller
{
    /**
     * Allowed lucide-react icon names selectable from the admin UI.
     * Keep this list in sync with ICON_MAP in the frontend.
     */
    private const ALLOWED_ICONS = [
        'FileText', 'Image', 'FileSpreadsheet', 'FileDigit', 'Landmark',
        'ShieldCheck', 'FileCheck', 'CheckCircle2', 'Check', 'Scale',
        'Share2', 'Building2', 'Building', 'FileSignature', 'Briefcase',
        'GraduationCap', 'Receipt', 'Lock', 'Award',
    ];

    private const ALLOWED_MIMES = ['pdf', 'jpg', 'jpeg', 'png', 'docx', 'xlsx'];

    public function index()
    {
        return inertia('Admin/DocumentRequirements/Index', [
            'documents'     => DocumentRequirement::ordered()->get()->map(fn($d) => [
                'id'            => $d->id,
                'key'           => $d->key,
                'label'         => $d->label,
                'icon'          => $d->icon,
                'accepts'       => $d->accepts ?? [],
                'is_required'   => $d->is_required,
                'is_active'     => $d->is_active,
                'legend'        => $d->legend,
                'template_path' => $d->template_path,
                'template_url'  => $d->template_url,
                'display_order' => $d->display_order,
            ]),
            'allowedIcons'  => self::ALLOWED_ICONS,
            'allowedMimes'  => self::ALLOWED_MIMES,
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateRequest($request);

        $data['display_order'] = (int) (DocumentRequirement::max('display_order') ?? 0) + 1;

        if ($request->hasFile('template_file')) {
            $data['template_path'] = $request->file('template_file')
                ->store('document_templates', config('filesystems.default'));
        }

        DocumentRequirement::create($data);

        return back()->with('success', 'Documento agregado al catálogo.');
    }

    public function update(Request $request, DocumentRequirement $documentRequirement)
    {
        $data = $this->validateRequest($request, $documentRequirement);

        if ($request->hasFile('template_file')) {
            // Replace template — delete old if it was a managed upload
            $this->deleteManagedTemplate($documentRequirement);
            $data['template_path'] = $request->file('template_file')
                ->store('document_templates', config('filesystems.default'));
        }

        if ($request->boolean('remove_template')) {
            $this->deleteManagedTemplate($documentRequirement);
            $data['template_path'] = null;
        }

        // Key is immutable after creation.
        unset($data['key']);

        $documentRequirement->update($data);

        return back()->with('success', 'Documento actualizado.');
    }

    public function toggleActive(DocumentRequirement $documentRequirement)
    {
        $documentRequirement->update(['is_active' => !$documentRequirement->is_active]);

        return back()->with('success', $documentRequirement->is_active
            ? 'Documento activado.'
            : 'Documento desactivado del catálogo.');
    }

    public function destroy(DocumentRequirement $documentRequirement)
    {
        // Block deletion if any associate has uploaded a file for this key —
        // the admin must explicitly deactivate instead.
        $inUse = Associate::whereNotNull('files')
            ->whereRaw("JSON_EXTRACT(files, '$.\"" . $documentRequirement->key . "\"') IS NOT NULL")
            ->exists();

        if ($inUse) {
            return back()->with('error', 'No puedes eliminar este documento: algunos asociados ya cargaron archivos para esta clave. Desactívalo en su lugar.');
        }

        $this->deleteManagedTemplate($documentRequirement);
        $documentRequirement->delete();

        return back()->with('success', 'Documento eliminado del catálogo.');
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'order'   => 'required|array',
            'order.*' => 'integer|exists:document_requirements,id',
        ]);

        DB::transaction(function () use ($request) {
            foreach ($request->order as $index => $id) {
                DocumentRequirement::where('id', $id)->update(['display_order' => $index]);
            }
        });

        return back()->with('success', 'Orden actualizado.');
    }

    // ─────────────────────────────────────────────────────────────────────────

    private function validateRequest(Request $request, ?DocumentRequirement $existing = null): array
    {
        $keyRule = $existing
            ? ['nullable']
            : ['required', 'string', 'max:64', 'regex:/^[a-z0-9_]+$/', Rule::unique('document_requirements', 'key')];

        $validated = $request->validate([
            'key'          => $keyRule,
            'label'        => 'required|string|max:255',
            'icon'         => ['required', 'string', Rule::in(self::ALLOWED_ICONS)],
            'accepts'      => 'required|array|min:1',
            'accepts.*'    => ['string', Rule::in(self::ALLOWED_MIMES)],
            'is_required'  => 'required|boolean',
            'is_active'    => 'required|boolean',
            'legend'       => 'nullable|string|max:255',
            'template_file' => 'nullable|file|mimes:pdf,docx,xlsx,jpg,jpeg,png|max:10240',
            'remove_template' => 'nullable|boolean',
        ]);

        if (!$existing && empty($validated['key'])) {
            $validated['key'] = Str::slug($validated['label'], '_');
        }

        unset($validated['template_file'], $validated['remove_template']);

        return $validated;
    }

    /**
     * Delete the template file only if it lives in the managed disk
     * (not a legacy /plantillas_docs/... reference or external URL).
     */
    private function deleteManagedTemplate(DocumentRequirement $doc): void
    {
        if (empty($doc->template_path)) {
            return;
        }

        $path = $doc->template_path;
        if (preg_match('#^https?://#i', $path) || str_starts_with($path, '/')) {
            return;
        }

        try {
            Storage::disk(config('filesystems.default'))->delete($path);
        } catch (\Throwable $e) {
            Log::warning("No se pudo eliminar plantilla {$path}: " . $e->getMessage());
        }
    }
}
