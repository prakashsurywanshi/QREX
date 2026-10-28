<?php

namespace App\Http\Controllers\Api;

use App\Http\Responses\ApiResponse;
use App\Models\Amenity;
use App\Models\PropertyType;
use App\Services\PropertyTypeCatalog;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AmenityController extends ApiController
{
    public function index(PropertyTypeCatalog $catalog)
    {
        return ApiResponse::success([
            'types' => $catalog->all(),
            'names' => $catalog->names(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'property_type' => 'required|string',
            'name' => 'required|string|max:80',
            'icon' => 'nullable|string|max:60',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $type = $this->resolveType($data['property_type']);

        if ($type === null) {
            return ApiResponse::error('Unknown property type.', 422, [
                'property_type' => ['The selected property type is not valid.'],
            ]);
        }

        if ($type->amenities()->whereRaw('LOWER(name) = ?', [mb_strtolower($data['name'])])->exists()) {
            return ApiResponse::error('Amenity already exists for this property type.', 422, [
                'name' => ["\"{$data['name']}\" already exists for {$type->name}."],
            ]);
        }

        $amenity = $type->amenities()->create([
            'name' => $data['name'],
            'slug' => $this->uniqueSlug($type, $data['name']),
            'icon' => $data['icon'] ?? null,
            'sort_order' => $data['sort_order'] ?? ((int) $type->amenities()->max('sort_order') + 1),
            'is_active' => $request->boolean('is_active', true),
        ]);

        return ApiResponse::success($amenity, 'Amenity created successfully.', 201);
    }

    public function update(Request $request, Amenity $amenity)
    {
        $data = $request->validate([
            'name' => 'required|string|max:80',
            'icon' => 'nullable|string|max:60',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $type = $amenity->propertyType;

        $duplicate = $type->amenities()
            ->where('id', '!=', $amenity->id)
            ->whereRaw('LOWER(name) = ?', [mb_strtolower($data['name'])])
            ->exists();

        if ($duplicate) {
            return ApiResponse::error('Amenity already exists for this property type.', 422, [
                'name' => ["\"{$data['name']}\" already exists for {$type->name}."],
            ]);
        }

        $amenity->update([
            'name' => $data['name'],
            'slug' => $this->uniqueSlug($type, $data['name'], $amenity->id),
            'icon' => $data['icon'] ?? null,
            'sort_order' => $data['sort_order'] ?? $amenity->sort_order,
            'is_active' => $request->boolean('is_active'),
        ]);

        return ApiResponse::success($amenity->fresh(), 'Amenity updated successfully.');
    }

    public function destroy(Amenity $amenity)
    {
        $amenity->delete();

        return ApiResponse::success(null, 'Amenity deleted.');
    }

    private function resolveType(string $name): ?PropertyType
    {
        return PropertyType::query()
            ->where('name', $name)
            ->orWhere('slug', $name)
            ->first();
    }

    private function uniqueSlug(PropertyType $type, string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name) ?: 'amenity';
        $slug = $base;
        $suffix = 2;

        while ($type->amenities()
            ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
            ->where('slug', $slug)
            ->exists()
        ) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }
}
