<?php

namespace App\Http\Controllers\Api;

use App\Http\Responses\ApiResponse;
use App\Models\Campaign;
use App\Models\Lead;
use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MarketingController extends ApiController
{
    public function index()
    {
        $campaigns = Campaign::withCount('leads as lead_count')->latest()->get();

        return ApiResponse::success([
            'campaigns' => $campaigns->map(fn ($c) => $this->campaignBrief($c))->all(),
            'leadSources' => [
                ['name' => 'Website', 'value' => 32],
                ['name' => 'Facebook', 'value' => 24],
                ['name' => 'Google', 'value' => 18],
                ['name' => 'Referral', 'value' => 12],
                ['name' => 'Instagram', 'value' => 8],
                ['name' => 'Walk-in', 'value' => 6],
            ],
            'propertyPromotions' => Property::query()
                ->with('images')
                ->where('featured', true)
                ->orWhereIn('status', ['Ready to Move', 'Under Construction'])
                ->take(6)
                ->get(['id', 'title', 'price', 'price_label', 'address', 'image', 'status'])
                ->map(fn ($p) => $p->setAttribute('image', $p->coverOrImage())),
            'landingLeads' => Lead::visibleTo(Auth::user())->where('source', 'Website')
                ->latest()
                ->take(8)
                ->get()
                ->map(fn ($l) => [
                    'name' => $l->name,
                    'phone' => $l->phone,
                    'status' => $l->status,
                    'created' => $l->created_at?->format('d M Y'),
                ])
                ->all(),
            'conversionData' => $campaigns->filter(fn ($c) => $c->leads > 0)->map(fn ($c) => [
                'name' => $c->name,
                'leads' => $c->leads,
                'conversions' => $c->conversions ?? 0,
                'revenue' => $c->revenue ?? 0,
            ])->values()->all(),
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

        $campaign = Campaign::create($data);

        return ApiResponse::success($this->campaignBrief($campaign), 'Campaign created.', 201);
    }

    public function update(Request $request, Campaign $campaign)
    {
        $data = $request->validate([
            'name' => ['nullable', 'string'],
            'channel' => ['nullable', 'string'],
            'budget' => ['nullable', 'numeric'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date'],
            'status' => ['nullable', 'string'],
        ]);

        $campaign->update(array_filter($data, fn ($v) => $v !== null && $v !== ''));

        return ApiResponse::success($this->campaignBrief($campaign), 'Campaign updated.');
    }

    public function destroy(Campaign $campaign)
    {
        $campaign->delete();

        return ApiResponse::success(null, 'Campaign deleted.');
    }

    protected function campaignBrief($c): array
    {
        return [
            'id' => $c->id,
            'campaign_id' => $c->campaign_id,
            'name' => $c->name,
            'channel' => $c->channel,
            'budget' => (float) $c->budget,
            'spent' => $c->spent,
            'leads' => (int) ($c->lead_count ?? $c->leads),
            'conversions' => $c->conversions,
            'revenue' => $c->revenue,
            'revenue_label' => $c->revenue_label,
            'roi' => $c->roi,
            'start_date' => $c->start_date?->format('Y-m-d'),
            'end_date' => $c->end_date?->format('Y-m-d'),
            'status' => $c->status,
            'created_at' => $c->created_at?->toISOString(),
        ];
    }
}