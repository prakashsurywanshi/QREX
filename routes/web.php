<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\AmenityController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\CampaignController;
use App\Http\Controllers\CMSController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PipelineController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\PublicInquiryController;
use App\Http\Controllers\PublicPageController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\SiteVisitController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Website Routes
|--------------------------------------------------------------------------
*/
Route::get('/', [PublicPageController::class, 'home'])->name('home');
Route::get('/properties', [PublicPageController::class, 'properties'])->name('public.properties');
Route::get('/properties/{property:public_id}', [PublicPageController::class, 'propertyDetail'])->name('public.property-detail');
Route::get('/about', [PublicPageController::class, 'about'])->name('public.about');
Route::get('/contact', [PublicPageController::class, 'contact'])->name('public.contact');

Route::post('/contact/enquiry', [PublicInquiryController::class, 'contact'])->name('public.contact.enquiry')->middleware('throttle:5,10');
Route::post('/properties/{property:public_id}/enquiry', [PublicInquiryController::class, 'propertyInquiry'])->name('public.property.enquiry')->middleware('throttle:5,10');

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.store')->middleware('throttle:5,1');
Route::get('/forgot-password', fn () => \Inertia\Inertia::render('auth/ForgotPassword'))->name('password.request');
Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink'])->name('password.email')->middleware('throttle:5,1');
Route::get('/reset-password/{token}/{email?}', [PasswordResetController::class, 'showResetForm'])->name('password.reset');
Route::post('/reset-password', [PasswordResetController::class, 'reset'])->name('password.store')->middleware('throttle:5,1');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

Route::middleware(['auth'])->group(function () {
    Route::get('/profile', [AuthController::class, 'profile'])->name('profile');
    Route::put('/profile', [AuthController::class, 'updateProfile'])->name('profile.update');
    Route::put('/password', [AuthController::class, 'changePassword'])->name('password.change');

    Route::post('/profile/email/otp', [AuthController::class, 'sendCurrentEmailOtp'])->name('profile.email.otp');
    Route::post('/profile/email/verify-current', [AuthController::class, 'verifyCurrentEmail'])->name('profile.email.verify-current');
    Route::post('/profile/email/new-otp', [AuthController::class, 'sendNewEmailOtp'])->name('profile.email.new-otp');
    Route::post('/profile/email/verify-new', [AuthController::class, 'verifyNewEmail'])->name('profile.email.verify-new');
});

