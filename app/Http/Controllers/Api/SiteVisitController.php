<?php

namespace App\Http\Controllers\Api;

use App\Http\Responses\ApiResponse;
use App\Models\SiteVisit;
use Illuminate\Http\Request;

class SiteVisitController extends ApiController
{
    public function index()
    {
        $visits = SiteVisit::latest('visit_date')->get()->map(fn ($v) => $this->visitBrief($v));

        return ApiResponse::success([
            'siteVisits' => $visits->all(),
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

        $visit = SiteVisit::create($data);

        return ApiResponse::success($this->visitBrief($visit), 'Site visit scheduled.', 201);
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

        return ApiResponse::success($this->visitBrief($siteVisit), 'Site visit updated.');
    }

    public function destroy(SiteVisit $siteVisit)
    {
        $siteVisit->delete();

        return ApiResponse::success(null, 'Site visit deleted.');
    }

    protected function visitBrief($v): array
    {
        return [
            'id' => $v->id,
            'visit_id' => $v->visit_id,
            'lead_id' => $v->lead_id,
            'customer_name' => $v->customer_name,
            'property_name' => $v->property_name,
            'agent_name' => $v->agent_name,
            'visit_date' => $v->visit_date,
            'visit_time' => $v->visit_time,
            'status' => $v->status,
            'location' => $v->location,
            'notes' => $v->notes,
            'feedback' => $v->feedback,
            'created_at' => $v->created_at?->toISOString(),
        ];
    }
}