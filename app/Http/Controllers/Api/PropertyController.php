<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ValidatesPropertyPayload;
use App\Http\Responses\ApiResponse;
use App\Models\Property;
use App\Models\PropertyImage;
use App\Models\User;
use App\Services\PropertyTypeCatalog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PropertyController extends ApiController
{
    use ValidatesPropertyPayload;

    public function index(Request $request, PropertyTypeCatalog $catalog)
    {
        $query = Property::query()->with('agent', 'images');

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

        $perPage = max(1, (int) $request->integer('per_page', 10));
        $properties = $query->latest()->paginate($perPage);

        return ApiResponse::success([
            'data' => collect($properties->items())->map(fn ($p) => $this->propertyBrief($p))->all(),
            'meta' => [
                'current_page' => $properties->currentPage(),
                'last_page' => $properties->lastPage(),
                'per_page' => $properties->perPage(),
                'total' => $properties->total(),
            ],
            'filters' => $request->only(['search', 'status', 'type', 'featured']),
            'statuses' => ['Available', 'Reserved', 'Under Negotiation', 'Sold', 'Draft', 'Rented', 'Inactive'],
            'types' => $catalog->names(),
            'type_options' => $catalog->all(),
        ]);
    }

    public function show(Property $property)
    {
        $property->load('agent', 'images');

        $catalog = app(PropertyTypeCatalog::class);

        $leads = $property->leads()->visibleTo(Auth::user())->with('assignedAgent')->get()->map(fn ($l) => [
            'id' => $l->id,
            'lead_id' => $l->lead_id,
            'name' => $l->name,
            'phone' => $l->phone,
            'email' => $l->email,
            'status' => $l->status,
            'source' => $l->source,
            'agent_name' => $l->assignedAgent?->name,
        ])->all();

        return ApiResponse::success([
            'property' => $this->propertyBrief($property),
            'leads' => $leads,
            'type_options' => $catalog->optionsFor($property->type),
        ]);
    }

    public function store(Request $request, PropertyTypeCatalog $catalog)
    {
        $data = $this->validateProperty($request, $catalog);
        $data['property_id'] = $this->nextId('PROP');
        $data['price_label'] = $this->label($data['price'] ?? 0);
        $data['slug'] = Str::slug($data['title']);

        $property = Property::create($data);

        return ApiResponse::success($this->propertyBrief($property), 'Property created successfully.', 201);
    }

    public function update(Request $request, Property $property, PropertyTypeCatalog $catalog)
    {
        $data = $this->validateProperty($request, $catalog);
        $data['price_label'] = $this->label($data['price'] ?? 0);

        $property->update($data);

        return ApiResponse::success($this->propertyBrief($property->load('agent')), 'Property updated successfully.');
    }

    public function destroy(Property $property)
    {
        $this->deleteImage($property->image);
        foreach ($property->images as $img) {
            $this->deleteImage($img->path);
        }
        $property->delete();

        return ApiResponse::success(null, 'Property deleted.');
    }

    public function storeImages(Request $request, Property $property)
    {
        $request->validate([
            'images' => 'required|array|min:1|max:15',
            'images.*' => 'required|image|mimes:jpg,jpeg,png,webp,gif|max:5120',
        ]);

        $existingCount = $property->images()->count();
        $maxNew = 15 - $existingCount;

        if ($maxNew <= 0) {
            return ApiResponse::error('Maximum 15 images per property.', 422);
        }

        $files = array_slice($request->file('images'), 0, $maxNew);
        $created = [];

        foreach ($files as $index => $file) {
            $path = $file->store('properties', 'public');
            $url = Storage::disk('public')->url($path);

            $image = PropertyImage::create([
                'property_id' => $property->id,
                'path' => $url,
                'type' => 'image',
                'is_cover' => $existingCount === 0 && $index === 0,
                'sort_order' => $existingCount + $index,
            ]);

            $created[] = [
                'id' => $image->id,
                'path' => $image->path,
                'type' => $image->type,
                'is_cover' => $image->is_cover,
                'sort_order' => $image->sort_order,
            ];
        }

        return ApiResponse::success($created, 'Images uploaded successfully.', 201);
    }

    public function destroyImage(Property $property, PropertyImage $image)
    {
        if ($image->property_id !== $property->id) {
            return ApiResponse::error('Image does not belong to this property.', 404);
        }

        $this->deleteImage($image->path);
        $image->delete();

        return ApiResponse::success(null, 'Image deleted.');
    }

    public function setCover(Property $property, PropertyImage $image)
    {
        if ($image->property_id !== $property->id) {
            return ApiResponse::error('Image does not belong to this property.', 404);
        }

        $property->images()->update(['is_cover' => false]);
        $image->update(['is_cover' => true]);

        return ApiResponse::success(null, 'Cover image updated.');
    }

    public function agents()
    {
        return ApiResponse::success([
            'agents' => User::whereIn('role', ['Sales Executive', 'Senior Agent'])
                ->get(['id', 'name'])
                ->map(fn ($u) => ['id' => $u->id, 'name' => $u->name]),
        ]);
    }

    protected function propertyBrief($p): array
    {
        return [
            'id' => $p->id,
            'public_id' => $p->public_id,
            'property_id' => $p->property_id,
            'title' => $p->title,
            'type' => $p->type,
            'transaction_type' => $p->transaction_type,
            'status' => $p->status,
            'price' => (float) $p->price,
            'price_label' => $p->price_label,
            'area' => (float) $p->area,
            'bedrooms' => (int) $p->bedrooms,
            'bathrooms' => (int) $p->bathrooms,
            'floors' => (int) $p->floors,
            'parking' => (int) $p->parking,
            'furnishing' => $p->furnishing,
            'possession_date' => $p->possession_date,
            'address' => $p->address,
            'city' => $p->city,
            'state' => $p->state,
            'country' => $p->country,
            'pincode' => $p->pincode,
            'amenities' => $p->amenities,
            'featured' => (bool) $p->featured,
            'is_website_visible' => (bool) $p->is_website_visible,
            'description' => $p->description,
            'image' => $p->coverOrImage(),
            'images' => $p->images->map(fn ($img) => [
                'id' => $img->id,
                'path' => $img->path,
                'type' => $img->type,
                'is_cover' => $img->is_cover,
                'sort_order' => $img->sort_order,
            ]),
            'agent_id' => $p->agent_id,
            'agent_name' => $p->agent?->name,
        ];
    }

    private function deleteImage(?string $url): void
    {
        if (!$url) {
            return;
        }
        $path = $this->storagePathFromUrl($url);
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    private function storagePathFromUrl(?string $url): ?string
    {
        if (!$url) {
            return null;
        }
        $base = rtrim(Storage::disk('public')->url('/'), '/');
        if (str_starts_with($url, $base.'/')) {
            return ltrim(substr($url, strlen($base)), '/');
        }
        if (preg_match('#^/storage/(.+)$#', $url, $m)) {
            return $m[1];
        }
        return null;
    }
}