<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Deal;
use App\Models\Lead;
use App\Models\Payment;
use App\Models\Project;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CoreFlowSmokeTest extends TestCase
{
    use RefreshDatabase;

    public function test_core_models_can_be_created_in_tenant_context(): void
    {
        config(['qrex.multi_tenant' => false]);
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $project = Project::create(['name' => 'P1', 'slug' => 'p1', 'status' => 'active']);
        $unit = Unit::create(['project_id' => $project->id, 'unit_no' => 'A-101', 'status' => 'available', 'price' => 1000000]);
        $lead = Lead::create(['lead_id'=>'L-CF1','name'=>'Lead','phone'=>'9','email'=>'l@x.test','source'=>'Website','status'=>'New','budget'=>'10L','preferred_location'=>'City']);
        $deal = Deal::create(['deal_id'=>'D-CF1','customer_name'=>'Lead','deal_value'=>1000000,'stage'=>'Qualified','assigned_agent_id'=>$user->id]);
        $booking = Booking::create(['booking_id'=>'B-CF1','customer_name'=>'Lead','property_name'=>'P1','agent_name'=>$user->name,'booking_date'=>now()->toDateString(),'deal_value'=>1000000,'deal_label'=>'10L','booking_amount'=>100000,'booking_amount_label'=>'1L','status'=>'Confirmed','agreement_status'=>'Pending','possession_status'=>'Pending']);
        $payment = Payment::create(['payment_id'=>'PAY-CF1','customer_name'=>'Lead','property_name'=>'P1','amount'=>100000,'amount_label'=>'1L','mode'=>'UPI','txn_id'=>'T1','due_date'=>now()->toDateString(),'paid_date'=>now()->toDateString(),'status'=>'Paid']);

        $this->assertDatabaseHas('units', ['id'=>$unit->id]);
        $this->assertDatabaseHas('leads', ['id'=>$lead->id]);
        $this->assertDatabaseHas('deals', ['id'=>$deal->id]);
        $this->assertDatabaseHas('bookings', ['id'=>$booking->id]);
        $this->assertDatabaseHas('payments', ['id'=>$payment->id]);
    }
}
