<?php

namespace App\Http\Controllers;

use App\Models\Associate;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\Slider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PublicCompanyController extends Controller
{
    public function index(Request $request)
    {
        $query = Associate::where('associates.status', 'approved')
            ->where('is_public', true)
            // Micrositio en borrador → fuera del directorio (plan 0021, corte 21-E).
            ->where('associates.microsite_published', true)
            ->leftJoin('plans', 'associates.plan_id', '=', 'plans.id')
            ->select('associates.*', 'plans.color_hex as plan_color', 'plans.name as plan_name')
            // Orden neutro: la prioridad por plan se retiró (plan 0016).
            ->orderByDesc('associates.created_at')
            ->with(['services.category']);

        // Search by company name
        if ($request->filled('search')) {
            $query->where('company_name', 'like', '%'.$request->search.'%');
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
                'categories' => $categories->map(function ($cat) {
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
            ->with(['services.category', 'contacts', 'references', 'projects.images', 'certifications', 'teamMembers', 'clients'])
            ->findOrFail($id);

        // URL canónica: si ya tiene slug, redirige a la dirección personalizada.
        if ($associate->slug) {
            return redirect()->route('companies.microsite', ['slug' => $associate->slug], 301);
        }

        return $this->renderVisible($associate);
    }

    /**
     * Micrositio por slug personalizado (ruta de último recurso en el raíz).
     * Plan 0021 / ADR-0009. Un slug reservado nunca llega aquí (guard de ruta),
     * pero se comprueba igual por defensa.
     */
    public function showBySlug(string $slug)
    {
        if (Associate::isReservedSlug($slug)) {
            abort(404);
        }

        $associate = Associate::where('slug', $slug)
            ->where('status', 'approved')
            ->with(['services.category', 'contacts', 'references', 'projects.images', 'certifications', 'teamMembers', 'clients'])
            ->firstOrFail();

        return $this->renderVisible($associate);
    }

    /**
     * Compuerta de visibilidad del micrositio (plan 0021, corte 21-E):
     * público solo si is_public + microsite_published; si está en borrador, solo
     * el dueño lo ve como vista previa. Cualquier otro caso → 404.
     */
    private function renderVisible(Associate $associate)
    {
        $viewerAssociateId = auth()->user()?->associate_id;
        $isOwner = $viewerAssociateId && (int) $viewerAssociateId === (int) $associate->id;

        $live = $associate->is_public && $associate->microsite_published;
        $ownerPreview = $isOwner && $associate->is_public && ! $associate->microsite_published;

        abort_unless($live || $ownerPreview, 404);

        return $this->renderProfile($associate, $ownerPreview);
    }

    private function renderProfile(Associate $associate, bool $preview = false)
    {
        $disk = config('filesystems.default');
        $url = fn (?string $path) => $path ? Storage::disk($disk)->url($path) : null;

        // Servicios aprobados enriquecidos (plan 0021): nombre + categoría + la
        // descripción/cover del pivot (opcionales). No se inventan servicios.
        $services = $associate->services->map(fn ($s) => [
            'id' => $s->id,
            'name' => $s->name,
            'category' => $s->category?->name,
            'description' => $s->pivot->description,
            'cover' => $url($s->pivot->cover_path),
        ])->values();

        $projects = $associate->projects->map(fn ($p) => [
            'id' => $p->id,
            'title' => $p->title,
            'description' => $p->description,
            'client' => $p->client,
            'images' => $p->images->map(fn ($img) => $url($img->path))->values(),
        ])->values();

        $data = [
            'id' => $associate->id,
            'name' => $associate->company_name,
            'slug' => $associate->slug,
            'nit' => $associate->nit,
            'is_verified' => $associate->is_verified,
            'logo' => $url($associate->logo_path),
            'cover' => $url($associate->cover_path),
            // Portada del hero: gradiente animado (por defecto) o imagen propia.
            'portada' => [
                'type' => $associate->cover_type ?: 'gradient',
                'image' => $url($associate->microsite_cover_path),
            ],
            'facades' => collect($associate->facade_paths ?? [])->take(3)->map($url)->values(),
            'about_story' => $associate->about_story,
            'about_image' => $url($associate->about_image_path),
            'description' => $associate->description,
            'legal' => [
                'rep_name' => $associate->rep_name,
                'main_ciiu' => $associate->main_ciiu,
                'constitution_date' => $associate->constitution_date?->format('d/m/Y'),
                'company_type' => $associate->company_type,
                'address' => $associate->address,
                'department' => $associate->department,
                'city' => $associate->city,
            ],
            'contact' => [
                'phone' => $associate->phone,
                'whatsapp' => $associate->whatsapp,
                'email' => $associate->contact_email ?: $associate->billing_email,
                'website' => $associate->website,
                'address' => $associate->address,
                'facebook' => $associate->social_facebook,
                'instagram' => $associate->social_instagram,
                'linkedin' => $associate->social_linkedin,
            ],
            'services' => $services,
            'projects' => $projects,
            'gallery' => collect($associate->gallery_paths ?? [])->map($url)->values(),
            'certifications' => $associate->certifications->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'year' => $c->year,
                'image' => $url($c->image_path),
            ])->values(),
            'team' => $associate->teamMembers->map(fn ($m) => [
                'id' => $m->id,
                'name' => $m->name,
                'position' => $m->position,
                'photo' => $url($m->photo_path),
                'email' => $m->email,
                'phone' => $m->phone,
            ])->values(),
            'clients' => $associate->clients->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'logo' => $url($c->logo_path),
            ])->values(),
        ];

        return Inertia::render('Public/Companies/Show', [
            'company' => $data,
            'preview' => $preview,
        ]);
    }

    public function categoryShow($slug)
    {
        $category = ServiceCategory::where('slug', $slug)
            ->with(['services' => function ($query) {
                $query->where('is_active', true);
            }])
            ->firstOrFail();

        return Inertia::render('Public/Categories/Show', [
            'category' => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'services' => $category->services->map(fn ($s) => [
                    'id' => $s->id,
                    'name' => $s->name,
                    'slug' => $s->slug,
                ]),
            ],
        ]);
    }

    public function serviceShow($slug)
    {
        $service = Service::where('slug', $slug)
            ->with(['category', 'associates' => function ($query) {
                $query->where('associates.status', 'approved')
                    ->where('is_public', true)
                    ->where('associates.microsite_published', true)
                    ->leftJoin('plans', 'associates.plan_id', '=', 'plans.id')
                    ->select('associates.*', 'plans.color_hex as plan_color')
                    // Orden neutro: la prioridad por plan se retiró (plan 0016).
                    ->orderByDesc('associates.created_at')
                    ->with('services.category');
            }])
            ->firstOrFail();

        $disk = config('filesystems.default');

        $associates = $service->associates->map(function ($associate) use ($disk) {
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
                'categories' => $associate->services->pluck('category')->unique('id')->values()->map(fn ($c) => [
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
            'associates' => $associates,
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
