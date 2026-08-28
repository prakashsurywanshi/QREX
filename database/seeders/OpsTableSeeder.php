<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\SiteVisit;
use Illuminate\Database\Seeder;

class OpsTableSeeder extends Seeder
{
    public function run(): void
    {
        $siteVisits = [
            ['id' => 'SV-001', 'customer' => 'Priya Patel', 'property' => 'Palm Grove Villa', 'agent' => 'Sneha Kapoor', 'date' => '2026-08-27', 'time' => '11:00 AM', 'status' => 'Confirmed', 'location' => 'Whitefield, Bangalore', 'notes' => 'Customer very interested, 2nd visit', 'feedback' => null],
            ['id' => 'SV-002', 'customer' => 'Rahul Sharma', 'property' => 'Skyline Heights', 'agent' => 'Amit Verma', 'date' => '2026-08-28', 'time' => '03:30 PM', 'status' => 'Scheduled', 'location' => 'Andheri West, Mumbai', 'notes' => 'First visit, needs to see amenities', 'feedback' => null],
            ['id' => 'SV-003', 'customer' => 'Suresh Menon', 'property' => 'Marina Bay', 'agent' => 'Sneha Kapoor', 'date' => '2026-08-24', 'time' => '10:00 AM', 'status' => 'Completed', 'location' => 'Powai, Mumbai', 'notes' => 'Visit done. Customer liked the lake view.', 'feedback' => 'Positive, interested to proceed'],
            ['id' => 'SV-004', 'customer' => 'Arjun Singh', 'property' => 'Emerald Towers', 'agent' => 'Rajesh Gupta', 'date' => '2026-08-29', 'time' => '02:00 PM', 'status' => 'Scheduled', 'location' => 'Koregaon Park, Pune', 'notes' => '', 'feedback' => null],
            ['id' => 'SV-005', 'customer' => 'Kavitha Nair', 'property' => 'Sunrise Residency', 'agent' => 'Pooja Iyer', 'date' => '2026-08-26', 'time' => '04:00 PM', 'status' => 'Rescheduled', 'location' => 'Sector 56, Gurugram', 'notes' => 'Rescheduled due to customer travel', 'feedback' => null],
        ];

        foreach ($siteVisits as $sv) {
            SiteVisit::updateOrCreate(
                ['visit_id' => $sv['id']],
                [
                    'customer_name' => $sv['customer'],
                    'property_name' => $sv['property'],
                    'agent_name' => $sv['agent'],
                    'visit_date' => $sv['date'],
                    'visit_time' => $sv['time'],
                    'status' => $sv['status'],
                    'location' => $sv['location'],
                    'notes' => $sv['notes'],
                    'feedback' => $sv['feedback'],
                ]
            );
        }

        $bookings = [
            ['id' => 'B-001', 'customer' => 'Anjali Verma', 'property' => 'Business Hub — Office Space', 'agent' => 'Rajesh Gupta', 'date' => '2026-08-20', 'value' => 48000000, 'label' => '₹4.80 Cr', 'amount' => 4800000, 'amountLabel' => '₹48 L', 'status' => 'Agreement Signed', 'agreement' => 'Signed', 'possession' => 'Handed Over'],
            ['id' => 'B-002', 'customer' => 'Manish Agarwal', 'property' => 'The Grand — Penthouse', 'agent' => 'Rajesh Gupta', 'date' => '2026-08-22', 'value' => 85000000, 'label' => '₹8.50 Cr', 'amount' => 8500000, 'amountLabel' => '₹85 L', 'status' => 'Under Agreement', 'agreement' => 'In Progress', 'possession' => 'Pending'],
        ];

        foreach ($bookings as $b) {
            Booking::updateOrCreate(
                ['booking_id' => $b['id']],
                [
                    'customer_name' => $b['customer'],
                    'property_name' => $b['property'],
                    'agent_name' => $b['agent'],
                    'booking_date' => $b['date'],
                    'deal_value' => $b['value'],
                    'deal_label' => $b['label'],
                    'booking_amount' => $b['amount'],
                    'booking_amount_label' => $b['amountLabel'],
                    'status' => $b['status'],
                    'agreement_status' => $b['agreement'],
                    'possession_status' => $b['possession'],
                ]
            );
        }

        $payments = [
            ['id' => 'PAY-001', 'customer' => 'Anjali Verma', 'property' => 'Business Hub', 'amount' => 48000000, 'label' => '₹4.80 Cr', 'mode' => 'RTGS', 'txn' => 'RTGS2026081901', 'due' => '2026-08-20', 'paid' => '2026-08-20', 'status' => 'Paid'],
            ['id' => 'PAY-002', 'customer' => 'Manish Agarwal', 'property' => 'The Grand Penthouse', 'amount' => 8500000, 'label' => '₹85 L (Booking)', 'mode' => 'Cheque', 'txn' => 'CHQ-00988712', 'due' => '2026-08-22', 'paid' => '2026-08-22', 'status' => 'Paid'],
            ['id' => 'PAY-003', 'customer' => 'Manish Agarwal', 'property' => 'The Grand Penthouse', 'amount' => 16000000, 'label' => '₹1.60 Cr (1st Instalment)', 'mode' => 'NEFT', 'txn' => '—', 'due' => '2026-09-22', 'paid' => null, 'status' => 'Pending'],
            ['id' => 'PAY-004', 'customer' => 'Suresh Menon', 'property' => 'Marina Bay', 'amount' => 2100000, 'label' => '₹21 L (Booking)', 'mode' => '—', 'txn' => '—', 'due' => '2026-08-30', 'paid' => null, 'status' => 'Pending'],
        ];

        foreach ($payments as $p) {
            Payment::updateOrCreate(
                ['payment_id' => $p['id']],
                [
                    'customer_name' => $p['customer'],
                    'property_name' => $p['property'],
                    'amount' => $p['amount'],
                    'amount_label' => $p['label'],
                    'mode' => $p['mode'],
                    'txn_id' => $p['txn'],
                    'due_date' => $p['due'],
                    'paid_date' => $p['paid'],
                    'status' => $p['status'],
                ]
            );
        }
    }
}
