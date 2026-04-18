<?php

namespace App\Http\Middleware;

use App\Models\ServiceCategory;
use Illuminate\Http\Request;
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
            $associate = \App\Models\Associate::with('plan')->find($user->associate_id);
            if ($associate) {
                $status = 'none';
                $daysRemaining = null;
                $daysTotal = null;
                $planStartedAt = null;

                if ($associate->plan_id && $associate->plan_expires_at) {
                    $planStartedAt = \App\Models\PaymentRequest::where('user_id', $user->id)
                        ->where('status', 'approved')
                        ->latest()
                        ->value('reviewed_at');

                    if ($associate->isSubscriptionActive()) {
                        $daysRemaining = (int) now()->diffInDays($associate->plan_expires_at, false);
                        $graceDays    = $associate->plan->grace_days ?? 0;

                        if ($daysRemaining >= 0) {
                            $status = 'active';
                            if ($planStartedAt) {
                                $daysTotal = (int) \Carbon\Carbon::parse($planStartedAt)->diffInDays($associate->plan_expires_at);
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
                    'status'       => $status,
                    'plan_name'    => $associate->plan?->name,
                    'plan_color'   => $associate->plan?->color_hex,
                    'days_remaining' => $daysRemaining,
                    'days_total'     => $daysTotal,
                    'expires_at'   => $associate->plan_expires_at?->format('d/m/Y'),
                ];
            }
        }

        return [
            ...parent::share($request),
            'associate_counts' => $user && ($user->is_superadmin || $user->role === 'admin')
            ? [
                'approved' => \App\Models\Associate::where('status', 'approved')->count(),
                'pending'  => \App\Models\Associate::where('status', 'pending')->count(),
                'inactive' => \App\Models\Associate::where('status', 'inactive')->count(),
            ]
            : null,
            'pending_payment_requests' => $user && ($user->is_superadmin || $user->role === 'admin')
                ? \App\Models\PaymentRequest::where('status', 'pending')->count()
                : null,
            'auth' => [
                'user'         => $user,
                'associate'    => $user && $user->associate_id
                ? [
                    'id'           => $user->associate->id,
                    'status'       => $user->associate->status,
                    'is_public'    => (bool) $user->associate->is_public,
                    'company_name' => $user->associate->company_name,
                    'logo_url'     => $user->associate->logo_path
                        ? \Illuminate\Support\Facades\Storage::url($user->associate->logo_path)
                        : null,
                ]
                : null,
            ],
            'subscription'       => $subscription,
            'unread_invoices'    => $user && $user->associate_id
                ? \App\Models\Invoice::where('associate_id', $user->associate_id)->whereNull('read_at')->count()
                : null,
            'service_categories' => ServiceCategory::withCount('services')->get(['id', 'name', 'slug', 'services_count']),
            'recent_companies' => \App\Models\Associate::where('status', 'approved')
                ->where('is_public', true)
                ->latest()
                ->take(5)
                ->get(['id', 'company_name', 'logo_path'])
                ->map(fn($a) => [
                    'id'   => $a->id,
                    'name' => $a->company_name,
                    'logo' => $a->logo_path ? \Illuminate\Support\Facades\Storage::url($a->logo_path) : null,
                ]),
            'tenant' => [
                'id'           => 'camep',
                'company_name' => 'CAMEP',
                'plan_type'    => 'Premium',
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error'   => $request->session()->get('error'),
                'draft_saved' => $request->session()->get('draft_saved'),
            ],
        ];
    }
}
