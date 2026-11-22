<?php

namespace App\Http\Controllers\Api;

use App\Http\Responses\ApiResponse;
use App\Models\Lead;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BulkActionController extends ApiController
{
    public function bulkAssignLeads(Request $request)
    {
        $validated = $request->validate([
            'lead_ids' => 'required|array',
            'lead_ids.*' => 'integer',
            'agent_id' => 'required|exists:users,id',
        ]);

        $ids = Lead::query()->visibleTo(Auth::user())->whereIn('id', $validated['lead_ids'])->pluck('id');
        Lead::whereIn('id', $ids)->update(['assigned_agent_id' => $validated['agent_id']]);

        return ApiResponse::success(['updated' => $ids->count()], 'Leads assigned successfully');
    }
}
