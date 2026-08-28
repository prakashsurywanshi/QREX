<?php

namespace Database\Seeders;

use App\Models\Lead;
use App\Models\LeadActivity;
use Illuminate\Database\Seeder;

class LeadsTableSeeder extends Seeder
{
    public function run(): void
    {
        $agents = [
            'Amit Verma' => 3,
            'Rajesh Gupta' => 5,
            'Sneha Kapoor' => 4,
            'Pooja Iyer' => 6,
        ];

        $leads = [
            ['id' => 'L-001', 'name' => 'Rahul Sharma', 'phone' => '9823401234', 'email' => 'rahul.s@gmail.com', 'source' => 'Website', 'status' => 'Qualified', 'budget' => '1.5–2 Cr', 'location' => 'Mumbai', 'property' => 'PROP-001', 'agent' => 'Amit Verma', 'lastContact' => '2026-08-24', 'next' => '2026-08-28', 'score' => 82],
            ['id' => 'L-002', 'name' => 'Priya Patel', 'phone' => '9834502345', 'email' => 'priya.patel@yahoo.com', 'source' => 'Facebook', 'status' => 'Site Visit Scheduled', 'budget' => '80 L–1.2 Cr', 'location' => 'Bangalore', 'property' => 'PROP-002', 'agent' => 'Sneha Kapoor', 'lastContact' => '2026-08-25', 'next' => '2026-08-27', 'score' => 74],
            ['id' => 'L-003', 'name' => 'Arjun Singh', 'phone' => '9845603456', 'email' => 'arjun.singh@hotmail.com', 'source' => 'Google', 'status' => 'Contacted', 'budget' => '2–3 Cr', 'location' => 'Pune', 'property' => 'PROP-003', 'agent' => 'Rajesh Gupta', 'lastContact' => '2026-08-22', 'next' => '2026-08-29', 'score' => 61],
            ['id' => 'L-004', 'name' => 'Kavitha Nair', 'phone' => '9856704567', 'email' => 'kavitha.n@outlook.com', 'source' => 'Referral', 'status' => 'New', 'budget' => '1.4–1.6 Cr', 'location' => 'Gurugram', 'property' => 'PROP-004', 'agent' => 'Pooja Iyer', 'lastContact' => '2026-08-26', 'next' => '2026-08-28', 'score' => 45],
            ['id' => 'L-005', 'name' => 'Manish Agarwal', 'phone' => '9867805678', 'email' => 'manish.a@gmail.com', 'source' => 'WhatsApp', 'status' => 'Negotiation', 'budget' => '8–10 Cr', 'location' => 'Mumbai', 'property' => 'PROP-005', 'agent' => 'Rajesh Gupta', 'lastContact' => '2026-08-25', 'next' => '2026-08-27', 'score' => 91],
            ['id' => 'L-006', 'name' => 'Deepika Rao', 'phone' => '9878906789', 'email' => 'deepika.r@gmail.com', 'source' => 'Instagram', 'status' => 'Qualified', 'budget' => '70–90 L', 'location' => 'Bangalore', 'property' => 'PROP-006', 'agent' => 'Amit Verma', 'lastContact' => '2026-08-23', 'next' => '2026-08-30', 'score' => 68],
            ['id' => 'L-007', 'name' => 'Suresh Menon', 'phone' => '9889007890', 'email' => 'suresh.m@gmail.com', 'source' => 'Walk-in', 'status' => 'Site Visit Completed', 'budget' => '2–2.5 Cr', 'location' => 'Mumbai', 'property' => 'PROP-008', 'agent' => 'Sneha Kapoor', 'lastContact' => '2026-08-24', 'next' => '2026-08-27', 'score' => 79],
            ['id' => 'L-008', 'name' => 'Anjali Verma', 'phone' => '9890108901', 'email' => 'anjali.v@yahoo.com', 'source' => 'Phone', 'status' => 'Converted', 'budget' => '4–5 Cr', 'location' => 'Mumbai', 'property' => 'PROP-007', 'agent' => 'Rajesh Gupta', 'lastContact' => '2026-08-20', 'next' => null, 'score' => 95],
            ['id' => 'L-009', 'name' => 'Kiran Bhat', 'phone' => '9901209012', 'email' => 'kiran.b@gmail.com', 'source' => 'Campaign', 'status' => 'Lost', 'budget' => '1–1.3 Cr', 'location' => 'Pune', 'property' => 'PROP-003', 'agent' => 'Pooja Iyer', 'lastContact' => '2026-08-15', 'next' => null, 'score' => 30],
            ['id' => 'L-010', 'name' => 'Rohit Joshi', 'phone' => '9912310123', 'email' => 'rohit.j@gmail.com', 'source' => 'Google', 'status' => 'New', 'budget' => '1.8–2.2 Cr', 'location' => 'Mumbai', 'property' => 'PROP-001', 'agent' => 'Amit Verma', 'lastContact' => '2026-08-26', 'next' => '2026-08-28', 'score' => 38],
        ];

        $i = 0;
        foreach ($leads as $l) {
            $i++;
            $lead = Lead::updateOrCreate(
                ['lead_id' => $l['id']],
                [
                    'name' => $l['name'],
                    'phone' => $l['phone'],
                    'email' => $l['email'],
                    'source' => $l['source'],
                    'status' => $l['status'],
                    'budget' => $l['budget'],
                    'preferred_location' => $l['location'],
                    'interested_property_id' => $this->propId($l['property']),
                    'assigned_agent_id' => $agents[$l['agent']] ?? 1,
                    'score' => $l['score'],
                    'requirements' => 'Looking for a ' . ($l['budget']) . ' property in ' . $l['location'],
                    'last_contact' => $l['lastContact'],
                    'next_followup' => $l['next'],
                    'created_at' => '2026-08-' . str_pad((string)(10 + $i), 2, '0', STR_PAD_LEFT) . ' 00:00:00',
                ]
            );

            LeadActivity::updateOrCreate(
                ['lead_id' => $lead->id, 'type' => 'Note', 'title' => 'Lead captured'],
                [
                    'description' => $lead->name . ' enquired about ' . $lead->budget . ' property',
                    'user_id' => $lead->assigned_agent_id,
                    'created_at' => $lead->created_at,
                ]
            );
        }
    }

    private function propId(string $pid): ?int
    {
        $prop = \App\Models\Property::where('property_id', $pid)->first();

        return $prop?->id;
    }
}
