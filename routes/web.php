<?php

use App\Http\Controllers\Associate\AnnouncementController;
use App\Http\Controllers\Associate\BienesServiciosController;
use App\Http\Controllers\Associate\CheckoutController;
use App\Http\Controllers\Associate\InvoiceController;
use App\Http\Controllers\Associate\InvoicePaymentController;
use App\Http\Controllers\AssociateController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\BillingDocumentController;
use App\Http\Controllers\ForumController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PublicAnnouncementController;
use App\Http\Controllers\PublicBienesServiciosController;
use App\Http\Controllers\PublicBlogController;
use App\Http\Controllers\PublicCompanyController;
use App\Http\Controllers\PublicContactController;
use App\Http\Controllers\Webhooks\BoldWebhookController;
use App\Models\Announcement;
use App\Models\Associate;
use App\Models\BlogPost;
use App\Models\ServiceCategory;
use App\Models\Slider;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

// CAMEP Welcome / Landing
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'tenant' => [
            'id' => 'camep',
            'company_name' => 'CAMEP',
            'plan_type' => 'Premium',
        ],
        'sliders' => Slider::where('is_active', true)->orderBy('order')->get(),
        'service_categories' => ServiceCategory::withCount('services')->get(['id', 'name', 'slug', 'services_count']),
        'associates' => Associate::where('associates.status', 'approved')
            ->leftJoin('plans', 'associates.plan_id', '=', 'plans.id')
            ->select('associates.id', 'associates.company_name', 'associates.logo_path', 'associates.cover_path', 'plans.color_hex as plan_color')
            // Orden neutro: se retiró la prioridad por plan (plan 0016). La prioridad
            // volverá como módulo `ranking` (hábito de pago · reseñas · actividad · vistas).
            ->orderByDesc('associates.created_at')
            ->take(6)
            ->get()
            ->map(function ($associate) {
                return [
                    'id' => $associate->id,
                    'name' => $associate->company_name,
                    'logo' => $associate->logo_path ? Storage::url($associate->logo_path) : null,
                    'cover' => $associate->cover_path ? Storage::url($associate->cover_path) : null,
                ];
            }),
        'associates_count' => Associate::where('status', 'approved')->count(),
        'all_associates' => Associate::where('status', 'approved')
            ->where('is_public', true)
            ->select(['id', 'company_name', 'logo_path', 'cover_path', 'is_verified'])
            ->get()
            ->map(function ($associate) {
                return [
                    'id' => $associate->id,
                    'name' => $associate->company_name,
                    'logo' => $associate->logo_path ? Storage::url($associate->logo_path) : null,
                    'cover' => $associate->cover_path ? Storage::url($associate->cover_path) : null,
                    'is_verified' => $associate->is_verified,
                ];
            }),
        'latest_announcements' => Announcement::published()
            ->public()
            ->latest()
            ->take(3)
            ->get()
            ->map(fn ($a) => [
                'id' => $a->id,
                'title' => $a->title,
                'slug' => $a->slug,
                'excerpt' => $a->excerpt,
                'published_at' => $a->published_at->format('d M, Y'),
                'cover_url' => $a->cover_url ?: ($a->getFirstMediaUrl('cover', 'card') ?: null),
            ]),
        'latest_posts' => BlogPost::published()
            ->latest()
            ->take(3)
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'title' => $p->title,
                'slug' => $p->slug,
                'excerpt' => $p->excerpt,
                'published_at' => $p->published_at->format('d M, Y'),
                'category' => $p->category ? $p->category->name : 'General',
                'cover_url' => $p->getFirstMediaUrl('cover', 'card') ?: null,
            ]),
    ]);
})->name('welcome');

