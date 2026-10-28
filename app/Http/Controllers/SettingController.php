<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Services\MailConfigService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SettingController extends Controller
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
        'logo_url' => '',
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

    protected function settings(): array
    {
        $saved = Setting::allAsArray();

        return array_merge($this->defaults, $saved);
    }

    public function index()
    {
        return Inertia::render('admin/Settings', [
            'settings' => $this->settings(),
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

        return back()->with('success', 'Settings saved.');
    }

    public function updateLogo(Request $request)
    {
        if (!$request->user()->isSuperAdmin()) {
            return back()->with('error', 'Only Super Admin can update the logo.');
        }

        $request->validate([
            'logo' => ['required', 'image', 'mimes:jpeg,png,jpg,webp,svg', 'max:2048'],
        ]);

        $this->deleteLogoFile();

        $path = $request->file('logo')->store('settings', 'public');
        $url = Storage::disk('public')->url($path);

        Setting::set('logo_url', $url, 'branding');

        return back()->with('success', 'Logo updated.');
    }

    public function removeLogo(Request $request)
    {
        if (!$request->user()->isSuperAdmin()) {
            return back()->with('error', 'Only Super Admin can remove the logo.');
        }

        $this->deleteLogoFile();
        Setting::set('logo_url', '', 'branding');

        return back()->with('success', 'Logo removed.');
    }

    protected function deleteLogoFile(): void
    {
        $url = Setting::where('key', 'logo_url')->value('value');
        if (!$url) {
            return;
        }

        $base = rtrim(Storage::disk('public')->url('/'), '/');
        if (str_starts_with($url, $base.'/')) {
            $relative = ltrim(substr($url, strlen($base)), '/');
            if (str_starts_with($relative, 'settings/') && Storage::disk('public')->exists($relative)) {
                Storage::disk('public')->delete($relative);
            }
        }
    }

    public function updateSmtp(Request $request)
    {
        if (!$request->user()->isSuperAdmin()) {
            return back()->with('error', 'Only Super Admin can update SMTP settings.');
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

        return back()->with('success', 'SMTP settings saved.');
    }

    public function testMail(Request $request)
    {
        if (!$request->user()->isSuperAdmin()) {
            return back()->with('error', 'Only Super Admin can test the mail configuration.');
        }

        $result = app(MailConfigService::class)->testConnection($request->input('email'));

        if ($result['ok']) {
            return back()->with('success', $result['message']);
        }

        return back()->with('error', $result['error']);
    }
}
