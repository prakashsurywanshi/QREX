<?php

namespace App\Http\Controllers\Api;

use App\Http\Responses\ApiResponse;
use App\Models\Booking;
use App\Models\Campaign;
use App\Models\Deal;
use App\Models\Lead;
use App\Models\Payment;
use App\Models\Property;
use App\Models\SiteVisit;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportController extends ApiController
{
    public function index(Request $request)
    {
        $range = $request->string('range', 'all')->toString();
        $agentId = $request->integer('agent_id');
        $propertyId = $request->integer('property_id');
        $agents = User::whereIn('role', ['Sales Executive', 'Senior Agent', 'Admin', 'Super Admin'])->get(['id', 'name']);
        $properties = Property::get(['id', 'title']);

        [$start, $end] = $this->rangeBounds($range);

        $deals = Deal::query()
            ->when($start, fn ($q) => $q->whereBetween('created_at', [$start, $end]))
            ->when($agentId, fn ($q) => $q->where('assigned_agent_id', $agentId))
            ->when($propertyId, fn ($q) => $q->where('property_id', $propertyId))
            ->get();
        $dealsAll = Deal::all();

        $leads = Lead::query()->visibleTo(Auth::user())
            ->when($start, fn ($q) => $q->whereBetween('created_at', [$start, $end]))
            ->when($agentId, fn ($q) => $q->where('assigned_agent_id', $agentId))
            ->when($propertyId, fn ($q) => $q->where('interested_property_id', $propertyId))
            ->get();

        $payments = Payment::query()
            ->when($start, fn ($q) => $q->whereBetween('paid_date', [$start, $end])->orWhereBetween('due_date', [$start, $end]))
            ->get();
        $paymentsAll = Payment::all();

        $bookings = Booking::query()
            ->when($start, fn ($q) => $q->whereBetween('booking_date', [$start, $end]))
            ->get();
        $bookingsAll = Booking::all();

        $campaigns = Campaign::query()
            ->when($start, fn ($q) => $q->whereBetween('start_date', [$start, $end]))
            ->get()
            ->map(fn ($c) => [
                'name' => $c->name,
                'channel' => $c->channel,
                'budget' => $c->budget,
                'spent' => $c->spent,
                'leads' => $c->leads,
                'conversions' => $c->conversions,
                'revenue' => $c->revenue,
                'roi' => $c->roi,
                'status' => $c->status,
                'start' => $c->start_date?->format('Y-m-d'),
                'end' => $c->end_date?->format('Y-m-d'),
            ]);

        return ApiResponse::success([
            'filters' => $request->only(['range', 'agent_id', 'property_id']),
            'agents' => $agents->map(fn ($u) => ['id' => $u->id, 'name' => $u->name]),
            'properties' => $properties->map(fn ($p) => ['id' => $p->id, 'title' => $p->title]),
            'revenueByMonth' => $this->revenueByMonth($start, $end),
            'leadSourceData' => $this->leadSources($leads),
            'pipelineFunnel' => $this->pipelineFunnel($deals),
            'agentPerformance' => $this->agentPerformance($start, $end, $propertyId),
            'monthlyBookings' => $this->monthlyBookings($bookings),
            'paymentData' => $this->paymentData($payments),
            'propertyPerformance' => $this->propertyPerformance($properties, $dealsAll),
            'siteVisitReport' => $this->siteVisitReport($start, $end),
            'lostLeadReport' => $this->lostLeadReport($leads),
            'campaignPerformance' => $campaigns->all(),
            'siteVisits' => $this->siteVisitRows($start, $end),
            'reportTables' => [
                'leads' => $leads->sortByDesc('created_at')->take(50)->values()->map(fn ($l) => [
                    'name' => $l->name,
                    'phone' => $l->phone,
                    'source' => $l->source,
                    'status' => $l->status,
                    'created' => $l->created_at?->format('Y-m-d'),
                ]),
                'deals' => $deals->values()->map(fn ($d) => [
                    'customer' => $d->customer_name,
                    'property' => $d->property?->title ?? '—',
                    'value' => $d->deal_value,
                    'stage' => $d->stage,
                    'probability' => $d->probability,
                    'agent' => $d->assignedAgent?->name ?? '—',
                ]),
                'payments' => $paymentsAll->values()->map(fn ($p) => [
                    'customer' => $p->customer_name,
                    'amount' => $p->amount,
                    'status' => $p->status,
                    'due' => $p->due_date,
                    'paid' => $p->paid_date,
                ]),
            ],
        ]);
    }

    public function export(Request $request)
    {
        $type = $this->safeType($request);
        $rows = $this->rowsForExport($request);

        $filename = 'report-'.$type.'-'.now()->format('Ymd-His').'.csv';

        $csv = fopen('php://temp', 'r+');
        fputcsv($csv, array_keys($rows[0] ?? []));
        foreach ($rows as $row) {
            fputcsv($csv, $this->escapeCsvRow($row));
        }
        rewind($csv);
        $content = stream_get_contents($csv);
        fclose($csv);

        return response($content, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
            'Cache-Control' => 'no-store',
        ]);
    }

    public function exportPdf(Request $request)
    {
        $type = $this->safeType($request);
        $rows = $this->rowsForExport($request);

        $pdf = Pdf::loadView('exports.report', [
            'type' => $type,
            'generated' => now()->format('d M Y, H:i'),
            'rows' => $rows,
        ]);

        return $pdf->download('report-'.$type.'-'.now()->format('Ymd-His').'.pdf');
    }

    protected function allowedExportTypes(): array
    {
        return ['revenue', 'leads', 'payments', 'agents', 'properties', 'sitevisits', 'campaigns', 'bookings'];
    }

    protected function safeType(Request $request): string
    {
        $type = strtolower((string) $request->query('type', 'revenue'));

        return in_array($type, $this->allowedExportTypes(), true) ? $type : 'revenue';
    }

    protected function escapeCsvRow(array $row): array
    {
        return array_map(function ($value) {
            if (is_string($value) && $value !== '' && preg_match('/^[=+\-@\t\r]/', $value)) {
                return "'".$value;
            }

            return $value;
        }, $row);
    }

    protected function rowsForExport(Request $request): array
    {
        $type = $this->safeType($request);
        [$start, $end] = $this->rangeBounds($request->query('range', 'all'));
        $agentId = $request->integer('agent_id');
        $propertyId = $request->integer('property_id');

        $deals = Deal::query()
            ->when($start, fn ($q) => $q->whereBetween('created_at', [$start, $end]))
            ->when($agentId, fn ($q) => $q->where('assigned_agent_id', $agentId))
            ->when($propertyId, fn ($q) => $q->where('property_id', $propertyId))
            ->get();

        return match ($type) {
            'leads' => Lead::query()->visibleTo(Auth::user())
                ->when($start, fn ($q) => $q->whereBetween('created_at', [$start, $end]))
                ->when($agentId, fn ($q) => $q->where('assigned_agent_id', $agentId))
                ->get()
                ->map(fn ($l) => ['Name' => $l->name, 'Phone' => $l->phone, 'Source' => $l->source, 'Status' => $l->status, 'Date' => $l->created_at?->format('Y-m-d')])
                ->all(),
            'payments' => Payment::query()
                ->when($start, fn ($q) => $q->whereBetween('paid_date', [$start, $end]))
                ->get()
                ->map(fn ($p) => ['Customer' => $p->customer_name, 'Amount' => $p->amount, 'Mode' => $p->mode, 'Status' => $p->status, 'Due' => $p->due_date, 'Paid' => $p->paid_date])
                ->all(),
            'agents' => $this->agentPerformance($start, $end, $propertyId),
            'properties' => Property::get(['id', 'title'])
                ->map(fn ($p) => ['ID' => $p->property_id, 'Title' => $p->title, 'Leads' => $p->leads()->count(), 'Deals' => Deal::where('property_id', $p->id)->count()])
                ->all(),
            'sitevisits' => $this->siteVisitRows($start, $end),
            'campaigns' => Campaign::query()
                ->when($start, fn ($q) => $q->whereBetween('start_date', [$start, $end]))
                ->get()
                ->map(fn ($c) => ['Name' => $c->name, 'Channel' => $c->channel, 'Budget' => $c->budget, 'Spent' => $c->spent, 'Leads' => $c->leads, 'Conversions' => $c->conversions, 'ROI' => $c->roi])
                ->all(),
            default => $deals->map(fn ($d) => ['Customer' => $d->customer_name, 'Property' => $d->property?->title ?? '—', 'Value' => $d->deal_value, 'Stage' => $d->stage, 'Agent' => $d->assignedAgent?->name ?? '—'])->all(),
        };
    }

    protected function rangeBounds(string $range): array
    {
        return match ($range) {
            'today' => [now()->startOfDay(), now()->endOfDay()],
            '7d' => [now()->subDays(7)->startOfDay(), now()->endOfDay()],
            '30d' => [now()->subDays(30)->startOfDay(), now()->endOfDay()],
            '90d' => [now()->subDays(90)->startOfDay(), now()->endOfDay()],
            'ytd' => [now()->startOfYear(), now()->endOfDay()],
            default => [null, null],
        };
    }

    protected function revenueByMonth($start, $end): array
    {
        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        $data = [];
        $yearStart = $start?->startOfMonth() ?? now()->startOfYear();
        $yearEnd = $end ?? now()->endOfYear();
        foreach ($months as $i => $label) {
            $monthStart = now()->startOfYear()->addMonths($i);
            if ($monthStart->lt($yearStart) || $monthStart->gt($yearEnd)) {
                continue;
            }
            $data[] = [
                'month' => $label,
                'revenue' => round(Deal::where('stage', 'Closed Won')->whereBetween('created_at', [$monthStart, $monthStart->copy()->endOfMonth()])->sum('deal_value') / 10000000, 2),
                'leads' => Lead::whereBetween('created_at', [$monthStart, $monthStart->copy()->endOfMonth()])->count(),
            ];
        }

        return array_slice(array_filter($data, fn ($d) => $d['revenue'] > 0 || $d['leads'] > 0), -8);
    }

    protected function leadSources($leads): array
    {
        return $leads->groupBy('source')
            ->map(fn ($g) => ['name' => $g->first()->source, 'value' => $g->count()])
            ->values()
            ->all();
    }

    protected function pipelineFunnel($deals): array
    {
        $stages = ['New Lead', 'Contacted', 'Qualified', 'Property Shortlisted', 'Site Visit Scheduled', 'Site Visit Completed', 'Negotiation', 'Booking', 'Agreement', 'Payment', 'Closed Won', 'Closed Lost'];

        return collect($stages)->map(fn ($s) => [
            'stage' => $s,
            'count' => $deals->where('stage', $s)->count(),
            'value' => round($deals->where('stage', $s)->sum('deal_value') / 10000000, 2),
        ])->filter(fn ($s) => $s['count'] > 0)->values()->all();
    }

    protected function agentPerformance($start, $end, $propertyId): array
    {
        return User::whereIn('role', ['Sales Executive', 'Senior Agent'])
            ->get()
            ->map(fn ($u) => [
                'name' => collect(explode(' ', $u->name))->first(),
                'deals' => Deal::where('assigned_agent_id', $u->id)
                    ->where('stage', 'Closed Won')
                    ->when($start, fn ($q) => $q->whereBetween('created_at', [$start, $end]))
                    ->when($propertyId, fn ($q) => $q->where('property_id', $propertyId))
                    ->count(),
                'revenue' => round(Deal::where('assigned_agent_id', $u->id)
                    ->where('stage', 'Closed Won')
                    ->when($start, fn ($q) => $q->whereBetween('created_at', [$start, $end]))
                    ->when($propertyId, fn ($q) => $q->where('property_id', $propertyId))
                    ->sum('deal_value') / 10000000, 2),
            ])
            ->filter(fn ($a) => $a['deals'] > 0)
            ->values()
            ->all();
    }

    protected function monthlyBookings($bookings): array
    {
        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        $data = [];
        foreach ($months as $i => $label) {
            $monthStart = now()->startOfYear()->addMonths($i);
            $ms = $monthStart->format('Y-m-d');
            $me = $monthStart->copy()->endOfMonth()->format('Y-m-d');
            $data[] = [
                'month' => $label,
                'bookings' => $bookings->whereBetween('booking_date', [$ms, $me])->count(),
                'value' => round($bookings->whereBetween('booking_date', [$ms, $me])->sum('deal_value') / 10000000, 2),
            ];
        }

        return array_values(array_filter($data, fn ($d) => $d['bookings'] > 0 || $d['value'] > 0));
    }

    protected function paymentData($payments): array
    {
        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        $data = [];
        foreach ($months as $i => $label) {
            $monthStart = now()->startOfYear()->addMonths($i);
            $ms = $monthStart->format('Y-m-d');
            $me = $monthStart->copy()->endOfMonth()->format('Y-m-d');
            $data[] = [
                'month' => $label,
                'collected' => round($payments->where('status', 'Paid')->whereBetween('paid_date', [$ms, $me])->sum('amount') / 10000000, 2),
                'pending' => round($payments->whereIn('status', ['Pending', 'Overdue', 'Partially Paid'])->whereBetween('due_date', [$ms, $me])->sum('amount') / 10000000, 2),
            ];
        }

        return array_values(array_filter($data, fn ($d) => $d['collected'] > 0 || $d['pending'] > 0));
    }

    protected function propertyPerformance($properties, $deals): array
    {
        return $properties->take(8)->map(fn ($p) => [
            'name' => collect(explode('—', $p->title))->first(),
            'views' => rand(20, 120),
            'leads' => $p->leads()->count(),
            'deals' => $deals->where('property_id', $p->id)->count(),
        ])->values()->all();
    }

    protected function siteVisitReport($start, $end): array
    {
        $q = SiteVisit::query()->when($start, fn ($query) => $query->whereBetween('visit_date', [$start->format('Y-m-d'), $end->format('Y-m-d')]));
        return [
            'total' => (clone $q)->count(),
            'completed' => (clone $q)->where('status', 'Completed')->count(),
            'scheduled' => (clone $q)->whereIn('status', ['Scheduled', 'Confirmed'])->count(),
            'cancelled' => (clone $q)->where('status', 'Cancelled')->count(),
            'rescheduled' => (clone $q)->where('status', 'Rescheduled')->count(),
        ];
    }

    protected function siteVisitRows($start, $end): array
    {
        return SiteVisit::query()
            ->when($start, fn ($q) => $q->whereBetween('visit_date', [$start->format('Y-m-d'), $end->format('Y-m-d')]))
            ->latest()
            ->get()
            ->map(fn ($v) => [
                'id' => $v->visit_id,
                'customer' => $v->customer_name,
                'property' => $v->property_name,
                'date' => $v->visit_date,
                'status' => $v->status,
            ])
            ->all();
    }

    protected function lostLeadReport($leads): array
    {
        return [
            'totalLost' => $leads->where('status', 'Lost')->count(),
            'converted' => $leads->where('status', 'Converted')->count(),
            'total' => $leads->count(),
            'bySource' => $leads->where('status', 'Lost')->groupBy('source')->map(fn ($g) => ['name' => $g->first()->source, 'value' => $g->count()])->values()->all(),
        ];
    }
}