/*
|--------------------------------------------------------------------------
| Admin Routes (Authenticated)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->middleware('permission:dashboard.view')
        ->name('dashboard');

    // Properties — static routes before wildcards
    Route::middleware('permission:properties.create')->group(function () {
        Route::get('/properties/create', [PropertyController::class, 'create'])->name('properties.create');
        Route::post('/properties', [PropertyController::class, 'store'])->name('properties.store');
    });
    Route::middleware('permission:properties.view')->group(function () {
        Route::get('/properties', [PropertyController::class, 'index'])->name('properties.index');
        Route::get('/properties/{property}', [PropertyController::class, 'show'])->name('properties.show');
    });
    Route::middleware('permission:properties.edit')->group(function () {
        Route::get('/properties/{property}/edit', [PropertyController::class, 'edit'])->name('properties.edit');
        Route::put('/properties/{property}', [PropertyController::class, 'update'])->name('properties.update');
    });
    Route::middleware('permission:properties.delete')->group(function () {
        Route::delete('/properties/{property}', [PropertyController::class, 'destroy'])->name('properties.destroy');
    });

    // Amenity catalog (which amenities are valid for which property type)
    Route::middleware('permission:amenities.view')->group(function () {
        Route::get('/amenities', [AmenityController::class, 'index'])->name('amenities.index');
    });
    Route::middleware('permission:amenities.create')->group(function () {
        Route::post('/amenities', [AmenityController::class, 'store'])->name('amenities.store');
        Route::post('/amenities/bulk', [AmenityController::class, 'bulkStore'])->name('amenities.bulk-store');
    });
    Route::middleware('permission:amenities.edit')->group(function () {
        Route::put('/amenities/{amenity}', [AmenityController::class, 'update'])->name('amenities.update');
    });
    Route::middleware('permission:amenities.delete')->group(function () {
        Route::delete('/amenities/{amenity}', [AmenityController::class, 'destroy'])->name('amenities.destroy');
    });

    // Commissions
    Route::middleware('permission:commissions.view')->group(function () {
        Route::get('/commissions', [\App\Http\Controllers\CommissionController::class, 'index'])->name('commissions.index');
        Route::get('/commissions/{commission}', [\App\Http\Controllers\CommissionController::class, 'show'])->name('commissions.show');
    });
    Route::middleware('permission:commissions.create')->group(function () {
        Route::get('/commissions/create', [\App\Http\Controllers\CommissionController::class, 'create'])->name('commissions.create');
        Route::post('/commissions', [\App\Http\Controllers\CommissionController::class, 'store'])->name('commissions.store');
    });
    Route::middleware('permission:commissions.edit')->group(function () {
        Route::get('/commissions/{commission}/edit', [\App\Http\Controllers\CommissionController::class, 'edit'])->name('commissions.edit');
        Route::put('/commissions/{commission}', [\App\Http\Controllers\CommissionController::class, 'update'])->name('commissions.update');
    });
    Route::middleware('permission:commissions.delete')->group(function () {
        Route::delete('/commissions/{commission}', [\App\Http\Controllers\CommissionController::class, 'destroy'])->name('commissions.destroy');
    });
    Route::middleware('permission:commissions.approve')->group(function () {
        Route::post('/commissions/{commission}/approve', [\App\Http\Controllers\CommissionController::class, 'approve'])->name('commissions.approve');
        Route::post('/commissions/{commission}/reject', [\App\Http\Controllers\CommissionController::class, 'reject'])->name('commissions.reject');
    });
    Route::middleware('permission:commissions.pay')->group(function () {
        Route::post('/commissions/{commission}/pay', [\App\Http\Controllers\CommissionController::class, 'pay'])->name('commissions.pay');
    });

    // Leads
    Route::middleware('permission:leads.create')->group(function () {
        Route::get('/leads/import-template', [LeadController::class, 'importTemplate'])->name('leads.import-template');
    });
    Route::middleware('permission:leads.view')->group(function () {
        Route::get('/leads', [LeadController::class, 'index'])->name('leads.index');
        Route::get('/leads/{lead}', [LeadController::class, 'show'])->name('leads.show');
    });
    Route::middleware('permission:leads.create')->group(function () {
        Route::post('/leads', [LeadController::class, 'store'])->name('leads.store');
        Route::post('/leads/import', [LeadController::class, 'import'])->name('leads.import');
    });
    Route::middleware('permission:leads.edit')->group(function () {
        Route::put('/leads/{lead}', [LeadController::class, 'update'])->name('leads.update');
        Route::post('/leads/{lead}/reassign', [LeadController::class, 'reassign'])->name('leads.reassign');
        Route::post('/leads/{lead}/activity', [LeadController::class, 'addActivity'])->name('leads.activity');
        Route::post('/leads/{lead}/status', [LeadController::class, 'changeStatus'])->name('leads.status');
    });
    Route::middleware('permission:sales.create')->group(function () {
        Route::post('/leads/{lead}/convert', [LeadController::class, 'convertToDeal'])->name('leads.convert');
    });

    // Pipeline / Deals
    Route::middleware('permission:sales.view')->group(function () {
        Route::get('/pipeline', [PipelineController::class, 'index'])->name('pipeline.index');
    });
    Route::middleware('permission:sales.edit')->group(function () {
        Route::put('/deals/{deal}/stage', [PipelineController::class, 'moveStage'])->name('deals.stage');
    });
    Route::middleware('permission:sales.create')->group(function () {
        Route::post('/deals', [PipelineController::class, 'store'])->name('deals.store');
    });

    // Tasks
    Route::middleware('permission:tasks.view')->group(function () {
        Route::get('/tasks', [TaskController::class, 'index'])->name('tasks.index');
    });
    Route::middleware('permission:tasks.create')->group(function () {
        Route::post('/tasks', [TaskController::class, 'store'])->name('tasks.store');
    });
    Route::middleware('permission:tasks.edit')->group(function () {
        Route::put('/tasks/{task}', [TaskController::class, 'update'])->name('tasks.update');
    });
    Route::middleware('permission:tasks.delete')->group(function () {
        Route::delete('/tasks/{task}', [TaskController::class, 'destroy'])->name('tasks.destroy');
    });

    // Notifications (accessible to all authenticated users)
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/read-all', [NotificationController::class, 'readAll'])->name('notifications.readAll');
    Route::put('/notifications/{notification}/read', [NotificationController::class, 'read'])->name('notifications.read');

    // Customers
    Route::middleware('permission:customers.view')->group(function () {
        Route::get('/customers', [CustomerController::class, 'index'])->name('customers.index');
        Route::get('/customers/{customer}', [CustomerController::class, 'show'])->name('customers.show');
    });
    Route::middleware('permission:customers.create')->group(function () {
        Route::post('/customers', [CustomerController::class, 'store'])->name('customers.store');
    });
    Route::middleware('permission:customers.edit')->group(function () {
        Route::put('/customers/{customer}', [CustomerController::class, 'update'])->name('customers.update');
    });

    // Site Visits
    Route::middleware('permission:site_visits.view')->group(function () {
        Route::get('/site-visits', [SiteVisitController::class, 'index'])->name('site-visits.index');
    });
    Route::middleware('permission:site_visits.create')->group(function () {
        Route::post('/site-visits', [SiteVisitController::class, 'store'])->name('site-visits.store');
    });
    Route::middleware('permission:site_visits.edit')->group(function () {
        Route::put('/site-visits/{siteVisit}', [SiteVisitController::class, 'update'])->name('site-visits.update');
    });

    // Bookings
    Route::middleware('permission:bookings.view')->group(function () {
        Route::get('/bookings', [BookingController::class, 'index'])->name('bookings.index');
        Route::get('/bookings/{booking}', [BookingController::class, 'show'])->name('bookings.show');
    });
    Route::middleware('permission:bookings.create')->group(function () {
        Route::post('/bookings', [BookingController::class, 'store'])->name('bookings.store');
    });
    Route::middleware('permission:bookings.edit')->group(function () {
        Route::put('/bookings/{booking}', [BookingController::class, 'update'])->name('bookings.update');
    });

    // Payments
    Route::middleware('permission:payments.view')->group(function () {
        Route::get('/payments', [PaymentController::class, 'index'])->name('payments.index');
    });
    Route::middleware('permission:payments.create')->group(function () {
        Route::post('/payments', [PaymentController::class, 'store'])->name('payments.store');
    });
    Route::middleware('permission:payments.edit')->group(function () {
        Route::put('/payments/{payment}', [PaymentController::class, 'update'])->name('payments.update');
    });

    // Media
    Route::middleware('permission:media.view')->group(function () {
        Route::get('/media', [MediaController::class, 'index'])->name('media.index');
    });
    Route::middleware('permission:media.create')->group(function () {
        Route::post('/media', [MediaController::class, 'store'])->name('media.store');
    });
    Route::middleware('permission:media.delete')->group(function () {
        Route::delete('/media/{mediaFile}', [MediaController::class, 'destroy'])->name('media.destroy');
    });

    // Marketing
    Route::middleware('permission:marketing.view')->group(function () {
        Route::get('/marketing', [CampaignController::class, 'index'])->name('marketing.index');
    });
    Route::middleware('permission:marketing.create')->group(function () {
        Route::post('/marketing', [CampaignController::class, 'store'])->name('marketing.store');
    });

    // Reports
    Route::middleware('permission:reports.view')->group(function () {
        Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
        Route::get('/reports/export-pdf', [ReportController::class, 'exportPdf'])->name('reports.export-pdf');
    });
    Route::middleware('permission:reports.export')->group(function () {
        Route::get('/reports/export', [ReportController::class, 'export'])->name('reports.export');
    });

    // CMS
    Route::middleware('permission:cms.view')->group(function () {
        Route::get('/cms', [CMSController::class, 'index'])->name('cms.index');
    });
    Route::middleware('permission:cms.edit')->group(function () {
        Route::put('/cms/featured', [CMSController::class, 'updateFeatured'])->name('cms.featured');
        Route::put('/cms/{section}', [CMSController::class, 'updateSection'])->name('cms.section');
    });

    // Users
    Route::middleware('permission:users.view')->group(function () {
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::get('/users/{user}', [UserController::class, 'show'])->name('users.show');
    });
    Route::middleware('permission:users.create')->group(function () {
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
    });
    Route::middleware('permission:users.edit')->group(function () {
        Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
    });
    Route::middleware('permission:users.delete')->group(function () {
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    });

    // Roles
    Route::middleware('permission:roles.view')->group(function () {
        Route::get('/roles', [\App\Http\Controllers\RoleController::class, 'index'])->name('roles.index');
    });
    Route::middleware('permission:roles.create')->group(function () {
        Route::post('/roles', [\App\Http\Controllers\RoleController::class, 'store'])->name('roles.store');
    });
    Route::middleware('permission:roles.edit')->group(function () {
        Route::put('/roles/{role}', [\App\Http\Controllers\RoleController::class, 'update'])->name('roles.update');
    });
    Route::middleware('permission:roles.delete')->group(function () {
        Route::delete('/roles/{role}', [\App\Http\Controllers\RoleController::class, 'destroy'])->name('roles.destroy');
    });
    Route::middleware('permission:roles.view')->group(function () {
        Route::get('/permissions', [\App\Http\Controllers\PermissionController::class, 'index'])->name('permissions.index');
    });

    // Settings
    Route::middleware('permission:settings.view')->group(function () {
        Route::get('/settings', [SettingController::class, 'index'])->name('settings.index');
    });
    Route::middleware('permission:settings.edit')->group(function () {
        Route::put('/settings', [SettingController::class, 'update'])->name('settings.update');
    });
    Route::middleware('role:super-admin')->group(function () {
        Route::put('/settings/smtp', [SettingController::class, 'updateSmtp'])->name('settings.smtp.update');
        Route::post('/settings/test-mail', [SettingController::class, 'testMail'])->name('settings.test-mail');
        Route::post('/settings/logo', [SettingController::class, 'updateLogo'])->name('settings.logo.store');
        Route::delete('/settings/logo', [SettingController::class, 'removeLogo'])->name('settings.logo.destroy');
    });

    Route::get('/', fn () => redirect()->route('admin.dashboard'));
});


/*
|--------------------------------------------------------------------------
| Buyer Portal Routes
|--------------------------------------------------------------------------
*/
Route::prefix('portal')->name('portal.')->group(function () {
    Route::get('/login', [\App\Http\Controllers\Portal\AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [\App\Http\Controllers\Portal\AuthController::class, 'login'])->name('login.store');
    
    Route::middleware('auth:buyer')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\Portal\DashboardController::class, 'index'])->name('dashboard');
        Route::post('/logout', [\App\Http\Controllers\Portal\AuthController::class, 'logout'])->name('logout');
    });
});

