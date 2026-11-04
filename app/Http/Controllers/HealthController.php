<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class HealthController extends Controller
{
    public function index(): JsonResponse
    {
        $status = ['status' => 'ok', 'timestamp' => now()->toIso8601String()];

        try {
            DB::connection()->getPdo();
            $status['database'] = 'connected';
        } catch (\Exception $e) {
            $status['database'] = 'disconnected';
            $status['status'] = 'error';
        }

        try {
            Cache::store()->get('health_check');
            $status['cache'] = 'ok';
        } catch (\Exception $e) {
            $status['cache'] = 'error';
        }

        $code = $status['status'] === 'ok' ? 200 : 503;
        return response()->json($status, $code);
    }
}
