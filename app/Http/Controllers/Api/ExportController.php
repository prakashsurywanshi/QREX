<?php

namespace App\Http\Controllers\Api;

use App\Http\Responses\ApiResponse;
use App\Models\Lead;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ExportController extends ApiController
{
    public function leads(Request $request)
    {
        $query = Lead::query()->visibleTo(Auth::user());
        if ($request->filled('status')) $query->where('status', $request->string('status'));
        $leads = $query->latest()->limit(5000)->get(['lead_id','name','phone','email','source','status','budget','preferred_location','created_at']);
        return ApiResponse::success($leads);
    }
}
