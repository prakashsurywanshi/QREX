<?php

namespace App\Http\Controllers\Api;

use App\Http\Responses\ApiResponse;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends ApiController
{
    public function index(Request $request)
    {
        $logs = AuditLog::with('user')
            ->latest()
            ->paginate(50);
        return ApiResponse::success($logs);
    }
}