Route::get('/empresas', [PublicCompanyController::class, 'index'])->name('companies.index');
Route::get('/empresas/{id}', [PublicCompanyController::class, 'show'])->name('companies.show');
Route::get('/categorias/{slug}', [PublicCompanyController::class, 'categoryShow'])->name('categories.show');
Route::get('/servicios/{slug}', [PublicCompanyController::class, 'serviceShow'])->name('services.show');
Route::get('/nosotros', [PublicCompanyController::class, 'aboutShow'])->name('about');
Route::get('/nuestra-historia', [PublicCompanyController::class, 'historyShow'])->name('history');
Route::get('/que-nos-inspira', [PublicCompanyController::class, 'inspirationShow'])->name('inspiration');
Route::get('/nuestro-proposito', [PublicCompanyController::class, 'purposeShow'])->name('purpose');
Route::get('/proyeccion-2030', [PublicCompanyController::class, 'projectionShow'])->name('projection');
Route::get('/operadoras', [PublicCompanyController::class, 'operatorsShow'])->name('operators');

// Bienes y Servicios Public Routes
Route::get('/bienes-y-servicios', [PublicBienesServiciosController::class, 'index'])->name('bienes-servicios.index');
Route::get('/bienes-y-servicios/{company}', [PublicBienesServiciosController::class, 'showCompany'])->name('bienes-servicios.company');
Route::get('/bienes-y-servicios/{company}/{tender}', [PublicBienesServiciosController::class, 'showTender'])->name('bienes-servicios.tender');

// Blog Public Routes
Route::get('/blog', [PublicBlogController::class, 'index'])->name('blog.index');
Route::get('/blog/{slug}', [PublicBlogController::class, 'show'])->name('blog.show');

// Announcements Public Routes
Route::get('/anuncios', [PublicAnnouncementController::class, 'index'])->name('announcements.index');
Route::get('/anuncios/{slug}', [PublicAnnouncementController::class, 'show'])->name('announcements.show');

// Contact Public Routes
Route::get('/contacto', [PublicContactController::class, 'index'])->name('contact.index');
Route::post('/contacto', [PublicContactController::class, 'store'])->name('contact.store');

// Red CAMEP Public Routes
Route::get('/red-camep', [ForumController::class, 'index'])->name('forums.index');
Route::get('/red-camep/{slug}', [ForumController::class, 'showCategory'])->name('forums.category');
Route::get('/red-camep/{categorySlug}/{topicSlug}', [ForumController::class, 'showTopic'])->name('forums.topic');

// Auth Routes (Login / Register)
// Avisos de la pasarela: sin sesión ni token CSRF, se autentican por firma.
// La exclusión de CSRF está en bootstrap/app.php.
Route::post('/webhooks/bold', BoldWebhookController::class)
    ->name('webhooks.bold');

Route::middleware('guest')->group(function () {
    Route::get('login', [AuthenticatedSessionController::class, 'create'])
        ->name('login');
    Route::post('login', [AuthenticatedSessionController::class, 'store'])
        ->name('login.store');

    Route::get('register', [RegisteredUserController::class, 'create'])
        ->name('register');
    Route::post('register', [RegisteredUserController::class, 'store'])
        ->name('register.store');

    // Registro multipaso (Corte 3D). JSON + rate-limit por IP.
    Route::post('register/check-email', [RegisteredUserController::class, 'checkEmail'])
        ->name('register.check-email')->middleware('throttle:20,1');
    Route::post('register/otp', [RegisteredUserController::class, 'sendOtp'])
        ->name('register.otp')->middleware('throttle:10,1');
    Route::post('register/otp/verify', [RegisteredUserController::class, 'verifyOtp'])
        ->name('register.otp.verify')->middleware('throttle:20,1');

    // Recuperación de contraseña por OTP (Corte 3E).
    Route::get('forgot-password', [PasswordResetController::class, 'create'])
        ->name('password.request');
    Route::post('forgot-password', [PasswordResetController::class, 'sendOtp'])
        ->name('password.email')->middleware('throttle:6,1');
    Route::post('reset-password', [PasswordResetController::class, 'reset'])
        ->name('password.update')->middleware('throttle:6,1');
});

