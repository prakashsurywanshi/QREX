<?php

namespace App\Services\WhatsApp;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MetaCloudService
{
    protected string $phoneNumberId;
    protected string $accessToken;
    protected string $version = 'v21.0';

    public function __construct()
    {
        $meta = config('services.whatsapp.meta', []);
        $this->phoneNumberId = (string) ($meta['phone_number_id'] ?? config('services.whatsapp.phone_number_id') ?? '');
        $this->accessToken = (string) ($meta['access_token'] ?? config('services.whatsapp.access_token') ?? '');
    }

    public function sendTemplate(string $to, string $templateName, string $language = 'en_US', array $components = []): array
    {
        if (empty($this->phoneNumberId) || empty($this->accessToken)) {
            Log::warning('WhatsApp Meta Cloud: Missing credentials');
            return ['success' => false, 'message' => 'Missing WhatsApp credentials'];
        }

        $to = $this->formatNumber($to);

        try {
            $response = Http::withToken($this->accessToken)
                ->post("https://graph.facebook.com/{$this->version}/{$this->phoneNumberId}/messages", [
                    'messaging_product' => 'whatsapp',
                    'to' => $to,
                    'type' => 'template',
                    'template' => [
                        'name' => $templateName,
                        'language' => ['code' => $language],
                        'components' => $components,
                    ],
                ]);

            return [
                'success' => $response->successful(),
                'data' => $response->json(),
                'status' => $response->status(),
            ];
        } catch (\Exception $e) {
            Log::error('WhatsApp send error: ' . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function sendText(string $to, string $message): array
    {
        if (empty($this->phoneNumberId) || empty($this->accessToken)) {
            return ['success' => false, 'message' => 'Missing WhatsApp credentials'];
        }

        $to = $this->formatNumber($to);

        try {
            $response = Http::withToken($this->accessToken)
                ->post("https://graph.facebook.com/{$this->version}/{$this->phoneNumberId}/messages", [
                    'messaging_product' => 'whatsapp',
                    'to' => $to,
                    'type' => 'text',
                    'text' => ['body' => $message],
                ]);

            return [
                'success' => $response->successful(),
                'data' => $response->json(),
                'status' => $response->status(),
            ];
        } catch (\Exception $e) {
            Log::error('WhatsApp send error: ' . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    protected function formatNumber(string $number): string
    {
        $number = preg_replace('/[^0-9]/', '', $number);
        if (strlen($number) === 10) {
            $number = '91' . $number;
        }
        return $number;
    }
}
