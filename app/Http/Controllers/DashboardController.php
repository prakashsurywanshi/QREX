<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Deal;
use App\Models\Lead;
use App\Models\Payment;
use App\Models\Property;
use App\Models\SiteVisit;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // Date-range filter (Today / Week / Month / Year / All)
        $range = $request->string('range', 'month')->toString();
        $start = match ($range) {
            'today' => now()->startOfDay(),
            'week' => now()->startOfWeek(),
            'year' => now()->startOfYear(),
            'all' => null,
            default => now()->startOfMonth(),
        };

        $deals = Deal::query();
        $payments = Payment::query();
        $bookings = Booking::query();
        $newLeads = Lead::query();

        if ($start) {
            $deals->where('created_at', '>=', $start);
            $payments->where('created_at', '>=', $start);
            $bookings->where('created_at', '>=', $start);
            $newLeads->where('created_at', '>=', $start);
        }

        $revenueWon = (clone $deals)->where('stage', 'Closed Won')->sum('deal_value');
        $received = (clone $payments)->where('status', 'Paid')->sum('amount');
        $pendingPayments = (clone $payments)->whereIn('status', ['Pending', 'Overdue', 'Partially Paid'])->sum('amount');

        $soldPropertyCount = Property::where('status', 'Sold')->count();
        $availablePropertyCount = Property::where('status', 'Available')->count();
        $featuredProperties = Property::where('featured', true)->where('is_website_visible', true)
            ->orderByDesc('updated_at')->take(4)->get();
        $leadCollection = Lead::select(['id', 'name', 'status', 'source', 'created_at'])->get();
        $recentLeads = $leadCollection->sortByDesc('created_at')->take(6)->values();

        return Inertia::render('admin/Dashboard', [
            'stats' => [
                'totalProperties' => Property::count(),
                'availableProperties' => $availablePropertyCount,
                'soldProperties' => $soldPropertyCount,
                'activeLeads' => Lead::whereNotIn('status', ['Converted', 'Lost'])->count(),
                'newLeads' => (clone $newLeads)->count(),
                'siteVisits' => SiteVisit::whereNotIn('status', ['Cancelled'])->count(),
                'activeDeals' => Deal::whereNotIn('stage', ['Closed Won', 'Closed Lost'])->count(),
                'revenue' => $revenueWon,
                'pendingPayments' => $pendingPayments,
                'received' => $received,
            ],
            'recentLeads' => $recentLeads,
            'upcomingVisits' => SiteVisit::whereIn('status', ['Scheduled', 'Confirmed'])->orderBy('visit_date')->take(5)->get(),
            'recentBookings' => Booking::latest()->take(5)->get(),
            'recentPayments' => Payment::latest()->take(5)->get(),
            'topAgents' => $this->topAgents(),
            'followUpsDue' => $this->followUpsDue(),
            'recentActivity' => $this->recentActivity(),
            'featuredProperties' => $featuredProperties,
            'chartData' => [
                'revenueByMonth' => $this->revenueByMonth(),
                'leadSources' => $this->leadSources(clone $leadCollection),
                'pipelineFunnel' => $this->pipelineFunnel(),
                'agentPerformance' => $this->agentPerformance(),
                'monthlyBookings' => $this->monthlyBookings(),
            ],
            'range' => $range,
            'ranges' => ['today' => 'Today', 'week' => 'This Week', 'month' => 'This Month', 'year' => 'This Year', 'all' => 'All Time'],
        ]);
    }

    protected function topAgents(): array
    {
        $agents = User::whereIn('role', ['Sales Executive', 'Senior Agent'])
            ->get(['id', 'name'])
            ->keyBy('id');

        $stats = Deal::where('stage', 'Closed Won')
            ->whereNotNull('assigned_agent_id')
            ->get(['assigned_agent_id', 'deal_value'])
            ->groupBy('assigned_agent_id')
            ->map(fn ($deals) => [
                'count' => $deals->count(),
                'revenue' => $deals->sum('deal_value'),
            ]);

        $result = [];

        foreach ($agents as $id => $u) {
            $s = $stats->get($id);
            if ($s) {
                $result[] = [
                    'name' => $u->name,
                    'initials' => $u->initials,
                    'role' => $u->role,
                    'deals' => $s['count'],
                    'revenue' => $s['revenue'],
                ];
            }
        }

        usort($result, fn ($a, $b) => $b['deals'] <=> $a['deals']);

        return array_slice($result, 0, 4);
    }

    protected function followUpsDue(): array
    {
        $today = now()->format('Y-m-d');

        return Task::where('status', '!=', 'Completed')
            ->where(fn ($q) => $q->where('due_date', '<=', $today)->orWhere('due_date', null))
            ->with('assignedTo')
            ->latest()
            ->take(6)
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'title' => $t->title,
                'type' => $t->type,
                'status' => $t->status,
                'priority' => $t->priority,
                'due_date' => $t->due_date,
                'assignee' => $t->assignedTo?->name,
            ])->all();
    }

    protected function recentActivity(): array
    {
        return \App\Models\LeadActivity::with('user')
            ->latest()
            ->take(8)
            ->get()
            ->map(fn ($a) => [
                'id' => $a->id,
                'type' => $a->type,
                'title' => $a->title,
                'description' => $a->description,
                'user' => $a->user?->name,
                'created_at' => $a->created_at?->diffForHumans(),
            ])->all();
    }

    protected function revenueByMonth(): array
    {
        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        $yearStart = now()->startOfYear();

        $revenueByMonth = Deal::where('stage', 'Closed Won')
            ->where('created_at', '>=', $yearStart)
            ->get(['created_at', 'deal_value'])
            ->groupBy(fn ($d) => (int) $d->created_at->format('n') - 1)
            ->map(fn ($g) => $g->sum('deal_value'));

        $leadsByMonth = Lead::where('created_at', '>=', $yearStart)
            ->get('created_at')
            ->groupBy(fn ($l) => (int) $l->created_at->format('n') - 1)
            ->map->count();

        $data = [];
        foreach ($months as $i => $label) {
            $data[] = [
                'month' => $label,
                'revenue' => ($revenueByMonth->get($i, 0) / 10000000),
                'leads' => $leadsByMonth->get($i, 0),
            ];
        }

        return $data;
    }

    protected function leadSources($leads): array
    {
        return $leads->groupBy('source')
            ->map(fn ($g) => ['name' => $g->first()->source, 'value' => $g->count()])
            ->values()
            ->all();
    }

    protected function pipelineFunnel(): array
    {
        $stages = ['New Lead', 'Contacted', 'Qualified', 'Property Shortlisted', 'Site Visit Scheduled', 'Site Visit Completed', 'Negotiation', 'Booking', 'Agreement', 'Payment', 'Closed Won', 'Closed Lost'];

        $counts = Deal::whereIn('stage', $stages)
            ->get('stage')
            ->groupBy('stage')
            ->map->count();

        return collect($stages)->map(fn ($s) => [
            'stage' => $s,
            'count' => $counts->get($s, 0),
        ])->all();
    }

    protected function agentPerformance(): array
    {
        $agents = User::whereIn('role', ['Sales Executive', 'Senior Agent'])
            ->get(['id', 'name'])
            ->keyBy('id');

        $revenueByAgent = Deal::where('stage', 'Closed Won')
            ->whereNotNull('assigned_agent_id')
            ->get(['assigned_agent_id', 'deal_value'])
            ->groupBy('assigned_agent_id')
            ->map->sum('deal_value');

        return $agents->map(function ($u) use ($revenueByAgent) {
            return [
                'name' => collect(explode(' ', $u->name))->first(),
                'revenue' => ($revenueByAgent->get($u->id, 0) / 10000000),
            ];
        })
            ->reject(fn ($a) => $a['revenue'] == 0)
            ->values()
            ->all();
    }

    protected function monthlyBookings(): array
    {
        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        $yearStart = now()->startOfYear()->format('Y-m-d');

        $counts = Booking::where('booking_date', '>=', $yearStart)
            ->get('booking_date')
            ->groupBy(fn ($b) => (int) substr($b->booking_date, 5, 2) - 1)
            ->map->count();

        $data = [];
        foreach ($months as $i => $label) {
            $data[] = [
                'month' => $label,
                'bookings' => $counts->get($i, 0),
            ];
        }

        return $data;
    }
}
