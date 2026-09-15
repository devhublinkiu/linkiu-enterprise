<?php

namespace App\Http\Middleware;

use App\Models\Associate;
use App\Models\Feature;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\PaymentRequest;
use App\Models\ServiceCategory;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        // Build subscription data for associates
        $subscription = null;
        if ($user && $user->associate_id) {
            $associate = Associate::with('plan')->find($user->associate_id);
            if ($associate) {
                $status = 'none';
                $daysRemaining = null;
                $daysTotal = null;
                $planStartedAt = null;

                if ($associate->plan_id && $associate->plan_expires_at) {
                    $planStartedAt = PaymentRequest::where('user_id', $user->id)
                        ->where('status', 'approved')
                        ->latest()
                        ->value('reviewed_at');

                    if ($associate->isSubscriptionActive()) {
                        $daysRemaining = (int) now()->diffInDays($associate->plan_expires_at, false);
                        $graceDays = $associate->plan->grace_days ?? 0;

                        if ($daysRemaining >= 0) {
                            $status = 'active';
                            if ($planStartedAt) {
                                $daysTotal = (int) Carbon::parse($planStartedAt)->diffInDays($associate->plan_expires_at);
                            }
                        } else {
                            $status = 'grace';
                            $daysRemaining = $graceDays + $daysRemaining;
                        }
                    } else {
                        $status = 'expired';
                        $daysRemaining = 0;
                    }
                }

                $subscription = [
                    'status' => $status,
                    'plan_name' => $associate->plan?->name,
                    'plan_color' => $associate->plan?->color_hex,
                    'days_remaining' => $daysRemaining,
                    'days_total' => $daysTotal,
                    'expires_at' => $associate->plan_expires_at?->format('d/m/Y'),
                ];
            }
        }

        return [
            ...parent::share($request),
            'associate_counts' => $user && ($user->is_superadmin || $user->role === 'admin')
            ? [
                'approved' => Associate::where('status', 'approved')->count(),
                'pending' => Associate::where('status', 'pending')->count(),
                'inactive' => Associate::where('status', 'inactive')->count(),
            ]
            : null,
            // Comprobantes esperando revisión: los del motor nuevo más los que
            // queden en la tabla congelada mientras se termina la transición.
            // Ver docs/adr/0001-motor-de-cobro-unificado.md
            'pending_payment_requests' => $user && ($user->is_superadmin || $user->role === 'admin')
                ? Payment::where('status', Payment::STATUS_PENDING)
                    ->where('method', '!=', Payment::METHOD_BOLD)
                    ->count()
                  + PaymentRequest::where('status', 'pending')->count()
                : null,
            'auth' => [
                'user' => $user,
                'associate' => $user && $user->associate_id
                ? [
                    'id' => $user->associate->id,
                    'status' => $user->associate->status,
                    'is_public' => (bool) $user->associate->is_public,
                    'company_name' => $user->associate->company_name,
                    'logo_url' => $user->associate->logo_path
                        ? Storage::url($user->associate->logo_path)
                        : null,
                    // Micrositio (plan 0021): dirección pública para el botón "Ver mi
                    // página" del topbar y estado de publicado (borrador = vista previa).
                    'microsite_url' => $user->associate->slug
                        ? url('/'.$user->associate->slug)
                        : route('companies.show', $user->associate->id),
                    'microsite_published' => (bool) $user->associate->microsite_published,
                ]
                : null,
            ],
            'subscription' => $subscription,
            // Módulos que incluye el plan del asociado. Cortesía para que la UI
            // oculte lo que el plan no trae; la comprobación real vive en el
            // servidor (middleware feature:*). Ver ADR-0002.
            'plan_features' => $this->planFeatures($user),
            'unread_invoices' => $user && $user->associate_id
                ? Invoice::where('associate_id', $user->associate_id)->whereNull('read_at')->count()
                : null,
            'service_categories' => ServiceCategory::withCount('services')->get(['id', 'name', 'slug', 'services_count']),
            'recent_companies' => Associate::where('status', 'approved')
                ->where('is_public', true)
                ->latest()
                ->take(5)
                ->get(['id', 'company_name', 'logo_path'])
                ->map(fn ($a) => [
                    'id' => $a->id,
                    'name' => $a->company_name,
                    'logo' => $a->logo_path ? Storage::url($a->logo_path) : null,
                ]),
            'tenant' => [
                'id' => 'camep',
                'company_name' => 'CAMEP',
                'plan_type' => 'Premium',
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'draft_saved' => $request->session()->get('draft_saved'),
            ],
        ];
    }

    /**
     * Mapa {clave-de-módulo: bool} de lo que incluye el plan del asociado.
     * Solo para asociados; para admin y visitantes devuelve un mapa vacío.
     */
    private function planFeatures(?User $user): array
    {
        if (! $user || ! $user->associate_id || $user->isAdmin()) {
            return [];
        }

        $associate = Associate::with('plan.features')->find($user->associate_id);
        $plan = $associate?->plan;

        if (! $plan) {
            return [];
        }

        $map = [];
        foreach (Feature::orderBy('sort')->pluck('key') as $key) {
            $map[$key] = $plan->allows($key);
        }

        return $map;
    }
}
