<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Tower;
use App\Models\Unit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UnitWebController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'tower_id' => 'nullable|exists:towers,id',
            'unit_no' => 'required|string',
            'floor' => 'nullable|integer',
            'unit_type' => 'required|string',
            'price' => 'nullable|numeric',
            'carpet_area' => 'nullable|numeric',
            'status' => 'nullable|in:available,hold,booked,sold,blocked',
        ]);

        Unit::create($validated);
        return back()->with('success', 'Unit added successfully');
    }

    public function hold(Unit $unit)
    {
        if ($unit->status !== 'available') {
            return back()->with('error', 'Unit not available');
        }
        $unit->hold(auth()->id());
        return back()->with('success', 'Unit held');
    }

    public function release(Unit $unit)
    {
        if ($unit->status !== 'hold') {
            return back()->with('error', 'Unit not on hold');
        }
        $unit->release();
        return back()->with('success', 'Unit released');
    }

    public function updateStatus(Request $request, Unit $unit)
    {
        $unit->update(['status' => $request->status]);
        return back()->with('success', 'Unit status updated');
    }
}