// Payment Plans
Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {
    Route::middleware('permission:payment_plans.view')->group(function () {
        Route::get('/payment-plans', [\App\Http\Controllers\PaymentPlanWebController::class, 'index'])->name('payment-plans.index');
        Route::get('/payment-plans/{paymentPlan}', [\App\Http\Controllers\PaymentPlanWebController::class, 'show'])->name('payment-plans.show');
    });
    Route::middleware('permission:payment_plans.create')->group(function () {
        Route::get('/payment-plans/create', [\App\Http\Controllers\PaymentPlanWebController::class, 'create'])->name('payment-plans.create');
        Route::post('/payment-plans', [\App\Http\Controllers\PaymentPlanWebController::class, 'store'])->name('payment-plans.store');
    });
});

// Projects & Inventory
Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {
    Route::middleware('permission:projects.view')->group(function () {
        Route::get('/projects', [\App\Http\Controllers\ProjectWebController::class, 'index'])->name('projects.index');
        Route::get('/projects/{project}', [\App\Http\Controllers\ProjectWebController::class, 'show'])->name('projects.show');
    });
    Route::middleware('permission:projects.create')->group(function () {
        Route::get('/projects/create', [\App\Http\Controllers\ProjectWebController::class, 'create'])->name('projects.create');
        Route::post('/projects', [\App\Http\Controllers\ProjectWebController::class, 'store'])->name('projects.store');
    });
});

