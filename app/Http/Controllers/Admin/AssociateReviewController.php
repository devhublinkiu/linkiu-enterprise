<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\InteractsWithAssociateFiles;
use App\Http\Controllers\Controller;
use App\Mail\AssociateApproved;
use App\Mail\AssociateAuditRejected;
use App\Mail\SectionAuditApproved;
use App\Models\Associate;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

/**
 * Auditoría admin de asociados: lista (estado derivado), detalle, aprobación por sección,
 * admisión (gate 5 secciones), verificación y activación/desactivación. Ver ADR-0007 / plan 0014.
 * Extraído de AssociateController (plan 0015) para separar el admin de la ficha del asociado.
 */
class AssociateReviewController extends Controller
{
    use InteractsWithAssociateFiles;

    public function index(Request $request)
    {
        $estado = $request->query('estado'); // filtro opcional (coarse): pendiente|admitida|activa|inactiva
        $q = $request->query('q');

        $associates = Associate::with('plan')
            ->select([
                'id', 'company_name', 'nit', 'status', 'created_at',
                'is_public', 'is_verified', 'section_reviews', 'plan_id',
                'plan_expires_at', 'deactivated_at',
            ])
            ->when($q, fn ($query) => $query->where(fn ($w) => $w
                ->where('company_name', 'like', "%{$q}%")
                ->orWhere('nit', 'like', "%{$q}%")))
            ->when($estado, fn ($query) => $this->filterByEstado($query, $estado))
            ->latest()
            ->paginate(25)
            ->withQueryString()
            ->through(fn (Associate $a) => [
                'id' => $a->id,
                'company_name' => $a->company_name,
                'nit' => $a->nit,
                'created_at' => $a->created_at,
                'is_public' => $a->is_public,
                'is_verified' => $a->is_verified,
                'section_reviews' => $a->section_reviews,
                'estado' => $a->adminState(),
                'subscription_status' => SubscriptionService::statusOf($a),
                'plan_expires_at' => $a->plan_expires_at,
            ]);

        return Inertia::render('Admin/Associates/Index', [
            'associates' => $associates,
            'filters' => ['estado' => $estado, 'q' => $q],
        ]);
    }

    /**
     * Filtro coarse por estado derivado. El límite de "gracia" se aproxima por fecha
     * (plan_expires_at); el badge de la fila muestra el estado fino y preciso.
     */
    private function filterByEstado($query, string $estado)
    {
        return match ($estado) {
            'pendiente' => $query->whereNull('deactivated_at')
                ->whereIn('status', ['draft', 'pending', 'rejected']),
            'admitida' => $query->whereNull('deactivated_at')->where('status', 'verified'),
            'activa' => $query->whereNull('deactivated_at')->where('status', 'approved')
                ->whereNotNull('plan_expires_at')->where('plan_expires_at', '>=', now()),
            'inactiva' => $query->where(fn ($w) => $w
                ->whereNotNull('deactivated_at')
                ->orWhere(fn ($x) => $x->where('status', 'approved')
                    ->where(fn ($y) => $y->whereNull('plan_expires_at')
                        ->orWhere('plan_expires_at', '<', now())))),
            default => $query,
        };
    }

    public function show(Associate $associate)
    {
        $associate->load(['contacts', 'references', 'users', 'services.category']);
        $this->appendFileUrls($associate);

        return Inertia::render('Admin/Associates/Show', [
            'associate' => $associate,
            'documentCatalog' => $this->documentCatalog(),
            'estado' => $associate->adminState(),
        ]);
    }

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

    public function approve(Associate $associate)
    {
        // Gate de admisión (ADR-0007): solo se admite con el perfil 100% (las 5 secciones aprobadas).
        if (! $associate->allSectionsApproved()) {
            return back()->with('error', 'No puedes admitir todavía: faltan secciones por aprobar. Deben estar aprobadas las 5.');
        }

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

    public function toggleVerified(Associate $associate)
    {
        $associate->update(['is_verified' => ! $associate->is_verified]);

        return back()->with('success', 'Estado de verificación actualizado.');
    }

    // Desactivación manual del admin (ADR-0007): sella la marca y saca del directorio.
    public function deactivate(Associate $associate)
    {
        $associate->update(['deactivated_at' => now(), 'is_public' => false]);

        return back()->with('success', 'Empresa desactivada. Ya no aparece en el directorio.');
    }

    // Reactivación: limpia la marca y recomputa la visibilidad según la suscripción.
    public function reactivate(Associate $associate)
    {
        $associate->update(['deactivated_at' => null]);
        app(SubscriptionService::class)->republishIfDue($associate);

        return back()->with('success', 'Empresa reactivada.');
    }
}
