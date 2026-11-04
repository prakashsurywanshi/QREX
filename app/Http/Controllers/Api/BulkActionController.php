<?php

namespace App\Http\Controllers\Api;

use App\Http\Responses\ApiResponse;
use App\Models\Lead;
use Illuminate\Http\Request;

class BulkActionController extends ApiController
{
    public function bulkAssignLeads(Request $request)
    {
        $validated = $request->validate([
            'lead_ids' => 'required|array',
            'lead_ids.*' => 'exists:leads,id',
            'agent_id' => 'required|exists:users,id',
        ]);

        Lead::whereIn('id', $validated['lead_ids'])->update(['assigned_to' => $validated['agent_id']]);

        return ApiResponse::success(null, 'Leads assigned successfully');
    }
}
