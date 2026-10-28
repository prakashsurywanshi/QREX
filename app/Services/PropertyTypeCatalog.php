<?php

namespace App\Services;

use App\Models\Property;
use App\Models\PropertyType;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/**
 * Single source of truth for property types, their amenities and their spec rules.
 *
 * The catalog lives in the `property_types` / `amenities` tables (seeded by
 * PropertyTypesTableSeeder + AmenitiesTableSeeder) so admins can curate it from
 * /admin/amenities instead of editing code.
 *
 * Degrades gracefully: if the catalog has not been seeded yet, type names fall
 * back to whatever distinct values already exist on `properties.type`, and every
 * type gets the generic spec rules with no amenity suggestions.
 */
class PropertyTypeCatalog
{
    /**
     * Every spec field the property form knows how to render, in display order.
     */
    public const SPEC_FIELDS = [
        'price',
        'area',
        'bedrooms',
        'bathrooms',
        'floors',
        'parking',
        'furnishing',
        'possession_date',
    ];

    /**
     * Fields that are never optional, whatever the property type is.
     */
    public const ALWAYS_REQUIRED = ['price', 'area'];

    public const DEFAULT_AREA_LABEL = 'Area';

    /**
     * Values written into a property when its type stops exposing a field.
     */
    public const NEUTRAL_DEFAULTS = [
        'bedrooms' => 0,
        'bathrooms' => 0,
        'floors' => 1,
        'parking' => 0,
        'furnishing' => 'Unfurnished',
        'possession_date' => '',
    ];

    private ?Collection $types = null;

    private ?array $byName = null;

    /**
     * Active property types with their active amenities, ordered for display.
     */
    public function types(): Collection
    {
        if ($this->types === null) {
            $this->types = PropertyType::query()
                ->active()
                ->ordered()
                ->with(['activeAmenities'])
                ->get();
        }

        return $this->types;
    }

    public function isSeeded(): bool
    {
        return PropertyType::query()->exists();
    }

    /**
     * Valid property type names, ordered.
     */
    public function names(): array
    {
        if ($this->isSeeded()) {
            return $this->types()->pluck('name')->all();
        }

        return Property::query()
            ->distinct()
            ->whereNotNull('type')
            ->where('type', '!=', '')
            ->orderBy('type')
            ->pluck('type')
            ->all();
    }

    /**
     * Valid property type names with a leading "All" entry, for filter dropdowns.
     */
    public function namesWithAll(): array
    {
        return array_merge(['All'], $this->names());
    }

    public function isValid(?string $type): bool
    {
        return $type !== null && in_array($type, $this->names(), true);
    }

    /**
     * Match a stored `properties.type` value against the catalog by name, then
     * slug. Tolerates casing and the slugified form of the name so "Farm/Land",
     * "farm/land" and "farm-land" all land on the same type.
     */
    public function resolve(?string $type): ?PropertyType
    {
        if ($this->byName === null) {
            $this->byName = $this->types()
                ->keyBy(fn (PropertyType $t) => mb_strtolower($t->name))
                ->all();
        }

        if ($type === null || $type === '') {
            return null;
        }

        $needle = mb_strtolower($type);

        // "Farm/Land" => "farm-land", which is how the slug is stored.
        $dashed = Str::slug(str_replace(['/', '\\'], '-', $type));

        return $this->byName[$needle]
            ?? $this->types()->firstWhere('slug', $dashed)
            ?? $this->types()->firstWhere('slug', Str::slug($type));
    }

    /**
     * Normalised spec rules for a type: visible, required, defaults, area_label.
     *
     * `price` and `area` are always present; everything else comes from the
     * type's `spec_rules` column, falling back to the generic set.
     */
    public function specRules(?string $type): array
    {
        $model = $this->resolve($type);
        $rules = $model?->spec_rules ?: [];

        // No spec_rules stored (unknown/unseeded type) => expose every field,
        // which is how the form behaved before the catalog existed.
        $visible = array_key_exists('visible', $rules)
            ? $this->normalizeList($rules['visible'])
            : self::SPEC_FIELDS;

        $visible = array_values(array_unique(array_merge(self::ALWAYS_REQUIRED, $visible)));

        // Keep display order stable regardless of how the rules were stored.
        $visible = array_values(array_filter(
            self::SPEC_FIELDS,
            fn (string $field) => in_array($field, $visible, true),
        ));

        $required = $this->normalizeList($rules['required'] ?? []);
        $required = array_values(array_unique(array_merge(self::ALWAYS_REQUIRED, $required)));
        $required = array_values(array_filter($required, fn ($f) => in_array($f, $visible, true)));

        return [
            'visible' => $visible,
            'required' => $required,
            'hidden' => array_values(array_diff(self::SPEC_FIELDS, $visible)),
            'defaults' => array_merge(self::NEUTRAL_DEFAULTS, $rules['defaults'] ?? []),
            'area_label' => $rules['area_label'] ?? self::DEFAULT_AREA_LABEL,
        ];
    }

    public function showsField(?string $type, string $field): bool
    {
        return in_array($field, $this->specRules($type)['visible'], true);
    }

    /**
     * Suggested amenity names for a type, in display order.
     */
    public function amenitiesFor(?string $type): array
    {
        return $this->resolve($type)?->activeAmenities->pluck('name')->all() ?? [];
    }

    /**
     * Everything the form needs in a single payload: amenities + spec rules.
     */
    public function optionsFor(?string $type): array
    {
        return [
            'amenities' => $this->amenitiesFor($type),
            'spec' => $this->specRules($type),
        ];
    }

    /**
     * The whole catalog, shaped for the frontend. Shipped once so switching
     * property type in the wizard needs no round trip.
     */
    public function all(): array
    {
        return $this->names()
            ? array_map(function (string $name) {
                $options = $this->optionsFor($name);
                $model = $this->resolve($name);

                return [
                    'name' => $name,
                    'slug' => $model?->slug,
                    'description' => $model?->description,
                    'amenities' => $options['amenities'],
                    'spec' => $options['spec'],
                ];
            }, $this->names())
            : [];
    }

    /**
     * Generic rules for a type with no spec_rules stored.
     */
    public function defaultSpecRules(): array
    {
        return $this->specRules(null);
    }

    private function normalizeList(mixed $value): array
    {
        if (! is_array($value)) {
            return [];
        }

        return array_values(array_filter(
            $value,
            fn ($item) => is_string($item) && in_array($item, self::SPEC_FIELDS, true),
        ));
    }
}
