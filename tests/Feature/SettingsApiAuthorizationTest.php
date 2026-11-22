<?php

namespace Tests\Feature;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SettingsApiAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_settings_update_requires_permission(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)
            ->putJson('/api/settings', ['agency_name' => 'Nope'])
            ->assertStatus(403);
    }

    public function test_settings_update_allowed_with_permission(): void
    {
        $user = User::factory()->create();
        $role = Role::create(['name' => 'Admin', 'slug' => 'admin']);
        $perm = Permission::create(['name' => 'Settings Edit', 'slug' => 'settings.edit', 'module' => 'settings', 'action' => 'edit']);
        $role->permissions()->attach($perm->id);
        $user->roles()->attach($role->id);

        $this->actingAs($user)
            ->putJson('/api/settings', ['agency_name' => 'QREX'])
            ->assertOk();
    }
}
