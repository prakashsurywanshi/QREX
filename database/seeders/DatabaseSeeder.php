<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call([
            RolesAndPermissionsSeeder::class,
            UsersTableSeeder::class,
            PropertyTypesTableSeeder::class,
            AmenitiesTableSeeder::class,
            PropertiesTableSeeder::class,
            LeadsTableSeeder::class,
            DealsTableSeeder::class,
            CustomersTableSeeder::class,
            OpsTableSeeder::class,
            MarketingMediaSeeder::class,
            TasksTableSeeder::class,
        ]);
    }
}
