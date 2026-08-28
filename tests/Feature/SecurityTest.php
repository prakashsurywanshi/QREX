<?php

namespace Tests\Feature;

use App\Models\Notification;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SecurityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_inactive_user_cannot_login(): void
    {
        $inactive = User::factory()->create([
            'email' => 'inactive@example.in',
            'status' => 'Inactive',
        ]);

        $response = $this->from('/login')->post('/login', [
            'email' => $inactive->email,
            'password' => 'password',
        ]);

        $response->assertRedirect('/login');
        $this->assertGuest();
        $response->assertSessionHasErrors('email');
    }

    public function test_user_cannot_mark_another_users_notification_as_read(): void
    {
        $owner = User::factory()->create();
        $attacker = User::factory()->create();

        $notification = Notification::create([
            'user_id' => $owner->id,
            'title' => 'Test',
            'message' => 'Test message',
            'type' => 'System',
            'is_read' => false,
        ]);

        $this->actingAs($attacker)
            ->put("/admin/notifications/{$notification->id}/read")
            ->assertForbidden();

        $this->assertDatabaseHas('notifications', [
            'id' => $notification->id,
            'is_read' => false,
        ]);
    }

    public function test_non_super_admin_cannot_assign_super_admin_role(): void
    {
        $adminRole = Role::where('slug', 'admin')->first();
        $superAdminRole = Role::where('slug', 'super-admin')->first();
        $this->assertNotNull($adminRole);
        $this->assertNotNull($superAdminRole);

        $admin = User::factory()->create(['email' => 'admin@example.in', 'role' => 'Admin']);
        $admin->roles()->attach($adminRole->id);
        $this->assertFalse($admin->fresh()->isSuperAdmin());

        $this->actingAs($admin)
            ->post('/admin/users', [
                'name' => 'Bob Lax',
                'email' => 'bob.lax@example.in',
                'phone' => '9990000000',
                'role_id' => $superAdminRole->id,
                'branch' => 'Mumbai',
            ])
            ->assertForbidden();

        $this->assertDatabaseMissing('users', ['email' => 'bob.lax@example.in']);
    }
}
