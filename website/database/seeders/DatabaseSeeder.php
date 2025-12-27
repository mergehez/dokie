<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::create([
            'name' => 'Demo User',
            'email' => 'demo@dokie.com',
            'password' => bcrypt('password'),
        ]);
        for ($i = 1; $i <= 10; $i++) {
            User::create([
                'name' => "Demo User $i",
                'email' => "demo_$i@dokie.com",
                'password' => bcrypt('password'),
            ]);
        }

        $category = Category::create([
            'name' => 'General',
            'description' => 'General category for all products.',
        ]);

        $today = now()->startOfDay();
        for ($i = 1; $i <= 100; $i++) {
            $p = Product::create([
                'name' => "Demo Product $i",
                'description' => "This is a demo product number $i.",
                'category_id' => $category->id,
                'created_by' => $user->id,
            ]);

            $price = rand(100, 1000) / 10; // Random price between 10.0 and 100.0
            $p->prices()->create([
                'price' => $price,
                'start_date' => $today,
                'end_date' => $today->addDays(30),
            ]);
        }
    }
}
