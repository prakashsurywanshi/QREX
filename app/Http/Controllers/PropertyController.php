<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PropertyController extends Controller
{
    public function index(Request $request)
    {
        $query = Property::query()->with('agent');

        if ($request->filled('search')) {
            $query->where(fn ($q) => $q
                ->where('title', 'like', '%'.$request->search.'%')
                ->orWhere('city', 'like', '%'.$request->search.'%')
                ->orWhere('property_id', 'like', '%'.$request->search.'%'));
        }

        if ($request->filled('status') && $request->status !== 'All') {
            $query->where('status', $request->status);
        }

        if ($request->filled('type') && $request->type !== 'All') {
            $query->where('type', $request->type);
        }

        if ($request->filled('featured') && $request->featured !== 'All') {
            $query->where('featured', $request->featured === 'Featured');
        }

        $perPage = 8;
        $properties = $query->latest()->paginate($perPage)->withQueryString();

        return Inertia::render('admin/Properties', [
            'properties' => $properties,
            'filters' => $request->only(['search', 'status', 'type', 'featured']),
            'types' => ['All', 'Apartment', 'Villa', 'Plot', 'Commercial', 'Office', 'Shop', 'Warehouse', 'Farm/Land', 'Other'],
            'statuses' => ['All', 'Available', 'Reserved', 'Under Negotiation', 'Sold', 'Draft', 'Rented', 'Inactive'],
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/PropertyForm', [
            'property' => null,
            'agents' => User::whereIn('role', ['Sales Executive', 'Senior Agent'])->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateProperty($request);
        $data['property_id'] = $this->nextId('PROP');
        $data['price_label'] = $this->label($data['price'] ?? 0);
        $data['slug'] = Str::slug($data['title']);
        if ($request->hasFile('image')) {
            $request->validate(['image' => 'required|image|mimes:jpg,jpeg,png,webp,gif|max:5120']);
            $data['image'] = $this->storeImage($request->file('image'));
        } elseif ($request->filled('image')) {
            $request->validate(['image' => 'nullable|string']);
            $data['image'] = $request->input('image');
        }

        Property::create($data);

        return redirect()->route('admin.properties.index')->with('success', 'Property created successfully.');
    }

    public function show(Property $property)
    {
        $property->load('agent');

        $relatedLeads = $property->leads()->with('assignedAgent')->get();

        return Inertia::render('admin/PropertyDetail', [
            'property' => $property,
            'leads' => $relatedLeads,
        ]);
    }

    public function edit(Property $property)
    {
        return Inertia::render('admin/PropertyForm', [
            'property' => $property,
            'agents' => User::whereIn('role', ['Sales Executive', 'Senior Agent'])->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Property $property)
    {
        $data = $this->validateProperty($request);
        $data['price_label'] = $this->label($data['price'] ?? 0);
        if ($request->hasFile('image')) {
            $request->validate(['image' => 'required|image|mimes:jpg,jpeg,png,webp,gif|max:5120']);
            $data['image'] = $this->storeImage($request->file('image'));
        } elseif ($request->filled('image')) {
            $request->validate(['image' => 'nullable|string']);
            $data['image'] = $request->input('image');
        } else {
            unset($data['image']);
        }

        $property->update($data);

        return redirect()->route('admin.properties.show', $property)->with('success', 'Property updated successfully.');
    }

    public function destroy(Property $property)
    {
        $property->delete();

        return redirect()->route('admin.properties.index')->with('success', 'Property deleted.');
    }

    private function validateProperty(Request $request): array
    {
        $data = $request->validate([
            'title' => 'required|string',
            'type' => 'required|string',
            'transaction_type' => 'required|string',
            'description' => 'nullable|string',
            'status' => 'required|string',
            'price' => 'required|numeric',
            'area' => 'required|numeric',
            'bedrooms' => 'nullable|integer',
            'bathrooms' => 'nullable|integer',
            'floors' => 'nullable|integer',
            'parking' => 'nullable|integer',
            'furnishing' => 'nullable|string',
            'possession_date' => 'nullable|string',
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'state' => 'nullable|string',
            'country' => 'nullable|string',
            'pincode' => 'nullable|string',
            'amenities' => 'nullable|array',
            'featured' => 'nullable|boolean',
            'is_website_visible' => 'nullable|boolean',
            'seo_title' => 'nullable|string',
            'meta_description' => 'nullable|string',
            'agent_id' => 'nullable|integer',
        ]);

        $data['bedrooms'] = (int) ($data['bedrooms'] ?? 0);
        $data['bathrooms'] = (int) ($data['bathrooms'] ?? 0);
        $data['floors'] = (int) ($data['floors'] ?? 1);
        $data['parking'] = (int) ($data['parking'] ?? 0);

        return $data;
    }

    private function storeImage($file): string
    {
        $path = $file->store('properties', 'public');
        return Storage::disk('public')->url($path);
    }

    private function label($amount): string
    {
        if ($amount >= 10000000) {
            return '₹'.round($amount / 10000000, 2).' Cr';
        }
        return '₹'.round($amount / 100000).' L';
    }
}
