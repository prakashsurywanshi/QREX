<?php

namespace Database\Seeders;

use App\Models\Amenity;
use App\Models\PropertyType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AmenitiesTableSeeder extends Seeder
{
    /**
     * Curated amenity list per property type, in the order they should appear
     * as toggle pills in the property form. Anything not listed here can still be
     * added as a custom amenity on the property form.
     */
    private const AMENITIES = [
        'Apartment' => [
            'Lift', 'Power Backup', 'Parking', 'Security', 'CCTV', 'Gym', 'Swimming Pool',
            'Clubhouse', 'Garden', "Children's Play Area", 'Jogging Track', '24hr Water',
            'Intercom', 'Fire Safety', 'Balcony', 'High-speed Fiber', 'Spa', 'Concierge',
            '24hr AC', 'Sea View', 'Lake View', 'Private Terrace',
        ],
        'Villa' => [
            'Private Pool', 'Garden', 'Private Terrace', 'Lawn', 'Garage', 'Gym', 'Clubhouse',
            'Security', 'CCTV', 'Jogging Track', 'Servant Quarters', 'Power Backup',
            'Rain Water Harvesting', 'Solar Backup', 'Gated Community', 'Intercom',
            'Home Theatre', 'Spa', 'Fire Safety', 'Lake View', 'Sea View',
        ],
        'Plot' => [
            'Gated Township', 'Corner Plot', 'Main Road Facing', 'Approved Layout',
            'Clear Title', 'Boundary Wall', 'Electricity Connection', 'Water Connection',
            'Sewage Connection', 'Road Access', 'Park Facing', 'Waterfront',
            'High-speed Fiber', '24hr Security',
        ],
        'Commercial' => [
            '24hr AC', 'High-speed Fiber', 'Dedicated Parking', 'CCTV', 'Conference Room',
            'Cafeteria', 'Elevator', 'Power Backup', 'Fire Safety', 'Escalator', 'ATM',
            'Reception', 'Server Room', 'Pantry', 'Wheelchair Access',
        ],
        'Office' => [
            '24hr AC', 'High-speed Fiber', 'Dedicated Parking', 'CCTV', 'Conference Room',
            'Pantry', 'Elevator', 'Power Backup', 'Fire Safety', 'Reception',
            'Server Room', 'Smoke Detection', 'Visitor Parking', 'Video Conferencing',
        ],
        'Shop' => [
            'Dedicated Parking', 'CCTV', 'Power Backup', 'Fire Safety', 'Escalator',
            'Signage Board', 'High-speed Fiber', 'Washroom', 'Loading Bay',
            'Generator Backup', 'Security', 'Show Front',
        ],
        'Warehouse' => [
            'Loading Bay', 'Loading Dock', 'CCTV', 'Fire Safety', 'Security',
            'Power Backup', 'Generator Backup', 'Crane', 'Truck Parking', 'High Ceiling',
            'Sprinkler System', 'Forklift Access', 'Rain Water Harvesting', 'Office Space',
        ],
        'Farm/Land' => [
            'Water Source', 'Borewell', 'Boundary Wall', 'Electricity Connection',
            'Approach Road', 'Agricultural Permit', 'Green Clearance', 'Fencing',
            'Storage Shed', 'Drip Irrigation', 'Farmhouse', 'Solar Fencing',
        ],
        'Other' => [
            'Parking', 'Security', 'CCTV', 'Power Backup', 'Lift', 'Garden', 'Water Supply',
        ],
    ];

    public function run(): void
    {
        $types = PropertyType::query()->pluck('id', 'name');
        $now = now();
        $rows = [];

        foreach (self::AMENITIES as $typeName => $amenities) {
            $typeId = $types[$typeName] ?? null;

            if ($typeId === null) {
                $this->command?->warn("Property type [{$typeName}] not found — skipping its amenities.");

                continue;
            }

            foreach ($amenities as $index => $name) {
                $rows[] = [
                    'property_type_id' => $typeId,
                    'name' => $name,
                    'slug' => Str::slug($name),
                    'icon' => null,
                    'sort_order' => $index + 1,
                    'is_active' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        if ($rows === []) {
            return;
        }

        // One statement instead of a SELECT + INSERT/UPDATE per amenity.
        Amenity::upsert($rows, ['property_type_id', 'name'], ['slug', 'sort_order', 'is_active', 'updated_at']);
    }
}
