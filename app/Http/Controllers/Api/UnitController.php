<?php

namespace App\Http\Controllers\Api;

use App\Http\Responses\ApiResponse;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UnitController extends ApiController
{
    public function index(Request $request)
    {
        $units = Unit::with(['project', 'tower'])
            ->when($request->project_id, fn($q,$v)=>$q->where('project_id',$v))
            ->when($request->tower_id, fn($q,$v)=>$q->where('tower_id',$v))
            ->when($request->status, fn($q,$v)=>$q->where('status',$v))
            ->when($request->unit_type, fn($q,$v)=>$q->where('unit_type',$v))
            ->latest()->paginate(20);
        return ApiResponse::success($units);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'tower_id' => 'nullable|exists:towers,id',
            'unit_no' => 'required|string',
            'floor' => 'nullable|integer',
            'unit_type' => 'required|string',
            'carpet_area' => 'nullable|numeric',
            'built_up_area' => 'nullable|numeric',
            'super_area' => 'nullable|numeric',
            'price' => 'nullable|numeric',
            'facing' => 'nullable|string',
            'status' => 'nullable|in:available,hold,booked,sold,blocked',
        ]);
        $unit = Unit::create($validated);
        return ApiResponse::success($unit, 'Unit created successfully', 201);
    }

    public function show(Unit $unit)
    {
        $unit->load(['project.towers', 'tower', 'holder', 'booking', 'deal']);
        return ApiResponse::success($unit);
    }

    public function hold(Unit $unit, Request $request)
    {
        if ($unit->status !== 'available') {
            return ApiResponse::error('Unit is not available for hold', 422);
        }
        $hours = $request->input('hours', 24);
        $unit->hold(Auth::id(), $hours);
        return ApiResponse::success($unit->fresh(), 'Unit held successfully');
    }

    public function release(Unit $unit)
    {
        if ($unit->status !== 'hold') {
            return ApiResponse::error('Unit is not on hold', 422);
        }
        $unit->release();
        return ApiResponse::success($unit->fresh(), 'Unit released successfully');
    }

    public function update(Request $request, Unit $unit)
    {
        $unit->update($request->only(['price', 'status', 'remarks', 'facing']));
        return ApiResponse::success($unit, 'Unit updated successfully');
    }

    public function destroy(Unit $unit)
    {
        $unit->delete();
        return ApiResponse::success(null, 'Unit deleted successfully');
    }
}
