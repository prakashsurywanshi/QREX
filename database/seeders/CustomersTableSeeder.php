<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Seeder;

class CustomersTableSeeder extends Seeder
{
    public function run(): void
    {
        $agents = [
            'Rajesh Gupta' => 5,
            'Sneha Kapoor' => 4,
            'Amit Verma' => 3,
        ];

        $customers = [
            ['id' => 'C-001', 'name' => 'Anjali Verma', 'phone' => '9890108901', 'email' => 'anjali.v@yahoo.com', 'type' => 'Buyer', 'status' => 'Buyer', 'properties' => ['Business Hub'], 'value' => '₹4.80 Cr', 'agent' => 'Rajesh Gupta', 'city' => 'Mumbai'],
            ['id' => 'C-002', 'name' => 'Manish Agarwal', 'phone' => '9867805678', 'email' => 'manish.a@gmail.com', 'type' => 'Investor', 'status' => 'Active', 'properties' => ['The Grand Penthouse'], 'value' => '₹8.50 Cr', 'agent' => 'Rajesh Gupta', 'city' => 'Mumbai'],
            ['id' => 'C-003', 'name' => 'Suresh Menon', 'phone' => '9889007890', 'email' => 'suresh.m@gmail.com', 'type' => 'Buyer', 'status' => 'Active', 'properties' => ['Marina Bay'], 'value' => '₹2.10 Cr', 'agent' => 'Sneha Kapoor', 'city' => 'Mumbai'],
            ['id' => 'C-004', 'name' => 'Priya Patel', 'phone' => '9834502345', 'email' => 'priya.patel@yahoo.com', 'type' => 'Buyer', 'status' => 'Active', 'properties' => ['Palm Grove Villa'], 'value' => '₹3.20 Cr', 'agent' => 'Sneha Kapoor', 'city' => 'Bangalore'],
            ['id' => 'C-005', 'name' => 'Rahul Sharma', 'phone' => '9823401234', 'email' => 'rahul.s@gmail.com', 'type' => 'Buyer', 'status' => 'Prospect', 'properties' => ['Skyline Heights'], 'value' => '₹1.85 Cr', 'agent' => 'Amit Verma', 'city' => 'Mumbai'],
        ];

        foreach ($customers as $c) {
            Customer::updateOrCreate(
                ['customer_id' => $c['id']],
                [
                    'name' => $c['name'],
                    'phone' => $c['phone'],
                    'email' => $c['email'],
                    'type' => $c['type'],
                    'status' => $c['status'],
                    'properties' => $c['properties'],
                    'total_value' => $c['value'],
                    'agent_id' => $agents[$c['agent']] ?? 1,
                    'city' => $c['city'],
                    'requirements' => 'Interested in premium residential & commercial properties',
                ]
            );
        }
    }
}
