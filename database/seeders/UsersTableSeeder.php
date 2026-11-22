<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class UsersTableSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            ['name' => 'Vikram Malhotra', 'email' => 'vikram@example.in', 'phone' => '9810001111', 'role' => 'Super Admin', 'branch' => 'HQ Mumbai'],
            ['name' => 'Neha Sharma', 'email' => 'neha@example.in', 'phone' => '9810002222', 'role' => 'Admin', 'branch' => 'Mumbai'],
            ['name' => 'Amit Verma', 'email' => 'amit.v@example.in', 'phone' => '9876501234', 'role' => 'Sales Executive', 'branch' => 'Mumbai'],
            ['name' => 'Sneha Kapoor', 'email' => 'sneha.k@example.in', 'phone' => '9876502345', 'role' => 'Sales Executive', 'branch' => 'Bangalore'],
            ['name' => 'Rajesh Gupta', 'email' => 'rajesh.g@example.in', 'phone' => '9876503456', 'role' => 'Senior Agent', 'branch' => 'Mumbai'],
            ['name' => 'Pooja Iyer', 'email' => 'pooja.i@example.in', 'phone' => '9876504567', 'role' => 'Sales Executive', 'branch' => 'Gurugram'],
            ['name' => 'Rahul Mehta', 'email' => 'rahul.m@example.in', 'phone' => '9810007777', 'role' => 'Marketing User', 'branch' => 'HQ Mumbai'],
            ['name' => 'Priti Shah', 'email' => 'priti.s@example.in', 'phone' => '9810008888', 'role' => 'Accountant', 'branch' => 'HQ Mumbai', 'status' => 'Active'],
        ];

        foreach ($users as $userData) {
            $roleSlug = Str::slug($userData['role']);
            $role = Role::where('slug', $roleSlug)->first();

            $user = User::updateOrCreate(
                ['email' => $userData['email']],
                array_merge($userData, [
                    'password' => 'password',
                    'avatar' => null,
                ])
            );

            if ($role) {
                $user->roles()->syncWithoutDetaching([$role->id]);
            }
        }
    }
}
