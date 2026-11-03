<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $buyer = Auth::guard('buyer')->user();
        $customer = $buyer->customer;
        $booking = $customer ? $customer->bookings()->with(['property', 'paymentPlan.installments'])->latest()->first() : null;

        return Inertia::render('portal/Dashboard', [
            'buyer' => $buyer,
            'customer' => $customer,
            'booking' => $booking,
        ]);
    }
}
