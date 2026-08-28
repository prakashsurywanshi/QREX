<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\Lead;
use App\Models\Property;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CampaignController extends Controller
{
    public function index()
    {
        $campaigns = Campaign::withCount('leads as lead_count')->latest()->get();

        return Inertia::render('admin/Marketing', [
            'campaigns' => $campaigns,
            'leadSources' => [
                ['name' => 'Website', 'value' => 32],
                ['name' => 'Facebook', 'value' => 24],
                ['name' => 'Google', 'value' => 18],
                ['name' => 'Referral', 'value' => 12],
                ['name' => 'Instagram', 'value' => 8],
                ['name' => 'Walk-in', 'value' => 6],
            ],
            'propertyPromotions' => Property::query()
                ->where('featured', true)
                ->orWhereIn('status', ['Ready to Move', 'Under Construction'])
                ->take(6)
                ->get(['id', 'title', 'price', 'price_label', 'address', 'image', 'status']),
            'landingLeads' => Lead::where('source', 'Website')
                ->latest()
                ->take(8)
                ->get()
                ->map(fn ($l) => [
                    'name' => $l->name,
                    'phone' => $l->phone,
                    'status' => $l->status,
                    'created' => $l->created_at?->format('d M Y'),
                ]),
            'conversionData' => $campaigns->filter(fn ($c) => $c->leads > 0)->map(fn ($c) => [
                'name' => $c->name,
                'leads' => $c->leads,
                'conversions' => $c->conversions ?? 0,
                'revenue' => $c->revenue ?? 0,
            ])->values(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'channel' => 'required|string',
            'budget' => 'required|numeric',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
        ]);

        $data['campaign_id'] = $this->nextId('CAM');
        $data['status'] = 'Scheduled';
        $data['revenue_label'] = '—';

        Campaign::create($data);

        return back()->with('success', 'Campaign created.');
    }
}
