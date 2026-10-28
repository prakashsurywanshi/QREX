<?php

namespace Tests\Feature;

use App\Models\Amenity;
use App\Models\PropertyType;
use App\Services\PropertyTypeCatalog;
use Database\Seeders\AmenitiesTableSeeder;
use Database\Seeders\PropertyTypesTableSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PropertyTypeCatalogTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(PropertyTypesTableSeeder::class);
        $this->seed(AmenitiesTableSeeder::class);
    }

    public function test_catalog_resolves_the_nine_property_types_in_order(): void
    {
        $catalog = app(PropertyTypeCatalog::class);

        $this->assertTrue($catalog->isSeeded());
        $this->assertSame(
            ['Apartment', 'Villa', 'Plot', 'Commercial', 'Office', 'Shop', 'Warehouse', 'Farm/Land', 'Other'],
            $catalog->names(),
        );
    }

    public function test_names_with_all_prepends_the_all_filter_option(): void
    {
        $names = app(PropertyTypeCatalog::class)->namesWithAll();

        $this->assertSame('All', $names[0]);
        $this->assertContains('Farm/Land', $names);
    }

    public function test_residential_types_expose_the_full_spec_set(): void
    {
        $spec = app(PropertyTypeCatalog::class)->specRules('Apartment');

        $this->assertSame(
            ['price', 'area', 'bedrooms', 'bathrooms', 'floors', 'parking', 'furnishing', 'possession_date'],
            $spec['visible'],
        );
        $this->assertSame([], $spec['hidden']);
        $this->assertSame(['price', 'area'], $spec['required']);
    }

    public function test_plot_hides_bedroom_and_bathroom_specs(): void
    {
        $spec = app(PropertyTypeCatalog::class)->specRules('Plot');

        $this->assertNotContains('bedrooms', $spec['visible']);
        $this->assertNotContains('bathrooms', $spec['visible']);
        $this->assertNotContains('furnishing', $spec['visible']);
        $this->assertContains('parking', $spec['visible']);
        $this->assertSame('Plot Area (sq.ft)', $spec['area_label']);

        foreach (['bedrooms', 'bathrooms', 'floors', 'furnishing'] as $field) {
            $this->assertContains($field, $spec['hidden']);
        }
    }

    public function test_farm_land_relabels_area_to_acres_and_hides_parking(): void
    {
        $spec = app(PropertyTypeCatalog::class)->specRules('Farm/Land');

        $this->assertSame(['price', 'area', 'possession_date'], $spec['visible']);
        $this->assertSame('Land Area (acres)', $spec['area_label']);
        $this->assertContains('parking', $spec['hidden']);
    }

    public function test_amenities_are_scoped_to_each_type(): void
    {
        $catalog = app(PropertyTypeCatalog::class);

        $apartment = $catalog->amenitiesFor('Apartment');
        $plot = $catalog->amenitiesFor('Plot');
        $warehouse = $catalog->amenitiesFor('Warehouse');

        $this->assertContains('Lift', $apartment);
        $this->assertNotContains('Corner Plot', $apartment);

        $this->assertContains('Corner Plot', $plot);
        $this->assertNotContains('Lift', $plot);

        $this->assertContains('Loading Bay', $warehouse);
        $this->assertNotContains('Swimming Pool', $warehouse);

        // A shop must not be offered a private pool.
        $this->assertNotContains('Private Pool', $catalog->amenitiesFor('Shop'));
    }

    public function test_inactive_amenities_are_hidden_from_the_catalog(): void
    {
        Amenity::where('name', 'Lift')->update(['is_active' => false]);

        $this->assertNotContains('Lift', app(PropertyTypeCatalog::class)->amenitiesFor('Apartment'));
    }

    public function test_unknown_type_degrades_to_the_generic_full_spec(): void
    {
        $catalog = app(PropertyTypeCatalog::class);

        $this->assertFalse($catalog->isValid('Skyscraper'));
        $this->assertNull($catalog->resolve('Skyscraper'));

        $spec = $catalog->specRules('Skyscraper');
        $this->assertCount(8, $spec['visible']);
        $this->assertSame([], $spec['hidden']);
        $this->assertSame([], $catalog->amenitiesFor('Skyscraper'));
    }

    public function test_resolve_matches_by_name_and_slug(): void
    {
        $catalog = app(PropertyTypeCatalog::class);

        $this->assertSame('Farm/Land', $catalog->resolve('Farm/Land')?->name);
        $this->assertSame('Farm/Land', $catalog->resolve('farm-land')?->name);
        $this->assertSame('Farm/Land', $catalog->resolve('farm/land')?->name);
        $this->assertNull($catalog->resolve(''));
        $this->assertNull($catalog->resolve(null));
    }

    public function test_all_payload_is_serialisable_for_the_frontend(): void
    {
        $all = app(PropertyTypeCatalog::class)->all();

        $this->assertCount(9, $all);
        $this->assertSame('Apartment', $all[0]['name']);
        $this->assertIsArray($all[0]['amenities']);
        $this->assertArrayHasKey('visible', $all[0]['spec']);
        $this->assertArrayHasKey('hidden', $all[0]['spec']);
        $this->assertArrayHasKey('area_label', $all[0]['spec']);

        $this->assertIsString(json_encode($all));
    }

    public function test_catalog_degrades_when_it_has_not_been_seeded(): void
    {
        PropertyType::query()->delete();

        $catalog = app(PropertyTypeCatalog::class);

        $this->assertFalse($catalog->isSeeded());
        $this->assertSame([], $catalog->names());
        $this->assertSame([], $catalog->all());
        $this->assertFalse($catalog->isValid('Apartment'));
    }
}
