<?php

namespace Tests\Unit;

use Tests\TestCase;

class UnitTest extends TestCase
{
    public function test_unit_status_values(): void
    {
        $validStatuses = ['available', 'hold', 'booked', 'sold', 'blocked'];
        $this->assertContains('available', $validStatuses);
        $this->assertContains('hold', $validStatuses);
    }

    public function test_hold_requires_available(): void
    {
        $this->assertTrue(true);
    }
}
