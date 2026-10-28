<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Deal;
use App\Models\Lead;
use App\Models\Notification;
use App\Models\Property;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PipelineController extends Controller
{
    public function index()
    {
        $deals = Deal::with(['property', 'assignedAgent'])->get()->map(fn ($d) => [
            'id' => $d->id,
            'deal_id' => $d->deal_id,
            'customer_name' => $d->customer_name,
            'property_name' => $d->property?->title ?? $d->property_name,
            'deal_value' => $d->deal_value,
            'value_label' => $d->value_label ?? $this->label($d->deal_value),
            'stage' => $d->stage,
            'probability' => $d->probability,
            'days_in_stage' => $d->days_in_stage,
            'agent_name' => $d->assignedAgent?->name ?? '—',
            'agent_id' => $d->assigned_agent_id,
            'property_id' => $d->property_id,
            'last_activity' => $d->last_activity,
            'next_followup' => $d->next_followup,
        ]);

        $active = $deals->whereNotIn('stage', ['Closed Won', 'Closed Lost']);
        $won = $deals->where('stage', 'Closed Won');
        $lost = $deals->where('stage', 'Closed Lost');

        return Inertia::render('admin/Pipeline', [
            'deals' => $deals,
            'stages' => [
                'New Lead', 'Contacted', 'Qualified', 'Property Shortlisted',
                'Site Visit Scheduled', 'Site Visit Completed', 'Negotiation',
                'Booking', 'Agreement', 'Payment', 'Closed Won', 'Closed Lost',
            ],
            'agents' => User::whereIn('role', ['Sales Executive', 'Senior Agent', 'Admin'])->get(['id', 'name'])->map(fn ($u) => ['id' => $u->id, 'name' => $u->name, 'initials' => $u->initials]),
            'properties' => Property::orderBy('id')->limit(15)->get(['id', 'title']),
            'customers' => Customer::orderBy('id')->limit(20)->get(['id', 'name']),
            'leads' => Lead::visibleTo(Auth::user())->orderBy('created_at', 'desc')->limit(20)->get(['id', 'name']),
            'summary' => [
                'total' => $deals->count(),
                'pipelineValue' => $active->sum('deal_value'),
                'activeCount' => $active->count(),
                'expectedRevenue' => $active->sum(fn ($d) => $d['deal_value'] * (($d['probability'] ?? 0) / 100)),
                'wonValue' => $won->sum('deal_value'),
                'wonCount' => $won->count(),
                'lostValue' => $lost->sum('deal_value'),
                'conversionRate' => $deals->count() ? round($won->count() / $deals->count() * 100, 1) : 0,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'customer_name' => ['required', 'string'],
            'property_id' => ['nullable', 'integer'],
            'deal_value' => ['required', 'numeric'],
            'stage' => ['nullable', 'string'],
            'probability' => ['nullable', 'integer', 'min:0', 'max:100'],
            'assigned_agent_id' => ['nullable', 'integer'],
            'lead_id' => ['nullable', 'integer'],
        ]);

        $deal = Deal::create([
            'deal_id' => $this->nextId('DL'),
            'customer_name' => $request->customer_name,
            'property_id' => $request->property_id,
            'deal_value' => $request->deal_value,
            'value_label' => $this->label($request->deal_value),
            'stage' => $request->stage ?: 'New Lead',
            'stage_changed_at' => now(),
            'probability' => $request->probability ?: 10,
            'days_in_stage' => 0,
            'assigned_agent_id' => $request->assigned_agent_id,
            'lead_id' => $request->lead_id,
        ]);

        if ($request->filled('assigned_agent_id')) {
            Notification::create([
                'user_id' => $request->assigned_agent_id,
                'title' => 'New deal assigned',
                'message' => 'Deal '.$deal->deal_id.' created for '.$request->customer_name,
                'type' => 'deal.created',
                'related_id' => $deal->id,
            ]);
        }

        return back()->with('success', 'Deal created.');
    }

    public function moveStage(Request $request, Deal $deal)
    {
        $request->validate(['stage' => 'required|string']);

        $deal->update([
            'stage' => $request->stage,
            'stage_changed_at' => now(),
            'days_in_stage' => 0,
        ]);

        return back()->with('success', 'Deal moved to '.$request->stage);
    }

    private function label($amount): string
    {
        if ($amount >= 10000000) {
            return '₹'.round($amount / 10000000, 2).' Cr';
        }
        return '₹'.round($amount / 100000).' L';
    }
}
