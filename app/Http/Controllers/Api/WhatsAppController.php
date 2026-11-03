<?php

namespace App\Http\Controllers\Api;

use App\Http\Responses\ApiResponse;
use App\Services\WhatsApp\MetaCloudService;
use Illuminate\Http\Request;

class WhatsAppController extends ApiController
{
    public function send(Request $request, MetaCloudService $whatsapp)
    {
        $validated = $request->validate([
            'to' => 'required|string',
            'type' => 'required|in:text,template',
            'message' => 'required_if:type,text|string',
            'template_name' => 'required_if:type,template|string',
            'language' => 'nullable|string',
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
        // Meta webhook verification
        if ($request->has('hub_mode') && $request->hub_mode === 'subscribe') {
            $verifyToken = env('META_VERIFY_TOKEN', '');
            if ($request->hub_verify_token === $verifyToken) {
                return response($request->hub_challenge, 200);
            }
            return response('Forbidden', 403);
        }

        // Handle incoming webhooks
        return response()->json(['status' => 'ok']);
    }

    public function status()
    {
        return ApiResponse::success([
            'enabled' => env('WHATSAPP_ENABLED', false),
            'provider' => env('WHATSAPP_PROVIDER', 'meta_cloud'),
            'configured' => !empty(env('META_PHONE_NUMBER_ID')) && !empty(env('META_ACCESS_TOKEN')),
        ]);
    }
}
