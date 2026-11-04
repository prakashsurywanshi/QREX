<?php

namespace App\Services\FCM;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FcmService
{
    public function sendToToken(string $token, string $title, string $body, array $data = []): array
    {
        $serverKey = env('FCM_SERVER_KEY');
        if (!$serverKey) {
            return ['success' => false, 'message' => 'FCM server key not configured'];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'key=' . $serverKey,
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

            return ['success' => $response->successful(), 'data' => $response->json()];
        } catch (\Exception $e) {
            Log::error('FCM error: ' . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
}
