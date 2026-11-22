<?php

namespace App\Http\Controllers\Api;

use App\Http\Responses\ApiResponse;
use App\Services\WhatsApp\MetaCloudService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class WhatsAppController extends ApiController
{
    public function send(Request $request, MetaCloudService $whatsapp)
    {
        $validated = $request->validate([
            'to' => 'required|string|max:30',
            'type' => 'required|in:text,template',
            'message' => 'required_if:type,text|string|max:4096',
            'template_name' => 'required_if:type,template|string|max:128',
            'language' => 'nullable|string|max:16',
            'components' => 'nullable|array',
        ]);

        if ($validated['type'] === 'template') {
            $result = $whatsapp->sendTemplate(
                $validated['to'],
                $validated['template_name'],
                $validated['language'] ?? 'en_US',
                $validated['components'] ?? []
            );
        } else {
            $result = $whatsapp->sendText($validated['to'], $validated['message']);
        }

        if ($result['success']) {
            return ApiResponse::success($result['data'] ?? null, 'Message sent successfully');
        }

        return ApiResponse::error($result['message'] ?? 'Failed to send message', 422);
    }

    public function webhook(Request $request)
    {
        if ($request->isMethod('get') && $request->query('hub_mode') === 'subscribe') {
            $verifyToken = (string) config('services.whatsapp.meta.verify_token', '');
            $challenge = $request->query('hub_challenge');

            if ($verifyToken !== '' && hash_equals($verifyToken, (string) $request->query('hub_verify_token', ''))) {
                return response($challenge, 200)->header('Content-Type', 'text/plain');
            }

            Log::warning('WhatsApp webhook verification failed.');
            return response('Forbidden', 403);
        }

        if (!$this->isValidSignature($request)) {
            Log::warning('WhatsApp webhook signature invalid.', ['ip' => $request->ip()]);
            return response('Forbidden', 403);
        }

        $payload = $request->all();
        $messages = data_get($payload, 'entry.0.changes.0.value.messages', []);
        $statuses = data_get($payload, 'entry.0.changes.0.value.statuses', []);

        foreach ($messages as $message) {
            $id = $message['id'] ?? null;
            if (!$id || !Cache::add('whatsapp:msg:'.$id, true, now()->addDays(2))) {
                continue;
            }
            Log::info('WhatsApp inbound message received', [
                'id' => $id,
                'from' => $message['from'] ?? null,
                'type' => $message['type'] ?? null,
                'timestamp' => $message['timestamp'] ?? null,
            ]);
        }

        foreach ($statuses as $status) {
            $id = $status['id'] ?? null;
            if (!$id) {
                continue;
            }
            Cache::put('whatsapp:status:'.$id, $status['status'] ?? 'unknown', now()->addDays(2));
            Log::info('WhatsApp status update received', [
                'id' => $id,
                'status' => $status['status'] ?? null,
                'recipient_id' => $status['recipient_id'] ?? null,
            ]);
        }

        return response()->json(['status' => 'ok']);
    }

    public function status()
    {
        $meta = config('services.whatsapp.meta', []);
        return ApiResponse::success([
            'enabled' => (bool) config('services.whatsapp.enabled', false),
            'provider' => config('services.whatsapp.provider', 'meta_cloud'),
            'configured' => !empty($meta['phone_number_id']) && !empty($meta['access_token']),
        ]);
    }

    private function isValidSignature(Request $request): bool
    {
        $secret = (string) config('services.whatsapp.meta.app_secret', '');
        $signature = (string) $request->header('X-Hub-Signature-256', '');

        if ($secret === '' || $signature === '') {
            return app()->environment('local', 'testing');
        }

        $expected = 'sha256='.hash_hmac('sha256', $request->getContent(), $secret);

        return hash_equals($expected, $signature);
    }
}
