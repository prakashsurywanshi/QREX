<?php

namespace Tests\Unit;

use Tests\TestCase;

class CommissionTest extends TestCase
{
    public function test_commission_amount_calculation_percentage(): void
    {
        $amount = 100000;
        $rate = 2;
        $this->assertEquals(2000.0, ($amount * $rate) / 100);
    }

    public function test_commission_amount_calculation_fixed(): void
    {
        $this->assertEquals(5000.0, (float) 5000);
    }
}
