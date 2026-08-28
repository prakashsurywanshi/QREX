<?php

namespace Database\Seeders;

use App\Models\Campaign;
use App\Models\MediaFile;
use App\Models\Notification;
use Illuminate\Database\Seeder;

class MarketingMediaSeeder extends Seeder
{
    public function run(): void
    {
        $campaigns = [
            ['id' => 'CAM-001', 'name' => 'Monsoon Offers 2026', 'channel' => 'Facebook + Instagram', 'budget' => 150000, 'spent' => 128000, 'leads' => 38, 'conv' => 6, 'revenue' => 9200000, 'label' => '₹92 L', 'roi' => '7.2x', 'start' => '2026-07-01', 'end' => '2026-08-31', 'status' => 'Active'],
            ['id' => 'CAM-002', 'name' => 'Diwali Pre-Launch', 'channel' => 'Google Ads', 'budget' => 200000, 'spent' => 0, 'leads' => 0, 'conv' => 0, 'revenue' => 0, 'label' => '—', 'roi' => '—', 'start' => '2026-09-15', 'end' => '2026-10-31', 'status' => 'Scheduled'],
            ['id' => 'CAM-003', 'name' => 'BKC Commercial Drive', 'channel' => 'LinkedIn + Email', 'budget' => 80000, 'spent' => 80000, 'leads' => 22, 'conv' => 2, 'revenue' => 48000000, 'label' => '₹4.80 Cr', 'roi' => '60x', 'start' => '2026-06-01', 'end' => '2026-07-31', 'status' => 'Completed'],
        ];

        foreach ($campaigns as $c) {
            Campaign::updateOrCreate(
                ['campaign_id' => $c['id']],
                [
                    'name' => $c['name'],
                    'channel' => $c['channel'],
                    'budget' => $c['budget'],
                    'spent' => $c['spent'],
                    'leads' => $c['leads'],
                    'conversions' => $c['conv'],
                    'revenue' => $c['revenue'],
                    'revenue_label' => $c['label'],
                    'roi' => $c['roi'],
                    'start_date' => $c['start'],
                    'end_date' => $c['end'],
                    'status' => $c['status'],
                ]
            );
        }

        $media = [
            ['name' => 'Skyline_Heights_Gallery_01.jpg', 'type' => 'image', 'size' => '3.4 MB', 'folder' => 'Properties', 'property' => 'Skyline Heights', 'by' => 'Amit Verma', 'url' => 'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=300&h=200&fit=crop'],
            ['name' => 'Palm_Grove_Brochure.pdf', 'type' => 'pdf', 'size' => '8.1 MB', 'folder' => 'Properties', 'property' => 'Palm Grove Villa', 'by' => 'Rajesh Gupta', 'url' => ''],
            ['name' => 'Anjali_Verma_Aadhar.pdf', 'type' => 'pdf', 'size' => '1.2 MB', 'folder' => 'Customers', 'property' => '—', 'by' => 'Rajesh Gupta', 'url' => ''],
            ['name' => 'BusinessHub_Agreement.pdf', 'type' => 'pdf', 'size' => '4.5 MB', 'folder' => 'Legal', 'property' => 'Business Hub', 'by' => 'Rajesh Gupta', 'url' => ''],
            ['name' => 'Agency_Banner_Diwali.jpg', 'type' => 'image', 'size' => '2.1 MB', 'folder' => 'Marketing', 'property' => '—', 'by' => 'Marketing Team', 'url' => 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=300&h=200&fit=crop'],
            ['name' => 'Marina_Bay_FloorPlan.jpg', 'type' => 'image', 'size' => '1.8 MB', 'folder' => 'Properties', 'property' => 'Marina Bay', 'by' => 'Sneha Kapoor', 'url' => 'https://images.unsplash.com/photo-1600210491369-e753d80a41f3?w=300&h=200&fit=crop'],
            ['name' => 'Palm_Grove_Video_Tour.mp4', 'type' => 'video', 'size' => '145 MB', 'folder' => 'Properties', 'property' => 'Palm Grove Villa', 'by' => 'Marketing Team', 'url' => ''],
            ['name' => 'Grand_Penthouse_Gallery.jpg', 'type' => 'image', 'size' => '4.7 MB', 'folder' => 'Properties', 'property' => 'The Grand Penthouse', 'by' => 'Rajesh Gupta', 'url' => 'https://images.unsplash.com/photo-1724582586529-62622e50c0b3?w=300&h=200&fit=crop'],
        ];

        foreach ($media as $m) {
            MediaFile::updateOrCreate(
                ['name' => $m['name']],
                [
                    'type' => $m['type'],
                    'size' => $m['size'],
                    'folder' => $m['folder'],
                    'property_name' => $m['property'],
                    'uploaded_by' => $m['by'],
                    'url' => $m['url'],
                ]
            );
        }

        $notifs = [
            ['title' => 'New Lead', 'message' => 'New lead from website: Rohit Joshi', 'type' => 'Lead'],
            ['title' => 'Site Visit', 'message' => 'Site visit confirmed: Priya Patel at Palm Grove', 'type' => 'Visit'],
            ['title' => 'Payment', 'message' => 'Payment received: ₹4.80 Cr from Anjali Verma', 'type' => 'Payment'],
            ['title' => 'Follow-up', 'message' => 'Follow-up due: Manish Agarwal — The Grand', 'type' => 'Task'],
        ];

        foreach ($notifs as $n) {
            Notification::updateOrCreate(
                ['title' => $n['title'], 'message' => $n['message']],
                ['type' => $n['type'], 'user_id' => 1]
            );
        }
    }
}
