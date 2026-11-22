<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingPaymentTest extends TestCase
{
    use RefreshDatabase;

    public function test_booking_and_payment_can_be_created(): void
    {
        $booking = Booking::withoutGlobalScopes()->create([
            'booking_id' => 'B-900',
            'customer_name' => 'Test',
            'property_name' => 'Prop',
            'agent_name' => 'Agent',
            'booking_date' => now()->toDateString(),
            'deal_value' => 1000000,
            'deal_label' => '10L',
            'booking_amount' => 100000,
            'booking_amount_label' => '1L',
            'status' => 'Pending',
            'agreement_status' => 'Draft',
            'possession_status' => 'Pending',
        ]);
        $payment = Payment::withoutGlobalScopes()->create([
            'payment_id' => 'PAY-900',
            'customer_name' => 'Test',
            'property_name' => 'Prop',
            'amount' => 100000,
            'amount_label' => '1L',
            'mode' => 'UPI',
            'txn_id' => 'TXN1',
            'due_date' => now()->toDateString(),
            'paid_date' => now()->toDateString(),
            'status' => 'Paid',
        ]);

        $this->assertDatabaseHas('bookings', ['id' => $booking->id, 'booking_id' => 'B-900']);
        $this->assertDatabaseHas('payments', ['id' => $payment->id, 'payment_id' => 'PAY-900']);
    }
}
