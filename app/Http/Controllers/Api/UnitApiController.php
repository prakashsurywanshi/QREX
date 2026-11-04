<?php

namespace App\Http\Controllers\Api;

use App\Http\Responses\ApiResponse;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UnitApiController extends ApiController
{
    public function index(Request $request)
    {
        $units = Unit::with(['project', 'tower'])
            ->when($request->project_id, fn($q,$v)=>$q->where('project_id',$v))
            ->when($request->status, fn($q,$v)=>$q->where('status',$v))
            ->latest()->paginate(20);
        return ApiResponse::success($units);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'tower_id' => 'nullable|exists:towers,id',
            'unit_no' => 'required|string',
            'unit_type' => 'required|string',
            'price' => 'nullable|numeric',
            'status' => 'nullable|in:available,hold,booked,sold,blocked',
        ]);
        $unit = Unit::create($validated);
        return ApiResponse::success($unit, 'Unit created', 201);
    }

    public function show(Unit $unit)
    {
        $unit->load(['project', 'tower']);
        return ApiResponse::success($unit);
    }

    public function hold(Unit $unit)
    {
        if ($unit->status !== 'available') return ApiResponse::error('Not available', 422);
        $unit->hold(Auth::id());
        return ApiResponse::success($unit->fresh(), 'Unit held');
    }

    public function release(Unit $unit)
    {
        if ($unit->status !== 'hold') return ApiResponse::error('Not on hold', 422);
        $unit->release();
        return ApiResponse::success($unit->fresh(), 'Unit released');
    }
}
