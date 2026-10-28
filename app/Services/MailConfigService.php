<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;

class MailConfigService
{
    protected string $group = 'smtp';

    public function settings(): array
    {
        return [
            'enabled' => (bool) $this->value('enabled', false),
            'host' => $this->value('host', ''),
            'port' => (int) $this->value('port', 587),
            'username' => $this->value('username', ''),
            'password' => $this->hasValue('password') ? '********' : '',
            'encryption' => $this->value('encryption', 'tls'),
            'from_address' => $this->value('from_address', config('mail.from.address', 'hello@example.com')),
            'from_name' => $this->value('from_name', config('app.name')),
            'test_email' => $this->value('test_email', ''),
        ];
    }

    public function hasValue(string $key): bool
    {
        return Setting::where('key', 'smtp_'.$key)->exists();
    }

    public function isConfigured(): bool
    {
        $s = $this->settings();

        return $s['enabled'] && !empty($s['host']) && !empty($s['port']);
    }

    public function applyForEmailSending(): void
    {
        $s = $this->settings();

        if (!$s['enabled']) {
            Config::set('mail.default', config('mail.default', 'log'));
            return;
        }

        Config::set('mail.default', 'smtp');
        Config::set('mail.mailers.smtp', [
            'transport' => 'smtp',
            'host' => $s['host'],
            'port' => $s['port'],
            'username' => $s['username'],
            'password' => $this->value('password', ''),
            'encryption' => $s['encryption'] === '' ? null : $s['encryption'],
            'timeout' => 30,
            'local_domain' => parse_url((string) config('app.url', 'http://localhost'), PHP_URL_HOST),
        ]);

        Config::set('mail.from.address', $s['from_address'] ?: config('mail.from.address'));
        Config::set('mail.from.name', $s['from_name'] ?: config('app.name'));
    }

    public function testConnection(?string $recipient = null): array
    {
        $this->applyForEmailSending();

        if (!$this->isConfigured()) {
            return ['ok' => false, 'error' => 'SMTP is not enabled or not configured yet.'];
        }

        try {
            $to = $recipient ?: $this->settings()['test_email'];

            if (empty($to)) {
                return ['ok' => false, 'error' => 'No recipient provided. Set a Test Email address or provide one.'];
            }

            $appName = config('app.name');
            $subject = 'SMTP Test - '.$appName;

            $sent = Mail::raw(
                'This is a test email to verify your SMTP configuration for '.$appName.'. If you are reading this, your SMTP settings are working correctly. Sent at '.now()->format('d M Y H:i:s').'.',
                function ($message) use ($to, $subject) {
                    $message->to($to)->subject($subject);
                }
            );

            return ['ok' => true, 'message' => 'Test email sent successfully to '.$to.'.'];
        } catch (\Throwable $e) {
            return ['ok' => false, 'error' => 'Failed to send test email: '.$e->getMessage()];
        }
    }

    protected function value(string $key, $default = null)
    {
        $raw = Setting::where('key', 'smtp_'.$key)->value('value');

        return $raw === null ? $default : $raw;
    }

    public static function save(array $smtp): void
    {
        $existing = Setting::where('key', 'smtp_password')->value('value') ?? '';

        $map = [
            'enabled' => isset($smtp['enabled']) ? (bool) $smtp['enabled'] : false,
            'host' => $smtp['host'] ?? '',
            'port' => (int) ($smtp['port'] ?? 587),
            'username' => $smtp['username'] ?? '',
            'password' => $smtp['password'] ?? '',
            'encryption' => $smtp['encryption'] ?? 'tls',
            'from_address' => $smtp['from_address'] ?? '',
            'from_name' => $smtp['from_name'] ?? '',
            'test_email' => $smtp['test_email'] ?? '',
        ];

        // Preserve the existing password unless a new (non-masked) one was submitted.
        if ($map['password'] === '********' || $map['password'] === '') {
            $map['password'] = $existing;
        }

        foreach ($map as $key => $value) {
            Setting::set('smtp_'.$key, $value, 'smtp');
        }
    }
}
