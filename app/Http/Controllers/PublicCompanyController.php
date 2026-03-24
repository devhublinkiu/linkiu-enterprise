<?php

namespace App\Http\Controllers;

use App\Models\Associate;
use App\Models\ServiceCategory;
use App\Models\Service;
use App\Models\Slider;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class PublicCompanyController extends Controller
{
    public function index(Request $request)
    {
        $query = Associate::where('associates.status', 'approved')
            ->where('is_public', true)
            ->leftJoin('plans', 'associates.plan_id', '=', 'plans.id')
            ->select('associates.*', 'plans.has_priority_directory', 'plans.color_hex as plan_color', 'plans.name as plan_name')
            ->orderByRaw('plans.has_priority_directory DESC, associates.created_at DESC')
            ->with(['services.category']);

        // Search by company name
        if ($request->filled('search')) {
            $query->where('company_name', 'like', '%' . $request->search . '%');
        }

        // Filter by category
        if ($request->filled('category_id')) {
            $query->whereHas('services', function ($q) use ($request) {
                $q->where('category_id', $request->category_id);
            });
        }

        // Filter by service
        if ($request->filled('service_id')) {
            $query->whereHas('services', function ($q) use ($request) {
                $q->where('services.id', $request->service_id);
            });
        }

        $associates = $query->latest()->get()->map(function ($associate) {
            $disk = config('filesystems.default');
            
            // Get unique categories for badges
            $categories = $associate->services->pluck('category')->unique('id')->values();

            return [
                'id' => $associate->id,
                'name' => $associate->company_name,
                'nit' => $associate->nit,
                'description' => $associate->description,
                'logo' => $associate->logo_path ? Storage::disk($disk)->url($associate->logo_path) : null,
                'cover' => $associate->cover_path ? Storage::disk($disk)->url($associate->cover_path) : null,
                'is_verified' => $associate->is_verified,
                'website' => $associate->website,
                'phone' => $associate->phone,
                'facebook' => $associate->social_facebook,
                'instagram' => $associate->social_instagram,
                'linkedin' => $associate->social_linkedin,
                'categories' => $categories->map(function($cat) {
                    return [
                        'id' => $cat->id,
                        'name' => $cat->name,
                        'slug' => $cat->slug,
                    ];
                }),
                'plan_color' => $associate->plan_color,
                'plan_name' => $associate->plan_name,
            ];
        });

        return Inertia::render('Public/Companies/Index', [
            'associates' => $associates,
            'categories' => ServiceCategory::all(['id', 'name']),
            'services' => Service::where('is_active', true)->get(['id', 'name', 'category_id']),
            'sliders' => Slider::where('is_active', true)->orderBy('order')->get(),
            'filters' => $request->only(['search', 'category_id', 'service_id']),
        ]);
    }

    public function show($id)
    {
        $associate = Associate::where('status', 'approved')
            ->where('is_public', true)
            ->with(['services.category', 'contacts', 'references'])
            ->findOrFail($id);

        $disk = config('filesystems.default');

        // Group services by category
        $categories = $associate->services->pluck('category')->unique('id')->values()->map(function($cat) use ($associate) {
            return [
                'id' => $cat->id,
                'name' => $cat->name,
                'services' => $associate->services->where('category_id', $cat->id)->values()->map(fn($s) => $s->name)
            ];
        });

        $data = [
            'id' => $associate->id,
            'name' => $associate->company_name,
            'nit' => $associate->nit,
            'description' => $associate->description,
            'logo' => $associate->logo_path ? Storage::disk($disk)->url($associate->logo_path) : null,
            'cover' => $associate->cover_path ? Storage::disk($disk)->url($associate->cover_path) : null,
            'gallery' => collect($associate->gallery_paths ?? [])->map(fn($path) => Storage::disk($disk)->url($path)),
            'is_verified' => $associate->is_verified,
            'website' => $associate->website,
            'phone' => $associate->phone,
            'facebook' => $associate->social_facebook,
            'instagram' => $associate->social_instagram,
            'linkedin' => $associate->social_linkedin,
            'billing_email' => $associate->billing_email,
            'address' => $associate->address,
            'department' => $associate->department,
            'city' => $associate->city,
            'rep_name' => $associate->rep_name,
            'constitution_date' => $associate->constitution_date ? $associate->constitution_date->format('d/m/Y') : null,
            'main_ciiu' => $associate->main_ciiu,
            'company_type' => $associate->company_type,
            'categories' => $categories,
        ];

        return Inertia::render('Public/Companies/Show', [
            'company' => $data
        ]);
    }

    public function categoryShow($slug)
    {
        $category = ServiceCategory::where('slug', $slug)
            ->with(['services' => function($query) {
                $query->where('is_active', true);
            }])
            ->firstOrFail();

        return Inertia::render('Public/Categories/Show', [
            'category' => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'services' => $category->services->map(fn($s) => [
                    'id' => $s->id,
                    'name' => $s->name,
                    'slug' => $s->slug,
                ])
            ]
        ]);
    }

    public function serviceShow($slug)
    {
        $service = Service::where('slug', $slug)
            ->with(['category', 'associates' => function($query) {
                $query->where('associates.status', 'approved')
                    ->where('is_public', true)
                    ->leftJoin('plans', 'associates.plan_id', '=', 'plans.id')
                    ->select('associates.*', 'plans.has_priority_directory', 'plans.color_hex as plan_color')
                    ->orderByRaw('plans.has_priority_directory DESC, associates.created_at DESC')
                    ->with('services.category');
            }])
            ->firstOrFail();

        $disk = config('filesystems.default');

        $associates = $service->associates->map(function($associate) use ($disk) {
            return [
                'id' => $associate->id,
                'name' => $associate->company_name,
                'nit' => $associate->nit,
                'logo' => $associate->logo_path ? Storage::disk($disk)->url($associate->logo_path) : null,
                'cover' => $associate->cover_path ? Storage::disk($disk)->url($associate->cover_path) : null,
                'is_verified' => $associate->is_verified,
                'description' => $associate->description,
                'phone' => $associate->phone,
                'website' => $associate->website,
                'facebook' => $associate->social_facebook,
                'instagram' => $associate->social_instagram,
                'linkedin' => $associate->social_linkedin,
                'categories' => $associate->services->pluck('category')->unique('id')->values()->map(fn($c) => [
                    'id' => $c->id,
                    'name' => $c->name,
                    'slug' => $c->slug,
                ]),
                'plan_color' => $associate->plan_color,
            ];
        });

        return Inertia::render('Public/Services/Show', [
            'service' => [
                'id' => $service->id,
                'name' => $service->name,
                'slug' => $service->slug,
                'category' => $service->category,
            ],
            'associates' => $associates
        ]);
    }

    public function aboutShow()
    {
        return Inertia::render('Public/About');
    }

    public function historyShow()
    {
        return Inertia::render('Public/History');
    }

    public function inspirationShow()
    {
        return Inertia::render('Public/Inspiration');
    }

    public function projectionShow()
    {
        return Inertia::render('Public/Projection');
    }

    public function purposeShow()
    {
        return Inertia::render('Public/Purpose');
    }

    public function operatorsShow()
    {
        return Inertia::render('Public/Operadoras');
    }
}
