<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ValidatesPropertyPayload;
use App\Models\Property;
use App\Models\PropertyImage;
use App\Models\User;
use App\Services\PropertyTypeCatalog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PropertyController extends Controller
{
    use ValidatesPropertyPayload;

    public function index(Request $request, PropertyTypeCatalog $catalog)
    {
        $query = Property::query()->with(['agent', 'images']);

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
            'types' => $catalog->namesWithAll(),
            'statuses' => ['All', 'Available', 'Reserved', 'Under Negotiation', 'Sold', 'Draft', 'Rented', 'Inactive'],
        ]);
    }

    public function create(PropertyTypeCatalog $catalog)
    {
        return Inertia::render('admin/PropertyForm', [
            'property' => null,
            'agents' => User::whereIn('role', ['Sales Executive', 'Senior Agent'])->get(['id', 'name']),
            'typeCatalog' => $catalog->all(),
        ]);
    }

    public function store(Request $request, PropertyTypeCatalog $catalog)
    {
        $data = $this->validateProperty($request, $catalog);
        $data['property_id'] = $this->nextId('PROP');
        $data['price_label'] = $this->label($data['price'] ?? 0);
        $data['slug'] = Str::slug($data['title']);

        $property = Property::create($data);

        $this->persistGallery(
            $property,
            $request->file('new_images') ?? [],
            $request->filled('cover_new_index') ? (int) $request->input('cover_new_index') : null,
            null,
        );

        return redirect()->route('admin.properties.index')->with('success', 'Property created successfully.');
    }

    public function show(Property $property, PropertyTypeCatalog $catalog)
    {
        $property->load(['agent', 'images']);

        $relatedLeads = $property->leads()->visibleTo(Auth::user())->with('assignedAgent')->get();

        return Inertia::render('admin/PropertyDetail', [
            'property' => $property,
            'leads' => $relatedLeads,
            'spec' => $catalog->specRules($property->type),
            'typeAmenities' => $catalog->amenitiesFor($property->type),
        ]);
    }

    public function edit(Property $property, PropertyTypeCatalog $catalog)
    {
        $property->load('images');

        return Inertia::render('admin/PropertyForm', [
            'property' => $property,
            'agents' => User::whereIn('role', ['Sales Executive', 'Senior Agent'])->get(['id', 'name']),
            'typeCatalog' => $catalog->all(),
        ]);
    }

    public function update(Request $request, Property $property, PropertyTypeCatalog $catalog)
    {
        $data = $this->validateProperty($request, $catalog);
        $data['price_label'] = $this->label($data['price'] ?? 0);

        $property->update($data);

        foreach ((array) $request->input('remove_image_ids', []) as $id) {
            $image = PropertyImage::where('property_id', $property->id)->find($id);
            if ($image) {
                Storage::disk('public')->delete($image->path);
                $image->delete();
            }
        }

        $this->persistGallery(
            $property,
            $request->file('new_images') ?? [],
            $request->filled('cover_new_index') ? (int) $request->input('cover_new_index') : null,
            $request->filled('cover_image_id') ? (int) $request->input('cover_image_id') : null,
        );

        return redirect()->route('admin.properties.show', $property)->with('success', 'Property updated successfully.');
    }

    public function destroy(Property $property)
    {
        if ($property->image) {
            Storage::disk('public')->delete($property->image);
        }
        foreach ($property->images as $image) {
            Storage::disk('public')->delete($image->path);
            $image->delete();
        }

        $property->delete();

        return redirect()->route('admin.properties.index')->with('success', 'Property deleted.');
    }

    private function persistGallery(Property $property, array $files, ?int $coverNewIndex = null, ?int $coverImageId = null): void
    {
        $existingCount = $property->images()->count();
        $files = array_slice($files, 0, max(0, 15 - $existingCount));

        $created = [];
        foreach ($files as $index => $file) {
            $path = $file->store('properties', 'public');
            $created[] = PropertyImage::create([
                'property_id' => $property->id,
                'path' => Storage::disk('public')->url($path),
                'type' => 'image',
                'is_cover' => false,
                'sort_order' => $existingCount + $index,
            ]);
        }

        $images = $property->images();

        if ($coverNewIndex !== null && isset($created[$coverNewIndex])) {
            $images->update(['is_cover' => false]);
            $created[$coverNewIndex]->update(['is_cover' => true]);
        } elseif ($coverImageId) {
            $images->update(['is_cover' => false]);
            $images->whereKey($coverImageId)->update(['is_cover' => true]);
        }

        if ($property->images()->where('is_cover', true)->doesntExist() && $property->images()->exists()) {
            $property->images()->orderBy('sort_order')->first()->update(['is_cover' => true]);
        }
    }

    private function label($amount): string
    {
        if ($amount >= 10000000) {
            return '₹'.round($amount / 10000000, 2).' Cr';
        }
        return '₹'.round($amount / 100000).' L';
    }
}
