<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Notification;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BookingController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/Bookings', [
            'bookings' => Booking::latest()->get(),
        ]);
    }

    public function show(Booking $booking)
    {
        $payments = Payment::where(function ($q) use ($booking) {
            $q->where('property_name', 'like', '%'.$booking->property_name.'%')
                ->orWhere('customer_name', $booking->customer_name);
        })->latest()->get();

        return Inertia::render('admin/BookingDetail', [
            'booking' => $booking,
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
            'user_id' => \Illuminate\Support\Facades\Auth::id(),
            'title' => 'New booking created',
            'message' => 'Booking '.$booking->booking_id.' created for '.$data['customer_name'],
            'type' => 'booking.created',
            'related_id' => $booking->id,
        ]);

        return back()->with('success', 'Booking created.');
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
                'user_id' => \Illuminate\Support\Facades\Auth::id(),
                'title' => 'Payment received',
                'message' => '₹'.number_format($request->payment_amount).' received for '.$booking->customer_name,
                'type' => 'payment.received',
                'related_id' => $booking->id,
            ]);
        }

        return back()->with('success', 'Booking updated.');
    }

    private function label($amount): string
    {
        if ($amount >= 10000000) {
            return '₹'.round($amount / 10000000, 2).' Cr';
        }
        return '₹'.round($amount / 100000).' L';
    }
}