// Units
Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {
    Route::middleware('permission:units.create')->group(function () {
        Route::post('/units', [\App\Http\Controllers\UnitWebController::class, 'store'])->name('units.store');
    });
    Route::middleware('permission:units.hold')->group(function () {
        Route::post('/units/{unit}/hold', [\App\Http\Controllers\UnitWebController::class, 'hold'])->name('units.hold');
        Route::post('/units/{unit}/release', [\App\Http\Controllers\UnitWebController::class, 'release'])->name('units.release');
    });
    Route::middleware('permission:units.edit')->group(function () {
        Route::put('/units/{unit}/status', [\App\Http\Controllers\UnitWebController::class, 'updateStatus'])->name('units.status');
    });
});

// Tenants (Multi-tenant/SaaS)
Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {
    Route::middleware('permission:tenants.view')->group(function () {
        Route::get('/tenants', [\App\Http\Controllers\TenantController::class, 'index'])->name('tenants.index');
        Route::get('/tenants/{tenant}', [\App\Http\Controllers\TenantController::class, 'show'])->name('tenants.show');
    });
    Route::middleware('permission:tenants.create')->group(function () {
        Route::get('/tenants/create', [\App\Http\Controllers\TenantController::class, 'create'])->name('tenants.create');
        Route::post('/tenants', [\App\Http\Controllers\TenantController::class, 'store'])->name('tenants.store');
    });
});

// Communications Web
Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {
    Route::middleware('permission:communications.view')->group(function () {
        Route::get('/communications', [\App\Http\Controllers\Api\CommunicationController::class, 'index'])->name('communications.index');
    });
    Route::middleware('permission:communications.create')->group(function () {
        Route::post('/communications', [\App\Http\Controllers\Api\CommunicationController::class, 'store'])->name('communications.store');
    });
});
