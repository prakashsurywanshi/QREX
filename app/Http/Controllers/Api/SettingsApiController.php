<?php

namespace App\Http\Controllers\Api;

use App\Http\Responses\ApiResponse;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingsApiController extends ApiController
{
    public function index()
    {
        $settings = Setting::pluck('value', 'key');
        return ApiResponse::success($settings);
    }

    public function update(Request $request)
    {
        foreach ($request->all() as $key => $value) {
            if (in_array($key, ['_token', '_method'])) continue;
            Setting::updateOrCreate(['key' => $key], ['value' => is_array($value) ? json_encode($value) : $value]);
        }
        return ApiResponse::success(null, 'Settings updated');
    }
}
