<?php

namespace Database\Seeders;

use App\Models\PropertyType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PropertyTypesTableSeeder extends Seeder
{
    /**
     * The nine property types, each with the spec fields that make sense for it.
     *
     * `visible` drives the "Pricing & Specifications" step in the property form:
     * fields left out are hidden and reset to `defaults` on save so no stale
     * values linger. `area_label` relabels the area input per type.
     */
    private const TYPES = [
        [
            'name' => 'Apartment',
            'description' => 'Multi-storey residential unit in a shared building.',
            'visible' => ['price', 'area', 'bedrooms', 'bathrooms', 'floors', 'parking', 'furnishing', 'possession_date'],
            'required' => ['price', 'area'],
            'area_label' => 'Built-up Area (sq.ft)',
        ],
        [
            'name' => 'Villa',
            'description' => 'Independent detached home on a private plot.',
            'visible' => ['price', 'area', 'bedrooms', 'bathrooms', 'floors', 'parking', 'furnishing', 'possession_date'],
            'required' => ['price', 'area'],
            'area_label' => 'Built-up Area (sq.ft)',
        ],
        [
            'name' => 'Plot',
            'description' => 'Land parcel approved for residential construction.',
            'visible' => ['price', 'area', 'parking', 'possession_date'],
            'required' => ['price', 'area'],
            'area_label' => 'Plot Area (sq.ft)',
        ],
        [
            'name' => 'Commercial',
            'description' => 'Mixed-use commercial unit such as a showroom or clinic.',
            'visible' => ['price', 'area', 'bathrooms', 'floors', 'parking', 'possession_date'],
            'required' => ['price', 'area'],
            'area_label' => 'Carpet Area (sq.ft)',
        ],
        [
            'name' => 'Office',
            'description' => 'Grade-A office space fitted for workstations.',
            'visible' => ['price', 'area', 'bathrooms', 'floors', 'parking', 'furnishing', 'possession_date'],
            'required' => ['price', 'area'],
            'area_label' => 'Carpet Area (sq.ft)',
        ],
        [
            'name' => 'Shop',
            'description' => 'Street-facing retail unit on a ground or first floor.',
            'visible' => ['price', 'area', 'bathrooms', 'parking', 'possession_date'],
            'required' => ['price', 'area'],
            'area_label' => 'Carpet Area (sq.ft)',
        ],
        [
            'name' => 'Warehouse',
            'description' => 'Industrial storage and distribution facility.',
            'visible' => ['price', 'area', 'parking', 'possession_date'],
            'required' => ['price', 'area'],
            'area_label' => 'Carpet Area (sq.ft)',
        ],
        [
            'name' => 'Farm/Land',
            'description' => 'Agricultural land, orchard or farmhouse plot.',
            'visible' => ['price', 'area', 'possession_date'],
            'required' => ['price', 'area'],
            'area_label' => 'Land Area (acres)',
        ],
        [
            'name' => 'Other',
            'description' => 'Anything that does not fit the categories above.',
            'visible' => ['price', 'area', 'bedrooms', 'bathrooms', 'floors', 'parking', 'furnishing', 'possession_date'],
            'required' => ['price', 'area'],
            'area_label' => 'Area (sq.ft)',
        ],
    ];

    public function run(): void
    {
        foreach (self::TYPES as $index => $type) {
            PropertyType::updateOrCreate(
                ['name' => $type['name']],
                [
                    'slug' => self::slugFor($type['name']),
                    'description' => $type['description'],
                    'spec_rules' => [
                        'visible' => $type['visible'],
                        'required' => $type['required'],
                        'area_label' => $type['area_label'],
                    ],
                    'sort_order' => $index + 1,
                    'is_active' => true,
                ],
            );
        }
    }

    /**
     * Str::slug would turn "Farm/Land" into "farmland" because ascii() strips the
     * slash. Swap it for a dash first so the slug reads "farm-land".
     */
    public static function slugFor(string $name): string
    {
        return Str::slug(str_replace(['/', '\\'], '-', $name));
    }
}