// Protected CAMEP Routes
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', function () {
        $user = auth()->user();
        $associate = null;
        if ($user->associate_id) {
            $associate = Associate::select(['id', 'company_name', 'section_reviews'])
                ->find($user->associate_id);
        }

        return Inertia::render('Dashboard', [
            'associateProfile' => $associate ? [
                'company_name' => $associate->company_name,
                'section_reviews' => $associate->section_reviews ?? [],
            ] : null,
        ]);
    })->name('dashboard');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Catálogo propio de ubicaciones (DANE/DIVIPOLA) para los Select del formulario.
    // Reemplaza a api-colombia.com. Ver ADR-0005 / plan 0007 (corte 7-B).
    Route::get('/ubicaciones/departamentos', [LocationController::class, 'departments'])
        ->name('locations.departments');
    Route::get('/ubicaciones/departamentos/{department}/ciudades', [LocationController::class, 'cities'])
        ->name('locations.cities');

    // Authenticated download of associate documents (owner or admin only).
    Route::get('/associate/documents/{associate}/{docKey}', [AssociateController::class, 'showDocument'])
        ->name('associate.documents.show');

    // Documentos de facturación: comprobantes y facturas, solo dueño o admin.
    Route::get('/billing/proof/{paymentRequest}', [BillingDocumentController::class, 'proof'])
        ->name('billing.proof');
    Route::get('/billing/payment/{payment}/proof', [BillingDocumentController::class, 'paymentProof'])
        ->name('billing.payment-proof');
    Route::get('/billing/invoice/{invoice}/document', [BillingDocumentController::class, 'invoice'])
        ->name('billing.invoice.document');

    // Associate Announcements (suscripción activa + módulo de plan)
    Route::middleware(['subscription.active', 'feature:anuncios'])->group(function () {
        Route::get('/my-announcements', [AnnouncementController::class, 'index'])->name('associate.announcements.index');
        Route::get('/my-announcements/{slug}', [AnnouncementController::class, 'show'])->name('associate.announcements.show');
    });

    // Billing / Subscription (accessible even when expired)
    Route::middleware(['associate.onboarding'])->group(function () {
        Route::get('/my-company/billing', [AssociateController::class, 'billing'])->name('associate.company.billing');

        // Checkout (accessible even when expired so they can pay)
        Route::get('/my-company/checkout/{plan}', [CheckoutController::class, 'show'])->name('associate.checkout.show');
        Route::post('/my-company/checkout/{plan}', [CheckoutController::class, 'store'])->name('associate.checkout.store');

        // Pago de una cuenta de cobro. Siempre accesible, incluso vencido:
        // es la puerta que faltaba. Ver docs/adr/0001-motor-de-cobro-unificado.md
        Route::get('/my-company/facturas/{invoice}/pagar', [InvoicePaymentController::class, 'show'])->name('associate.invoice.pay');
        Route::post('/my-company/facturas/{invoice}/comprobante', [InvoicePaymentController::class, 'submitProof'])->name('associate.invoice.proof');
        Route::get('/my-company/facturas/{invoice}/pago-en-linea', [InvoicePaymentController::class, 'online'])->name('associate.invoice.online');
    });

    // Associate Profile Management (New independent pages) - Protected by onboarding status
    Route::name('associate.company.')->prefix('my-company')->middleware(['auth', 'associate.onboarding'])->group(function () {
        Route::get('/basic-info', [AssociateController::class, 'editBasicInfo'])->name('basic');
        Route::post('/basic-info', [AssociateController::class, 'updateBasicInfo'])->name('update.basic');
        Route::post('/basic-info/draft', [AssociateController::class, 'saveBasicInfoDraft'])->name('save.draft');
        Route::post('/basic-info/reopen', [AssociateController::class, 'reopenBasicInfo'])->name('reopen.basic');

        Route::get('/characterization', [AssociateController::class, 'editCharacterization'])->name('characterization');
        Route::post('/characterization', [AssociateController::class, 'updateCharacterization'])->name('update.characterization');
        Route::post('/characterization/draft', [AssociateController::class, 'saveCharacterizationDraft'])->name('save.characterization.draft');
        Route::post('/characterization/reopen', [AssociateController::class, 'reopenCharacterization'])->name('reopen.characterization');

        Route::get('/contacts', [AssociateController::class, 'editContacts'])->name('contacts');
        Route::post('/contacts', [AssociateController::class, 'updateContacts'])->name('update.contacts');
        Route::post('/contacts/draft', [AssociateController::class, 'saveContactsDraft'])->name('save.contacts.draft');
        Route::post('/contacts/reopen', [AssociateController::class, 'reopenContacts'])->name('reopen.contacts');

        Route::get('/services', [AssociateController::class, 'editServices'])->name('services');
        Route::post('/services', [AssociateController::class, 'updateServices'])->name('update.services');
        Route::post('/services/draft', [AssociateController::class, 'saveServicesDraft'])->name('save.services.draft');
        Route::post('/services/reopen', [AssociateController::class, 'reopenServices'])->name('reopen.services');

        Route::get('/documentation', [AssociateController::class, 'editDocumentation'])->name('documentation');
        Route::post('/documentation', [AssociateController::class, 'updateDocumentation'])->name('update.documentation');
        Route::post('/documentation/draft', [AssociateController::class, 'saveDocumentationDraft'])->name('save.documentation.draft');
        Route::delete('/documentation/{docKey}', [AssociateController::class, 'deleteDocument'])->name('documentation.delete');
        Route::post('/documentation/reopen', [AssociateController::class, 'reopenDocumentation'])->name('reopen.documentation');

        Route::get('/gallery', [AssociateController::class, 'editGallery'])->name('gallery');
        Route::post('/gallery', [AssociateController::class, 'updateGallery'])->name('update.gallery');
        Route::delete('/gallery/image', [AssociateController::class, 'deleteGalleryImage'])->name('delete.gallery.image');
        Route::post('/gallery/set-cover', [AssociateController::class, 'setCoverImage'])->name('set.cover.image');
        Route::post('/gallery/logo', [AssociateController::class, 'uploadLogo'])->name('upload.logo');
        Route::delete('/gallery/logo', [AssociateController::class, 'deleteLogo'])->name('delete.logo');

        // Mis Facturas
        Route::get('/mis-facturas', [InvoiceController::class, 'index'])->name('invoices.index');

        // Bienes y Servicios (Associate) — beneficio de plan: se corta al vencer
        Route::middleware(['subscription.active'])->group(function () {
            Route::get('/bienes-y-servicios', [BienesServiciosController::class, 'index'])->name('bienes-servicios.index');
            Route::get('/bienes-y-servicios/{company}', [BienesServiciosController::class, 'showCompany'])->name('bienes-servicios.company');
            Route::get('/bienes-y-servicios/{company}/{tender}', [BienesServiciosController::class, 'showTender'])->name('bienes-servicios.tender');
        });

    });

    // Red CAMEP Actions — participar exige estar al día y que el plan incluya foros;
    // leer sigue siendo público
    Route::name('forums.')->prefix('red-camep')->middleware(['associate.onboarding', 'subscription.active', 'feature:foros'])->group(function () {
        Route::post('/{category}/topic', [ForumController::class, 'storeTopic'])->name('topic.store');
        Route::post('/topic/{topic}/reply', [ForumController::class, 'storeReply'])->name('reply.store');
        Route::post('/react/{type}/{id}', [ForumController::class, 'react'])->name('react');
        Route::post('/report/{type}/{id}', [ForumController::class, 'report'])->name('report');
    });

    // Admin Panel for CAMEP — solo admin/superadmin (ADR-0006). Antes estaba solo bajo 'auth'.
    // Panel de administración. Las rutas viven en routes/admin.php (plan 0015).
    Route::name('admin.')->prefix('admin')->middleware('admin')->group(base_path('routes/admin.php'));

    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');
});

// Galería de componentes — SOLO local, abierta, temporal. Regla 9 (design.md §6).
if (app()->environment('local')) {
    Route::get('dev/componentes', function () {
        return Inertia::render('Dev/Componentes');
    })->name('dev.componentes');
}
