<?php

namespace App\Http\Controllers\Api;

use App\Http\Responses\ApiResponse;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends ApiController
{
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user || (!$user->isSuperAdmin() && !$user->hasRole('admin'))) {
            return ApiResponse::error('Forbidden', 403);
        }
        $perPage = min(100, max(1, (int) $request->integer('per_page', 50)));
        $query = AuditLog::with('user:id,name,email')->latest();
        if ($request->filled('action')) $query->where('action', $request->string('action'));
        if ($request->filled('user_id')) $query->where('user_id', $request->integer('user_id'));
        if ($request->filled('auditable_type')) $query->where('auditable_type', $request->string('auditable_type'));
        $logs = $query->paginate($perPage);
        return ApiResponse::success($logs);
    }
}
