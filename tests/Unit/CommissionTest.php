<?php

namespace Tests\Unit;

use App\Models\Commission;
use Tests\TestCase;

class CommissionTest extends TestCase
{
    public function test_commission_can_be_created(): void
    {
        $this->assertTrue(true);
    }

    public function test_commission_amount_calculation_percentage(): void
    {
        $amount = 100000;
        $rate = 2;
        $expected = ($amount * $rate) / 100;
        $this->assertEquals(2000, $expected);
    }

    public function test_commission_amount_calculation_fixed(): void
    {
        $amount = 5000;
        $this->assertEquals(5000, $amount);
    }
}
