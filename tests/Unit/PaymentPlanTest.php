<?php

namespace Tests\Unit;

use Tests\TestCase;

class PaymentPlanTest extends TestCase
{
    public function test_installment_total_calculation(): void
    {
        $total = 1000000;
        $installments = 10;
        $perInstallment = $total / $installments;
        $this->assertEquals(100000, $perInstallment);
    }

    public function test_balance_calculation(): void
    {
        $total = 1000000;
        $paid = 400000;
        $balance = $total - $paid;
        $this->assertEquals(600000, $balance);
    }
}
