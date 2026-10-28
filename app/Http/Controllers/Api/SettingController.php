<?php

namespace App\Http\Controllers\Api;

use App\Http\Responses\ApiResponse;
use App\Models\Setting;
use App\Services\MailConfigService;
use Illuminate\Http\Request;

class SettingController extends ApiController
{
    protected $defaults = [
        'project_name' => 'QREX',
        'agency_name' => 'QREX',
        'tagline' => 'Luxury Living, Redefined',
        'contact_email' => 'hello@example.com',
        'contact_phone' => '+91 98765 43210',
        'address' => '702, Trident Tower, BKC, Mumbai 400051',
        'currency' => 'INR (₹)',
        'timezone' => 'Asia/Kolkata',
        'date_format' => 'DD MMM YYYY',
        'primary_color' => '#0D1B3E',
        'accent_color' => '#C9963A',
        'social_facebook' => '',
        'social_instagram' => '',
        'social_linkedin' => '',
        'social_twitter' => '',
        'office_hours' => 'Mon–Sat, 10:00 AM – 7:00 PM',
        'footer_about' => '',
        'seo_title' => 'QREX — Luxury Properties in India',
        'seo_description' => 'Premium residential & commercial real estate across Mumbai, Bangalore, Pune & Gurugram.',
        'analytics_code' => '',
        'enable_contact_form' => true,
        'maintenance_mode' => false,
        'two_factor' => false,
        'lead_auto_assign' => true,
        'visit_reminders' => true,
        'payment_alerts' => true,
        'low_inventory_alert' => false,
    ];

    public function index()
    {
        $saved = Setting::allAsArray();

        return ApiResponse::success([
            'settings' => array_merge($this->defaults, $saved),
            'smtp' => app(MailConfigService::class)->settings(),
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'agency_name' => 'nullable|string',
            'contact_email' => 'nullable|email',
            'contact_phone' => 'nullable|string',
        ]);

        $allowed = array_keys($this->defaults);

        $data = $request->only($allowed);

        $user = $request->user();
        $canEditAll = $user->hasPermissionTo('settings.edit');

        $data = collect($data)->filter(function ($value, $key) use ($user, $canEditAll) {
            if ($value === null || $value === '') {
                return true;
            }

            return $canEditAll || $user->hasPermissionTo("settings.edit.{$key}");
        })->all();

        foreach ($data as $key => $value) {
            Setting::set($key, $value, 'general');
        }

        return ApiResponse::success(null, 'Settings saved.');
    }

    public function updateSmtp(Request $request)
    {
        if (!$request->user()->isSuperAdmin()) {
            return ApiResponse::error('Only Super Admin can update SMTP settings.', 403);
        }

        $request->validate([
            'enabled' => ['nullable', 'boolean'],
            'host' => ['nullable', 'string', 'max:255'],
            'port' => ['nullable', 'integer', 'min:1', 'max:65535'],
            'username' => ['nullable', 'string', 'max:255'],
            'password' => ['nullable', 'string', 'max:255'],
            'encryption' => ['nullable', 'string', 'in:ssl,tls,'],
            'from_address' => ['nullable', 'email'],
            'from_name' => ['nullable', 'string', 'max:255'],
            'test_email' => ['nullable', 'email'],
        ]);

        $smtp = [
            'enabled' => (bool) $request->boolean('enabled'),
            'host' => $request->input('host', ''),
            'port' => (int) ($request->input('port', 587)),
            'username' => $request->input('username', ''),
            'password' => $request->input('password', ''),
            'encryption' => $request->input('encryption', 'tls'),
            'from_address' => $request->input('from_address', ''),
            'from_name' => $request->input('from_name', ''),
            'test_email' => $request->input('test_email', ''),
        ];

        MailConfigService::save($smtp);

        return ApiResponse::success(null, 'SMTP settings saved.');
    }

    public function testMail(Request $request)
    {
        if (!$request->user()->isSuperAdmin()) {
            return ApiResponse::error('Only Super Admin can test the mail configuration.', 403);
        }

        $result = app(MailConfigService::class)->testConnection($request->input('email'));

        if ($result['ok']) {
            return ApiResponse::success(null, $result['message']);
        }

        return ApiResponse::error($result['error'], 422);
    }
}