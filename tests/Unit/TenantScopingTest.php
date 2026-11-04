<?php

namespace Tests\Unit;

use Tests\TestCase;

class TenantScopingTest extends TestCase
{
    public function test_tenant_trait_exists(): void
    {
        $this->assertTrue(trait_exists('App\Traits\BelongsToTenant'));
    }
}
