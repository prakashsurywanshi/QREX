<?php

namespace Database\Seeders;

use App\Models\Deal;
use Illuminate\Database\Seeder;

class DealsTableSeeder extends Seeder
{
    public function run(): void
    {
        $agents = [
            'Amit Verma' => 3,
            'Rajesh Gupta' => 5,
            'Sneha Kapoor' => 4,
            'Pooja Iyer' => 6,
        ];

        $deals = [
            ['id' => 'D-001', 'customer' => 'Rahul Sharma', 'property' => 'PROP-001', 'value' => 18500000, 'agent' => 'Amit Verma', 'stage' => 'Qualified', 'prob' => 60, 'days' => 4, 'last' => 'Call - Discussed pricing', 'next' => 'Aug 28'],
            ['id' => 'D-002', 'customer' => 'Priya Patel', 'property' => 'PROP-002', 'value' => 32000000, 'agent' => 'Sneha Kapoor', 'stage' => 'Site Visit Scheduled', 'prob' => 70, 'days' => 2, 'last' => 'Site visit confirmed', 'next' => 'Aug 27'],
            ['id' => 'D-003', 'customer' => 'Manish Agarwal', 'property' => 'PROP-005', 'value' => 85000000, 'agent' => 'Rajesh Gupta', 'stage' => 'Negotiation', 'prob' => 85, 'days' => 6, 'last' => 'Counter offer sent', 'next' => 'Aug 27'],
            ['id' => 'D-004', 'customer' => 'Suresh Menon', 'property' => 'PROP-008', 'value' => 21000000, 'agent' => 'Sneha Kapoor', 'stage' => 'Site Visit Completed', 'prob' => 75, 'days' => 3, 'last' => 'Site visit done, feedback positive', 'next' => 'Aug 28'],
            ['id' => 'D-005', 'customer' => 'Anjali Verma', 'property' => 'PROP-007', 'value' => 48000000, 'agent' => 'Rajesh Gupta', 'stage' => 'Closed Won', 'prob' => 100, 'days' => 1, 'last' => 'Agreement signed', 'next' => null],
            ['id' => 'D-006', 'customer' => 'Kavitha Nair', 'property' => 'PROP-004', 'value' => 14500000, 'agent' => 'Pooja Iyer', 'stage' => 'Contacted', 'prob' => 35, 'days' => 7, 'last' => 'Email sent with brochure', 'next' => 'Aug 29'],
            ['id' => 'D-007', 'customer' => 'Deepika Rao', 'property' => 'PROP-006', 'value' => 7200000, 'agent' => 'Amit Verma', 'stage' => 'Qualified', 'prob' => 55, 'days' => 5, 'last' => 'Budget confirmed', 'next' => 'Aug 30'],
            ['id' => 'D-008', 'customer' => 'Rohit Joshi', 'property' => 'PROP-001', 'value' => 18500000, 'agent' => 'Amit Verma', 'stage' => 'New Lead', 'prob' => 20, 'days' => 1, 'last' => 'Lead captured via website', 'next' => 'Aug 28'],
            ['id' => 'D-009', 'customer' => 'Arjun Singh', 'property' => 'PROP-003', 'value' => 9500000, 'agent' => 'Rajesh Gupta', 'stage' => 'Property Shortlisted', 'prob' => 50, 'days' => 3, 'last' => '3 properties shortlisted', 'next' => 'Aug 28'],
            ['id' => 'D-010', 'customer' => 'Kiran Bhat', 'property' => 'PROP-003', 'value' => 9500000, 'agent' => 'Pooja Iyer', 'stage' => 'Closed Lost', 'prob' => 0, 'days' => 12, 'last' => 'Client chose competitor', 'next' => null],
        ];

        foreach ($deals as $d) {
            Deal::updateOrCreate(
                ['deal_id' => $d['id']],
                [
                    'customer_name' => $d['customer'],
                    'property_id' => \App\Models\Property::where('property_id', $d['property'])->value('id'),
                    'deal_value' => $d['value'],
                    'value_label' => $this->label($d['value']),
                    'stage' => $d['stage'],
                    'probability' => $d['prob'],
                    'days_in_stage' => $d['days'],
                    'assigned_agent_id' => $agents[$d['agent']] ?? 1,
                    'last_activity' => $d['last'],
                    'next_followup' => $d['next'],
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
