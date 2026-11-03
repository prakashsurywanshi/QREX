<?php

namespace App\Http\Controllers\Api;

use App\Http\Responses\ApiResponse;
use App\Models\Communication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommunicationController extends ApiController
{
    public function index(Request $request)
    {
        $query = Communication::with('creator')->latest();
        if ($request->filled('communicable_type') && $request->filled('communicable_id')) {
            $query->where('communicable_type', $request->communicable_type)
                  ->where('communicable_id', $request->communicable_id);
        }
        if ($request->filled('type')) $query->where('type', $request->type);
        return ApiResponse::success($query->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'communicable_type' => 'required|string',
            'communicable_id' => 'required|integer',
            'type' => 'required|in:note,call,whatsapp,email,site_visit,status_change,assignment,reminder',
            'direction' => 'nullable|in:inbound,outbound',
            'subject' => 'nullable|string',
            'content' => 'nullable|string',
            'duration_minutes' => 'nullable|integer|min:0',
            'call_outcome' => 'nullable|string',
            'next_follow_up_at' => 'nullable|date',
            'meta' => 'nullable|array',
        ]);

        $comm = Communication::create([
            ...$validated,
            'created_by' => Auth::id(),
        ]);

        return ApiResponse::success($comm->load('creator'), 'Communication logged successfully', 201);
    }

    public function show(Communication $communication)
    {
        return ApiResponse::success($communication->load('creator', 'communicable'));
    }

    public function destroy(Communication $communication)
    {
        $communication->delete();
        return ApiResponse::success(null, 'Communication deleted successfully');
    }
}
