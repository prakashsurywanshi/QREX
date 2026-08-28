<?php

namespace App\Http\Controllers;

use App\Models\SiteVisit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SiteVisitController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/SiteVisits', [
            'siteVisits' => SiteVisit::latest('visit_date')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'customer_name' => 'required|string',
            'property_name' => 'required|string',
            'agent_name' => 'required|string',
            'visit_date' => 'required|date',
            'visit_time' => 'required|string',
            'location' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $data['visit_id'] = $this->nextId('SV');

        SiteVisit::create($data);

        return back()->with('success', 'Site visit scheduled.');
    }

    public function update(Request $request, SiteVisit $siteVisit)
    {
        $data = $request->validate([
            'status' => 'nullable|string',
            'notes' => 'nullable|string',
            'feedback' => 'nullable|string',
            'visit_date' => 'nullable|date',
            'visit_time' => 'nullable|string',
        ]);

        $siteVisit->update($data);

        return back()->with('success', 'Site visit updated.');
    }
}
