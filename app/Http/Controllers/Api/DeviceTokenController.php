<?php

namespace App\Http\Controllers\Api;

use App\Http\Responses\ApiResponse;
use App\Models\DeviceToken;
use Illuminate\Http\Request;

class DeviceTokenController extends ApiController
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'token' => 'required|string|max:500',
            'platform' => 'nullable|string|max:20',
            'device_id' => 'nullable|string|max:191',
        ]);

        $deviceToken = DeviceToken::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'token' => $validated['token'],
            ],
            [
                'tenant_id' => $request->user()->tenant_id ?? null,
                'platform' => $validated['platform'] ?? 'android',
                'device_id' => $validated['device_id'] ?? null,
            ]
        );

        return ApiResponse::success($deviceToken, 'Device token registered');
    }

    public function destroy(Request $request)
    {
        $request->validate([
            'token' => 'required|string|max:500',
        ]);

        DeviceToken::where('user_id', $request->user()->id)
            ->where('token', $request->token)
            ->delete();

        return ApiResponse::success(null, 'Device token removed');
    }
}
