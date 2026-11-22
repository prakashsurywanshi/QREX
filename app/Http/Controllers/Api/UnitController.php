<?php

namespace App\Http\Controllers\Api;

use App\Http\Responses\ApiResponse;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

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
        $hours = min(max((int) $request->input('hours', 24), 1), 168);
        $held = DB::transaction(function () use ($unit, $hours) {
            $fresh = Unit::whereKey($unit->id)->lockForUpdate()->first();
            if (!$fresh || $fresh->status !== 'available') return null;
            $fresh->update([
                'status' => 'hold',
                'held_by' => Auth::id(),
                'hold_expires_at' => now()->addHours($hours),
            ]);
            return $fresh;
        });
        if (!$held) return ApiResponse::error('Unit not available for hold', 422);
        return ApiResponse::success($held->fresh(), 'Unit held successfully');
    }

    public function release(Unit $unit)
    {
        $released = DB::transaction(function () use ($unit) {
            $fresh = Unit::whereKey($unit->id)->lockForUpdate()->first();
            if (!$fresh || $fresh->status !== 'hold') return null;
            $fresh->update(['status' => 'available', 'held_by' => null, 'hold_expires_at' => null]);
            return $fresh;
        });
        if (!$released) return ApiResponse::error('Unit is not on hold', 422);
        return ApiResponse::success($released->fresh(), 'Unit released successfully');
    }

    public function update(Request $request, Unit $unit)
    {
        $validated = $request->validate([
            'price' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:available,hold,booked,sold,blocked',
            'remarks' => 'nullable|string|max:1000',
            'facing' => 'nullable|string|max:100',
        ]);
        $unit->update($validated);
        return ApiResponse::success($unit, 'Unit updated successfully');
    }

    public function destroy(Unit $unit)
    {
        $unit->delete();
        return ApiResponse::success(null, 'Unit deleted successfully');
    }
}
