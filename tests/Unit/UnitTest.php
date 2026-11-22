<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class UnitTest extends TestCase
{
    public function test_basic_math_for_unit_pricing(): void
    {
        $base = 5000000;
        $tax = $base * 0.05;
        $this->assertSame(5250000.0, (float) ($base + $tax));
    }
}
