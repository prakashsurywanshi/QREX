<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Deal;
use App\Models\Lead;
use App\Models\Payment;
use App\Models\Property;
use App\Models\SiteVisit;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicPageController extends Controller
{
    public function home()
    {
        $featuredProperties = Property::where('featured', true)
            ->where('is_website_visible', true)
            ->get();

        $latestProperties = Property::where('is_website_visible', true)
            ->latest()
            ->take(6)
            ->get();

        $agents = User::whereIn('role', ['Sales Executive', 'Senior Agent'])
            ->take(4)
            ->get()
            ->map(fn ($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'role' => $u->role,
                'branch' => $u->branch,
                'initials' => $u->initials,
            ]);

        $categoryCounts = Property::where('is_website_visible', true)
            ->selectRaw('type, count(*) as total')
            ->groupBy('type')
            ->pluck('total', 'type');

        $earliestAt = min(
            (int) Customer::min('created_at') ?: PHP_INT_MAX,
            (int) Lead::min('created_at') ?: PHP_INT_MAX,
            (int) Property::min('created_at') ?: PHP_INT_MAX,
        );
        $years = $earliestAt !== PHP_INT_MAX ? max(1, (int) now()->diffInYears(\Carbon\Carbon::createFromTimestamp($earliestAt))) : 1;

        $revenueTotal = (float) Deal::sum('deal_value');
        if ($revenueTotal >= 10000000) {
            $revenue = '₹'.number_format($revenueTotal / 10000000, 1).' Cr';
        } elseif ($revenueTotal >= 100000) {
            $revenue = '₹'.number_format($revenueTotal / 100000, 1).' L';
        } else {
            $revenue = '₹'.number_format($revenueTotal);
        }

        $customerCount = Customer::count();

        return Inertia::render('public/Home', [
            'featuredProperties' => $featuredProperties,
            'latestProperties' => $latestProperties,
            'agents' => $agents,
            'categoryCounts' => $categoryCounts,
            'stats' => [
                'properties' => Property::count(),
                'deals' => Deal::count(),
                'customers' => $customerCount,
                'clients' => $customerCount,
                'years' => $years,
                'revenue' => $revenue,
            ],
        ]);
    }

    public function properties(Request $request)
    {
        $query = Property::where('is_website_visible', true);

        if ($request->filled('search')) {
            $query->where(fn ($q) => $q
                ->where('title', 'like', '%'.$request->search.'%')
                ->orWhere('city', 'like', '%'.$request->search.'%')
                ->orWhere('type', 'like', '%'.$request->search.'%'));
        }

        if ($request->filled('type') && $request->type !== 'All') {
            $query->where('type', $request->type);
        }

        if ($request->filled('status') && $request->status !== 'All') {
            $query->where('status', $request->status);
        }

        if ($request->filled('bedrooms') && $request->bedrooms > 0) {
            $query->where('bedrooms', $request->bedrooms);
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        $sort = $request->filled('sort') ? $request->sort : 'newest';
        match ($sort) {
            'price_asc' => $query->orderBy('price', 'asc'),
            'price_desc' => $query->orderBy('price', 'desc'),
            'featured' => $query->orderByDesc('featured'),
            default => $query->latest(),
        };

        $perPage = 6;
        $properties = $query->paginate($perPage)->withQueryString();

        return Inertia::render('public/Properties', [
            'properties' => $properties,
            'filters' => $request->only(['search', 'type', 'status', 'bedrooms', 'min_price', 'max_price', 'sort']),
            'types' => ['All', 'Apartment', 'Villa', 'Plot', 'Commercial', 'Office', 'Shop', 'Warehouse', 'Farm/Land'],
        ]);
    }

    public function propertyDetail(Property $property)
    {
        $property->load('agent', 'images');

        if (!$property->is_website_visible) {
            abort(404);
        }

        $similar = Property::where('is_website_visible', true)
            ->where('type', $property->type)
            ->where('id', '!=', $property->id)
            ->take(3)
            ->get();

        if ($similar->isEmpty()) {
            $similar = Property::where('is_website_visible', true)
                ->where('id', '!=', $property->id)
                ->take(3)
                ->get();
        }

        return Inertia::render('public/PropertyDetail', [
            'property' => $property,
            'similar' => $similar,
            'agent' => $property->agent ? [
                'name' => $property->agent->name,
                'phone' => $property->agent->phone,
                'email' => $property->agent->email,
                'role' => $property->agent->role,
                'initials' => $property->agent->initials,
            ] : null,
        ]);
    }

    public function about()
    {
        $agents = User::whereIn('role', ['Sales Executive', 'Senior Agent'])
            ->get()
            ->map(fn ($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'role' => $u->role,
                'branch' => $u->branch,
                'initials' => $u->initials,
            ]);

        return Inertia::render('public/About', [
            'agents' => $agents,
            'stats' => [
                'properties' => Property::count(),
                'deals' => Deal::count(),
                'customers' => Customer::count(),
                'clients' => 1200,
                'years' => 12,
                'revenue' => '₹100 Cr+',
            ],
        ]);
    }

    public function contact()
    {
        return Inertia::render('public/Contact');
    }
}
