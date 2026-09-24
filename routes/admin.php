<?php

use App\Http\Controllers\Admin\AnnouncementController;
use App\Http\Controllers\Admin\AssociateReviewController;
use App\Http\Controllers\Admin\BankAccountController;
use App\Http\Controllers\Admin\BienesServiciosEmpresaController;
use App\Http\Controllers\Admin\BlogController;
use App\Http\Controllers\Admin\ContactController;
use App\Http\Controllers\Admin\DocumentRequirementController;
use App\Http\Controllers\Admin\ForumCategoryController;
use App\Http\Controllers\Admin\ForumReportController;
use App\Http\Controllers\Admin\IntegrationController;
use App\Http\Controllers\Admin\InvoiceController;
use App\Http\Controllers\Admin\LicitacionController;
use App\Http\Controllers\Admin\PaymentController;
use App\Http\Controllers\Admin\PlanController;
use App\Http\Controllers\Admin\ServiceCategoryController;
use App\Http\Controllers\Admin\ServiceController;
use App\Http\Controllers\Admin\SliderController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rutas del panel de administración
|--------------------------------------------------------------------------
| Cargadas desde routes/web.php dentro del grupo:
|   Route::name('admin.')->prefix('admin')->middleware('admin')->group(...)
| Extraído de web.php en el plan 0015 para partir el archivo (regla 6).
*/

// Users
Route::get('users', [UserController::class, 'index'])->name('users.index');
Route::post('users/{user}/password', [UserController::class, 'updatePassword'])->name('users.update-password');
Route::post('users/purge-spam', [UserController::class, 'purgeSpam'])->name('users.purge-spam');
Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

// Asociados: auditoría / ciclo de vida (Admin\AssociateReviewController)
Route::get('associates', [AssociateReviewController::class, 'index'])->name('associates.index');
Route::get('associates/{associate}', [AssociateReviewController::class, 'show'])->name('associates.show');
Route::post('associates/{associate}/audit-section', [AssociateReviewController::class, 'auditSection'])->name('associates.audit-section');
Route::post('associates/{associate}/approve', [AssociateReviewController::class, 'approve'])->name('associates.approve');
Route::post('associates/{associate}/toggle-verified', [AssociateReviewController::class, 'toggleVerified'])->name('associates.toggle-verified');
Route::post('associates/{associate}/deactivate', [AssociateReviewController::class, 'deactivate'])->name('associates.deactivate');
Route::post('associates/{associate}/reactivate', [AssociateReviewController::class, 'reactivate'])->name('associates.reactivate');

// Sliders
Route::get('sliders', [SliderController::class, 'index'])->name('sliders.index');
Route::post('sliders', [SliderController::class, 'store'])->name('sliders.store');
Route::post('sliders/order', [SliderController::class, 'updateOrder'])->name('sliders.order');
Route::post('sliders/{slider}/toggle', [SliderController::class, 'toggleStatus'])->name('sliders.toggle');
Route::delete('sliders/{slider}', [SliderController::class, 'destroy'])->name('sliders.destroy');

// Servicios
Route::get('services', [ServiceController::class, 'index'])->name('services.index');
Route::post('services', [ServiceController::class, 'store'])->name('services.store');
Route::patch('services/{service}', [ServiceController::class, 'update'])->name('services.update');
Route::delete('services/{service}', [ServiceController::class, 'destroy'])->name('services.destroy');

// Categorías de servicios
Route::post('service-categories', [ServiceCategoryController::class, 'store'])->name('service-categories.store');
Route::patch('service-categories/{category}', [ServiceCategoryController::class, 'update'])->name('service-categories.update');
Route::delete('service-categories/{category}', [ServiceCategoryController::class, 'destroy'])->name('service-categories.destroy');
Route::post('service-categories/order', [ServiceCategoryController::class, 'order'])->name('service-categories.order');

// Documentos requeridos (catálogo de docs que los asociados deben subir)
Route::get('document-requirements', [DocumentRequirementController::class, 'index'])->name('document-requirements.index');
Route::post('document-requirements', [DocumentRequirementController::class, 'store'])->name('document-requirements.store');
Route::post('document-requirements/reorder', [DocumentRequirementController::class, 'reorder'])->name('document-requirements.reorder');
Route::post('document-requirements/{documentRequirement}', [DocumentRequirementController::class, 'update'])->name('document-requirements.update');
Route::post('document-requirements/{documentRequirement}/toggle', [DocumentRequirementController::class, 'toggleActive'])->name('document-requirements.toggle');
Route::delete('document-requirements/{documentRequirement}', [DocumentRequirementController::class, 'destroy'])->name('document-requirements.destroy');

