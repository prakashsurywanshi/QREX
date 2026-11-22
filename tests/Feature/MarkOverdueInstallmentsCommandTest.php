<?php

namespace Tests\Feature;

use App\Models\Installment;
use App\Models\PaymentPlan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MarkOverdueInstallmentsCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_overdue_installments_are_marked(): void
    {
        $plan = PaymentPlan::create(['plan_name'=>'P','total_amount'=>1000,'plan_type'=>'custom','status'=>'active']);
        $inst = Installment::create([
            'payment_plan_id'=>$plan->id,'installment_no'=>1,'due_date'=>now()->subDay()->toDateString(),
            'amount'=>1000,'status'=>'pending','paid_amount'=>0,'balance_amount'=>1000,
        ]);
        $this->artisan('qrex:mark-overdue-installments')->assertExitCode(0);
        $this->assertSame('overdue', $inst->fresh()->status);
    }
}
