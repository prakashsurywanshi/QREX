<?php

namespace App\Http\Controllers\Api;

use App\Http\Responses\ApiResponse;
use App\Models\Lead;

class ExportController extends ApiController
{
    public function leads()
    {
        $leads = Lead::select('id', 'first_name', 'last_name', 'email', 'phone', 'status', 'created_at')
            ->get();
        return ApiResponse::success($leads);
    }
}
