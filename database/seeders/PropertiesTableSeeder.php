<?php

namespace Database\Seeders;

use App\Models\Property;
use Illuminate\Database\Seeder;

class PropertiesTableSeeder extends Seeder
{
    public function run(): void
    {
        $agents = [
            'Amit Verma' => 3,
            'Rajesh Gupta' => 5,
            'Sneha Kapoor' => 4,
            'Pooja Iyer' => 6,
        ];

        $properties = [
            [
                'property_id' => 'PROP-001', 'title' => 'Skyline Heights — 3BHK', 'type' => 'Apartment',
                'location' => 'Andheri West, Mumbai', 'city' => 'Mumbai', 'price' => 18500000,
                'area' => 1450, 'bedrooms' => 3, 'bathrooms' => 2, 'status' => 'Available',
                'agent' => 'Amit Verma', 'featured' => true,
                'image' => 'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=600&h=400&fit=crop&auto=format',
                'description' => 'Premium 3BHK apartment with panoramic city views in the heart of Andheri West. Fully loaded with modern amenities.',
                'amenities' => ['Swimming Pool', 'Gym', 'Parking', 'Security', 'CCTV', 'Lift', 'Power Backup'],
                'possession_date' => 'Dec 2026',
            ],
            [
                'property_id' => 'PROP-002', 'title' => 'Palm Grove Villa', 'type' => 'Villa',
                'location' => 'Whitefield, Bangalore', 'city' => 'Bangalore', 'price' => 32000000,
                'area' => 3200, 'bedrooms' => 4, 'bathrooms' => 4, 'status' => 'Available',
                'agent' => 'Rajesh Gupta', 'featured' => true,
                'image' => 'https://images.unsplash.com/photo-1707189856923-46dd41ea2bdc?w=600&h=400&fit=crop&auto=format',
                'description' => 'Sprawling 4BHK villa with private pool and manicured garden in premium Whitefield gated community.',
                'amenities' => ['Private Pool', 'Garden', 'Gym', 'Clubhouse', 'Security', 'CCTV', '3 Parking'],
                'possession_date' => 'Immediate',
            ],
            [
                'property_id' => 'PROP-003', 'title' => 'Emerald Towers — 2BHK', 'type' => 'Apartment',
                'location' => 'Koregaon Park, Pune', 'city' => 'Pune', 'price' => 9500000,
                'area' => 980, 'bedrooms' => 2, 'bathrooms' => 2, 'status' => 'Reserved',
                'agent' => 'Sneha Kapoor', 'featured' => false,
                'image' => 'https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=600&h=400&fit=crop&auto=format',
                'description' => 'Well-appointed 2BHK in the prestigious Koregaon Park neighborhood, close to restaurants and nightlife.',
                'amenities' => ['Swimming Pool', 'Gym', 'Security', 'Parking', 'Lift'],
                'possession_date' => 'Mar 2027',
            ],
            [
                'property_id' => 'PROP-004', 'title' => 'Sunrise Residency — 3BHK', 'type' => 'Apartment',
                'location' => 'Sector 56, Gurugram', 'city' => 'Gurugram', 'price' => 14500000,
                'area' => 1620, 'bedrooms' => 3, 'bathrooms' => 3, 'status' => 'Available',
                'agent' => 'Pooja Iyer', 'featured' => false,
                'image' => 'https://images.unsplash.com/photo-1590560041498-ef79363d9f0c?w=600&h=400&fit=crop&auto=format',
                'description' => 'Spacious 3BHK with excellent connectivity to Cyber City and Golf Course Road. Modern design, ample parking.',
                'amenities' => ['Gymnasium', 'Clubhouse', "Children's Play Area", 'Security', 'Power Backup'],
                'possession_date' => 'Jun 2027',
            ],
            [
                'property_id' => 'PROP-005', 'title' => 'The Grand — Penthouse', 'type' => 'Apartment',
                'location' => 'Worli, Mumbai', 'city' => 'Mumbai', 'price' => 85000000,
                'area' => 4200, 'bedrooms' => 5, 'bathrooms' => 5, 'status' => 'Under Negotiation',
                'agent' => 'Rajesh Gupta', 'featured' => true,
                'image' => 'https://images.unsplash.com/photo-1724582586529-62622e50c0b3?w=600&h=400&fit=crop&auto=format',
                'description' => 'Luxurious 5BHK penthouse with breathtaking sea views, private terrace and exclusive amenities in Worli.',
                'amenities' => ['Sea View', 'Private Terrace', 'Swimming Pool', 'Gym', 'Spa', 'Concierge', '4 Parking'],
                'possession_date' => 'Ready to Move',
            ],
            [
                'property_id' => 'PROP-006', 'title' => 'Green Valley Plot', 'type' => 'Plot',
                'location' => 'Yelahanka, Bangalore', 'city' => 'Bangalore', 'price' => 7200000,
                'area' => 2400, 'bedrooms' => 0, 'bathrooms' => 0, 'status' => 'Available',
                'agent' => 'Amit Verma', 'featured' => false,
                'image' => 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop&auto=format',
                'description' => 'Approved residential plot in a well-planned township with all civic amenities and excellent road connectivity.',
                'amenities' => ['Corner Plot', 'BBMP Approved', 'Gated Township', '24hr Security'],
                'possession_date' => 'Immediate',
            ],
            [
                'property_id' => 'PROP-007', 'title' => 'Business Hub — Office Space', 'type' => 'Commercial',
                'location' => 'BKC, Mumbai', 'city' => 'Mumbai', 'price' => 48000000,
                'area' => 2000, 'bedrooms' => 0, 'bathrooms' => 4, 'status' => 'Sold',
                'agent' => 'Rajesh Gupta', 'featured' => false,
                'image' => 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop&auto=format',
                'description' => 'Premium Grade-A office space in BKC\'s most sought-after business complex. Fully fitted and ready to move.',
                'amenities' => ['24hr AC', 'High-speed Fiber', 'Dedicated Parking', 'CCTV', 'Conference Room', 'Cafeteria'],
                'possession_date' => 'Immediate',
            ],
            [
                'property_id' => 'PROP-008', 'title' => 'Marina Bay — 3BHK', 'type' => 'Apartment',
                'location' => 'Powai, Mumbai', 'city' => 'Mumbai', 'price' => 21000000,
                'area' => 1650, 'bedrooms' => 3, 'bathrooms' => 3, 'status' => 'Available',
                'agent' => 'Sneha Kapoor', 'featured' => true,
                'image' => 'https://images.unsplash.com/photo-1600210491369-e753d80a41f3?w=600&h=400&fit=crop&auto=format',
                'description' => 'Serene lake-facing 3BHK in Powai\'s most prestigious residential address. Walking distance to Hiranandani Business Park.',
                'amenities' => ['Lake View', 'Swimming Pool', 'Gym', 'Jogging Track', 'Club House', 'Parking'],
                'possession_date' => 'Ready to Move',
            ],
        ];

        foreach ($properties as $p) {
            $priceLabel = $this->label($p['price']);
            $agentId = $agents[$p['agent']] ?? 1;

            Property::updateOrCreate(
                ['property_id' => $p['property_id']],
                [
                    'title' => $p['title'],
                    'type' => $p['type'],
                    'transaction_type' => 'Buy',
                    'description' => $p['description'],
                    'status' => $p['status'],
                    'price' => $p['price'],
                    'price_label' => $priceLabel,
                    'area' => $p['area'],
                    'bedrooms' => $p['bedrooms'],
                    'bathrooms' => $p['bathrooms'],
                    'floors' => $p['type'] === 'Apartment' ? ($p['bedrooms'] > 0 ? $p['bedrooms'] : 1) : 1,
                    'parking' => $p['amenities'] ? (in_array('4 Parking', $p['amenities']) || in_array('3 Parking', $p['amenities']) ? 2 : 1) : 0,
                    'furnishing' => in_array($p['type'], ['Apartment', 'Villa']) ? 'Semi-Furnished' : 'Unfurnished',
                    'possession_date' => $p['possession_date'],
                    'address' => $p['location'],
                    'city' => $p['city'],
                    'state' => $p['type'] ? ($p['city'] === 'Mumbai' ? 'Maharashtra' : ($p['city'] === 'Bangalore' ? 'Karnataka' : ($p['city'] === 'Pune' ? 'Maharashtra' : 'Haryana'))) : null,
                    'country' => 'India',
                    'amenities' => $p['amenities'],
                    'featured' => $p['featured'],
                    'is_website_visible' => $p['status'] !== 'Inactive',
                    'slug' => strtolower(str_replace([' — ', ' ', '—'], ['-', '-', '-'], $p['title'])),
                    'image' => $p['image'],
                    'agent_id' => $agentId,
                    'created_at' => '2026-08-01 00:00:00',
                ]
            );
        }
    }

    private function label($amount): string
    {
        if ($amount >= 10000000) {
            return '₹' . round($amount / 10000000, 2) . ' Cr';
        }
        return '₹' . round($amount / 100000) . ' L';
    }
}