// Blog
Route::post('blog/upload-image', [BlogController::class, 'uploadImage'])->name('blog.upload-image');
Route::post('blog/category', [BlogController::class, 'storeCategory'])->name('blog.store-category');
Route::delete('blog/category/{category}', [BlogController::class, 'destroyCategory'])->name('blog.destroy-category');
Route::post('blog/tag', [BlogController::class, 'storeTag'])->name('blog.store-tag');
Route::resource('blog', BlogController::class)->except(['show']);

// Comunidad/Foros (Admin)
Route::get('forums/categories', [ForumCategoryController::class, 'index'])->name('forums.categories.index');
Route::post('forums/categories', [ForumCategoryController::class, 'store'])->name('forums.categories.store');
Route::post('forums/categories/reorder', [ForumCategoryController::class, 'reorder'])->name('forums.categories.reorder');
Route::patch('forums/categories/{category}', [ForumCategoryController::class, 'update'])->name('forums.categories.update');
Route::delete('forums/categories/{category}', [ForumCategoryController::class, 'destroy'])->name('forums.categories.destroy');

// Reportes de Comunidad
Route::get('forums/reports', [ForumReportController::class, 'index'])->name('forums.reports.index');
Route::post('forums/reports/{report}/dismiss', [ForumReportController::class, 'dismiss'])->name('forums.reports.dismiss');
Route::delete('forums/reports/{report}/take-action', [ForumReportController::class, 'takeAction'])->name('forums.reports.take-action');

// Anuncios y Licitaciones General
Route::delete('announcements/{announcement}/documents/{media}', [AnnouncementController::class, 'destroyDocument'])->name('announcements.documents.destroy');
Route::resource('announcements', AnnouncementController::class)->except(['show']);

// Bienes y Servicios (Admin)
Route::delete('bienes-servicios/tenders/{tender}/documents/{media}', [LicitacionController::class, 'deleteDocument'])->name('bienes-servicios.tenders.documents.destroy');
Route::resource('bienes-servicios/companies', BienesServiciosEmpresaController::class)->names('bienes-servicios.companies');
Route::resource('bienes-servicios/tenders', LicitacionController::class)->names('bienes-servicios.tenders');

// Planes / Membresías
Route::resource('plans', PlanController::class);

// Datos Bancarios
Route::resource('bank-accounts', BankAccountController::class)->except(['show']);

// Integraciones (Bold). Nivel admin, como el resto del área de Finanzas.
Route::get('integraciones', [IntegrationController::class, 'index'])->name('integrations.index');
Route::patch('integraciones/bold', [IntegrationController::class, 'updateBold'])->name('integrations.bold.update');

// Facturación
// Bandeja de pagos: comprobantes por revisar y todo lo cobrado.
Route::get('payments', [PaymentController::class, 'index'])->name('payments.index');
Route::patch('payments/{payment}/approve', [PaymentController::class, 'approve'])->name('payments.approve');
Route::patch('payments/{payment}/reject', [PaymentController::class, 'reject'])->name('payments.reject');

Route::get('invoices', [InvoiceController::class, 'index'])->name('invoices.index');
Route::post('invoices', [InvoiceController::class, 'store'])->name('invoices.store');
Route::patch('invoices/{invoice}/mark-paid', [InvoiceController::class, 'markPaid'])->name('invoices.mark-paid');
// Riel 3: pago en efectivo u otro canal que la plataforma no ve.
Route::post('invoices/{invoice}/register-payment', [InvoiceController::class, 'registerPayment'])->name('invoices.register-payment');
Route::delete('invoices/{invoice}', [InvoiceController::class, 'destroy'])->name('invoices.destroy');

// Solicitudes / Contacto
Route::get('contacts', [ContactController::class, 'index'])->name('contacts.index');
Route::get('contacts/{contact}', [ContactController::class, 'show'])->name('contacts.show');
Route::patch('contacts/{contact}/status', [ContactController::class, 'updateStatus'])->name('contacts.update-status');
Route::delete('contacts/{contact}', [ContactController::class, 'destroy'])->name('contacts.destroy');
