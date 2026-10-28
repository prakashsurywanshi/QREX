<?php

namespace App\Http\Controllers;

use App\Models\Amenity;
use App\Models\PropertyType;
use App\Services\PropertyTypeCatalog;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AmenityController extends Controller
{
    public function index(Request $request, PropertyTypeCatalog $catalog)
    {
        $types = PropertyType::query()->ordered()->with(['amenities' => fn ($q) => $q->ordered()])->get();

        $requestedId = $request->integer('type') ?: null;
        $selected = $requestedId ? $types->firstWhere('id', $requestedId) : null;

        // Fall back to the first type so the page always opens on a populated list.
        $selected ??= $types->first();

        return Inertia::render('admin/Amenities', [
            'types' => $types->map(fn (PropertyType $t) => [
                'id' => $t->id,
                'name' => $t->name,
                'slug' => $t->slug,
                'description' => $t->description,
                'is_active' => $t->is_active,
                'amenity_count' => $t->amenities->count(),
                'active_count' => $t->amenities->where('is_active', true)->count(),
            ])->all(),
            'selectedTypeId' => $selected?->id,
            'amenities' => $selected
                ? $selected->amenities()->ordered()->get()
                : collect(),
            'specRules' => $catalog->defaultSpecRules(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'property_type_id' => 'required|integer|exists:property_types,id',
            'name' => 'required|string|max:80',
            'icon' => 'nullable|string|max:60',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $type = PropertyType::findOrFail($data['property_type_id']);

        $existing = $type->amenities()
            ->whereRaw('LOWER(name) = ?', [mb_strtolower($data['name'])])
            ->first();

        if ($existing) {
            return back()->with('error', "\"{$data['name']}\" already exists for {$type->name}.");
        }

        $amenity = $type->amenities()->create([
            'name' => $data['name'],
            'slug' => $this->uniqueSlug($type, $data['name']),
            'icon' => $data['icon'] ?? null,
            'sort_order' => $data['sort_order'] ?? ((int) $type->amenities()->max('sort_order') + 1),
            'is_active' => $request->boolean('is_active', true),
        ]);

        return back()->with('success', "{$amenity->name} added to {$type->name}.");
    }

    /**
     * Add several amenities at once — comma or newline separated.
     */
    public function bulkStore(Request $request)
    {
        $data = $request->validate([
            'property_type_id' => 'required|integer|exists:property_types,id',
            'names' => 'required|string',
        ]);

        $type = PropertyType::findOrFail($data['property_type_id']);

        $names = collect(preg_split('/[\r\n,]+/', $data['names']))
            ->map(fn ($n) => trim($n))
            ->filter()
            ->unique(fn ($n) => mb_strtolower($n))
            ->values();

        if ($names->isEmpty()) {
            return back()->with('error', 'No amenity names found.');
        }

        $existing = $type->amenities()
            ->pluck('name')
            ->map(fn ($n) => mb_strtolower($n))
            ->all();

        $order = (int) $type->amenities()->max('sort_order');
        $added = 0;
        $skipped = 0;

        foreach ($names as $name) {
            if (in_array(mb_strtolower($name), $existing, true)) {
                $skipped++;

                continue;
            }

            $type->amenities()->create([
                'name' => $name,
                'slug' => $this->uniqueSlug($type, $name),
                'sort_order' => ++$order,
                'is_active' => true,
            ]);

            $added++;
        }

        $message = "{$added} ".($added === 1 ? 'amenity' : 'amenities')." added to {$type->name}.";

        if ($skipped > 0) {
            $message .= " {$skipped} duplicate ".($skipped === 1 ? 'was' : 'were').' skipped.';
        }

        return back()->with('success', $message);
    }

    public function update(Request $request, Amenity $amenity)
    {
        $data = $request->validate([
            'name' => 'required|string|max:80',
            'icon' => 'nullable|string|max:60',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $duplicate = $amenity->propertyType->amenities()
            ->where('id', '!=', $amenity->id)
            ->whereRaw('LOWER(name) = ?', [mb_strtolower($data['name'])])
            ->exists();

        if ($duplicate) {
            return back()->with('error', "\"{$data['name']}\" already exists for {$amenity->propertyType->name}.");
        }

        $amenity->update([
            'name' => $data['name'],
            'slug' => $this->uniqueSlug($amenity->propertyType, $data['name'], $amenity->id),
            'icon' => $data['icon'] ?? null,
            'sort_order' => $data['sort_order'] ?? $amenity->sort_order,
            'is_active' => $request->boolean('is_active'),
        ]);

        return back()->with('success', "{$amenity->name} updated.");
    }

    public function destroy(Amenity $amenity)
    {
        $typeName = $amenity->propertyType->name;
        $name = $amenity->name;

        $amenity->delete();

        return back()->with('success', "\"{$name}\" removed from {$typeName}.");
    }

    /**
     * Slugs are unique per property type, so append a counter on collision.
     */
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
