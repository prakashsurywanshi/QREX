<?php

namespace Tests\Feature;

use App\Models\Amenity;
use App\Models\PropertyType;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\AmenitiesTableSeeder;
use Database\Seeders\PropertyTypesTableSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AmenityCrudTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $salesRep;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);
        $this->seed(PropertyTypesTableSeeder::class);
        $this->seed(AmenitiesTableSeeder::class);

        $this->admin = User::factory()->create(['role' => 'Admin']);
        $this->admin->roles()->attach(Role::where('slug', 'admin')->value('id'));

        $this->salesRep = User::factory()->create(['role' => 'Sales Executive']);
        $this->salesRep->roles()->attach(Role::where('slug', 'sales-executive')->value('id'));
    }

    private function typeId(string $name = 'Plot'): int
    {
        return PropertyType::where('name', $name)->value('id');
    }

    public function test_admin_can_load_the_amenity_page(): void
    {
        $this->actingAs($this->admin)
            ->get('/admin/amenities')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('admin/Amenities')
                ->has('types', 9)
                ->has('amenities')
            );
    }

    public function test_page_defaults_to_the_first_property_type_with_its_amenities(): void
    {
        $expected = Amenity::where('property_type_id', $this->typeId('Apartment'))
            ->orderBy('sort_order')
            ->pluck('name')
            ->all();

        $this->actingAs($this->admin)
            ->get('/admin/amenities')
            ->assertInertia(fn ($page) => $page
                ->where('selectedTypeId', $this->typeId('Apartment'))
                ->has('amenities', count($expected))
                ->where('amenities.0.name', $expected[0])
            );
    }

    public function test_page_falls_back_to_the_first_type_when_an_unknown_type_is_requested(): void
    {
        $this->actingAs($this->admin)
            ->get('/admin/amenities?type=99999')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('selectedTypeId', $this->typeId('Apartment'))
                ->has('amenities')
            );
    }

    public function test_page_can_switch_to_a_specific_property_type(): void
    {
        $this->actingAs($this->admin)
            ->get('/admin/amenities?type='.$this->typeId('Warehouse'))
            ->assertInertia(fn ($page) => $page
                ->where('selectedTypeId', $this->typeId('Warehouse'))
                ->has('amenities', 14)
            );
    }

    public function test_admin_can_add_an_amenity(): void
    {
        $this->actingAs($this->admin)
            ->post('/admin/amenities', [
                'property_type_id' => $this->typeId(),
                'name' => 'Rainwater Harvesting',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('amenities', [
            'property_type_id' => $this->typeId(),
            'name' => 'Rainwater Harvesting',
            'slug' => 'rainwater-harvesting',
            'is_active' => true,
        ]);
    }

    public function test_duplicate_amenity_is_rejected_regardless_of_case(): void
    {
        $this->actingAs($this->admin)
            ->post('/admin/amenities', [
                'property_type_id' => $this->typeId(),
                'name' => 'corner PLOT',
            ])
            ->assertSessionHas('error');

        $this->assertSame(
            1,
            Amenity::where('property_type_id', $this->typeId())->where('name', 'Corner Plot')->count(),
        );
    }

    public function test_same_amenity_name_is_allowed_across_different_types(): void
    {
        $this->actingAs($this->admin)->post('/admin/amenities', [
            'property_type_id' => $this->typeId('Apartment'),
            'name' => 'Loading Bay',
        ])->assertRedirect();

        $this->assertDatabaseHas('amenities', [
            'property_type_id' => $this->typeId('Apartment'),
            'name' => 'Loading Bay',
        ]);
    }

    public function test_bulk_add_splits_lines_and_commas_and_skips_duplicates(): void
    {
        $typeId = $this->typeId('Farm/Land');
        $before = Amenity::where('property_type_id', $typeId)->count();

        $this->actingAs($this->admin)
            ->post('/admin/amenities/bulk', [
                'property_type_id' => $typeId,
                'names' => "Orchard\nPoultry Sheds, Solar Fencing\nBorewell\n\n  ",
            ])
            ->assertRedirect();

        // 2 new (Orchard, Poultry Sheds) — Solar Fencing and Borewell already existed.
        $this->assertSame($before + 2, Amenity::where('property_type_id', $typeId)->count());
        $this->assertDatabaseHas('amenities', ['property_type_id' => $typeId, 'name' => 'Poultry Sheds']);
        $this->assertSame(
            1,
            Amenity::where('property_type_id', $typeId)->where('name', 'Solar Fencing')->count(),
        );
    }

    public function test_admin_can_rename_and_deactivate_an_amenity(): void
    {
        $amenity = Amenity::where('name', 'Corner Plot')->firstOrFail();

        $this->actingAs($this->admin)
            ->put("/admin/amenities/{$amenity->id}", [
                'name' => 'Corner Plot (Main Road)',
                'is_active' => false,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('amenities', [
            'id' => $amenity->id,
            'name' => 'Corner Plot (Main Road)',
            'is_active' => false,
        ]);
    }

    public function test_deactivating_an_amenity_removes_it_from_the_catalog(): void
    {
        $amenity = Amenity::where('property_type_id', $this->typeId('Plot'))->where('name', 'Corner Plot')->firstOrFail();

        $this->actingAs($this->admin)->put("/admin/amenities/{$amenity->id}", [
            'name' => $amenity->name,
            'is_active' => false,
        ]);

        $this->assertDatabaseHas('amenities', ['id' => $amenity->id, 'is_active' => false]);
        $this->assertDatabaseMissing('amenities', ['id' => $amenity->id, 'is_active' => true]);
    }

    public function test_admin_can_delete_an_amenity(): void
    {
        $amenity = Amenity::where('name', 'Corner Plot')->firstOrFail();

        $this->actingAs($this->admin)
            ->delete("/admin/amenities/{$amenity->id}")
            ->assertRedirect();

        $this->assertDatabaseMissing('amenities', ['id' => $amenity->id]);
    }

    public function test_user_without_amenity_permissions_is_denied(): void
    {
        $this->assertFalse($this->salesRep->fresh()->hasPermissionTo('amenities.view'));

        // PermissionMiddleware redirects web requests back with a flash error...
        $this->actingAs($this->salesRep)
            ->get('/admin/amenities')
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->actingAs($this->salesRep)
            ->post('/admin/amenities', ['property_type_id' => $this->typeId(), 'name' => 'Nope'])
            ->assertRedirect()
            ->assertSessionHas('error');

        // ...but aborts with 403 for JSON clients.
        $this->actingAs($this->salesRep)
            ->postJson('/api/amenities', ['property_type' => 'Plot', 'name' => 'Nope'])
            ->assertForbidden();

        $this->assertDatabaseMissing('amenities', ['name' => 'Nope']);
    }

    public function test_sales_rep_sees_the_amenity_module_as_fully_locked(): void
    {
        $this->actingAs($this->salesRep)
            ->get('/admin/dashboard')
            ->assertInertia(fn ($page) => $page
                ->where('can.amenities.view', false)
                ->where('can.amenities.create', false)
                ->where('can.amenities.edit', false)
                ->where('can.amenities.delete', false)
                ->where('can.amenities.fields', [])
            );
    }

    public function test_api_catalog_endpoint_returns_the_full_type_catalog(): void
    {
        $this->actingAs($this->admin)
            ->getJson('/api/amenities')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(9, 'data.types')
            ->assertJsonPath('data.types.0.name', 'Apartment');
    }

    public function test_api_can_add_an_amenity_and_rejects_a_bad_type(): void
    {
        $this->actingAs($this->admin)
            ->postJson('/api/amenities', ['property_type' => 'Warehouse', 'name' => 'Cold Storage'])
            ->assertCreated();

        $this->actingAs($this->admin)
            ->postJson('/api/amenities', ['property_type' => 'Skyscraper', 'name' => 'Nope'])
            ->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    public function test_deleting_a_property_type_cascades_to_its_amenities(): void
    {
        $typeId = $this->typeId('Shop');
        $this->assertGreaterThan(0, Amenity::where('property_type_id', $typeId)->count());

        PropertyType::where('id', $typeId)->delete();

        $this->assertSame(0, Amenity::where('property_type_id', $typeId)->count());
    }
}
