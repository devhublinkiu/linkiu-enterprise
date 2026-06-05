<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PublicCompanyController;
use App\Http\Controllers\PublicBlogController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// CAMEP Welcome / Landing
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'tenant' => [
            'id' => 'camep',
            'company_name' => 'CAMEP',
            'plan_type' => 'Premium'
        ],
        'sliders' => \App\Models\Slider::where('is_active', true)->orderBy('order')->get(),
        'service_categories' => \App\Models\ServiceCategory::withCount('services')->get(['id', 'name', 'slug', 'services_count']),
        'associates' => \App\Models\Associate::where('associates.status', 'approved')
            ->leftJoin('plans', 'associates.plan_id', '=', 'plans.id')
            ->select('associates.id', 'associates.company_name', 'associates.logo_path', 'associates.cover_path', 'plans.color_hex as plan_color')
            ->orderByRaw('plans.has_priority_directory DESC, associates.created_at DESC')
            ->take(6)
            ->get()
            ->map(function($associate) {
                return [
                    'id' => $associate->id,
                    'name' => $associate->company_name,
                    'logo' => $associate->logo_path ? \Illuminate\Support\Facades\Storage::url($associate->logo_path) : null,
                    'cover' => $associate->cover_path ? \Illuminate\Support\Facades\Storage::url($associate->cover_path) : null
                ];
            }),
        'associates_count' => \App\Models\Associate::where('status', 'approved')->count(),
        'all_associates' => \App\Models\Associate::where('status', 'approved')
            ->where('is_public', true)
            ->select(['id', 'company_name', 'logo_path', 'cover_path', 'is_verified'])
            ->get()
            ->map(function($associate) {
                return [
                    'id' => $associate->id,
                    'name' => $associate->company_name,
                    'logo' => $associate->logo_path ? \Illuminate\Support\Facades\Storage::url($associate->logo_path) : null,
                    'cover' => $associate->cover_path ? \Illuminate\Support\Facades\Storage::url($associate->cover_path) : null,
                    'is_verified' => $associate->is_verified
                ];
            }),
        'latest_announcements' => \App\Models\Announcement::published()
            ->public()
            ->latest()
            ->take(3)
            ->get()
            ->map(fn($a) => [
                'id' => $a->id,
                'title' => $a->title,
                'slug' => $a->slug,
                'excerpt' => $a->excerpt,
                'published_at' => $a->published_at->format('d M, Y'),
                'cover_url' => $a->cover_url ?: ($a->getFirstMediaUrl('cover', 'card') ?: null),
            ]),
        'latest_posts' => \App\Models\BlogPost::published()
            ->latest()
            ->take(3)
            ->get()
            ->map(fn($p) => [
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
Route::get('/bienes-y-servicios', [\App\Http\Controllers\PublicBienesServiciosController::class, 'index'])->name('bienes-servicios.index');
Route::get('/bienes-y-servicios/{company}', [\App\Http\Controllers\PublicBienesServiciosController::class, 'showCompany'])->name('bienes-servicios.company');
Route::get('/bienes-y-servicios/{company}/{tender}', [\App\Http\Controllers\PublicBienesServiciosController::class, 'showTender'])->name('bienes-servicios.tender');

// Blog Public Routes
Route::get('/blog', [\App\Http\Controllers\PublicBlogController::class, 'index'])->name('blog.index');
Route::get('/blog/{slug}', [\App\Http\Controllers\PublicBlogController::class, 'show'])->name('blog.show');

// Announcements Public Routes
Route::get('/anuncios', [\App\Http\Controllers\PublicAnnouncementController::class, 'index'])->name('announcements.index');
Route::get('/anuncios/{slug}', [\App\Http\Controllers\PublicAnnouncementController::class, 'show'])->name('announcements.show');

// Contact Public Routes
Route::get('/contacto', [\App\Http\Controllers\PublicContactController::class, 'index'])->name('contact.index');
Route::post('/contacto', [\App\Http\Controllers\PublicContactController::class, 'store'])->name('contact.store');

// Red CAMEP Public Routes
Route::get('/red-camep', [\App\Http\Controllers\ForumController::class, 'index'])->name('forums.index');
Route::get('/red-camep/{slug}', [\App\Http\Controllers\ForumController::class, 'showCategory'])->name('forums.category');
Route::get('/red-camep/{categorySlug}/{topicSlug}', [\App\Http\Controllers\ForumController::class, 'showTopic'])->name('forums.topic');

// Auth Routes (Login / Register)
Route::middleware('guest')->group(function () {
    Route::get('login', [App\Http\Controllers\Auth\AuthenticatedSessionController::class, 'create'])
        ->name('login');
    Route::post('login', [App\Http\Controllers\Auth\AuthenticatedSessionController::class, 'store'])
        ->name('login.store');

    Route::get('register', [App\Http\Controllers\Auth\RegisteredUserController::class, 'create'])
        ->name('register');
    Route::post('register', [App\Http\Controllers\Auth\RegisteredUserController::class, 'store'])
        ->name('register.store');
});

// Protected CAMEP Routes
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', function () {
        $user      = auth()->user();
        $associate = null;
        if ($user->associate_id) {
            $associate = \App\Models\Associate::select(['id', 'company_name', 'section_reviews'])
                ->find($user->associate_id);
        }
        return Inertia::render('Dashboard', [
            'associateProfile' => $associate ? [
                'company_name'    => $associate->company_name,
                'section_reviews' => $associate->section_reviews ?? [],
            ] : null,
        ]);
    })->name('dashboard');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Authenticated download of associate documents (owner or admin only).
    Route::get('/associate/documents/{associate}/{docKey}', [App\Http\Controllers\AssociateController::class, 'showDocument'])
        ->name('associate.documents.show');

    // Associate Announcements (Protected by subscription)
    Route::middleware(['subscription.active'])->group(function () {
        Route::get('/my-announcements', [App\Http\Controllers\Associate\AnnouncementController::class, 'index'])->name('associate.announcements.index');
        Route::get('/my-announcements/{slug}', [App\Http\Controllers\Associate\AnnouncementController::class, 'show'])->name('associate.announcements.show');
    });


    // Billing / Subscription (accessible even when expired)
    Route::middleware(['associate.onboarding'])->group(function () {
        Route::get('/my-company/billing', [App\Http\Controllers\AssociateController::class, 'billing'])->name('associate.company.billing');

        // Checkout (accessible even when expired so they can pay)
        Route::get('/my-company/checkout/{plan}', [App\Http\Controllers\Associate\CheckoutController::class, 'show'])->name('associate.checkout.show');
        Route::post('/my-company/checkout/{plan}', [App\Http\Controllers\Associate\CheckoutController::class, 'store'])->name('associate.checkout.store');
    });

    // Associate Profile Management (New independent pages) - Protected by onboarding status
    Route::name('associate.company.')->prefix('my-company')->middleware(['auth', 'associate.onboarding'])->group(function () {
        Route::get('/basic-info', [App\Http\Controllers\AssociateController::class, 'editBasicInfo'])->name('basic');
        Route::post('/basic-info', [App\Http\Controllers\AssociateController::class, 'updateBasicInfo'])->name('update.basic');
        Route::post('/basic-info/draft', [App\Http\Controllers\AssociateController::class, 'saveBasicInfoDraft'])->name('save.draft');
        Route::post('/section/request-change', [App\Http\Controllers\AssociateController::class, 'requestSectionChange'])->name('request.section.change');
        

        Route::get('/characterization', [App\Http\Controllers\AssociateController::class, 'editCharacterization'])->name('characterization');
        Route::post('/characterization', [App\Http\Controllers\AssociateController::class, 'updateCharacterization'])->name('update.characterization');
        Route::post('/characterization/draft', [App\Http\Controllers\AssociateController::class, 'saveCharacterizationDraft'])->name('save.characterization.draft');
        
        Route::get('/contacts', [App\Http\Controllers\AssociateController::class, 'editContacts'])->name('contacts');
        Route::post('/contacts', [App\Http\Controllers\AssociateController::class, 'updateContacts'])->name('update.contacts');
        Route::post('/contacts/draft', [App\Http\Controllers\AssociateController::class, 'saveContactsDraft'])->name('save.contacts.draft');

        Route::get('/services', [App\Http\Controllers\AssociateController::class, 'editServices'])->name('services');
        Route::post('/services', [App\Http\Controllers\AssociateController::class, 'updateServices'])->name('update.services');
        Route::post('/services/draft', [App\Http\Controllers\AssociateController::class, 'saveServicesDraft'])->name('save.services.draft');

        Route::get('/documentation', [App\Http\Controllers\AssociateController::class, 'editDocumentation'])->name('documentation');
        Route::post('/documentation', [App\Http\Controllers\AssociateController::class, 'updateDocumentation'])->name('update.documentation');
        Route::post('/documentation/draft', [App\Http\Controllers\AssociateController::class, 'saveDocumentationDraft'])->name('save.documentation.draft');
        Route::delete('/documentation/{docKey}', [App\Http\Controllers\AssociateController::class, 'deleteDocument'])->name('documentation.delete');

        Route::get('/gallery', [App\Http\Controllers\AssociateController::class, 'editGallery'])->name('gallery');
        Route::post('/gallery', [App\Http\Controllers\AssociateController::class, 'updateGallery'])->name('update.gallery');
        Route::delete('/gallery/image', [App\Http\Controllers\AssociateController::class, 'deleteGalleryImage'])->name('delete.gallery.image');
        Route::post('/gallery/set-cover', [App\Http\Controllers\AssociateController::class, 'setCoverImage'])->name('set.cover.image');
        Route::post('/gallery/logo', [App\Http\Controllers\AssociateController::class, 'uploadLogo'])->name('upload.logo');
        Route::delete('/gallery/logo', [App\Http\Controllers\AssociateController::class, 'deleteLogo'])->name('delete.logo');

        // Mis Facturas
        Route::get('/mis-facturas', [App\Http\Controllers\Associate\InvoiceController::class, 'index'])->name('invoices.index');

        // Bienes y Servicios (Associate)
        Route::get('/bienes-y-servicios', [App\Http\Controllers\Associate\BienesServiciosController::class, 'index'])->name('bienes-servicios.index');
        Route::get('/bienes-y-servicios/{company}', [App\Http\Controllers\Associate\BienesServiciosController::class, 'showCompany'])->name('bienes-servicios.company');
        Route::get('/bienes-y-servicios/{company}/{tender}', [App\Http\Controllers\Associate\BienesServiciosController::class, 'showTender'])->name('bienes-servicios.tender');

    });

    // Red CAMEP Actions (Accessible to any authenticated user with active subscription)
    Route::name('forums.')->prefix('red-camep')->middleware(['associate.onboarding'])->group(function () {
        Route::post('/{category}/topic', [\App\Http\Controllers\ForumController::class, 'storeTopic'])->name('topic.store');
        Route::post('/topic/{topic}/reply', [\App\Http\Controllers\ForumController::class, 'storeReply'])->name('reply.store');
        Route::post('/react/{type}/{id}', [\App\Http\Controllers\ForumController::class, 'react'])->name('react');
        Route::post('/report/{type}/{id}', [\App\Http\Controllers\ForumController::class, 'report'])->name('report');
    });

    // Admin Panel for CAMEP
    Route::name('admin.')->prefix('admin')->group(function () {
        // Users
        Route::get('users', [App\Http\Controllers\Admin\UserController::class, 'index'])->name('users.index');
        Route::post('users/{user}/password', [App\Http\Controllers\Admin\UserController::class, 'updatePassword'])->name('users.update-password');

        Route::get('associates', [App\Http\Controllers\AssociateController::class, 'index'])->name('associates.index');
        Route::get('associates/{associate}', [App\Http\Controllers\AssociateController::class, 'show'])->name('associates.show');
        Route::post('associates/{associate}/audit-section', [App\Http\Controllers\AssociateController::class, 'auditSection'])->name('associates.audit-section');
        Route::post('associates/{associate}/audit-change-request', [App\Http\Controllers\AssociateController::class, 'auditChangeRequest'])->name('associates.audit-change-request');
        Route::put('associates/{associate}', [App\Http\Controllers\AssociateController::class, 'update'])->name('associates.update');
        Route::post('associates/{associate}/gallery', [App\Http\Controllers\AssociateController::class, 'adminGalleryUpload'])->name('associates.gallery.upload');
        Route::post('associates/{associate}/gallery/delete', [App\Http\Controllers\AssociateController::class, 'adminGalleryDelete'])->name('associates.gallery.delete');
        Route::post('associates/{associate}/gallery/cover', [App\Http\Controllers\AssociateController::class, 'adminGalleryCover'])->name('associates.gallery.cover');
        Route::post('associates/{associate}/approve', [App\Http\Controllers\AssociateController::class, 'approve'])->name('associates.approve');
        Route::post('associates/{associate}/toggle-public', [App\Http\Controllers\AssociateController::class, 'togglePublic'])->name('associates.toggle-public');
        Route::post('associates/{associate}/toggle-verified', [App\Http\Controllers\AssociateController::class, 'toggleVerified'])->name('associates.toggle-verified');

        // Sliders
        Route::get('sliders', [App\Http\Controllers\Admin\SliderController::class, 'index'])->name('sliders.index');
        Route::post('sliders', [App\Http\Controllers\Admin\SliderController::class, 'store'])->name('sliders.store');
        Route::post('sliders/order', [App\Http\Controllers\Admin\SliderController::class, 'updateOrder'])->name('sliders.order');
        Route::post('sliders/{slider}/toggle', [App\Http\Controllers\Admin\SliderController::class, 'toggleStatus'])->name('sliders.toggle');
        Route::delete('sliders/{slider}', [App\Http\Controllers\Admin\SliderController::class, 'destroy'])->name('sliders.destroy');

        // Servicios
        Route::get('services', [App\Http\Controllers\Admin\ServiceController::class, 'index'])->name('services.index');
        Route::post('services', [App\Http\Controllers\Admin\ServiceController::class, 'store'])->name('services.store');
        Route::patch('services/{service}', [App\Http\Controllers\Admin\ServiceController::class, 'update'])->name('services.update');
        Route::delete('services/{service}', [App\Http\Controllers\Admin\ServiceController::class, 'destroy'])->name('services.destroy');

        // Documentos requeridos (catálogo de docs que los asociados deben subir)
        Route::get('document-requirements', [App\Http\Controllers\Admin\DocumentRequirementController::class, 'index'])->name('document-requirements.index');
        Route::post('document-requirements', [App\Http\Controllers\Admin\DocumentRequirementController::class, 'store'])->name('document-requirements.store');
        Route::post('document-requirements/reorder', [App\Http\Controllers\Admin\DocumentRequirementController::class, 'reorder'])->name('document-requirements.reorder');
        Route::post('document-requirements/{documentRequirement}', [App\Http\Controllers\Admin\DocumentRequirementController::class, 'update'])->name('document-requirements.update');
        Route::post('document-requirements/{documentRequirement}/toggle', [App\Http\Controllers\Admin\DocumentRequirementController::class, 'toggleActive'])->name('document-requirements.toggle');
        Route::delete('document-requirements/{documentRequirement}', [App\Http\Controllers\Admin\DocumentRequirementController::class, 'destroy'])->name('document-requirements.destroy');

        // Blog
        Route::post('blog/upload-image', [App\Http\Controllers\Admin\BlogController::class, 'uploadImage'])->name('blog.upload-image');
        Route::post('blog/category', [App\Http\Controllers\Admin\BlogController::class, 'storeCategory'])->name('blog.store-category');
        Route::delete('blog/category/{category}', [App\Http\Controllers\Admin\BlogController::class, 'destroyCategory'])->name('blog.destroy-category');
        Route::post('blog/tag', [App\Http\Controllers\Admin\BlogController::class, 'storeTag'])->name('blog.store-tag');
        Route::resource('blog', App\Http\Controllers\Admin\BlogController::class)->except(['show']);

        // Comunidad/Foros (Admin)
        Route::get('forums/categories', [App\Http\Controllers\Admin\ForumCategoryController::class, 'index'])->name('forums.categories.index');
        Route::post('forums/categories', [App\Http\Controllers\Admin\ForumCategoryController::class, 'store'])->name('forums.categories.store');
        Route::post('forums/categories/reorder', [App\Http\Controllers\Admin\ForumCategoryController::class, 'reorder'])->name('forums.categories.reorder');
        Route::patch('forums/categories/{category}', [App\Http\Controllers\Admin\ForumCategoryController::class, 'update'])->name('forums.categories.update');
        Route::delete('forums/categories/{category}', [App\Http\Controllers\Admin\ForumCategoryController::class, 'destroy'])->name('forums.categories.destroy');

        // Reportes de Comunidad
        Route::get('forums/reports', [App\Http\Controllers\Admin\ForumReportController::class, 'index'])->name('forums.reports.index');
        Route::post('forums/reports/{report}/dismiss', [App\Http\Controllers\Admin\ForumReportController::class, 'dismiss'])->name('forums.reports.dismiss');
        Route::delete('forums/reports/{report}/take-action', [App\Http\Controllers\Admin\ForumReportController::class, 'takeAction'])->name('forums.reports.take-action');

        // Anuncios y Licitaciones General
        Route::delete('announcements/{announcement}/documents/{media}', [App\Http\Controllers\Admin\AnnouncementController::class, 'destroyDocument'])->name('announcements.documents.destroy');
        Route::resource('announcements', App\Http\Controllers\Admin\AnnouncementController::class)->except(['show']);

        // Bienes y Servicios (Admin)
        Route::delete('bienes-servicios/tenders/{tender}/documents/{media}', [App\Http\Controllers\Admin\LicitacionController::class, 'deleteDocument'])->name('bienes-servicios.tenders.documents.destroy');
        Route::resource('bienes-servicios/companies', App\Http\Controllers\Admin\BienesServiciosEmpresaController::class)->names('bienes-servicios.companies');
        Route::resource('bienes-servicios/tenders', App\Http\Controllers\Admin\LicitacionController::class)->names('bienes-servicios.tenders');

        // Planes / Membresías
        Route::resource('plans', App\Http\Controllers\Admin\PlanController::class);

        // Datos Bancarios
        Route::resource('bank-accounts', App\Http\Controllers\Admin\BankAccountController::class)->except(['show']);

        // Solicitudes de Pago de Membresía
        Route::get('payment-requests', [App\Http\Controllers\Admin\PaymentRequestController::class, 'index'])->name('payment-requests.index');
        Route::get('payment-requests/{paymentRequest}', [App\Http\Controllers\Admin\PaymentRequestController::class, 'show'])->name('payment-requests.show');
        Route::patch('payment-requests/{paymentRequest}/approve', [App\Http\Controllers\Admin\PaymentRequestController::class, 'approve'])->name('payment-requests.approve');
        Route::patch('payment-requests/{paymentRequest}/reject', [App\Http\Controllers\Admin\PaymentRequestController::class, 'reject'])->name('payment-requests.reject');

        // Facturación
        Route::get('invoices', [App\Http\Controllers\Admin\InvoiceController::class, 'index'])->name('invoices.index');
        Route::post('invoices', [App\Http\Controllers\Admin\InvoiceController::class, 'store'])->name('invoices.store');
        Route::patch('invoices/{invoice}/mark-paid', [App\Http\Controllers\Admin\InvoiceController::class, 'markPaid'])->name('invoices.mark-paid');
        Route::delete('invoices/{invoice}', [App\Http\Controllers\Admin\InvoiceController::class, 'destroy'])->name('invoices.destroy');
        // Solicitudes / Contacto
        Route::get('contacts', [App\Http\Controllers\Admin\ContactController::class, 'index'])->name('contacts.index');
        Route::get('contacts/{contact}', [App\Http\Controllers\Admin\ContactController::class, 'show'])->name('contacts.show');
        Route::patch('contacts/{contact}/status', [App\Http\Controllers\Admin\ContactController::class, 'updateStatus'])->name('contacts.update-status');
        Route::delete('contacts/{contact}', [App\Http\Controllers\Admin\ContactController::class, 'destroy'])->name('contacts.destroy');
    });

    Route::post('logout', [App\Http\Controllers\Auth\AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');
});
