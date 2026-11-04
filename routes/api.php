<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AmenityController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\CmsController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\MarketingController;
use App\Http\Controllers\Api\MediaController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PipelineController;
use App\Http\Controllers\Api\PropertyController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\SiteVisitController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public API Routes
|--------------------------------------------------------------------------
*/
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/reset/send', [AuthController::class, 'sendResetLink']);

/*
|--------------------------------------------------------------------------
| Authenticated API Routes
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::put('/auth/password', [AuthController::class, 'changePassword']);

    // Email OTP change flow
    Route::post('/auth/email/otp/send-current', [AuthController::class, 'sendCurrentEmailOtp']);
    Route::post('/auth/email/otp/verify-current', [AuthController::class, 'verifyCurrentEmail']);
    Route::post('/auth/email/otp/send-new', [AuthController::class, 'sendNewEmailOtp']);
    Route::post('/auth/email/otp/verify-new', [AuthController::class, 'verifyNewEmail']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Notifications (own data, no permission gate)
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/read-all', [NotificationController::class, 'readAll']);
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'read']);

    // Properties
    Route::middleware('permission:properties.view')->group(function () {
        Route::get('/properties', [PropertyController::class, 'index']);
        Route::get('/properties/agents', [PropertyController::class, 'agents']);
        Route::get('/properties/{property}', [PropertyController::class, 'show']);
    });
    Route::post('/properties', [PropertyController::class, 'store'])->middleware('permission:properties.create');
    Route::put('/properties/{property}', [PropertyController::class, 'update'])->middleware('permission:properties.edit');
    Route::delete('/properties/{property}', [PropertyController::class, 'destroy'])->middleware('permission:properties.delete');
    Route::post('/properties/{property}/images', [PropertyController::class, 'storeImages'])->middleware('permission:properties.edit');
    Route::delete('/properties/{property}/images/{image}', [PropertyController::class, 'destroyImage'])->middleware('permission:properties.edit');
    Route::post('/properties/{property}/images/{image}/cover', [PropertyController::class, 'setCover'])->middleware('permission:properties.edit');

    // Amenity catalog
    Route::get('/amenities', [AmenityController::class, 'index'])->middleware('permission:amenities.view');
    Route::post('/amenities', [AmenityController::class, 'store'])->middleware('permission:amenities.create');
    Route::put('/amenities/{amenity}', [AmenityController::class, 'update'])->middleware('permission:amenities.edit');
    Route::delete('/amenities/{amenity}', [AmenityController::class, 'destroy'])->middleware('permission:amenities.delete');

    // Leads
    Route::middleware('permission:leads.view')->group(function () {
        Route::get('/leads', [LeadController::class, 'index']);
        Route::get('/leads/import/template', [LeadController::class, 'importTemplate']);
        Route::get('/leads/{lead}', [LeadController::class, 'show']);
    });
    Route::post('/leads/import', [LeadController::class, 'import'])->middleware('permission:leads.create');
    Route::post('/leads', [LeadController::class, 'store'])->middleware('permission:leads.create');
    Route::middleware('permission:leads.edit')->group(function () {
        Route::put('/leads/{lead}', [LeadController::class, 'update']);
        Route::post('/leads/{lead}/reassign', [LeadController::class, 'reassign']);
        Route::post('/leads/{lead}/status', [LeadController::class, 'changeStatus']);
        Route::post('/leads/{lead}/activities', [LeadController::class, 'addActivity']);
    });
    Route::post('/leads/{lead}/convert', [LeadController::class, 'convertToDeal'])->middleware('permission:sales.create');
    Route::delete('/leads/{lead}', [LeadController::class, 'destroy'])->middleware('permission:leads.delete');

    // Pipeline / Deals (sales module)
    Route::get('/pipeline', [PipelineController::class, 'index'])->middleware('permission:sales.view');
    Route::get('/pipeline/deals/{deal}', [PipelineController::class, 'show'])->middleware('permission:sales.view');
    Route::post('/pipeline/deals', [PipelineController::class, 'store'])->middleware('permission:sales.create');
    Route::middleware('permission:sales.edit')->group(function () {
        Route::post('/pipeline/deals/{deal}/move', [PipelineController::class, 'moveStage']);
        Route::put('/pipeline/deals/{deal}', [PipelineController::class, 'update']);
    });
    Route::delete('/pipeline/deals/{deal}', [PipelineController::class, 'destroy'])->middleware('permission:sales.delete');

    // Customers
    Route::get('/customers', [CustomerController::class, 'index'])->middleware('permission:customers.view');
    Route::get('/customers/{customer}', [CustomerController::class, 'show'])->middleware('permission:customers.view');
    Route::post('/customers', [CustomerController::class, 'store'])->middleware('permission:customers.create');
    Route::put('/customers/{customer}', [CustomerController::class, 'update'])->middleware('permission:customers.edit');
    Route::delete('/customers/{customer}', [CustomerController::class, 'destroy'])->middleware('permission:customers.delete');

    // Site Visits
    Route::get('/site-visits', [SiteVisitController::class, 'index'])->middleware('permission:site_visits.view');
    Route::post('/site-visits', [SiteVisitController::class, 'store'])->middleware('permission:site_visits.create');
    Route::put('/site-visits/{siteVisit}', [SiteVisitController::class, 'update'])->middleware('permission:site_visits.edit');
    Route::delete('/site-visits/{siteVisit}', [SiteVisitController::class, 'destroy'])->middleware('permission:site_visits.delete');

    // Tasks
    Route::get('/tasks', [TaskController::class, 'index'])->middleware('permission:tasks.view');
    Route::post('/tasks', [TaskController::class, 'store'])->middleware('permission:tasks.create');
    Route::put('/tasks/{task}', [TaskController::class, 'update'])->middleware('permission:tasks.edit');
    Route::delete('/tasks/{task}', [TaskController::class, 'destroy'])->middleware('permission:tasks.delete');

    // Bookings
    Route::get('/bookings', [BookingController::class, 'index'])->middleware('permission:bookings.view');
    Route::get('/bookings/{booking}', [BookingController::class, 'show'])->middleware('permission:bookings.view');
    Route::post('/bookings', [BookingController::class, 'store'])->middleware('permission:bookings.create');
    Route::put('/bookings/{booking}', [BookingController::class, 'update'])->middleware('permission:bookings.edit');
    Route::delete('/bookings/{booking}', [BookingController::class, 'destroy'])->middleware('permission:bookings.delete');

    // Payments
    Route::get('/payments', [PaymentController::class, 'index'])->middleware('permission:payments.view');
    Route::post('/payments', [PaymentController::class, 'store'])->middleware('permission:payments.create');
    Route::put('/payments/{payment}', [PaymentController::class, 'update'])->middleware('permission:payments.edit');
    Route::delete('/payments/{payment}', [PaymentController::class, 'destroy'])->middleware('permission:payments.delete');

    // Media
    Route::get('/media', [MediaController::class, 'index'])->middleware('permission:media.view');
    Route::post('/media', [MediaController::class, 'store'])->middleware('permission:media.create');
    Route::delete('/media/{mediaFile}', [MediaController::class, 'destroy'])->middleware('permission:media.delete');

    // Marketing / Campaigns
    Route::get('/campaigns', [MarketingController::class, 'index'])->middleware('permission:marketing.view');
    Route::post('/campaigns', [MarketingController::class, 'store'])->middleware('permission:marketing.create');
    Route::put('/campaigns/{campaign}', [MarketingController::class, 'update'])->middleware('permission:marketing.edit');
    Route::delete('/campaigns/{campaign}', [MarketingController::class, 'destroy'])->middleware('permission:marketing.delete');

    // Reports
    Route::middleware('permission:reports.view')->group(function () {
        Route::get('/reports', [ReportController::class, 'index']);
    });
    Route::middleware('permission:reports.export')->group(function () {
        Route::get('/reports/export', [ReportController::class, 'export']);
        Route::get('/reports/export-pdf', [ReportController::class, 'exportPdf']);
    });

    // CMS
    Route::get('/cms', [CmsController::class, 'index'])->middleware('permission:cms.view');
    Route::middleware('permission:cms.edit')->group(function () {
        Route::put('/cms/sections/{section}', [CmsController::class, 'updateSection']);
        Route::put('/cms/featured', [CmsController::class, 'updateFeatured']);
    });

    // Users
    Route::get('/users', [UserController::class, 'index'])->middleware('permission:users.view');
    Route::post('/users', [UserController::class, 'store'])->middleware('permission:users.create');
    Route::put('/users/{user}', [UserController::class, 'update'])->middleware('permission:users.edit');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->middleware('permission:users.delete');

    // Roles & Permissions
    Route::get('/roles', [RoleController::class, 'index'])->middleware('permission:roles.view');
    Route::post('/roles', [RoleController::class, 'store'])->middleware('permission:roles.create');
    Route::put('/roles/{role}', [RoleController::class, 'update'])->middleware('permission:roles.edit');
    Route::delete('/roles/{role}', [RoleController::class, 'destroy'])->middleware('permission:roles.delete');
    Route::get('/permissions', [RoleController::class, 'permissions'])->middleware('permission:roles.view');

    // Settings
    Route::get('/settings', [SettingController::class, 'index'])->middleware('permission:settings.view');
    Route::put('/settings', [SettingController::class, 'update'])->middleware('permission:settings.edit');
    Route::put('/settings/smtp', [SettingController::class, 'updateSmtp'])->middleware('permission:settings.edit');
    Route::post('/settings/smtp/test', [SettingController::class, 'testMail'])->middleware('permission:settings.edit');
});

use App\Http\Controllers\Api\CommissionController;

// Commissions
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/commissions', [CommissionController::class, 'index'])->middleware('permission:commissions.view');
    Route::post('/commissions/calculate', [CommissionController::class, 'calculate'])->middleware('permission:commissions.view');
    Route::post('/commissions', [CommissionController::class, 'store'])->middleware('permission:commissions.create');
    Route::get('/commissions/{commission}', [CommissionController::class, 'show'])->middleware('permission:commissions.view');
    Route::put('/commissions/{commission}', [CommissionController::class, 'update'])->middleware('permission:commissions.edit');
    Route::delete('/commissions/{commission}', [CommissionController::class, 'destroy'])->middleware('permission:commissions.delete');
    Route::post('/commissions/{commission}/approve', [CommissionController::class, 'approve'])->middleware('permission:commissions.approve');
    Route::post('/commissions/{commission}/pay', [CommissionController::class, 'pay'])->middleware('permission:commissions.pay');
    Route::post('/commissions/{commission}/reject', [CommissionController::class, 'reject'])->middleware('permission:commissions.approve');
});


use App\Http\Controllers\Api\PaymentPlanController;

// Payment Plans
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/payment-plans', [PaymentPlanController::class, 'index'])->middleware('permission:payment_plans.view');
    Route::post('/payment-plans', [PaymentPlanController::class, 'store'])->middleware('permission:payment_plans.create');
    Route::get('/payment-plans/{paymentPlan}', [PaymentPlanController::class, 'show'])->middleware('permission:payment_plans.view');
    Route::delete('/payment-plans/{paymentPlan}', [PaymentPlanController::class, 'destroy'])->middleware('permission:payment_plans.delete');
    Route::post('/installments/{installment}/pay', [PaymentPlanController::class, 'payInstallment'])->middleware('permission:payments.create');
});


use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\UnitController;

// Projects & Inventory
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/projects', [ProjectController::class, 'index'])->middleware('permission:projects.view');
    Route::post('/projects', [ProjectController::class, 'store'])->middleware('permission:projects.create');
    Route::get('/projects/{project}', [ProjectController::class, 'show'])->middleware('permission:projects.view');
    Route::put('/projects/{project}', [ProjectController::class, 'update'])->middleware('permission:projects.edit');
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy'])->middleware('permission:projects.delete');

    Route::get('/units', [UnitController::class, 'index'])->middleware('permission:units.view');
    Route::post('/units', [UnitController::class, 'store'])->middleware('permission:units.create');
    Route::get('/units/{unit}', [UnitController::class, 'show'])->middleware('permission:units.view');
    Route::put('/units/{unit}', [UnitController::class, 'update'])->middleware('permission:units.edit');
    Route::delete('/units/{unit}', [UnitController::class, 'destroy'])->middleware('permission:units.delete');
    Route::post('/units/{unit}/hold', [UnitController::class, 'hold'])->middleware('permission:units.hold');
    Route::post('/units/{unit}/release', [UnitController::class, 'release'])->middleware('permission:units.hold');
});


use App\Http\Controllers\Api\CommunicationController;

// Communications Timeline
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/communications', [CommunicationController::class, 'index'])->middleware('permission:communications.view');
    Route::post('/communications', [CommunicationController::class, 'store'])->middleware('permission:communications.create');
    Route::get('/communications/{communication}', [CommunicationController::class, 'show'])->middleware('permission:communications.view');
    Route::delete('/communications/{communication}', [CommunicationController::class, 'destroy'])->middleware('permission:communications.delete');
});


use App\Http\Controllers\Api\WhatsAppController;

// WhatsApp
Route::post('/whatsapp/webhook', [WhatsAppController::class, 'webhook']);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/whatsapp/status', [WhatsAppController::class, 'status']);
    Route::post('/whatsapp/send', [WhatsAppController::class, 'send'])->middleware('permission:leads.edit');
});


use App\Http\Controllers\Api\UnitApiController;

// Units API (additional)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/units/{unit}/hold', [UnitApiController::class, 'hold'])->middleware('permission:units.hold');
    Route::post('/units/{unit}/release', [UnitApiController::class, 'release'])->middleware('permission:units.hold');
});


use App\Http\Controllers\Api\SettingsApiController;

// Settings API
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/settings', [SettingsApiController::class, 'index'])->middleware('permission:settings.view');
    Route::put('/settings', [SettingsApiController::class, 'update'])->middleware('permission:settings.edit');
});


use App\Http\Controllers\Api\ReportApiController;

// Reports API enhanced
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/reports/summary', [ReportApiController::class, 'index'])->middleware('permission:reports.view');
});


use App\Http\Controllers\Api\DeviceTokenController;

// Device Tokens
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/device-tokens', [DeviceTokenController::class, 'store']);
    Route::delete('/device-tokens', [DeviceTokenController::class, 'destroy']);
});


// Additional API routes
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('units', \App\Http\Controllers\Api\UnitApiController::class)->only(['index', 'show', 'store']);
});


use App\Http\Controllers\Api\ProjectApiController;

// Projects API
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/projects-api', [ProjectApiController::class, 'index']);
    Route::get('/projects-api/{project}', [ProjectApiController::class, 'show']);
});


use App\Http\Controllers\Api\AuditLogController;

// Audit Logs
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/audit-logs', [AuditLogController::class, 'index'])->middleware('permission:settings.view');
});


use App\Http\Controllers\Api\HealthApiController;

// Health API
Route::get('/health', [HealthApiController::class, 'index']);


use App\Http\Controllers\Api\ExportController;

// Exports
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/export/leads', [ExportController::class, 'leads'])->middleware('permission:leads.view');
});


use App\Http\Controllers\Api\BulkActionController;

// Bulk Actions
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/bulk/leads/assign', [BulkActionController::class, 'bulkAssignLeads'])->middleware('permission:leads.edit');
});
