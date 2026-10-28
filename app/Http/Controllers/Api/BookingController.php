<?php

namespace App\Http\Controllers\Api;

use App\Http\Responses\ApiResponse;
use App\Models\Booking;
use App\Models\Notification;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BookingController extends ApiController
{
    public function index()
    {
        return ApiResponse::success([
            'bookings' => Booking::latest()->get()->map(fn ($b) => $this->bookingBrief($b)),
        ]);
    }

    public function show(Booking $booking)
    {
        $payments = Payment::where(function ($q) use ($booking) {
            $q->where('property_name', 'like', '%'.$booking->property_name.'%')
                ->orWhere('customer_name', $booking->customer_name);
        })->latest()->get()->map(fn ($p) => $this->paymentBrief($p))->all();

        return ApiResponse::success([
            'booking' => $this->bookingBrief($booking),
            'payments' => $payments,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'customer_name' => 'required|string',
            'property_name' => 'required|string',
            'agent_name' => 'required|string',
            'booking_date' => 'required|date',
            'deal_value' => 'required|numeric',
            'booking_amount' => 'required|numeric',
        ]);

        $data['booking_id'] = $this->nextId('B');
        $data['deal_label'] = $this->label($data['deal_value']);
        $data['booking_amount_label'] = $this->label($data['booking_amount']);
        $data['status'] = 'Booking Pending';
        $data['agreement_status'] = 'Pending';
        $data['possession_status'] = 'Pending';

        $booking = Booking::create($data);

        Notification::create([
            'user_id' => Auth::id(),
            'title' => 'New booking created',
            'message' => 'Booking '.$booking->booking_id.' created for '.$data['customer_name'],
            'type' => 'booking.created',
            'related_id' => $booking->id,
        ]);

        return ApiResponse::success($this->bookingBrief($booking), 'Booking created.', 201);
    }

    public function update(Request $request, Booking $booking)
    {
        $request->validate([
            'status' => ['nullable', 'string'],
            'agreement_status' => ['nullable', 'string'],
            'possession_status' => ['nullable', 'string'],
            'record_payment' => ['nullable', 'boolean'],
            'payment_amount' => ['nullable', 'numeric'],
            'payment_mode' => ['nullable', 'string'],
        ]);

        $booking->update($request->only(['status', 'agreement_status', 'possession_status']));

        if ($request->boolean('record_payment') && $request->filled('payment_amount')) {
            Payment::create([
                'payment_id' => $this->nextId('PAY'),
                'customer_name' => $booking->customer_name,
                'property_name' => $booking->property_name,
                'amount' => $request->payment_amount,
                'amount_label' => $booking->booking_amount_label,
                'mode' => $request->payment_mode ?: 'Bank Transfer',
                'txn_id' => '—',
                'due_date' => now()->format('Y-m-d'),
                'paid_date' => now()->format('Y-m-d'),
                'status' => 'Paid',
            ]);

            Notification::create([
                'user_id' => Auth::id(),
                'title' => 'Payment received',
                'message' => '₹'.number_format($request->payment_amount).' received for '.$booking->customer_name,
                'type' => 'payment.received',
                'related_id' => $booking->id,
            ]);
        }

        return ApiResponse::success($this->bookingBrief($booking), 'Booking updated.');
    }

    public function destroy(Booking $booking)
    {
        $booking->delete();

        return ApiResponse::success(null, 'Booking deleted.');
    }

    protected function bookingBrief($b): array
    {
        return [
            'id' => $b->id,
            'booking_id' => $b->booking_id,
            'customer_name' => $b->customer_name,
            'property_name' => $b->property_name,
            'agent_name' => $b->agent_name,
            'booking_date' => $b->booking_date,
            'deal_value' => (float) $b->deal_value,
            'deal_label' => $b->deal_label,
            'booking_amount' => (float) $b->booking_amount,
            'booking_amount_label' => $b->booking_amount_label,
            'status' => $b->status,
            'agreement_status' => $b->agreement_status,
            'possession_status' => $b->possession_status,
            'created_at' => $b->created_at?->toISOString(),
        ];
    }

    protected function paymentBrief($p): array
    {
        return [
            'id' => $p->id,
            'payment_id' => $p->payment_id,
            'customer_name' => $p->customer_name,
            'property_name' => $p->property_name,
            'amount' => (float) $p->amount,
            'amount_label' => $p->amount_label,
            'mode' => $p->mode,
            'txn_id' => $p->txn_id,
            'status' => $p->status,
            'paid_date' => $p->paid_date,
            'due_date' => $p->due_date,
            'created_at' => $p->created_at?->toISOString(),
        ];
    }
}