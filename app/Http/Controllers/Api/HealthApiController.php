<?php

namespace App\Http\Controllers\Api;

use App\Http\Responses\ApiResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class HealthApiController extends ApiController
{
    public function index()
    {
        $health = [
            'status' => 'ok',
            'timestamp' => now()->toIso8601String(),
            'services' => [],
        ];

        try {
            DB::connection()->getPdo();
            $health['services']['database'] = 'up';
        } catch (\Exception $e) {
            $health['services']['database'] = 'down';
            $health['status'] = 'degraded';
        }

        try {
            Cache::get('health');
            $health['services']['cache'] = 'up';
        } catch (\Exception $e) {
            $health['services']['cache'] = 'down';
        }

        return ApiResponse::success($health);
    }
}
