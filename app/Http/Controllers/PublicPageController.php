<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Deal;
use App\Models\Lead;
use App\Models\Property;
use App\Models\User;
use App\Services\PropertyTypeCatalog;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PublicPageController extends Controller
{
    public function home()
    {
        $featuredProperties = Property::with('images')->where('featured', true)
            ->where('is_website_visible', true)
            ->get();

        $latestProperties = Property::with('images')->where('is_website_visible', true)
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
        $years = $earliestAt !== PHP_INT_MAX ? max(1, (int) now()->diffInYears(Carbon::createFromTimestamp($earliestAt))) : 1;

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

    public function properties(Request $request, PropertyTypeCatalog $catalog)
    {
        $query = Property::with('images')->where('is_website_visible', true);

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
            'types' => $catalog->namesWithAll(),
        ]);
    }

    public function propertyDetail(Property $property, PropertyTypeCatalog $catalog)
    {
        $property->load('agent', 'images');

        if (! $property->is_website_visible) {
            abort(404);
        }

        $similar = Property::with('images')->where('is_website_visible', true)
            ->where('type', $property->type)
            ->where('id', '!=', $property->id)
            ->take(3)
            ->get();

        if ($similar->isEmpty()) {
            $similar = Property::with('images')->where('is_website_visible', true)
                ->where('id', '!=', $property->id)
                ->take(3)
                ->get();
        }

        return Inertia::render('public/PropertyDetail', [
            'property' => $property,
            'similar' => $similar,
            'spec' => $catalog->specRules($property->type),
            'agent' => $property->agent ? [
                'name' => $property->agent->name,
                'phone' => $property->agent->phone,
                'email' => $property->agent->email,
                'role' => $property->agent->role,
                'initials' => $property->agent->initials,
            ] : null,
        ])->withViewData(['seo' => $this->propertySeo($property)]);
    }

    /**
     * Server-rendered share preview data (Open Graph / Twitter) for the
     * property detail page — social crawlers never execute the Inertia app.
     */
    private function propertySeo(Property $property): array
    {
        $forLabel = match ($property->transaction_type) {
            'Rent' => 'for Rent',
            'Lease' => 'for Lease',
            default => 'for Sale',
        };

        $title = $property->seo_title
            ?: trim("{$property->title} — {$property->transaction_type} {$property->type}"
                .($property->city ? " in {$property->city}" : ''));

        $headline = $property->bedrooms > 0
            ? "{$property->bedrooms} BHK {$property->type} {$forLabel}"
            : "{$property->type} {$forLabel}";

        $details = array_values(array_filter([
            $property->area > 0 ? "{$property->area} sq.ft" : null,
            $property->bathrooms > 0 ? "{$property->bathrooms} Baths" : null,
            $property->price_label ?: null,
        ]));

        $description = $property->meta_description
            ?: trim($headline.($property->city ? " in {$property->city}" : '')
                .($details !== [] ? ' — '.implode(' · ', $details) : ''));

        $image = $this->shareableImage($property);

        return [
            'title' => $title,
            'description' => $description,
            'image' => $image,
            'url' => url('/properties/'.$property->public_id),
            'property_type' => $property->type,
            'transaction_type' => $property->transaction_type,
        ];
    }

    /**
     * Resolve an absolute, crawler-fetchable image URL for the share preview.
     * Falls back to the property's external image, then a bundled placeholder,
     * so og:image is never a broken or missing file.
     */
    private function shareableImage(Property $property): string
    {
        $candidate = $property->coverOrImage();

        if ($candidate) {
            if (preg_match('#/storage/(.+)$#', $candidate, $matches)) {
                if (Storage::disk('public')->exists($matches[1])) {
                    return $candidate;
                }
            } elseif (preg_match('#^https?://#i', $candidate)) {
                return $candidate;
            }
        }

        $fallback = $property->getRawOriginal('image');
        if ($fallback && preg_match('#^https?://#i', $fallback)
            && ! preg_match('#/storage/#', $fallback)) {
            return $fallback;
        }

        return asset('share-placeholder.png');
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
