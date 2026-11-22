<?php

namespace App\Services\FCM;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FcmService
{
    public function sendToToken(string $token, string $title, string $body, array $data = []): array
    {
        if (!config('services.fcm.enabled', false)) {
            return ['success' => false, 'message' => 'FCM disabled'];
        }

        $serverKey = (string) config('services.fcm.server_key', '');
        if ($serverKey === '') {
            return ['success' => false, 'message' => 'FCM server key not configured'];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'key='.$serverKey,
                'Content-Type' => 'application/json',
            ])->post('https://fcm.googleapis.com/fcm/send', [
                'to' => $token,
                'notification' => [
                    'title' => $title,
                    'body' => $body,
                    'sound' => 'default',
                ],
                'data' => $data,
            ]);

            return ['success' => $response->successful(), 'data' => $response->json(), 'status' => $response->status()];
        } catch (\Exception $e) {
            Log::error('FCM error: '.$e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
}
